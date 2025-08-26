import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import prisma from "@/lib/prisma";
dayjs.extend(utc);

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const month = url.searchParams.get("month"); // 1-12 (string)
  const year = url.searchParams.get("year"); // yyyy (string)
  const teacher_id = url.searchParams.get("teacher_id");
  const user = await authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  // Default ke bulan & tahun sekarang jika tidak ada
  const currentMonth = month ? parseInt(month, 10) : dayjs().month() + 1;
  const currentYear = year ? parseInt(year, 10) : dayjs().year();

  // Pastikan 2 digit untuk bulan (ex: 03)
  const monthStr = String(currentMonth).padStart(2, "0");

  // Mulai & akhir bulan UTC
  const startOfMonth = dayjs
    .utc(`${currentYear}-${monthStr}-01`)
    .startOf("month")
    .toDate();
  const endOfMonth = dayjs
    .utc(`${currentYear}-${monthStr}-01`)
    .endOf("month")
    .toDate();

  try {
    const getMeeting = await prisma.meeting.findMany({
      where: {
        teacher_id: teacher_id!,
        dateTime: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        student: { select: { username: true } },
        teacher: { select: { username: true } },
      },
      orderBy: { dateTime: "asc" },
    });

    return NextResponse.json({ status: 200, error: false, data: getMeeting });
  } catch (error) {
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
