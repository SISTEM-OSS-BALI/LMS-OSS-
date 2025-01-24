import { NextResponse, NextRequest } from "next/server";
import prisma from "@/app/lib/prisma";
import { authenticateRequest } from "@/app/lib/auth/authUtils";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { payload } = body;
  const { code_course, course_id } = payload;

  if (!payload) {
    return NextResponse.json(
      { error: "Payload diperlukan dalam permintaan" },
      { status: 400 }
    );
  }

  // Destructure payload untuk mendapatkan base_id, course_id, type, dsb.

  if (!code_course) {
    return NextResponse.json(
      { error: "Code course is required" },
      { status: 400 }
    );
  }

  try {
    const user = authenticateRequest(request);
    if (user instanceof NextResponse) {
      return user;
    }

    const user_id = user.user_id;

    const course = await prisma.course.findUnique({
      where: {
        course_id: course_id,
      },
    });

    if (course!.code_course !== code_course) {
      return NextResponse.json(
        { error: "Invalid code course" },
        { status: 400 }
      );
    } else {
      await prisma.courseEnrollment.create({
        data: {
          user_id: user_id,
          course_id: course_id,
        },
      });
    }

    return NextResponse.json({
      status: 200,
      error: false,
      message: "Course joined successfully",
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
