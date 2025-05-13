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

const apiKey = process.env.API_KEY_WATZAP!;
const numberKey = process.env.NUMBER_KEY_WATZAP!;

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (user instanceof NextResponse) return user;

  try {
    const body = await request.json();
    const { teacher_absence_id, status } = body;

    if (!teacher_absence_id || typeof status !== "boolean") {
      return NextResponse.json(
        { error: "Missing or invalid fields" },
        { status: 400 }
      );
    }

    const updatedAbsence = await prisma.teacherAbsence.update({
      where: { teacher_absence_id },
      data: {
        status,
        is_delete: true,
      },
    });

    const teacherAbsence = await prisma.teacherAbsence.findUnique({
      where: { teacher_absence_id },
    });

    if (!teacherAbsence) {
      return NextResponse.json(
        { error: "Teacher absence not found" },
        { status: 404 }
      );
    }

    const meeting = await prisma.meeting.findUnique({
      where: { meeting_id: teacherAbsence.meeting_id },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const student = await getData(
      "user",
      { where: { user_id: meeting.student_id } },
      "findFirst"
    );
    const teacher = await getData(
      "user",
      { where: { user_id: meeting.teacher_id } },
      "findFirst"
    );

    const formattedStudentPhone = formatPhoneNumber(student.no_phone);
    const formattedTeacherPhone = formatPhoneNumber(teacher.no_phone);

    if (status) {
      // ✅ Meeting dibatalkan
      await prisma.meeting.delete({
        where: { meeting_id: meeting.meeting_id },
      });

      const studentMessage = buildStudentCancellationMessage(
        student.username,
        teacher.username,
        meeting
      );

      const teacherMessage = buildTeacherApprovalMessage(teacher.username);

      await Promise.all([
        sendWhatsAppMessage(
          apiKey,
          numberKey,
          formattedStudentPhone,
          studentMessage
        ),
        sendWhatsAppMessage(
          apiKey,
          numberKey,
          formattedTeacherPhone,
          teacherMessage
        ),
      ]);
    } else {
      // ❌ Absen ditolak
      await prisma.teacherAbsence.delete({
        where: { teacher_absence_id },
      });

      const teacherMessage = buildTeacherRejectionMessage(
        teacher.username,
        meeting
      );

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
      data: updatedAbsence,
    });
  } catch (error) {
    console.error("Error handling absence approval:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// 🔧 Helper functions

function buildStudentCancellationMessage(
  studentName: string,
  teacherName: string,
  meeting: any
) {
  return (
    `🚨 *Pemberitahuan Pembatalan Meeting* 🚨\n\n` +
    `Halo, *${studentName}*! 👋\n\n` +
    `Meeting Anda dengan *${teacherName}* telah *dibatalkan* karena ketidakhadiran guru. 🚫\n\n` +
    `📅 *Jadwal*: ${formatSchedule(meeting)}\n\n` +
    `Silakan hubungi admin untuk reschedule. 🙏`
  );
}

function buildTeacherApprovalMessage(teacherName: string) {
  return (
    `✅ *Pengajuan Absen Disetujui* ✅\n\n` +
    `Halo, *${teacherName}*! 👋\n\n` +
    `Pengajuan ketidakhadiran Anda telah disetujui dan meeting telah dibatalkan. 📅🚫\n\n` +
    `Terima kasih telah menginformasikan sebelumnya! 🚀`
  );
}

function buildTeacherRejectionMessage(teacherName: string, meeting: any) {
  return (
    `❌ *Pengajuan Absen Ditolak* ❌\n\n` +
    `Halo, *${teacherName}*! 👋\n\n` +
    `Pengajuan ketidakhadiran Anda untuk meeting:\n\n` +
    `📅 *Jadwal*: ${formatSchedule(meeting)}\n\n` +
    `Tidak disetujui. Anda diharapkan tetap hadir. 🙏`
  );
}

function formatSchedule(meeting: any) {
  return `${dayjs(meeting.startTime).format(
    "dddd, DD MMMM YYYY HH:mm"
  )} - ${dayjs(meeting.endTime).format("HH:mm")}`;
}
