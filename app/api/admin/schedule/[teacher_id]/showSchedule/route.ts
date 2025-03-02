import { NextRequest, NextResponse } from "next/server";
import { getData } from "@/app/lib/db/getData";
import { authenticateRequest } from "@/app/lib/auth/authUtils";

export async function GET(
  request: NextRequest,
  { params }: { params: { teacher_id: string } }
) {
  const user = await authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user; // Jika user tidak terautentikasi
  }

  const teacher_id = params.teacher_id;

  try {
    // Ambil region siswa
    const studentData = await getData(
      "user",
      {
        where: {
          user_id: user.user_id,
        },
        select: {
          region: true,
        },
      },
      "findUnique"
    );

    // Ambil region guru
    const teacherData = await getData(
      "user",
      {
        where: {
          user_id: teacher_id,
        },
        select: {
          region: true,
        },
      },
      "findUnique"
    );

    if (!studentData || !teacherData) {
      return NextResponse.json(
        {
          status: 404,
          error: true,
          message: "Student or Teacher data not found",
        },
        { status: 404 }
      );
    }

    // Validasi region
    if (studentData.region !== teacherData.region) {
      return NextResponse.json(
        {
          status: 400,
          error: true,
          message: "Teacher and student are not in the same region",
        },
        { status: 400 }
      );
    }

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

    // Filter data dengan isAvailable: true
    const filteredData = getScheduleTeacherDetail.map((schedule: any) => ({
      ...schedule,
      days: schedule.days.filter((day: any) => day.isAvailable),
    }));

    return NextResponse.json({
      status: 200,
      error: false,
      data: filteredData,
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
