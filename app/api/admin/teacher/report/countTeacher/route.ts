import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (user instanceof NextResponse) return user;

  const url = new URL(request.url);
  const year = parseInt(url.searchParams.get("year") || "");
  const month = parseInt(url.searchParams.get("month") || "");
  
  const currentYear = dayjs().year();
  const currentMonth = dayjs().month() + 1;

  const finalYear = !isNaN(year) ? year : currentYear;
  const finalMonth = !isNaN(month) ? month : currentMonth;

  if (finalMonth < 1 || finalMonth > 12) {
    return NextResponse.json({
      status: 400,
      error: true,
      message: "Tahun atau bulan tidak valid.",
    });
  }

  const startDate = dayjs(`${finalYear}-${finalMonth}-01`)
    .startOf("day")
    .toDate();
  const endDate = dayjs(startDate).endOf("month").toDate();

  try {
    const meetings = await prisma.meeting.findMany({
      where: {
        absent: true,
        dateTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        teacher_id: true,
        teacher: {
          select: {
            username: true,
          },
        },
      },
    });

    const grouped: Record<string, { username: string; count: number }> = {};

    for (const record of meetings) {
      const id = record.teacher_id;
      const name = record.teacher?.username || "Unknown";

      if (!grouped[id]) {
        grouped[id] = { username: name, count: 0 };
      }
      grouped[id].count++;
    }

    const result = Object.entries(grouped).map(([teacher_id, value]) => ({
      teacher_id,
      username: value.username,
      count: value.count,
    }));

    return NextResponse.json({
      status: 200,
      error: false,
      data: result,
    });
  } catch (err) {
    console.error("Gagal mengambil statistik program guru:", err);
    return NextResponse.json({
      status: 500,
      error: true,
      message: "Terjadi kesalahan saat memproses data.",
    });
  }
}
