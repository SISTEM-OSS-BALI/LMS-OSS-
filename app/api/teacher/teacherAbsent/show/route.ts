import { NextRequest, NextResponse } from "next/server";

import { getData } from "@/app/lib/db/getData";
import { authenticateRequest } from "@/app/lib/auth/authUtils";

export async function GET(request: NextRequest) {
  const user = authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  try {
    const getTeacherAbsent = await getData(
      "teacherAbsence",
      {
        where: {
          teacher_id: user.user_id,
        },
        select: {
            teacher_absence_id: true,
            teacher_id: true,
            meeting_id: true,
        }
      },
      "findMany"
    );

    return NextResponse.json({
      status: 200,
      error: false,
      data: getTeacherAbsent,
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
