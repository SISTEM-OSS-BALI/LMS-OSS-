import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/app/lib/prisma";
import { deleteData } from "@/app/lib/db/deleteData";
import { getData } from "@/app/lib/db/getData";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { formatPhoneNumber, sendWhatsAppMessage } from "@/app/lib/utils/notificationHelper";
dayjs.extend(utc);

export async function POST(request: NextRequest) {
  const user = authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  const body = await request.json();
  const { teacher_absence_id, status, meeting_id } = body;

  const apiKey = process.env.API_KEY_WATZAP!;
  const numberKey = process.env.NUMBER_KEY_WATZAP!;

  try {
    const updateAbsent = await prisma.teacherAbsence.update({
      where: { teacher_absence_id },
      data: { status },
    });

    const getMeeting = await getData("meeting", {
      where: { meeting_id: meeting_id },
    });

    const getStudent = await getData(
      "user",
      { where: { user_id: getMeeting.student_id } },
      "findFirst"
    );

    const getTeacher = await getData(
      "user",
      { where: { user_id: getMeeting.teacher_id } },
      "findFirst"
    );

    const formattedStudentPhone = formatPhoneNumber(getStudent.no_phone);
    const formattedTeacherPhone = formatPhoneNumber(getTeacher.no_phone);

    // Pesan untuk Siswa 📩
    const studentMessage = `🚨 *Pemberitahuan Pembatalan Meeting* 🚨\n\n` +
      `Halo, *${getStudent.username}*! 👋\n\n` +
      `Kami ingin menginformasikan bahwa meeting Anda dengan *${getTeacher.username}* telah *dibatalkan* 🚫.\n\n` +
      `📅 *Jadwal*: ${dayjs.utc(getMeeting.startTime).format("dddd, DD MMMM YYYY HH:mm")} - ${dayjs.utc(getMeeting.endTime).format("HH:mm")}\n` +
      `❌ *Alasan*: Guru berhalangan hadir.\n\n` +
      `Kami mohon maaf atas ketidaknyamanannya 🙏. Silakan hubungi admin untuk menjadwalkan ulang. 📞✨`;

    await sendWhatsAppMessage(apiKey, numberKey, formattedStudentPhone, studentMessage);

    // Pesan untuk Guru 📩
    const teacherMessage = `✅ *Pengajuan Absen Berhasil* ✅\n\n` +
      `Halo, *${getTeacher.username}*! 👋\n\n` +
      `Pengajuan ketidakhadiran Anda pada meeting berikut telah dikonfirmasi:\n\n` +
      `📅 *Jadwal*: ${dayjs.utc(getMeeting.startTime).format("dddd, DD MMMM YYYY HH:mm")} - ${dayjs.utc(getMeeting.endTime).format("HH:mm")}\n` +
      `📢 *Status*: Disetujui.\n\n` +
      `Terima kasih telah memberi tahu kami sebelumnya! 🚀✨`;

    await sendWhatsAppMessage(apiKey, numberKey, formattedTeacherPhone, teacherMessage);

    await prisma.teacherAbsence.update({
      where: { teacher_absence_id },
      data: { is_delete: true },
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: updateAbsent,
    });

  } catch (error) {
    console.error("Error updating absent status:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
 
  }
}


