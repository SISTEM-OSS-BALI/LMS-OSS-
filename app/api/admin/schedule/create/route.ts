import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/app/lib/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

enum DayOfWeek {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

function convertDayToEnglish(day: string): DayOfWeek | null {
  const daysMap: Record<string, DayOfWeek> = {
    SENIN: DayOfWeek.MONDAY,
    SELASA: DayOfWeek.TUESDAY,
    RABU: DayOfWeek.WEDNESDAY,
    KAMIS: DayOfWeek.THURSDAY,
    JUMAT: DayOfWeek.FRIDAY,
    SABTU: DayOfWeek.SATURDAY,
    MINGGU: DayOfWeek.SUNDAY,
  };

  return daysMap[day.toUpperCase()] || null;
}

export async function POST(request: NextRequest) {
  const user = authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  try {
    const body = await request.json();
    const { teacherId, schedule } = body;

    if (!teacherId || !Array.isArray(schedule)) {
      return new NextResponse(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const now = dayjs();
    const transformedSchedule = schedule.map((day: any) => {
      const englishDay = convertDayToEnglish(day.day);
      if (!englishDay) {
        throw new Error(`Invalid day: ${day.day}`);
      }

      return {
        day: englishDay,
        isAvailable: day.times.length > 0,
        times: day.times.map((time: any) => ({
          startTime: dayjs.utc(
            `${now.year()}-${now.month() + 1}-${now.date()}T${time.startTime}`
          ),
          endTime: dayjs.utc(
            `${now.year()}-${now.month() + 1}-${now.date()}T${time.endTime}`
          ),
        })),
      };
    });

    let scheduleTeacher = await prisma.scheduleTeacher.findFirst({
      where: {
        teacher_id: teacherId,
      },
    });

    if (!scheduleTeacher) {
      scheduleTeacher = await prisma.scheduleTeacher.create({
        data: {
          teacher: {
            connect: { user_id: teacherId },
          },
        },
      });
    }

    for (const daySchedule of transformedSchedule) {
      const existingDay = await prisma.scheduleDay.findFirst({
        where: {
          schedule_id: scheduleTeacher.schedule_id,
          day: daySchedule.day,
        },
        include: { times: true },
      });

      const filteredTimes = daySchedule.times.filter((newTime: any) => {
        if (!existingDay) return true;

        return !existingDay.times.some(
          (existingTime) =>
            dayjs
              .utc(existingTime.startTime)
              .isSame(newTime.startTime, "minute") &&
            dayjs.utc(existingTime.endTime).isSame(newTime.endTime, "minute")
        );
      });

      if (filteredTimes.length > 0) {
        if (existingDay) {
          await prisma.scheduleDay.update({
            where: { day_id: existingDay.day_id },
            data: {
              isAvailable: daySchedule.isAvailable,
              times: {
                create: filteredTimes.map((time: any) => ({
                  startTime: time.startTime.toDate(),
                  endTime: time.endTime.toDate(),
                })),
              },
            },
          });
        } else {
          await prisma.scheduleDay.create({
            data: {
              schedule_id: scheduleTeacher.schedule_id,
              day: daySchedule.day,
              isAvailable: daySchedule.isAvailable,
              times: {
                create: daySchedule.times.map((time: any) => ({
                  startTime: time.startTime.toDate(),
                  endTime: time.endTime.toDate(),
                })),
              },
            },
          });
        }
      }
    }

    return NextResponse.json({
      status: 200,
      error: false,
      message: "Schedule updated successfully",
    });
  } catch (error) {
    console.error("Error saving schedule:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
