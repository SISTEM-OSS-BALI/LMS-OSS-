import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { updateData } from "@/app/lib/db/updateData";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function PUT(
  request: NextRequest,
  { params }: { params: { course_id: string } }
) {
  const course_id = params.course_id;

  try {
    const body = await request.json();
    const { name } = body;

    const user = await authenticateRequest(request);

    if (user) {
      const updateCourse = await updateData(
        "course",
        { course_id: course_id },
        { name }
      );

      return NextResponse.json({
        status: 200,
        error: false,
        data: updateCourse,
      });
    } else {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error accessing database:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    await prisma.$disconnect();
  }
}
