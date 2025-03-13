import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { deleteData } from "@/app/lib/db/deleteData";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function DELETE(
  request: NextRequest,
  { params }: { params: { assignment_id: string; mcq_id: string } }
) {
  const { mcq_id } = params;

  try {
    const user = await authenticateRequest(request);
    if (user instanceof NextResponse) {
      return user;
    }


    const updatedMcq = await deleteData("multipleChoice", {
      mcq_id: mcq_id,
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
