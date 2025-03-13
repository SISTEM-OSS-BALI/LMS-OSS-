import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/lib/prisma";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isoWeek from "dayjs/plugin/isoWeek"; // Agar minggu dimulai dari Senin

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (user instanceof NextResponse) {
    return user;
  }

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
    const getStudents = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        createdAt: {
          gte: new Date(`${year}-01-01T00:00:00Z`),
          lt: new Date(`${year + 1}-01-01T00:00:00Z`),
        },
      },
      select: {
        createdAt: true,
      },
    });

    // ** Inisialisasi objek total siswa per bulan & minggu **
    const studentsPerMonth: Record<
      string,
      { [week: number]: { total: number; month: string; year: number } }
    > = {};

    // Hitung jumlah siswa per minggu dalam setiap bulan
    getStudents.forEach((item) => {
      if (item.createdAt) {
        const createdAt = dayjs(item.createdAt); // Pastikan format benar
        const month = createdAt.format("MMMM"); // Nama bulan (Januari, Februari)
        const year = createdAt.year();
        const startOfMonth = createdAt.startOf("month");

        // Hitung minggu dalam bulan dengan menghitung jarak dari awal bulan
        const weekInMonth =
          Math.floor(createdAt.diff(startOfMonth, "week")) + 1;

        if (!studentsPerMonth[month]) {
          studentsPerMonth[month] = {};
        }

        if (!studentsPerMonth[month][weekInMonth]) {
          studentsPerMonth[month][weekInMonth] = { total: 0, month, year };
        }

        studentsPerMonth[month][weekInMonth].total += 1;
      }
    });

    // ** Pastikan semua minggu dalam setiap bulan ada (1-4 minggu) **
    const allMonths = Array.from({ length: 12 }, (_, i) =>
      dayjs(`${year}-${i + 1}-01`).format("MMMM")
    );

    allMonths.forEach((month) => {
      if (!studentsPerMonth[month]) {
        studentsPerMonth[month] = {};
      }

      const totalWeeks =
        dayjs(`${year}-${month}-01`).endOf("month").date() >= 29 ? 4 : 3;

      for (let week = 1; week <= totalWeeks; week++) {
        if (!studentsPerMonth[month][week]) {
          studentsPerMonth[month][week] = { total: 0, month, year };
        }
      }
    });

    // Format data untuk response API
    const formattedData = allMonths.flatMap((month) =>
      Object.entries(studentsPerMonth[month]).map(([week, data]) => ({
        week: parseInt(week),
        total_students: data.total,
        month: data.month,
        year: data.year,
      }))
    );

    return NextResponse.json({
      status: 200,
      error: false,
      data: formattedData,
      year: year,
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
