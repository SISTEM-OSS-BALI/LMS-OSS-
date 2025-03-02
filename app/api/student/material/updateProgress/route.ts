import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { authenticateRequest } from "@/app/lib/auth/authUtils";

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  const body = await request.json();
  const { material_id, base_id, course_id, assignment_id } = body;

  if (user instanceof NextResponse) {
    return user;
  }

  try {
    // Update progress for MaterialProgress
    if (material_id) {
      // Update material progress
      await prisma.materialProgress.upsert({
        where: {
          user_id_material_id: {
            user_id: user.user_id,
            material_id: material_id,
          },
        },
        update: { completed: true },
        create: {
          user_id: user.user_id,
          material_id: material_id,
          base_id: base_id,
          completed: true,
        },
      });
    }

    if (assignment_id) {
      // Update assignment progress
      await prisma.assignmentProgress.upsert({
        where: {
          user_id_base_id: {
            user_id: user.user_id,
            base_id: base_id,
          },
        },
        update: { completed: true },
        create: {
          user_id: user.user_id,
          assignment_id: assignment_id,
          base_id: base_id,
          completed: true,
        },
      });
    }

    // Fetch total materials and assignments for the course
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

    // Count completed materials
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

    // Calculate the overall progress percentage
    const totalItems = totalCourseMaterials + totalAssignments;
    const completedItems = completedMaterials + completedAssignments;
    const progressPercentage =
      totalItems > 0 ? ((completedItems / totalItems) * 100).toFixed(2) : 0;

    // Update CourseProgress
    const courseProgress = await prisma.courseProgress.upsert({
      where: {
        user_id_course_id: {
          user_id: user.user_id,
          course_id: course_id,
        },
      },
      update: {
        progress: Number(progressPercentage),
        totalMaterialAssigement: totalItems,
        completed: completedItems === totalItems,
        currentMaterialAssigmentBaseId: base_id,
      },
      create: {
        user_id: user.user_id,
        course_id: course_id,
        progress: Number(progressPercentage),
        totalMaterialAssigement: totalItems,
        completed: completedItems === totalItems,
        currentMaterialAssigmentBaseId: base_id,
      },
    });

    if (courseProgress.completed === true) {
      await prisma.courseEnrollment.update({
        where: {
          user_id_course_id: {
            user_id: user.user_id,
            course_id: course_id,
          },
        },
        data: {
          completed: true,
        },
      });
    }

    return NextResponse.json({
      status: 200,
      error: false,
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
