import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/lib/prisma";
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

// Tipe untuk Schedule Input dari API
interface ScheduleInput {
  day: string;
  times: { startTime: string; endTime: string }[];
}

// Tipe untuk Schedule yang telah diproses
interface TransformedSchedule {
  day: DayOfWeek;
  isAvailable: boolean;
  times: { startTime: string; endTime: string }[];
}

// Konversi nama hari dari bahasa Indonesia ke bahasa Inggris
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

export async function POST(request: NextRequest): Promise<NextResponse> {
  const user = await authenticateRequest(request);
  if (user instanceof NextResponse) {
    return user;
  }

  try {
    const body = await request.json();
    const {
      teacherId,
      schedule,
    }: { teacherId: string; schedule: ScheduleInput[] } = body;


    if (!teacherId || !Array.isArray(schedule)) {
      return new NextResponse(
        JSON.stringify({ error: "Payload tidak valid" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const transformedSchedule: TransformedSchedule[] = schedule.map((day) => {
      const englishDay = convertDayToEnglish(day.day);
      if (!englishDay) {
        throw new Error(`Hari tidak valid: ${day.day}`);
      }

      return {
        day: englishDay,
        isAvailable: day.times.length > 0,
        times: day.times.map((time) => ({
          startTime: time.startTime, // Hanya jam & menit
          endTime: time.endTime, // Hanya jam & menit
        })),
      };
    });

    let scheduleTeacher = await prisma.scheduleTeacher.findFirst({
      where: { teacher_id: teacherId },
    });

    if (!scheduleTeacher) {
      scheduleTeacher = await prisma.scheduleTeacher.create({
        data: { teacher: { connect: { user_id: teacherId } } },
      });
    }

    for (const daySchedule of transformedSchedule) {
      let existingDay = await prisma.scheduleDay.findFirst({
        where: {
          schedule_id: scheduleTeacher.schedule_id,
          day: daySchedule.day,
        },
        include: { times: true },
      });

      if (!existingDay) {
        existingDay = await prisma.scheduleDay.create({
          data: {
            schedule_id: scheduleTeacher.schedule_id,
            day: daySchedule.day,
            isAvailable: daySchedule.isAvailable,
            times: { create: [] },
          },
          include: { times: true },
        });
      }

      // Ambil semua startTime & endTime yang sudah ada di database dalam format "HH:mm"
      const existingTimesSet = new Set(
        existingDay?.times.map(
          (t) =>
            `${dayjs.utc(t.startTime).format("HH:mm")}-${dayjs
              .utc(t.endTime)
              .format("HH:mm")}`
        )
      );

      // Filter hanya waktu yang belum ada dalam database
      const newTimes = daySchedule.times.filter(
        (newTime) =>
          !existingTimesSet.has(`${newTime.startTime}-${newTime.endTime}`)
      );

      if (newTimes.length > 0) {
        await prisma.scheduleDay.update({
          where: { day_id: existingDay?.day_id },
          data: {
            isAvailable: daySchedule.isAvailable,
            times: {
              create: newTimes.map((time) => ({
                startTime: dayjs.utc(`1970-01-01T${time.startTime}`).toDate(),
                endTime: dayjs.utc(`1970-01-01T${time.endTime}`).toDate(),
              })),
            },
          },
        });
      }
    }

    return NextResponse.json({
      status: 200,
      error: false,
      message: "Jadwal berhasil diperbarui",
    });
  } catch (error) {
    console.error("Error accessing database:", error);
    return new NextResponse(
      JSON.stringify({ error: error }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
