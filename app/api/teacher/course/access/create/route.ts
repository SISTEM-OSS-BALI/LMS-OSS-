import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { createData } from "@/app/lib/db/createData";
import prisma from "@/lib/prisma";
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student_id, course_id } = body;

    const user = await authenticateRequest(request);

    if (user instanceof NextResponse) {
      return user;
    }

    await createData("accessCourse", {
      user_id: student_id,
      course_id,
    });

    await createData("courseEnrollment", {
      user_id: student_id,
      course_id,
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: "Sucess",
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
