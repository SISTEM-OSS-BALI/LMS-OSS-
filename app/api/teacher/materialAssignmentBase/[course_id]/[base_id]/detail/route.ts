import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { getData } from "@/app/lib/db/getData";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET(
  request: NextRequest,
  { params }: { params: { course_id: string, base_id: string } }
) {
  const course_id = params.course_id;
  const base_id = params.base_id

  try {
    const user = await authenticateRequest(request);
    if (user instanceof NextResponse) {
      return user;
    }

    if (user) {
      const detailBase = await getData(
        "materialAssigmentBase",
        {
          where: {
            course_id: course_id,
            base_id: base_id
          },
        },
        "findUnique"
      );

      return NextResponse.json({
        status: 200,
        error: false,
        data: detailBase,
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
