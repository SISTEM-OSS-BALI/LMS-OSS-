import { NextRequest, NextResponse } from "next/server";
import { evaluateWritingAnswer } from "@/app/lib/utils/geminiHelper";
import prisma from "@/lib/prisma";
import {
  formatPhoneNumber,
  sendWhatsAppMessage,
} from "@/app/lib/utils/notificationHelper";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { selectedData, placement_test_id, email } = body;

  const apiKey = process.env.API_KEY_WATZAP!;
  const numberKey = process.env.NUMBER_KEY_WATZAP!;

  try {
    const user = await prisma.placementTestParticipant.findFirst({
      where: { email },
    });
    if (!user) {
      return NextResponse.json({
        status: 404,
        error: true,
        message: "Peserta tidak ditemukan.",
      });
    }

    const [mcCount, tfCount, writingCount] = await prisma.$transaction([
      prisma.multipleChoicePlacementTest.count({
        where: { basePlacementTest: { placementTestId: placement_test_id } },
      }),
      prisma.trueFalseQuestion.count({
        where: {
          trueFalseGroup: {
            basePlacementTest: { placementTestId: placement_test_id },
          },
        },
      }),
      prisma.writingPlacementTest.count({
        where: { basePlacementTest: { placementTestId: placement_test_id } },
      }),
    ]);

    const totalQuestionsCount = mcCount + tfCount + writingCount;
    if (totalQuestionsCount === 0) {
      return NextResponse.json({
        status: 400,
        error: true,
        message: "Placement test tidak memiliki soal.",
      });
    }

    const writingFeedback: {
      writing_id: string;
      score: number;
      feedback: string;
    }[] = [];
    const studentAnswers: any[] = [];
    const answerIds: string[] = [];

    for (const answer of selectedData) {
      const { id, selectedAnswer } = answer;
      const [multipleChoice, trueFalseQuestion, writingQuestion] =
        await prisma.$transaction([
          prisma.multipleChoicePlacementTest.findUnique({
            where: { mc_id: id },
          }),
          prisma.trueFalseQuestion.findUnique({ where: { tf_id: id } }),
          prisma.writingPlacementTest.findUnique({ where: { writing_id: id } }),
        ]);

      let isCorrect = null;
      let score = 0;
      const answer_id = crypto.randomUUID();
      const baseData = {
        answer_id,
        participant_id: user.participant_id,
        placement_test_id,
        studentAnswer: selectedAnswer,
        submittedAt: new Date(),
      };

      if (multipleChoice) {
        isCorrect = multipleChoice.correctAnswer === selectedAnswer;
        score = isCorrect ? 1 : 0;
        studentAnswers.push({ ...baseData, mcq_id: id, isCorrect, score });
      } else if (trueFalseQuestion) {
        isCorrect =
          trueFalseQuestion.correctAnswer.toString() === selectedAnswer;
        score = isCorrect ? 1 : 0;
        studentAnswers.push({ ...baseData, tf_id: id, isCorrect, score });
      } else if (writingQuestion) {
        try {
          const { aiScore, aiFeedback } = await evaluateWritingAnswer(
            writingQuestion.question,
            selectedAnswer
          );
          studentAnswers.push({
            ...baseData,
            writing_id: id,
            score: aiScore,
            writing_feedback: aiFeedback,
          });
          writingFeedback.push({
            writing_id: id,
            score: aiScore,
            feedback: aiFeedback,
          });
        } catch (error) {
          console.error(`Failed to evaluate writing for id ${id}`, error);
          studentAnswers.push({
            ...baseData,
            writing_id: id,
            score: 0,
            writing_feedback: "Evaluation failed.",
          });
          writingFeedback.push({
            writing_id: id,
            score: 0,
            feedback: "Evaluation failed.",
          });
        }
      }

      answerIds.push(answer_id);
    }

    await prisma.studentAnswerFreePlacementTest.createMany({
      data: studentAnswers,
    });

    const updatedScores = await prisma.studentAnswerFreePlacementTest.findMany({
      where: { answer_id: { in: answerIds } },
      select: { score: true },
    });

    const totalScore = updatedScores.reduce(
      (sum, item) => sum + (item.score ?? 0),
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

    await prisma.scoreFreePlacementTest.create({
      data: {
        participant_id: user.participant_id,
        placement_test_id,
        totalScore,
        percentageScore: parseFloat(percentageScore.toFixed(2)),
        level: newLevel,
      },
    });

    const no_tlp = formatPhoneNumber(user.phone ?? "");
    const message = `
🌟 *Halo, ${
      user.name
    }!*\n\nTerima kasih telah mengikuti *Placement Test* bersama *One Step Solution (OSS)*. Berikut adalah hasil tes Anda:\n\n📊 *Skor Total:* ${totalScore}  \n📈 *Persentase Skor:* ${percentageScore.toFixed(
      2
    )}%  \n🎯 *Level:* ${newLevel}  \n\n🗣 *Writing Feedback:*  \n${writingFeedback
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
        writingFeedback,
      },
    });
  } catch (error) {
    console.error("Error accessing database:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
