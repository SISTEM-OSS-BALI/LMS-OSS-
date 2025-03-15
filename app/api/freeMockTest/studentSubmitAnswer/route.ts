import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Pastikan Prisma client diimport
import { transcribeAudioFromBase64 } from "@/app/lib/utils/speechToTextHelper";
import { evaluateWritingAnswer } from "@/app/lib/utils/geminiHelper";
import {
  formatPhoneNumber,
  sendWhatsAppMessage,
} from "@/app/lib/utils/notificationHelper";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers, testId, audio, speaking_id, email } = body;

    const apiKey = process.env.API_KEY_WATZAP!;
    const numberKey = process.env.NUMBER_KEY_WATZAP!;

    if (!testId || !answers) {
      return NextResponse.json(
        { status: 400, error: true, message: "Data tidak lengkap." },
        { status: 400 }
      );
    }

    const [user, baseMockTests] = await prisma.$transaction([
      prisma.mockTestParticipant.findFirst({
        where: {
          email: email,
        },
      }),
      prisma.baseMockTest.findMany({
        where: { mock_test_id: testId },
        include: {
          reading: { include: { questions: true } },
          listening: { include: { questions: true } },
          speaking: true,
          writing: { include: { questions: true } },
        },
        orderBy: {
          createdAt: "asc",
        },
      }),
    ]);

    if (baseMockTests.length === 0) {
      return NextResponse.json(
        { status: 400, error: true, message: "Mock Test tidak memiliki soal." },
        { status: 400 }
      );
    }

    let totalQuestionsCount = 0;
    const speakingFeedback: {
      speaking_id: string;
      score: number;
      feedback: string;
    }[] = [];

    // ✅ **Simpan jawaban SPEAKING jika ada**
    if (speaking_id && audio) {
      const speakingTest = baseMockTests.find(
        (section) => section.speaking?.speaking_id === speaking_id
      );

      const transcriptionText = await transcribeAudioFromBase64(audio);

      const evaluationResult = speakingTest?.speaking?.prompt
        ? await evaluateWritingAnswer(
            speakingTest.speaking.prompt,
            transcriptionText
          )
        : null;
      const { aiScore, aiFeedback } = evaluationResult || {};

      if (speakingTest) {
        await prisma.studentAnswerFreeMockTest.create({
          data: {
            participant_id: user?.participant_id ?? "",
            mock_test_id: testId,
            base_mock_test_id: speakingTest.base_mock_test_id,
            speaking_test_id: speaking_id,
            studentAnswer: null, // Tidak ada jawaban teks untuk speaking
            recording_url: audio, // Simpan audio di sini
            isCorrect: null,
            feedback: aiFeedback,
            score: aiScore,
            submittedAt: new Date(),
          },
        });
        speakingFeedback.push({
          speaking_id: speaking_id,
          score: aiScore ?? 0,
          feedback: aiFeedback ?? "",
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

                await prisma.studentAnswerFreeMockTest.create({
                  data: {
                    participant_id: user?.participant_id ?? "",
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

    // 🔹 Hitung skor akhir siswa
    const updatedScores = await prisma.studentAnswerFreeMockTest.findMany({
      where: { participant_id: user?.participant_id, mock_test_id: testId },
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

    await prisma.scoreFreeMockTest.create({
      data: {
        participant_id: user?.participant_id ?? "",
        mock_test_id: testId,
        totalScore: totalScore,
        percentageScore: percentageScore,
        level: newLevel,
      },
    });

    const no_tlp = formatPhoneNumber(user?.phone ?? "");

    // 🔹 Kirim notifikasi

    (async () => {
      const message = `
🌟 *Halo, ${user?.name}!*

Terima kasih telah mengikuti *Placement Test* bersama *One Step Solution (OSS)*. Berikut adalah hasil tes Anda:

📊 *Skor Total:* ${totalScore}  
📈 *Persentase Skor:* ${percentageScore.toFixed(2)}%  
🎯 *Level:* ${newLevel}  

🗣 *Speaking Feedback:*  
${speakingFeedback
  .map((feedback) => `- ${feedback.feedback} (⭐ Skor: ${feedback.score})`)
  .join("\n")}

📢 *Tingkatkan Kemampuan Bahasa Inggris Anda!*
Hasil tes menunjukkan bahwa masih ada ruang untuk perbaikan dalam kemampuan bahasa Inggris Anda. Kami sangat menyarankan Anda untuk bergabung dengan *Program Sahabat OSS English Course*! 🚀✨  

✅ *Keuntungan Bergabung:*  
🌏 Peluang *Kerja di Luar Negeri* dengan gaji dalam *Dollar 💵*  
🎓 Bisa *Kuliah sambil Berkarier* di luar negeri 🏫✈️  

🔥 Jangan lewatkan kesempatan ini untuk masa depan yang lebih cerah!  

📞 Hubungi kami untuk informasi lebih lanjut. Kami siap membantu Anda! 😊  

Terima kasih,  
*One Step Solution (OSS)* 🌍✨
`;
      await sendWhatsAppMessage(apiKey, numberKey, no_tlp, message);
    })();

    return NextResponse.json({
      status: 200,
      error: false,
      data: { totalScore, percentageScore, level: newLevel, speakingFeedback },
    });
  } catch (error) {
    console.error("Error accessing database:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
