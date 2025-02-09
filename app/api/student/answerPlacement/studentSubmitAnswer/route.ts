import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { getData } from "@/app/lib/db/getData";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const user = authenticateRequest(request);
  const body = await request.json();
  const { selectedData, placement_test_id, access_id } = body;
  console.log(selectedData, placement_test_id, access_id);

  if (user instanceof NextResponse) {
    return user;
  }

  try {
    // Get the total number of questions for the current assignment
    const totalQuestions = await prisma.multipleChoicePlacementTest.count({
      where: {
        placement_test_id,
      },
    });

    // Looping for each answer submitted by the student
    await Promise.all(
      selectedData.map(async (answer: any) => {
        const { mcq_id, selectedAnswer } = answer;

        // Fetching the multiple-choice question
        const multipleChoice = await getData(
          "multipleChoicePlacementTest",
          {
            where: {
              mcq_id,
            },
          },
          "findUnique"
        );

        if (!multipleChoice) {
          throw new Error("Multiple Choice not found");
        }

        // Check if the answer is correct
        const isCorrect = multipleChoice.correctAnswer === selectedAnswer;

        // Calculate score
        const score = isCorrect ? 1 : 0;

        // Create a new answer if not found
        await prisma.studentAnswerPlacementTest.create({
          data: {
            student_id: user.user_id,
            placement_test_id,
            mcq_id,
            studentAnswer: selectedAnswer,
            isCorrect,
            score,
            submittedAt: new Date(),
          },
        });
      })
    );

    await prisma.accessPlacementTest.update({
      where: {
        access_placement_test_id: access_id,
      },
      data: {
        is_completed: true,
      },
    });

    // Recalculate the total score for the current assignment
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

    // Calculate the percentage score
    const percentageScore = (totalScore / totalQuestions) * 100 || 0;

    // Determine if the assignment is completed
    if (percentageScore >= 80) {
      await prisma.user.update({
        where: {
          user_id: user.user_id,
        },
        data: {
          level: "ADVANCED",
        },
      });
    } else if (percentageScore < 80 && percentageScore >= 50) {
      await prisma.user.update({
        where: {
          user_id: user.user_id,
        },
        data: {
          level: "INTERMEDIATE",
        },
      });
    } else {
      await prisma.user.update({
        where: {
          user_id: user.user_id,
        },
        data: {
          level: "BASIC",
        },
      });
    }

    return NextResponse.json({
      status: 200,
      error: false,
      data: { totalScore, percentageScore },
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
  } finally {
    await prisma.$disconnect();
  }
}
