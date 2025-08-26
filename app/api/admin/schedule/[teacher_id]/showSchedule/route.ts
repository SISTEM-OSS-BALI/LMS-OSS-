import { NextRequest, NextResponse } from "next/server";
import { getData } from "@/app/lib/db/getData";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/lib/prisma";
import { Color } from "antd/es/color-picker";

export async function GET(
  request: NextRequest,
  { params }: { params: { teacher_id: string } }
) {
  const user = await authenticateRequest(request);
  if (user instanceof NextResponse) return user;

  const teacher_id = params.teacher_id;

  try {
    // Ambil region student dan teacher sekaligus
    const [student, teacher] = await Promise.all([
      getData(
        "user",
        {
          where: { user_id: user.user_id },
          select: { region: true },
        },
        "findUnique"
      ),

      getData(
        "user",
        {
          where: { user_id: teacher_id },
          select: { region: true },
        },
        "findUnique"
      ),
    ]);

    if (!student || !teacher) {
      return NextResponse.json(
        {
          status: 404,
          error: true,
          message: "Student or teacher not found.",
        },
        { status: 404 }
      );
    }

    // Validasi region
    if (student.region_id !== teacher.region_id) {
      return NextResponse.json(
        {
          status: 400,
          error: true,
          message: "Teacher and student are not in the same region.",
        },
        { status: 400 }
      );
    }

    // Ambil jadwal guru
    const teacherSchedule = await prisma.user.findUnique({
      where: { user_id: teacher_id },
      select: {
        user_id: true,
        ScheduleMonth: {
          orderBy: { createdAt: "desc" },
          select: {
            blocks: {
              orderBy: { start_date: "asc" },
              include: {
                times: true,
              },
            },
          },
        },
      },
    });

    if (!teacherSchedule) {
      return NextResponse.json(
        {
          status: 404,
          error: true,
          message: "Schedule not found for this teacher.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      error: false,
      data: teacherSchedule,
    });
  } catch (error) {
    console.error("Schedule fetch error:", error);
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
