import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/app/lib/prisma";
import dayjs from "dayjs";

export async function GET(request: NextRequest) {
  const user = authenticateRequest(request);
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
    // 🔹 Ambil semua program yang tersedia
    const allPrograms = await prisma.program.findMany({
      select: {
        program_id: true,
        name: true,
      },
    });

    // 🔹 Ambil total siswa berdasarkan program
    const studentsByProgram = await prisma.user.groupBy({
      by: ["program_id"],
      where: {
        role: "STUDENT",
        createdAt: {
          gte: new Date(`${year}-01-01T00:00:00Z`),
          lt: new Date(`${year + 1}-01-01T00:00:00Z`),
        },
      },
      _count: {
        user_id: true,
      },
    });

    // 🔹 Gabungkan data agar semua program tetap muncul dengan total 0 jika tidak ada siswa
    const formattedData = allPrograms.map((program) => {
      const studentData = studentsByProgram.find(
        (s) => s.program_id === program.program_id
      );
      return {
        program_id: program.program_id,
        program_name: program.name,
        total_students: studentData ? studentData._count.user_id : 0,
      };
    });

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
