import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/lib/prisma";
import {
  formatPhoneNumber,
  sendWhatsAppMessage,
} from "@/app/lib/utils/notificationHelper";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export async function PATCH(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (user instanceof NextResponse) return user;

  try {
    const { meeting_id, student_id, is_cancelled } = await request.json();

    // 1. Ambil data meeting sekarang (status & waktu)
    const currentMeeting = await prisma.meeting.findUnique({
      where: { meeting_id },
      select: {
        startTime: true,
        endTime: true,
        status: true,
        is_cancelled: true,
      },
    });

    if (!currentMeeting) {
      throw new Error("Meeting tidak ditemukan");
    }

    const now = dayjs().add(8, "hours").utc();
    const startTime = dayjs(currentMeeting.startTime).utc();

    const timeDifferenceMinutes = now.diff(startTime, "minute");
    const timeDifferenceDays = now.diff(startTime, "day");

    if (!now.isAfter(startTime)) {
      return NextResponse.json(
        {
          status: 403,
          error: true,
          message: "Anda tidak bisa melakukan absensi sebelum meeting dimulai.",
        },
        { status: 403 }
      );
    }

    if (timeDifferenceDays > 1) {
      return NextResponse.json(
        {
          status: 403,
          error: true,
          message:
            "Absensi hanya bisa dilakukan hingga 1 hari setelah meeting dimulai.",
        },
        { status: 403 }
      );
    }

    // 2. Ambil data siswa dan guru
    const [studentData, teacherData] = await Promise.all([
      prisma.user.findUnique({
        where: { user_id: student_id },
        select: {
          username: true,
          no_phone: true,
          consultant_id: true,
          program_id: true,
          count_program: true,
        },
      }),
      prisma.user.findUnique({
        where: { user_id: user.user_id },
        select: {
          username: true,
          count_program: true,
          no_phone: true,
        },
      }),
    ]);

    if (!studentData) throw new Error("Siswa tidak ditemukan");

    const programData = await prisma.program.findUnique({
      where: { program_id: studentData.program_id ?? "" },
      select: { name: true, duration: true, count_program: true },
    });

    if (!programData) throw new Error("Program tidak ditemukan");

    const wasAlreadyCounted = currentMeeting.status === "PENDING";

    // 3. Hanya update count_program jika:
    // - is_cancelled diubah ke false
    // - dan sebelumnya belum counted
    if (!is_cancelled && !wasAlreadyCounted) {
      await Promise.all([
        prisma.user.update({
          where: { user_id: student_id },
          data: {
            count_program: (studentData.count_program ?? 0) + 1,
          },
        }),
        prisma.user.update({
          where: { user_id: user.user_id },
          data: {
            count_program: (teacherData?.count_program ?? 0) + 1,
          },
        }),
      ]);
    }

    // 4. Update status meeting
    await prisma.meeting.update({
      where: { meeting_id },
      data: {
        is_cancelled,
        status: is_cancelled ? "CANCEL" : "PENDING",
      },
    });

    return NextResponse.json({ status: 200, error: false, data: "Success" });
  } catch (error) {
    console.error("Error updating absent status:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
