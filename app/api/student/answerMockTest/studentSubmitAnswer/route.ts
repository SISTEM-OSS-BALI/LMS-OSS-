import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma"; // Pastikan Prisma client diimport

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (user instanceof NextResponse) {
    return user;
  }

  try {
    const body = await request.json();
    const { answers, testId, accessId, audio, speaking_id } = body;

    if (!testId || !accessId || !answers) {
      return NextResponse.json(
        { status: 400, error: true, message: "Data tidak lengkap." },
        { status: 400 }
      );
    }

    // 🔹 Ambil semua BaseMockTest terkait
    const baseMockTests = await prisma.baseMockTest.findMany({
      where: { mock_test_id: testId },
      include: {
        reading: { include: { questions: true } },
        listening: { include: { questions: true } },
        speaking: true,
        writing: { include: { questions: true } },
      },
    });

    if (baseMockTests.length === 0) {
      return NextResponse.json(
        { status: 400, error: true, message: "Mock Test tidak memiliki soal." },
        { status: 400 }
      );
    }

    let totalQuestionsCount = 0;

    // ✅ **Simpan jawaban SPEAKING jika ada**
    if (speaking_id && audio) {
      const speakingTest = baseMockTests.find(
        (section) => section.speaking?.speaking_id === speaking_id
      );

      if (speakingTest) {
        await prisma.studentAnswerMockTest.create({
          data: {
            student_id: user.user_id,
            mock_test_id: testId,
            base_mock_test_id: speakingTest.base_mock_test_id,
            speaking_test_id: speaking_id,
            studentAnswer: null, // Tidak ada jawaban teks untuk speaking
            recording_url: audio, // Simpan audio di sini
            isCorrect: null,
            score: null,
            submittedAt: new Date(),
          },
        });
      }
    }

    // ✅ **Simpan jawaban untuk Reading, Listening, dan Writing**
    await Promise.all(
      Object.entries(answers).map(async ([baseMockTestId, questions]) => {
        await Promise.all(
          Object.entries(questions as { [key: string]: any }).map(
            async ([question_id, selectedAnswer]) => {
              let isCorrect = null;
              let score = 0;
              let reading_question_id = null;
              let listening_question_id = null;
              let writing_question_id = null;

              const readingQuestion = baseMockTests
                .flatMap((section) => section.reading?.questions ?? [])
                .find((q) => q.question_id === question_id);

              const listeningQuestion = baseMockTests
                .flatMap((section) => section.listening?.questions ?? [])
                .find((q) => q.question_id === question_id);

              const writingQuestion = baseMockTests
                .flatMap((section) => section.writing?.questions ?? [])
                .find((q) => q.question_id === question_id);

              if (readingQuestion) {
                isCorrect = readingQuestion.answer === selectedAnswer;
                score = isCorrect ? 1 : 0;
                reading_question_id = readingQuestion.question_id;
              } else if (listeningQuestion) {
                isCorrect = listeningQuestion.answer === selectedAnswer;
                score = isCorrect ? 1 : 0;
                listening_question_id = listeningQuestion.question_id;
              } else if (writingQuestion) {
                isCorrect = writingQuestion.answer === selectedAnswer;
                score = isCorrect ? 1 : 0;
                writing_question_id = writingQuestion.question_id;
              }

              if (
                reading_question_id ||
                listening_question_id ||
                writing_question_id
              ) {
                totalQuestionsCount++;

                await prisma.studentAnswerMockTest.create({
                  data: {
                    student_id: user.user_id,
                    mock_test_id: testId,
                    base_mock_test_id: baseMockTestId,
                    reading_question_id,
                    listening_question_id,
                    writing_question_id,
                    speaking_test_id: null, // Tidak ada speaking test di sini
                    studentAnswer: selectedAnswer,
                    recording_url: null,
                    isCorrect,
                    score,
                    submittedAt: new Date(),
                  },
                });
              }
            }
          )
        );
      })
    );

    // 🔹 Tandai bahwa siswa telah menyelesaikan test
    await prisma.accessMockTest.update({
      where: { access_mock_test_id: accessId },
      data: { is_completed: true },
    });

    // 🔹 Hitung skor akhir siswa
    const updatedScores = await prisma.studentAnswerMockTest.findMany({
      where: { student_id: user.user_id, mock_test_id: testId },
      select: { score: true },
    });

    const totalScore = updatedScores.reduce(
      (sum, answer) => sum + (answer.score ?? 0),
      0
    );
    const percentageScore = (totalScore / totalQuestionsCount) * 100 || 0;

    // 🔹 Tentukan level baru siswa berdasarkan skor
    let newLevel = "BASIC";
    if (percentageScore >= 80) {
      newLevel = "ADVANCED";
    } else if (percentageScore >= 50) {
      newLevel = "INTERMEDIATE";
    }

    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { level: newLevel },
    });

    await prisma.scoreMockTest.create({
      data: {
        student_id: user.user_id,
        mock_test_id: testId,
        totalScore: totalScore,
        percentageScore: percentageScore,
        level: newLevel,
      },
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: { totalScore, percentageScore, level: newLevel },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
