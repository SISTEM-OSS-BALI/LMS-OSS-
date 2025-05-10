import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { NextRequest, NextResponse } from "next/server";
import { evaluateWritingAnswer } from "@/app/lib/utils/geminiHelper";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (user instanceof NextResponse) return user;

  try {
    const body = await request.json();
    const { selectedData, placement_test_id, access_id } = body;

    if (!placement_test_id || !access_id || !selectedData) {
      return NextResponse.json(
        { status: 400, error: true, message: "Data tidak lengkap." },
        { status: 400 }
      );
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
      return NextResponse.json(
        {
          status: 400,
          error: true,
          message: "Placement test tidak memiliki soal.",
        },
        { status: 400 }
      );
    }

    const writingFeedback: {
      writing_id: string;
      score: number;
      feedback: string;
    }[] = [];
    const studentAnswers: any[] = [];
    const insertedAnswerIds: string[] = [];

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

      if (multipleChoice) {
        isCorrect = multipleChoice.correctAnswer === selectedAnswer;
        score = isCorrect ? 1 : 0;
        studentAnswers.push({
          answer_id,
          student_id: user.user_id,
          placement_test_id,
          mcq_id: id,
          studentAnswer: selectedAnswer,
          isCorrect,
          score,
          submittedAt: new Date(),
        });
      } else if (trueFalseQuestion) {
        isCorrect =
          trueFalseQuestion.correctAnswer.toString() === selectedAnswer;
        score = isCorrect ? 1 : 0;
        studentAnswers.push({
          answer_id,
          student_id: user.user_id,
          placement_test_id,
          tf_id: id,
          studentAnswer: selectedAnswer,
          isCorrect,
          score,
          submittedAt: new Date(),
        });
      } else if (writingQuestion) {
        try {
          const { aiScore, aiFeedback } = await evaluateWritingAnswer(
            writingQuestion.question,
            selectedAnswer
          );
          await prisma.studentAnswerPlacementTest.create({
            data: {
              answer_id,
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
        } catch (error) {
          console.error(
            `Failed to evaluate writing answer for id ${id}:`,
            error
          );
          await prisma.studentAnswerPlacementTest.create({
            data: {
              answer_id,
              student_id: user.user_id,
              placement_test_id,
              writing_id: id,
              studentAnswer: selectedAnswer,
              score: 0,
              writing_feedback: "Evaluation failed.",
              submittedAt: new Date(),
            },
          });
          writingFeedback.push({
            writing_id: id,
            score: 0,
            feedback: "Evaluation failed.",
          });
        }
      }

      insertedAnswerIds.push(answer_id);
    }

    if (studentAnswers.length > 0) {
      await prisma.studentAnswerPlacementTest.createMany({
        data: studentAnswers,
      });
    }

    await prisma.accessPlacementTest.update({
      where: { access_placement_test_id: access_id },
      data: { is_completed: true },
    });

    const updatedScores = await prisma.studentAnswerPlacementTest.findMany({
      where: { answer_id: { in: insertedAnswerIds } },
      select: { score: true },
    });

    const totalScore = updatedScores.reduce(
      (sum, answer) => sum + (answer.score ?? 0),
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

    await prisma.$transaction([
      prisma.user.update({
        where: { user_id: user.user_id },
        data: { level: newLevel },
      }),
      prisma.scorePlacementTest.create({
        data: {
          student_id: user.user_id,
          placement_test_id,
          totalScore,
          percentageScore: parseFloat(percentageScore.toFixed(2)),
          level: newLevel,
        },
      }),
    ]);

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
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
