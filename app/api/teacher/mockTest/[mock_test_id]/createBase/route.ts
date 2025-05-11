import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { createData } from "@/app/lib/db/createData";
import prisma from "@/lib/prisma";
export async function POST(
  request: NextRequest,
  { params }: { params: { mock_test_id: string } }
) {
  try {
    const body = await request.json();
    const { type } = body;

    const user = await authenticateRequest(request);

    if (user instanceof NextResponse) {
      return user;
    }

    await createData("baseMockTest", {
      type,
      mock_test_id: params.mock_test_id,
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: "Base Placement Test created",
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
