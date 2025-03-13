import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { getData } from "@/app/lib/db/getData";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  const body = await request.json();
  const { selectedData, assignment_id, base_id, course_id } = body;

  if (user instanceof NextResponse) {
    return user;
  }

  try {
    // Get the total number of questions for the current assignment
    const totalQuestions = await prisma.multipleChoice.count({
      where: {
        assignment_id,
      },
    });

    // Looping for each answer submitted by the student
    await Promise.all(
      selectedData.map(async (answer: any) => {
        const { mcq_id, selectedAnswer } = answer;

        // Fetching the multiple-choice question
        const multipleChoice = await getData(
          "multipleChoice",
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

        // Update or create the student's answer
        const existingAnswer = await prisma.studentAnswerAssigment.findFirst({
          where: {
            student_id: user.user_id,
            assignment_id,
            mcq_id,
          },
        });

        if (existingAnswer) {
          // Update the existing answer if found
          await prisma.studentAnswerAssigment.update({
            where: {
              answer_id: existingAnswer.answer_id,
            },
            data: {
              studentAnswer: selectedAnswer,
              isCorrect,
              score,
              submittedAt: new Date(),
            },
          });
        } else {
          // Create a new answer if not found
          await prisma.studentAnswerAssigment.create({
            data: {
              student_id: user.user_id,
              assignment_id,
              mcq_id,
              studentAnswer: selectedAnswer,
              isCorrect,
              score,
              submittedAt: new Date(),
            },
          });
        }
      })
    );

    // Recalculate the total score for the current assignment
    const updatedScores = await prisma.studentAnswerAssigment.findMany({
      where: {
        student_id: user.user_id,
        assignment_id,
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
    const completed = percentageScore >= 50;

    // Check if an assignment progress entry already exists
    const existingProgress = await prisma.assignmentProgress.findUnique({
      where: {
        user_id_base_id: {
          user_id: user.user_id,
          base_id,
        },
      },
    });

    if (existingProgress) {
      // Update the existing progress entry
      await prisma.assignmentProgress.update({
        where: { progress_id: existingProgress.progress_id },
        data: {
          score: percentageScore,
          completed,
        },
      });
    } else {
      // Create a new progress entry if not found
      await prisma.assignmentProgress.create({
        data: {
          user_id: user.user_id,
          base_id,
          score: percentageScore,
          assignment_id,
          completed,
        },
      });
    }

    const totalCourseMaterials = await prisma.material.count({
      where: {
        materialBase: {
          course_id: course_id,
        },
      },
    });

    const totalAssignments = await prisma.assignment.count({
      where: {
        materialAssigmentBase: {
          course_id: course_id,
        },
      },
    });

    const completedMaterials = await prisma.materialProgress.count({
      where: {
        user_id: user.user_id,
        completed: true,
        material: {
          materialBase: {
            course_id: course_id,
          },
        },
      },
    });

    // Count completed assignments
    const completedAssignments = await prisma.assignmentProgress.count({
      where: {
        user_id: user.user_id,
        completed: true,
        base: {
          course_id: course_id,
        },
      },
    });

    const totalItems = totalCourseMaterials + totalAssignments;
    const completedItems = completedMaterials + completedAssignments;
    const progressPercentage =
      totalItems > 0 ? ((completedItems / totalItems) * 100).toFixed(2) : 0;

    // If the assignment is completed, update the CourseProgress
    if (completed) {
      const existingCourseProgress = await prisma.courseProgress.findUnique({
        where: {
          user_id_course_id: {
            user_id: user.user_id,
            course_id,
          },
        },
      });

      if (existingCourseProgress) {
        // Update the course progress entry
        await prisma.courseProgress.update({
          where: {
            progress_course_id: existingCourseProgress.progress_course_id,
          },
          data: {
            progress: Number(progressPercentage),
            totalMaterialAssigement: totalAssignments,
            completed: completedItems === totalItems,
            currentMaterialAssigmentBaseId: base_id, // or true if course is fully completed
            // Optionally, you can update other progress-related fields here
          },
        });
      } else {
        // Create a new course progress entry if not found
        await prisma.courseProgress.create({
          data: {
            user_id: user.user_id,
            course_id: course_id,
            progress: Number(progressPercentage),
            totalMaterialAssigement: totalAssignments,
            completed: completedItems === totalItems,
            currentMaterialAssigmentBaseId: base_id,
          },
        });
      }
    }

    return NextResponse.json({
      status: 200,
      error: false,
      totalScore,
      percentageScore,
      completed,
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
