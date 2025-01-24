import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { updateData } from "@/app/lib/db/updateData";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { course_id: string; base_id: string } }
) {
  const body = await request.json();
  const course_id = params.course_id;
  const base_id = params.base_id;
  const { title } = body;

  try {
    const user = authenticateRequest(request);
    if (user instanceof NextResponse) {
      return user;
    }

    if (user) {
      const updateBase = await updateData(
        "materialAssigmentBase",
        {
          course_id: course_id,
          base_id: base_id,
        },
        {
          title,
        }
      );

      return NextResponse.json({
        status: 200,
        error: false,
        data: updateBase,
      });
    }
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
