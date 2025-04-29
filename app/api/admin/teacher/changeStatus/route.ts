import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/lib/prisma";
import { getData } from "@/app/lib/db/getData";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  formatPhoneNumber,
  sendWhatsAppMessage,
} from "@/app/lib/utils/notificationHelper";
dayjs.extend(utc);

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);

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
      data: {
        status,
        is_delete: true,
      },
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

    if (status) {
      // ✅ Jika status TRUE, hapus meeting
      await prisma.meeting.delete({
        where: { meeting_id },
      });

      // 📩 Pesan untuk siswa bahwa meeting dibatalkan
      const studentMessage =
        `🚨 *Pemberitahuan Pembatalan Meeting* 🚨\n\n` +
        `Halo, *${getStudent.username}*! 👋\n\n` +
        `Meeting Anda dengan *${getTeacher.username}* telah *dibatalkan* karena ketidakhadiran guru. 🚫\n\n` +
        `📅 *Jadwal*: ${dayjs(getMeeting.startTime).format(
          "dddd, DD MMMM YYYY HH:mm"
        )} - ${dayjs(getMeeting.endTime).format("HH:mm")}\n\n` +
        `Silakan hubungi admin untuk reschedule. 🙏`;

      await sendWhatsAppMessage(
        apiKey,
        numberKey,
        formattedStudentPhone,
        studentMessage
      );

      // 📩 Pesan untuk guru bahwa absen disetujui
      const teacherMessage =
        `✅ *Pengajuan Absen Disetujui* ✅\n\n` +
        `Halo, *${getTeacher.username}*! 👋\n\n` +
        `Pengajuan ketidakhadiran Anda telah disetujui dan meeting telah dibatalkan. 📅🚫\n\n` +
        `Terima kasih telah menginformasikan sebelumnya! 🚀`;

      await sendWhatsAppMessage(
        apiKey,
        numberKey,
        formattedTeacherPhone,
        teacherMessage
      );
    } else {
      await prisma.teacherAbsence.delete({
        where: { teacher_absence_id },
      });
      const teacherMessage =
        `❌ *Pengajuan Absen Ditolak* ❌\n\n` +
        `Halo, *${getTeacher.username}*! 👋\n\n` +
        `Pengajuan ketidakhadiran Anda untuk meeting:\n\n` +
        `📅 *Jadwal*: ${dayjs(getMeeting.startTime).format(
          "dddd, DD MMMM YYYY HH:mm"
        )} - ${dayjs(getMeeting.endTime).format("HH:mm")}\n\n` +
        `Tidak disetujui. Anda diharapkan tetap hadir. 🙏`;

      await sendWhatsAppMessage(
        apiKey,
        numberKey,
        formattedTeacherPhone,
        teacherMessage
      );
    }

    return NextResponse.json({
      status: 200,
      error: false,
      data: updateAbsent,
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
