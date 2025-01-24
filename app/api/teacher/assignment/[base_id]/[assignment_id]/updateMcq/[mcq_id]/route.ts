import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { assignment_id: string; mcq_id: string } }
) {
  const { mcq_id } = params;

  try {
    const user = authenticateRequest(request);
    if (user instanceof NextResponse) {
      return user;
    }

    const body = await request.json();
    const { question, options, correctAnswer } = body;
    console.log(body);

    if (!question || !options || !correctAnswer) {
      return NextResponse.json(
        {
          error: "Pertanyaan, opsi, jawaban yang benar, dan waktu diperlukan.",
        },
        { status: 400 }
      );
    }

    const updatedMcq = await prisma.multipleChoice.update({
      where: {
        mcq_id: mcq_id,
      },
      data: {
        question,
        options,
        correctAnswer,
      },
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: updatedMcq,
    });
  } catch (error) {
    console.error("Error updating MCQ:", error);
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
