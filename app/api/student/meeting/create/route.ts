import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/lib/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import {
  createGoogleMeetEvent,
  getOAuthClient,
  createZoomMeeting,
} from "@/app/lib/utils/meetingHelper";
import {
  formatPhoneNumber,
  sendWhatsAppMessage,
} from "@/app/lib/utils/notificationHelper";

dayjs.extend(utc);

const monthTranslation = {
  Januari: "January",
  Februari: "February",
  Maret: "March",
  April: "April",
  Mei: "May",
  Juni: "June",
  Juli: "July",
  Agustus: "August",
  September: "September",
  Oktober: "October",
  November: "November",
  Desember: "December",
};

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (user instanceof NextResponse) return user;

  const apiKey = process.env.API_KEY_WATZAP!;
  const numberKey = process.env.NUMBER_KEY_WATZAP!;

  try {
    const { teacher_id, date, time, method, platform } = await request.json();

    const dateParts = date.split(", ");
    const dateStrIndo = dateParts[1];

    const monthRegex = new RegExp(
      Object.keys(monthTranslation).join("|"),
      "gi"
    );
    const dateStrEn = dateStrIndo.replace(
      monthRegex,
      (matched: string) =>
        monthTranslation[matched as keyof typeof monthTranslation]
    );

    const dayjsDate = dayjs(dateStrEn, "DD MMMM YYYY");
    if (!dayjsDate.isValid()) {
      throw new Error("Format tanggal tidak valid");
    }

    const [hours, minutes] = time.split(":").map(Number);
    const dateTime = dayjs
      .utc(dayjsDate)
      .set("hour", hours)
      .set("minute", minutes);

    const [studentData, teacherData, programData] = await Promise.all([
      prisma.user.findUnique({
        where: { user_id: user.user_id },
        select: {
          username: true,
          no_phone: true,
          consultant_id: true,
          count_program: true,
          is_active: true,
        },
      }),
      prisma.user.findUnique({
        where: { user_id: teacher_id },
        select: { username: true, no_phone: true },
      }),
      prisma.program.findUnique({
        where: { program_id: user.program_id ?? "" },
        select: { name: true, duration: true },
      }),
    ]);

    if (!studentData || !teacherData || !programData)
      throw new Error("Data tidak ditemukan");

    if (studentData.is_active == false) {
      return NextResponse.json(
        {
          status: 403,
          error: true,
          message: "User tidak aktif",
        },
        { status: 403 }
      );
    }

    let meetLink = null;
    if (method === "ONLINE") {
      if (platform === "GOOGLE_MEET") {
        const auth = await getOAuthClient();
        meetLink = await createGoogleMeetEvent(
          auth,
          "Meeting dengan guru",
          dateTime.toDate(),
          dateTime.add(1, "hour").toDate()
        );
      } else if (platform === "ZOOM") {
        meetLink = await createZoomMeeting(
          "Meeting dengan guru",
          dateTime.toDate()
        );
      }
    }

    const existingMeeting = await prisma.meeting.findFirst({
      where: {
        student_id: user.user_id,
      },
    });

    if (!existingMeeting) {
      await prisma.user.update({
        where: {
          user_id: user.user_id,
        },
        data: {
          start_date: dateTime.toDate(),
          end_date: dateTime.add(2, "month").toDate(),
        },
      });
    }

    await prisma.meeting.create({
      data: {
        teacher_id,
        student_id: user.user_id,
        method,
        dateTime: dateTime.toDate(),
        startTime: dateTime.toDate(),
        endTime: dateTime.add(programData.duration, "minute").toDate(),
        name_program: programData.name,
        ...(method === "ONLINE" && { meetLink, platform }),
      },
    });

    const formattedTeacherPhone = formatPhoneNumber(teacherData.no_phone ?? "");
    const formattedStudentPhone = formatPhoneNumber(studentData.no_phone ?? "");
    const studentName = studentData.username;
    const teacherName = teacherData.username;

    const messages = [
      {
        phone: formattedTeacherPhone,
        text: `📅 *Jadwal Meeting*\n\n👨‍🎓 *Siswa:* ${studentName}\n📆 *Tanggal:* ${dayjs(
          dateTime
        ).format("dddd, DD MMMM YYYY")}\n🕒 *Waktu Mulai:* ${dayjs(
          dateTime
        ).format("HH:mm")} ⏰\n🕒 *Waktu Selesai:* ${dayjs(
          dateTime.add(programData.duration, "minute")
        ).format("HH:mm")} ⏰\n📝 *Metode:* ${method}\n📍 *Platform:* ${
          platform || "-"
        }\n🔗 *Link:* ${
          meetLink || "-"
        }\n\nHarap siapkan pertemuan dengan baik! 👍`,
      },
      {
        phone: formattedStudentPhone,
        text: `📅🔔 *Pengingat Meeting* 📅\n\n👨‍🏫 *Guru:* ${teacherName} 👋\n📆 *Tanggal:* ${dayjs(
          dateTime
        ).format("dddd, DD MMMM YYYY")} 📆\n🕒 *Waktu Mulai:* ${dayjs(
          dateTime
        ).format("HH:mm")} ⏰\n🕒 *Waktu Selesai:* ${dayjs(
          dateTime.add(programData.duration, "minute")
        ).format("HH:mm")} ⏰\n *Program:* ${
          programData.name
        } 📚\n📝 *Metode:* ${method} 📝\n📍 *Platform:* ${
          platform || "-"
        } 📱\n🔗 *Link:* ${
          meetLink || "-"
        } 📈\n\n🙏 Mohon bersiap sebelum meeting dimulai! 👍`,
      },
    ];

    let waError = false;

    try {
      await Promise.all(
        messages.map((msg) =>
          sendWhatsAppMessage(apiKey, numberKey, msg.phone, msg.text)
        )
      );
    } catch (err) {
      waError = true;
    }

    return NextResponse.json({
      status: 200,
      error: false,
      message: waError
        ? "Jadwal berhasil dibuat, tetapi notifikasi WhatsApp gagal dikirim."
        : "Jadwal berhasil dibuat dan notifikasi WhatsApp berhasil dikirim.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 500,
        error: true,
        message: "Terjadi kesalahan saat membuat jadwal.",
      },
      { status: 500 }
    );
  }
}
