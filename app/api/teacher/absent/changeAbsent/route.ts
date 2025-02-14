import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/app/lib/prisma";
import {
  formatPhoneNumber,
  sendWhatsAppMessage,
} from "@/app/lib/utils/notificationHelper";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export async function POST(request: NextRequest) {
  const user = authenticateRequest(request);
  if (user instanceof NextResponse) return user;

  const apiKey = process.env.API_KEY_WATZAP!;
  const numberKey = process.env.NUMBER_KEY_WATZAP!;

  try {
    const { meeting_id, absent, student_id } = await request.json();

    // ✅ Ambil data meeting berdasarkan ID
    const meetingData = await prisma.meeting.findUnique({
      where: { meeting_id },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    if (!meetingData) throw new Error("Meeting tidak ditemukan");

    const now = dayjs().add(8, "hours").utc();
    const startTime = dayjs(meetingData.startTime).utc();

    const timeDifferenceMinutes = now.diff(startTime, "minute");
    const timeDifferenceDays = now.diff(startTime, "day");

    if (timeDifferenceMinutes < 40) {
      return NextResponse.json({
        status: 403,
        error: true,
        message:
          "Anda hanya bisa mengupdate absensi setelah 40 menit dari waktu mulai.",
      });
    }

    if (!now.isAfter(startTime)) {
      return NextResponse.json({
        status: 403,
        error: true,
        message: "Anda tidak bisa melakukan absensi sebelum meeting dimulai.",
      });
    }

    if (timeDifferenceDays > 1) {
      return NextResponse.json({
        status: 403,
        error: true,
        message:
          "Absensi hanya bisa dilakukan hingga 1 hari setelah meeting dimulai.",
      });
    }

    await prisma.meeting.update({
      where: { meeting_id },
      data: { absent },
    });

    // ✅ Ambil data siswa & program
    const studentData = await prisma.user.findUnique({
      where: { user_id: student_id },
      select: {
        username: true,
        no_phone: true,
        consultant_id: true,
        program_id: true,
        count_program: true,
      },
    });

    const teacherData = await prisma.user.findUnique({
      where: { user_id: user.user_id },
      select: {
        username: true,
        count_program: true,
        no_phone: true,
      },
    });

    if (!studentData) throw new Error("Siswa tidak ditemukan");

    const programData = await prisma.program.findUnique({
      where: { program_id: studentData.program_id ?? "" },
      select: { name: true, duration: true, count_program: true },
    });

    if (!programData) throw new Error("Program tidak ditemukan");

    let updatedCountProgramStudent = (studentData.count_program ?? 0) + 1;
    let updatedCountProgramTeacher = (teacherData?.count_program ?? 0) + 1;

    await prisma.user.update({
      where: { user_id: student_id },
      data: { count_program: updatedCountProgramStudent },
    });

    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { count_program: updatedCountProgramTeacher },
    });

    // ✅ Kirim notifikasi absensi jika absent = true
    if (absent) {
      const formattedStudentPhone = formatPhoneNumber(
        studentData.no_phone ?? ""
      );
      await sendWhatsAppMessage(
        apiKey,
        numberKey,
        formattedStudentPhone,
        `📢 *Absensi Diterima!* \n\n🎓 *Siswa:* ${studentData.username}\n📚 *Program:* ${programData.name}\n✅ *Status:* Hadir\n\nTerus semangat belajar! 💪\n\n📊 *Progres Anda:* Anda telah menyelesaikan *${updatedCountProgramStudent}* sesi dari program ini. Tetap semangat! 🚀`
      );
    } else {
      await prisma.meeting.update({
        where: {
          meeting_id: meeting_id,
        },
        data: {
          is_cancelled: true,
        },
      });
    }

    const sessionThresholds =
      programData.duration === 90 ? [10, 20, 25] : [10, 15];

    if (sessionThresholds.includes(updatedCountProgramStudent)) {
      const consultant = await prisma.consultant.findUnique({
        where: { consultant_id: studentData.consultant_id ?? "" },
        select: { name: true, no_phone: true },
      });

      if (consultant) {
        const formattedConsultantPhone = formatPhoneNumber(consultant.no_phone);
        await sendWhatsAppMessage(
          apiKey,
          numberKey,
          formattedConsultantPhone,
          `👋 *Hallo Konsultan ${consultant.name},*\n\n📢 *Notifikasi Konsultasi!*\n\n🎓 *Siswa:* ${studentData.username}\n📚 *Program:* ${programData.name}\n✅ *Sesi Selesai:* ${updatedCountProgramStudent} sesi\n\nSilakan lakukan konsultasi dengan siswa tersebut. Terima kasih! 🙌`
        );
      }
    }

    const completionThreshold = programData.duration === 90 ? 30 : 20;

    if (updatedCountProgramStudent === completionThreshold) {
      await prisma.user.update({
        where: { user_id: student_id },
        data: { is_completed: true, is_active: false },
      });

      await sendWhatsAppMessage(
        apiKey,
        numberKey,
        formatPhoneNumber(studentData.no_phone ?? ""),
        `🎉 *Selamat ${studentData.username}!* \n\nAnda telah menyelesaikan *${programData.name}* dengan total ${updatedCountProgramStudent} sesi. Anda dapat mengunduh sertifikat pada sistem \n👏 Terima kasih telah menyelesaikan program ini!`
      );

      await sendWhatsAppMessage(
        apiKey,
        numberKey,
        formatPhoneNumber(teacherData?.no_phone ?? ""),
        `📢 *Pengingat Penting!* 📢\n\n` +
          `Siswa atas nama *${studentData.username}* telah *menyelesaikan* program *${programData.name}*.\n\n` +
          `🎓 *Harap segera memberikan nilai pada sertifikat mereka* agar dapat diterbitkan.\n\n` +
          `Terima kasih atas dedikasi Anda dalam membimbing siswa! 🙌`
      );
    }

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
