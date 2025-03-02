import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/app/lib/prisma"; // Pastikan prisma di-import

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: {
      placement_test_id: string;
      basePlacementTestId: string;
      question_id: string;
    };
  }
) {
  try {
    // Ambil `type` dari query parameter
    const url = new URL(request.url);
    const type = url.searchParams.get("type");

    const { question_id } = params;

    const user = await authenticateRequest(request);
    if (user instanceof NextResponse) {
      return user;
    }

    if (!type || !question_id) {
      return NextResponse.json({
        status: 400,
        error: true,
        message: "Tipe soal atau ID soal tidak valid.",
      });
    }

    let deletedQuestion;

    // ✅ **Hapus soal berdasarkan tipe soal**
    if (type === "multipleChoice") {
      deletedQuestion = await prisma.multipleChoicePlacementTest.delete({
        where: { mc_id: question_id },
      });
    } else if (type === "reading") {
      // Cek apakah ini Passage atau Pertanyaan True/False
      const existingGroup = await prisma.trueFalseGroupPlacementTest.findUnique(
        {
          where: { group_id: question_id },
        }
      );

      if (existingGroup) {
        // Jika Passage dihapus, hapus juga semua soalnya
        await prisma.trueFalseQuestion.deleteMany({
          where: { group_id: question_id },
        });

        deletedQuestion = await prisma.trueFalseGroupPlacementTest.delete({
          where: { group_id: question_id },
        });
      } else {
        deletedQuestion = await prisma.trueFalseQuestion.delete({
          where: { tf_id: question_id },
        });
      }
    } else if (type === "writing") {
      deletedQuestion = await prisma.writingPlacementTest.delete({
        where: { writing_id: question_id },
      });
    } else {
      return NextResponse.json({
        status: 400,
        error: true,
        message: "Tipe soal tidak valid.",
      });
    }

    if (!deletedQuestion) {
      return NextResponse.json({
        status: 404,
        error: true,
        message: "Soal tidak ditemukan atau sudah dihapus.",
      });
    }

    return NextResponse.json({
      status: 200,
      error: false,
      message: "Soal berhasil dihapus.",
    });
  } catch (error: any) {
    console.error("Error deleting question:", error);

    if (error.code === "P2025") {
      return NextResponse.json({
        status: 404,
        error: true,
        message: "Soal tidak ditemukan atau sudah dihapus.",
      });
    }

    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
