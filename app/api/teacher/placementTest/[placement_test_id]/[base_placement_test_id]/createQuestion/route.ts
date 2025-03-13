import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { createData } from "@/app/lib/db/createData";
import prisma from "@/lib/prisma";
export async function POST(
  request: NextRequest,
  { params }: { params: { placement_test_id: string } }
) {
  try {
    const body = await request.json();
    const { type, basePlacementTestId, questions, passage } = body;

    const user = await authenticateRequest(request);
    if (user instanceof NextResponse) {
      return user;
    }

    if (!type || !basePlacementTestId || !questions || questions.length === 0) {
      return NextResponse.json({
        status: 400,
        error: true,
        message: "Data tidak lengkap atau format tidak valid.",
      });
    }

    // **Multiple Choice Question**
    if (type === "multipleChoice") {
      for (const questionObj of questions) {
        const { question, options, correctAnswer } = questionObj;

        await createData("multipleChoicePlacementTest", {
          question,
          options,
          correctAnswer,
          basePlacementTestId,
        });
      }
    }

    // **Reading (True/False Group)**
    else if (type === "reading") {
      // **Simpan passage terlebih dahulu**
      const trueFalseGroup = await createData("trueFalseGroupPlacementTest", {
        passage,
        basePlacementTestId,
      });

      // **Loop semua pertanyaan True/False**
      for (const questionObj of questions) {
        const { question, correctAnswer } = questionObj;

        await createData("trueFalseQuestion", {
          question,
          correctAnswer,
          group_id: trueFalseGroup.group_id,
        });
      }
    }

    // **Writing Placement Test**
    else if (type === "writing") {
      for (const questionObj of questions) {
        const { question } = questionObj;

        await createData("writingPlacementTest", {
          question,
          basePlacementTestId,
        });
      }
    } else {
      return NextResponse.json({
        status: 400,
        error: true,
        message: "Tipe soal tidak valid.",
      });
    }

    return NextResponse.json({
      status: 200,
      error: false,
      message: "Soal berhasil dibuat",
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
