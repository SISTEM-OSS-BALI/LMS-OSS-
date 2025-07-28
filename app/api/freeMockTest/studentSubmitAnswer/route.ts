import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { transcribeAudioFromUrl } from "@/app/lib/utils/speechToTextHelper";
import { evaluateWritingAnswer } from "@/app/lib/utils/geminiHelper";
import {
  formatPhoneNumber,
  sendWhatsAppMessage,
} from "@/app/lib/utils/notificationHelper";
import { uploadBase64Audio } from "@/app/lib/utils/uploadAudioHelper";

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
      prisma.mockTestParticipant.findFirst({ where: { email } }),
      prisma.baseMockTest.findMany({
        where: { mock_test_id: testId },
        include: {
          reading: { include: { questions: true } },
          listening: { include: { questions: true } },
          speaking: true,
          writing: { include: { questions: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    if (!user || baseMockTests.length === 0) {
      return NextResponse.json(
        { status: 400, error: true, message: "Mock Test tidak valid." },
        { status: 400 }
      );
    }

    let totalQuestionsCount = 0;
    const answerIds: string[] = [];
    const speakingFeedback: {
      speaking_id: string;
      score: number;
      feedback: string;
    }[] = [];

    if (speaking_id && audio) {
       const fileName = `speaking/${user.participant_id}_${Date.now()}.mp3`;
       const publicUrl = await uploadBase64Audio(audio, fileName);
      const speakingTest = baseMockTests.find(
        (section) => section.speaking?.speaking_id === speaking_id
      );
      if (!speakingTest) {
        return NextResponse.json(
          {
            status: 400,
            error: true,
            message: "Speaking test tidak ditemukan.",
          },
          { status: 400 }
        );
      }

      try {
        const transcriptionText = await transcribeAudioFromUrl(publicUrl);
        const evaluation = speakingTest.speaking?.prompt
          ? await evaluateWritingAnswer(
              speakingTest.speaking.prompt,
              transcriptionText
            )
          : null;

        const aiScore = evaluation?.aiScore ?? 0;
        const aiFeedback = evaluation?.aiFeedback ?? "Evaluation failed.";
        const answer_id = crypto.randomUUID();
        answerIds.push(answer_id);

        await prisma.studentAnswerFreeMockTest.create({
          data: {
            answer_id,
            participant_id: user.participant_id,
            mock_test_id: testId,
            base_mock_test_id: speakingTest.base_mock_test_id,
            speaking_test_id: speaking_id,
            studentAnswer: null,
            recording_url: publicUrl,
            feedback: aiFeedback,
            isCorrect: null,
            score: aiScore,
            submittedAt: new Date(),
          },
        });

        speakingFeedback.push({
          speaking_id,
          score: aiScore,
          feedback: aiFeedback,
        });
      } catch (error) {
        const answer_id = crypto.randomUUID();
        answerIds.push(answer_id);

        await prisma.studentAnswerFreeMockTest.create({
          data: {
            answer_id,
            participant_id: user.participant_id,
            mock_test_id: testId,
            base_mock_test_id: speakingTest.base_mock_test_id,
            speaking_test_id: speaking_id,
            studentAnswer: null,
            recording_url: publicUrl,
            feedback: "Evaluation failed.",
            isCorrect: null,
            score: 0,
            submittedAt: new Date(),
          },
        });

        speakingFeedback.push({
          speaking_id,
          score: 0,
          feedback: "Evaluation failed.",
        });
      }
    }

    for (const [baseMockTestId, questions] of Object.entries(answers)) {
      for (const [question_id, selectedAnswer] of Object.entries(
        questions as { [key: string]: any }
      )) {
        let isCorrect = null;
        let score = 0;
        let reading_question_id = null;
        let listening_question_id = null;
        let writing_question_id = null;

        const readingQuestion = baseMockTests
          .flatMap((s) => s.reading?.questions ?? [])
          .find((q) => q.question_id === question_id);
        const listeningQuestion = baseMockTests
          .flatMap((s) => s.listening?.questions ?? [])
          .find((q) => q.question_id === question_id);
        const writingQuestion = baseMockTests
          .flatMap((s) => s.writing?.questions ?? [])
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
          const answer_id = crypto.randomUUID();
          answerIds.push(answer_id);

          await prisma.studentAnswerFreeMockTest.create({
            data: {
              answer_id,
              participant_id: user.participant_id,
              mock_test_id: testId,
              base_mock_test_id: baseMockTestId,
              reading_question_id,
              listening_question_id,
              writing_question_id,
              speaking_test_id: null,
              studentAnswer: selectedAnswer,
              recording_url: null,
              isCorrect,
              score,
              submittedAt: new Date(),
            },
          });
        }
      }
    }

    const updatedScores = await prisma.studentAnswerFreeMockTest.findMany({
      where: { answer_id: { in: answerIds } },
      select: { score: true },
    });

    const totalScore = updatedScores.reduce(
      (sum, ans) => sum + (ans.score ?? 0),
      0
    );
    const percentageScore =
      Math.min((totalScore / totalQuestionsCount) * 100, 100) || 0;

    let newLevel = "Beginner";
    if (totalScore >= 46) newLevel = "Advanced";
    else if (totalScore >= 40) newLevel = "Upper Intermediate";
    else if (totalScore >= 33) newLevel = "Intermediate";
    else if (totalScore >= 25) newLevel = "Pre-Intermediate";
    else if (totalScore >= 16) newLevel = "Elementary";

    await prisma.scoreFreeMockTest.create({
      data: {
        participant_id: user.participant_id,
        mock_test_id: testId,
        totalScore,
        percentageScore: parseFloat(percentageScore.toFixed(2)),
        level: newLevel,
      },
    });

    const no_tlp = formatPhoneNumber(user.phone ?? "");
    const message = `
🌟 *Halo, ${
      user.name
    }!*\n\nTerima kasih telah mengikuti *Mock Test* bersama *One Step Solution (OSS)*. Berikut adalah hasil tes Anda:\n\n📊 *Skor Total:* ${totalScore}  \n📈 *Persentase Skor:* ${percentageScore.toFixed(
      2
    )}%  \n🎯 *Level:* ${newLevel}  \n\n🗣 *Speaking Feedback:*  \n${speakingFeedback
      .map((f) => `- ${f.feedback} (⭐ Skor: ${f.score})`)
      .join(
        "\n"
      )}\n\n📢 *Tingkatkan Kemampuan Bahasa Inggris Anda!*\nHasil tes menunjukkan bahwa masih ada ruang untuk perbaikan dalam kemampuan bahasa Inggris Anda. Kami sangat menyarankan Anda untuk bergabung dengan *Program Sahabat OSS English Course*! 🚀✨  \n\n✅ *Keuntungan Bergabung:*  \n🌏 Peluang *Kerja di Luar Negeri* dengan gaji dalam *Dollar 💵*  \n🎓 Bisa *Kuliah sambil Berkarier* di luar negeri 🏫✈️  \n\n🔥 Jangan lewatkan kesempatan ini untuk masa depan yang lebih cerah!  \n\n📞 Hubungi kami untuk informasi lebih lanjut. Kami siap membantu Anda! 😊  \n\nTerima kasih,  \n*One Step Solution (OSS)* 🌍✨
`;

    await sendWhatsAppMessage(apiKey, numberKey, no_tlp, message);

    return NextResponse.json({
      status: 200,
      error: false,
      data: {
        totalScore,
        percentageScore: percentageScore.toFixed(2),
        level: newLevel,
        speakingFeedback,
      },
    });
  } catch (error) {
    console.error("Error accessing database:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
