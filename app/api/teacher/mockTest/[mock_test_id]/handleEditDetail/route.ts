import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/lib/prisma";
export async function PATCH(
  request: NextRequest,
  { params }: { params: { mock_test_id: string } }
) {
  try {
    const body = await request.json();
    const { description, time_limit } = body;

    const user = await authenticateRequest(request);

    if (user instanceof NextResponse) {
      return user;
    }

    const updateData: any = {};
    if (description !== undefined) {
      updateData.description = description;
    }
    if (time_limit !== undefined) {
      updateData.timeLimit = Number(time_limit);
    }

    await prisma.mockTest.update({
      where: {
        mock_test_id: params.mock_test_id,
      },
      data: updateData,
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: "Placement Test updated",
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
