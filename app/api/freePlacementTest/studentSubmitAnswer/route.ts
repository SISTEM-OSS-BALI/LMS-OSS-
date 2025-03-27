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

    // 🔹 Ambil data user dan jumlah soal sekaligus untuk menghindari banyak query
    const [mcCount, tfCount, writingCount] = await prisma.$transaction([
      prisma.multipleChoicePlacementTest.count({
        where: {
          basePlacementTest: {
            placementTestId: placement_test_id,
          },
        },
      }),
      prisma.trueFalseQuestion.count({
        where: {
          trueFalseGroup: {
            basePlacementTest: {
              placementTestId: placement_test_id,
            },
          },
        },
      }),
      prisma.writingPlacementTest.count({
        where: {
          basePlacementTest: {
            placementTestId: placement_test_id,
          },
        },
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

    if (!totalQuestionsCount) {
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

    // 🔹 Proses semua jawaban secara paralel
    const answersPromises = selectedData.map(async (answer: any) => {
      const { id, selectedAnswer } = answer;

      // 🔹 Cek jenis soal (Multiple Choice, True/False, Writing)
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
      let data: any = {
        participant_id: user?.participant_id ?? "",
        placement_test_id,
        studentAnswer: selectedAnswer,
        submittedAt: new Date(),
      };

      if (multipleChoice) {
        isCorrect = multipleChoice.correctAnswer === selectedAnswer;
        score = isCorrect ? 1 : 0;
        data = { ...data, mcq_id: id, isCorrect, score };
      } else if (trueFalseQuestion) {
        isCorrect =
          trueFalseQuestion.correctAnswer.toString() === selectedAnswer;
        score = isCorrect ? 1 : 0;
        data = { ...data, tf_id: id, isCorrect, score };
      } else if (writingQuestion) {
        const { aiScore, aiFeedback } = await evaluateWritingAnswer(
          writingQuestion.question,
          selectedAnswer
        );
        data = {
          ...data,
          writing_id: id,
          score: aiScore,
          writing_feedback: aiFeedback,
        };

        writingFeedback.push({
          writing_id: id,
          score: aiScore,
          feedback: aiFeedback,
        });
      }

      return data;
    });

    // 🔹 Simpan semua jawaban sekaligus dalam batch transaction
    const studentAnswers = await Promise.all(answersPromises);
    await prisma.studentAnswerFreePlacementTest.createMany({
      data: studentAnswers,
    });

    // 🔹 Hitung skor akhir siswa
    const updatedScores = await prisma.studentAnswerFreePlacementTest.findMany({
      where: {
        participant_id: user?.participant_id,
        placement_test_id: placement_test_id,
      },
      select: { score: true },
    });

    // ✅ **Hitung skor akhir siswa dalam satu query**
    const totalScore = updatedScores.reduce(
      (sum, answer) => sum + (answer.score ?? 0),
      0
    );
    const percentageScore =
      Math.min((totalScore / totalQuestionsCount) * 100, 100) || 0;

    let newLevel = "Beginner";
    // 🔹 Tentukan level baru siswa berdasarkan skor
    if (totalScore >= 46) {
      newLevel = "Advanced";
    } else if (totalScore >= 40) {
      newLevel = "Upper Intermediate";
    } else if (totalScore >= 33) {
      newLevel = "Intermediate";
    } else if (totalScore >= 25) {
      newLevel = "Pre-Intermediate";
    } else if (totalScore >= 16) {
      newLevel = "Elementary";
    }

    // 🔹 Simpan skor akhir siswa
    await prisma.scoreFreePlacementTest.create({
      data: {
        participant_id: user?.participant_id ?? "",
        placement_test_id,
        totalScore,
        percentageScore,
        level: newLevel,
      },
    });

    const no_tlp = formatPhoneNumber(user.phone ?? "");
    const message = `
🌟 *Halo, ${user.name}!*

Terima kasih telah mengikuti *Placement Test* bersama *One Step Solution (OSS)*. Berikut adalah hasil tes Anda:

📊 *Skor Total:* ${totalScore}  
📈 *Persentase Skor:* ${percentageScore.toFixed(2)}%  
🎯 *Level:* ${newLevel}  

🗣 *Writing Feedback:*  
${writingFeedback
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

    return NextResponse.json({
      status: 200,
      error: false,
      data: { totalScore, percentageScore, level: newLevel, writingFeedback },
    });
  } catch (error) {
    console.error("Error accessing database:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
