import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, Part, Content } from "@google/generative-ai";
import { evaluateWritingAnswer } from "@/app/lib/utils/geminiHelper";


export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  const body = await request.json();
  const { selectedData, placement_test_id, access_id } = body;

  if (user instanceof NextResponse) {
    return user;
  }

  try {
    // 🔹 Ambil jumlah total soal dalam placement test
    const totalQuestions = await prisma.basePlacementTest.findMany({
      where: {
        placementTestId: placement_test_id,
      },
      include: {
        multipleChoices: true,
        trueFalseGroups: {
          include: {
            trueFalseQuestions: true,
          },
        },
        writingQuestions: true,
      },
    });

    const totalQuestionsCount = totalQuestions.reduce(
      (count, section) =>
        count +
        section.multipleChoices.length +
        section.trueFalseGroups.reduce(
          (subCount, group) => subCount + group.trueFalseQuestions.length,
          0
        ) +
        section.writingQuestions.length,
      0
    );

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

    // 🔹 Loop setiap jawaban yang dikirimkan siswa
    await Promise.all(
      selectedData.map(async (answer: any) => {
        const { id, selectedAnswer } = answer;

        // 🔹 Cek apakah soal ini Multiple Choice, True/False, atau Writing
        const multipleChoice =
          await prisma.multipleChoicePlacementTest.findUnique({
            where: { mc_id: id },
          });

        const trueFalseQuestion = await prisma.trueFalseQuestion.findUnique({
          where: { tf_id: id },
        });

        const writingQuestion = await prisma.writingPlacementTest.findUnique({
          where: { writing_id: id },
        });

        let isCorrect = null;
        let score = 0;

        if (multipleChoice) {
          isCorrect = multipleChoice.correctAnswer === selectedAnswer;
          score = isCorrect ? 1 : 0;
          await prisma.studentAnswerPlacementTest.create({
            data: {
              student_id: user.user_id,
              placement_test_id,
              mcq_id: id,
              studentAnswer: selectedAnswer,
              isCorrect,
              score,
              submittedAt: new Date(),
            },
          });
        } else if (trueFalseQuestion) {
          const trueFalseGroup =
            await prisma.trueFalseGroupPlacementTest.findFirst({
              where: { group_id: trueFalseQuestion.group_id },
            });
          isCorrect =
            trueFalseQuestion.correctAnswer.toString() === selectedAnswer;
          score = isCorrect ? 1 : 0;
          await prisma.studentAnswerPlacementTest.create({
            data: {
              student_id: user.user_id,
              placement_test_id,
              tf_id: id,
              group_id: trueFalseGroup ? trueFalseGroup.group_id : null,
              studentAnswer: selectedAnswer,
              isCorrect,
              score,
              submittedAt: new Date(),
            },
          });
        } else if (writingQuestion) {
          const writingQuestionText = writingQuestion.question;
          const { aiScore, aiFeedback } = await evaluateWritingAnswer(
            writingQuestionText,
            selectedAnswer
          );

          await prisma.studentAnswerPlacementTest.create({
            data: {
              student_id: user.user_id,
              placement_test_id,
              writing_id: id,
              studentAnswer: selectedAnswer,
              score: aiScore,
              writing_feedback: aiFeedback,
              submittedAt: new Date(),
            },
          });

          writingFeedback.push({
            writing_id: id,
            score: aiScore,
            feedback: aiFeedback,
          });
        }
      })
    );

    // 🔹 Tandai bahwa siswa telah menyelesaikan test
    await prisma.accessPlacementTest.update({
      where: {
        access_placement_test_id: access_id,
      },
      data: {
        is_completed: true,
      },
    });

    // 🔹 Hitung skor akhir siswa
    const updatedScores = await prisma.studentAnswerPlacementTest.findMany({
      where: {
        student_id: user.user_id,
        placement_test_id,
      },
      select: {
        score: true,
      },
    });

    const totalScore = updatedScores.reduce(
      (sum, answer) => sum + answer.score,
      0
    );
    const percentageScore = (totalScore / totalQuestionsCount) * 100 || 0;

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

    await prisma.scorePlacementTest.create({
      data: {
        student_id: user.user_id,
        placement_test_id,
        totalScore: totalScore,
        percentageScore: percentageScore,
        level: newLevel,
      },
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: {
        totalScore,
        percentageScore,
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
  } finally {
    await prisma.$disconnect();
  }
}

