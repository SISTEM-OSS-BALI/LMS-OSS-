import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/lib/prisma";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek); // Opsional untuk penanganan minggu mulai dari Senin

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (user instanceof NextResponse) return user;

  const url = new URL(request.url);
  const yearParam = url.searchParams.get("year");
  const currentYear = dayjs().year();
  const year = yearParam ? parseInt(yearParam, 10) : currentYear;

  if (isNaN(year)) {
    return NextResponse.json({
      status: 400,
      error: true,
      message: "Tahun tidak valid. Harap masukkan tahun yang benar.",
    });
  }

  try {
    const meetings = await prisma.meeting.findMany({
      where: {
        dateTime: {
          gte: new Date(`${year}-01-01T00:00:00Z`),
          lt: new Date(`${year + 1}-01-01T00:00:00Z`),
        },
      },
      select: {
        dateTime: true,
        is_cancelled: true,
      },
    });

    // Inisialisasi struktur data: bulan -> minggu -> data
    const meetingsPerMonth: Record<
      string,
      Record<
        number,
        { total: number; cancelled: number; month: string; year: number }
      >
    > = {};

    meetings.forEach((item) => {
      if (item.dateTime) {
        const createdAt = dayjs(item.dateTime);
        const month = createdAt.format("MMMM"); // e.g., "February"
        const startOfMonth = createdAt.startOf("month");
        const week = Math.floor(createdAt.diff(startOfMonth, "week")) + 1;

        if (!meetingsPerMonth[month]) {
          meetingsPerMonth[month] = {};
        }

        if (!meetingsPerMonth[month][week]) {
          meetingsPerMonth[month][week] = {
            total: 0,
            cancelled: 0,
            month,
            year,
          };
        }

        meetingsPerMonth[month][week].total += 1;
        if (item.is_cancelled) {
          meetingsPerMonth[month][week].cancelled += 1;
        }
      }
    });

    // Pastikan semua minggu (1-5) ada di tiap bulan untuk konsistensi
    const allMonths = Array.from({ length: 12 }, (_, i) =>
      dayjs(`${year}-${i + 1}-01`).format("MMMM")
    );

    allMonths.forEach((month) => {
      if (!meetingsPerMonth[month]) {
        meetingsPerMonth[month] = {};
      }

      const totalWeeks = month === "February" ? 3 : 4;

      for (let week = 1; week <= totalWeeks; week++) {
        if (!meetingsPerMonth[month][week]) {
          meetingsPerMonth[month][week] = {
            total: 0,
            cancelled: 0,
            month,
            year,
          };
        }
      }
    });


    // Format data menjadi array terurut
    const formattedData = allMonths.flatMap((month) =>
      Object.entries(meetingsPerMonth[month])
        .map(([week, data]) => ({
          week: parseInt(week),
          total_meetings: data.total,
          cancelled_meetings: data.cancelled,
          month: data.month,
          year: data.year,
        }))
        .sort((a, b) => a.week - b.week)
    );

    return NextResponse.json({
      status: 200,
      error: false,
      data: formattedData,
      year,
    });
  } catch (error) {
    console.error("Error accessing database:", error);
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
