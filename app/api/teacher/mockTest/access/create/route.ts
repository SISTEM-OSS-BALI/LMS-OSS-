import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { createData } from "@/app/lib/db/createData";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student_id, mock_test_id } = body;

    const user = await authenticateRequest(request);

    if (user instanceof NextResponse) {
      return user;
    }

    const accessMockTest = await createData("accessMockTest", {
      user_id: student_id,
      mock_test_id,
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: accessMockTest,
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
