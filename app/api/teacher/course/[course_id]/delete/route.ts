import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { course_id?: string } }
) {
  try {
    const course_id = params.course_id;
    const user = await authenticateRequest(request);

    // Periksa autentikasi pengguna
    if (user instanceof NextResponse) {
      return user;
    }

    // Validasi keberadaan `course_id`
    if (!course_id) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Periksa apakah course dimiliki oleh pengguna
    const course = await prisma.course.findFirst({
      where: { course_id, teacher_id: user.user_id },
    });

    if (!course) {
      return NextResponse.json(
        { error: true, message: "Course not found or not owned by user" },
        { status: 404 }
      );
    }

    // Penghapusan berurutan
    await prisma.$transaction([
      // Hapus jawaban siswa
      prisma.studentAnswerAssigment.deleteMany({
        where: {
          assignment: {
            materialAssigmentBase: {
              course_id,
            },
          },
        },
      }),

      // Hapus MultipleChoice, Essay, dan Pair
      prisma.multipleChoice.deleteMany({
        where: {
          assignment: {
            materialAssigmentBase: {
              course_id,
            },
          },
        },
      }),

      prisma.essay.deleteMany({
        where: {
          assignment: {
            materialAssigmentBase: {
              course_id,
            },
          },
        },
      }),

      prisma.pair.deleteMany({
        where: {
          sentenceMatching: {
            assignment: {
              materialAssigmentBase: {
                course_id,
              },
            },
          },
        },
      }),

      prisma.assignmentProgress.deleteMany({
        where: {
          base: {
            course_id,
          },
        },
      }),
      // Hapus Assignment
      prisma.assignment.deleteMany({
        where: {
          materialAssigmentBase: {
            course_id,
          },
        },
      }),

      // Hapus progress terkait

      prisma.materialProgress.deleteMany({
        where: {
          base: {
            course_id,
          },
        },
      }),

      // Hapus materi
      prisma.materialText.deleteMany({
        where: {
          material: {
            materialBase: {
              course_id,
            },
          },
        },
      }),

      prisma.materialImage.deleteMany({
        where: {
          material: {
            materialBase: {
              course_id,
            },
          },
        },
      }),

      prisma.materialUrl.deleteMany({
        where: {
          material: {
            materialBase: {
              course_id,
            },
          },
        },
      }),

      prisma.material.deleteMany({
        where: {
          materialBase: {
            course_id,
          },
        },
      }),

      // Hapus MaterialAssigmentBase
      prisma.materialAssigmentBase.deleteMany({
        where: {
          course_id,
        },
      }),

      // Hapus enrollment dan progress course
      prisma.courseEnrollment.deleteMany({
        where: { course_id },
      }),

      prisma.courseProgress.deleteMany({
        where: { course_id },
      }),

      // Hapus course
      prisma.course.delete({
        where: { course_id },
      }),
    ]);

    return NextResponse.json({
      status: 200,
      error: false,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
