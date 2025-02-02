import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { createData } from "@/app/lib/db/createData";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student_id, placement_test_id } = body;

    const user = authenticateRequest(request);

    if (user instanceof NextResponse) {
      return user;
    }

    const accessPlacementTest = await createData("accessPlacementTest", {
      user_id: student_id,
      placement_test_id,
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: accessPlacementTest,
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
