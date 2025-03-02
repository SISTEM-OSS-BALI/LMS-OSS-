import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { authenticateRequest } from "@/app/lib/auth/authUtils";

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { schedule_id: string } }
) {
  const user = await authenticateRequest(request);

  const schedule_id = params.schedule_id;
  const body = await request.json();
  const { day, index } = body;

  if (user instanceof NextResponse) {
    return user;
  }

  const dayInEnglish = convertDayToEnglish(day);

  if (!dayInEnglish) {
    return NextResponse.json(
      {
        status: 400,
        error: true,
        message: `Hari ${day} tidak valid. Pastikan menggunakan nama hari dalam bahasa Indonesia.`,
      },
      { status: 400 }
    );
  }

  try {
    const scheduleDay = await prisma.scheduleDay.findFirst({
      where: {
        schedule_id,
        day: dayInEnglish,
      },
      include: {
        times: true,
      },
    });

    if (!scheduleDay) {
      return NextResponse.json({
        status: 404,
        error: true,
        message: `Jadwal untuk hari ${day} tidak ditemukan.`,
      });
    }

    if (index < 0 || index >= scheduleDay.times.length) {
      return NextResponse.json({
        status: 400,
        error: true,
        message: `Index ${index} tidak valid untuk hari ${day}.`,
      });
    }

    const timeIdToDelete = scheduleDay.times[index]?.time_id;

    if (!timeIdToDelete) {
      return NextResponse.json({
        status: 400,
        error: true,
        message: "Waktu tidak ditemukan berdasarkan indeks.",
      });
    }

    // Hapus waktu berdasarkan `time_id`
    await prisma.scheduleTime.delete({
      where: {
        time_id: timeIdToDelete,
      },
    });

    return NextResponse.json({
      status: 200,
      error: false,
      message: `Waktu pada hari ${day} dengan indeks ${index} telah dihapus.`,
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
