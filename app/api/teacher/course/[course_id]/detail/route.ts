import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { getData } from "@/app/lib/db/getData";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { course_id: string } }
) {
  const course_id = params.course_id;

  try {
    const user = authenticateRequest(request);
    if (user instanceof NextResponse) {
      return user;
    }

    if (user) {
      const detailCourse = await getData(
        "course",
        {
          where: {
            course_id: course_id,
          },
        },
        "findUnique"
      );

      return NextResponse.json({
        status: 200,
        error: false,
        data: detailCourse,
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
