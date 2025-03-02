import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { createData } from "@/app/lib/db/createData";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, course_id, type } = body;

    const user = await authenticateRequest(request);

    if (user instanceof NextResponse) {
      return user;
    }

    if (!title || !course_id || !type) {
      return NextResponse.json(
        { error: "Title and course_id are required" },
        { status: 400 }
      );
    }

    const materialBase = await createData("materialAssigmentBase", {
      title,
      course_id,
      type,
    });

    return NextResponse.json({ status: 200, error: false, data: materialBase });
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
