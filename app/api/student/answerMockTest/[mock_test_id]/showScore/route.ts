import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { getData } from "@/app/lib/db/getData";

export async function GET(
  request: NextRequest,
  params: { params: { mock_test_id: string } }
) {
  const mock_test_id = params.params.mock_test_id;
  const user = await authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  try {
    const studentScore = await getData(
      "scoreMockTest",
      {
        where: {
          mock_test_id: mock_test_id,
          student_id: user.user_id,
        },
      },
      "findFirst"
    );

    return NextResponse.json({
      status: 200,
      error: false,
      data: studentScore,
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
