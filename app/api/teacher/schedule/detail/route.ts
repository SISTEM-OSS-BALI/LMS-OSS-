import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (user instanceof NextResponse) return user;

  try {
    // Ambil jadwal dari ScheduleTeacher + Days + Times
    const schedule = await prisma.user.findUnique({
      where: {
        user_id: user.user_id,
      },
      select: {
        user_id: true,
        scheduleTeacher: {
          select: {
            schedule_id: true,
            teacher_id: true,
            days: {
              select: {
                day_id: true,
                day: true,
                isAvailable: true,
                times: {
                  select: {
                    time_id: true,
                    startTime: true,
                    endTime: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: {
        ...schedule,
      },
    });
  } catch (error) {
    console.error("❌ Error accessing schedule/leave:", error);
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
