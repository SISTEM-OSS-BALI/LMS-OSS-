import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";

export async function PUT(
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
    const body = await request.json();
    const { type, passage, question, options, correctAnswer } = body;
    const { question_id } = params;

    const user = authenticateRequest(request);
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

    // ✅ **Update untuk Multiple Choice**
    if (type === "multipleChoice") {
      const existingQuestion =
        await prisma.multipleChoicePlacementTest.findUnique({
          where: { mc_id: question_id },
        });

      if (!existingQuestion) {
        return NextResponse.json({
          status: 404,
          error: true,
          message: "Soal tidak ditemukan.",
        });
      }

      await prisma.multipleChoicePlacementTest.update({
        where: { mc_id: question_id },
        data: {
          question,
          options,
          correctAnswer,
        },
      });
    }

    // ✅ **Update untuk Reading (True/False)**
    else if (type === "reading") {
      // **Cek apakah yang diedit adalah Passage atau Pertanyaan True/False**
      const existingGroup = await prisma.trueFalseGroupPlacementTest.findUnique(
        {
          where: { group_id: question_id },
        }
      );

      if (passage && existingGroup) {
        // ✅ Update Passage
        await prisma.trueFalseGroupPlacementTest.update({
          where: { group_id: question_id },
          data: { passage },
        });
      } else {
        const existingQuestion = await prisma.trueFalseQuestion.findUnique({
          where: { tf_id: question_id },
        });

        if (!existingQuestion) {
          return NextResponse.json({
            status: 404,
            error: true,
            message: "Soal tidak ditemukan.",
          });
        }

        // ✅ Update Pertanyaan True/False
        await prisma.trueFalseQuestion.update({
          where: { tf_id: question_id },
          data: { question, correctAnswer },
        });
      }
    }

    // ✅ **Update untuk Writing**
    else if (type === "writing") {
      const existingQuestion = await prisma.writingPlacementTest.findUnique({
        where: { writing_id: question_id },
      });

      if (!existingQuestion) {
        return NextResponse.json({
          status: 404,
          error: true,
          message: "Soal tidak ditemukan.",
        });
      }

      await prisma.writingPlacementTest.update({
        where: { writing_id: question_id },
        data: { question },
      });
    }

    // ❌ **Jika tipe soal tidak sesuai**
    else {
      return NextResponse.json({
        status: 400,
        error: true,
        message: "Tipe soal tidak valid.",
      });
    }

    return NextResponse.json({
      status: 200,
      error: false,
      message: "Soal berhasil diperbarui.",
    });
  } catch (error) {
    console.error("Error updating question:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
