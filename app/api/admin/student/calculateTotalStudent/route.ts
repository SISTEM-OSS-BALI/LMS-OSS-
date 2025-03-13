import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/lib/prisma";
import dayjs from "dayjs";

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
    const getStudent = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        start_date: {
          not: null,
          gte: new Date(`${year}-01-01T00:00:00Z`),
          lt: new Date(`${year + 1}-01-01T00:00:00Z`),
        },
      },
      select: {
        start_date: true,
      },
    });

    // Inisialisasi objek total siswa per bulan
    const studentPerMonth: Record<number, number> = Array.from(
      { length: 12 },
      (_, i) => [i + 1, 0]
    ).reduce((acc, [month, count]) => ({ ...acc, [month]: count }), {});

    // Hitung jumlah siswa per bulan
    getStudent.forEach((item) => {
      if (item.start_date) {
        const month = dayjs(item.start_date).month() + 1; // Bulan dalam format 1-12
        studentPerMonth[month] += 1;
      }
    });

    // Format data untuk response API
    const formattedData = Object.entries(studentPerMonth).map(
      ([month, total]) => ({
        month: parseInt(month),
        total_students: total,
      })
    );

    return NextResponse.json({
      status: 200,
      error: false,
      data: formattedData,
      year: year, // Tambahkan informasi tahun
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
