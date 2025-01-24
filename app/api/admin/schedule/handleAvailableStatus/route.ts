import { NextRequest, NextResponse } from "next/server";

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

export async function PATCH(request: NextRequest) {
  const user = authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  const body = await request.json();

  const { day, isAvailable, schedule_id } = body;

  try {
    const convertedDay = convertDayToEnglish(day);
    if (convertedDay === null) {
      return NextResponse.json({
        status: 400,
        error: true,
        message: "Invalid day provided",
      });
    }

    await prisma.scheduleDay.updateMany({
      where: {
        schedule_id: schedule_id,
        day: convertedDay,
      },
      data: {
        isAvailable: isAvailable,
      },
    });

    return NextResponse.json({
      status: 200,
      error: false,
      message: "Successfully updated schedule",
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
