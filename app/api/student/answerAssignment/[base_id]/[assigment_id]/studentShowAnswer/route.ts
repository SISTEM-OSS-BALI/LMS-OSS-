import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { getData } from "@/app/lib/db/getData";

export async function GET(
  request: NextRequest,
  params: { params: { assignment_id: string } }
) {
  const assignment_id = params.params.assignment_id;
  const user = await authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  try {
    
    const stundentAnswer = await getData(
      "studentAnswerAssigment",
      {
        where: {
          assignment_id: assignment_id,
          student_id: user.user_id,
        },
      },
      "findMany"
    );


    return NextResponse.json({
      status: 200,
      error: false,
      data: stundentAnswer,
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
