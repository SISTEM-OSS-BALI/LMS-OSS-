import { NextRequest, NextResponse } from "next/server";
import { getData } from "@/app/lib/db/getData";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/lib/prisma";
export async function GET(
  request: NextRequest,
  { params }: { params: { teacher_id: string } }
) {
  const user = await authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  const teacher_id = params.teacher_id;

  try {



    // Ambil jadwal guru
    const getScheduleTeacherDetail = await getData(
      "scheduleTeacher",
      {
        where: {
          teacher_id: teacher_id,
          days: {
            some: {
              isAvailable: true,
            },
          },
        },
        include: {
          days: {
            include: {
              times: true,
            },
          },
        },
      },
      "findMany"
    );


    return NextResponse.json({
      status: 200,
      error: false,
      data: getScheduleTeacherDetail,
    });
  } catch (error) {
    console.error("Error accessing database:", error);
    return NextResponse.json(
      {
        status: 500,
        error: true,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
