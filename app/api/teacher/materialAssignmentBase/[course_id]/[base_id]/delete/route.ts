import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { base_id?: string } }
) {
  try {
    const base_id = params.base_id;
    const user = await authenticateRequest(request);

    // Periksa autentikasi pengguna
    if (user instanceof NextResponse) {
      return user;
    }

    // Validasi keberadaan `base_id`
    if (!base_id) {
      return NextResponse.json(
        { error: "Base ID is required" },
        { status: 400 }
      );
    }

    // Periksa apakah MaterialAssignmentBase dimiliki oleh pengguna
    const materialAssignmentBase = await prisma.materialAssigmentBase.findFirst(
      {
        where: { base_id, course: { teacher_id: user.user_id } },
      }
    );

    if (!materialAssignmentBase) {
      return NextResponse.json(
        {
          error: true,
          message: "MaterialAssignmentBase not found or not owned by user",
        },
        { status: 404 }
      );
    }

    // Mulai transaksi penghapusan berdasarkan tipe
    await prisma.$transaction(async (tx) => {
      if (materialAssignmentBase.type === "ASSIGNMENT") {
        // Hapus data terkait ASSIGNMENT
        await tx.studentAnswerAssigment.deleteMany({
          where: { assignment: { base_id } },
        });
        await tx.multipleChoice.deleteMany({
          where: { assignment: { base_id } },
        });
        await tx.essay.deleteMany({
          where: { assignment: { base_id } },
        });
        await tx.pair.deleteMany({
          where: { sentenceMatching: { assignment: { base_id } } },
        });
        await tx.assignmentProgress.deleteMany({
          where: { base_id },
        });
        await tx.assignment.deleteMany({
          where: { base_id },
        });
      } else if (materialAssignmentBase.type === "MATERIAL") {
        // Hapus data terkait MATERIAL
        await tx.materialProgress.deleteMany({
          where: { base_id },
        });
        await tx.materialText.deleteMany({
          where: { material: { base_id } },
        });
        await tx.materialImage.deleteMany({
          where: { material: { base_id } },
        });
        await tx.materialUrl.deleteMany({
          where: { material: { base_id } },
        });
        await tx.material.deleteMany({
          where: { base_id },
        });
      }

      // Hapus MaterialAssignmentBase
      await tx.materialAssigmentBase.delete({
        where: { base_id },
      });
    });

    return NextResponse.json({
      status: 200,
      error: false,
      message: "MaterialAssignmentBase deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting MaterialAssignmentBase:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
