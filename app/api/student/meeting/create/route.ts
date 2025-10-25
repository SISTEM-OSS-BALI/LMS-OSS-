import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/lib/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";

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
dayjs.extend(customParseFormat);

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

// ...imports & setup sama...

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (user instanceof NextResponse) return user;

  const apiKey = process.env.API_KEY_WATZAP!;
  const numberKey = process.env.NUMBER_KEY_WATZAP!;

  try {
    const { teacher_id, date, time, method, platform } = await request.json();

    // --- parsing tanggal bahasa Indonesia / ISO -> Date ---
    const monthRegex = new RegExp(Object.keys(monthTranslation).join("|"), "gi");
    const normalizedDateString = (() => {
      if (typeof date !== "string") {
        return date;
      }

      if (date.includes(",")) {
        const [, datePortion = date] = date.split(", ");
        return datePortion.replace(
          monthRegex,
          (m: string) => monthTranslation[m as keyof typeof monthTranslation]
        );
      }

      return date.replace(
        monthRegex,
        (m: string) => monthTranslation[m as keyof typeof monthTranslation]
      );
    })();

    const possibleFormats = [
      "DD MMMM YYYY",
      "DD MMM YYYY",
      "YYYY-MM-DD",
      "YYYY/MM/DD",
    ];

    let baseDate =
      typeof normalizedDateString === "string"
        ? dayjs(normalizedDateString, possibleFormats, true)
        : dayjs(normalizedDateString);

    if (!baseDate.isValid()) {
      baseDate = dayjs(normalizedDateString);
    }

    if (!baseDate.isValid()) {
      throw new Error("Format tanggal tidak valid");
    }

    const [h, mm] = time.split(":").map(Number);
    const startUtc = dayjs
      .utc(baseDate)
      .set("hour", h)
      .set("minute", mm)
      .set("second", 0)
      .set("millisecond", 0);

    // --- ambil data terkait ---
    const [studentData, teacherData, programData] = await Promise.all([
      prisma.user.findUnique({
        where: { user_id: user.user_id },
        select: {
          username: true,
          no_phone: true,
          consultant_id: true,
          count_program: true,
          is_active: true,
          name_group: true,
          start_date: true,
          end_date: true,
          program_id: true,
        },
      }),
      prisma.user.findUnique({
        where: { user_id: teacher_id },
        select: { username: true, no_phone: true, count_program: true },
      }),
      prisma.program.findUnique({
        where: { program_id: user.program_id ?? "" },
        select: { name: true, duration: true },
      }),
    ]);

    if (!studentData || !teacherData || !programData) {
      return NextResponse.json({ status: 404, error: true, message: "Data tidak ditemukan" }, { status: 404 });
    }
    if (studentData.is_active === false) {
      return NextResponse.json({ status: 403, error: true, message: "User tidak aktif" }, { status: 403 });
    }

    const meetingDuration = programData.duration;

    if (!meetingDuration || Number.isNaN(meetingDuration)) {
      throw new Error("Durasi program tidak ditemukan");
    }

    const newMeetingStart = startUtc.toDate();
    const newMeetingEnd = startUtc.add(meetingDuration, "minute").toDate();

    // --- validasi bentrok jadwal guru ---
    const candidateMeetings = await prisma.meeting.findMany({
      where: {
        teacher_id,
        is_cancelled: false,
        OR: [
          { startTime: { lt: newMeetingEnd } },
          { dateTime: { lt: newMeetingEnd } },
        ],
      },
      select: {
        meeting_id: true,
        startTime: true,
        endTime: true,
        dateTime: true,
      },
    });

    const isOverlapping = candidateMeetings.some((meeting) => {
      const start = dayjs.utc(meeting.startTime ?? meeting.dateTime);
      const end = meeting.endTime
        ? dayjs.utc(meeting.endTime)
        : start.add(meetingDuration, "minute");
      return start.isBefore(dayjs.utc(newMeetingEnd)) && end.isAfter(dayjs.utc(newMeetingStart));
    });

    if (isOverlapping) {
      return NextResponse.json(
        {
          status: 409,
          error: true,
          message:
            "Guru sudah memiliki jadwal lain pada rentang waktu tersebut.",
        },
        { status: 409 }
      );
    }

    // --- siapkan meet link bila ONLINE ---
    let meetLink: string | null = null;
    if (method === "ONLINE") {
      if (platform === "GOOGLE_MEET") {
        const auth = await getOAuthClient();
        meetLink =
          (await createGoogleMeetEvent(
            auth,
            "Meeting dengan guru",
            newMeetingStart,
            newMeetingEnd
          )) ?? null;
      } else if (platform === "ZOOM") {
        meetLink = await createZoomMeeting("Meeting dengan guru", startUtc.toDate());
      }
    }

    // --- jalankan dalam transaction agar konsisten & atomic ---
    const [createdMeeting] = await prisma.$transaction([
      prisma.meeting.create({
        data: {
          teacher_id,
          student_id: user.user_id,
          method,
          dateTime: newMeetingStart,
          startTime: newMeetingStart,
          endTime: newMeetingEnd,
          name_program: programData.name,
          ...(method === "ONLINE" && { meetLink, platform }),
        },
      }),
      // Atomic increment student
      prisma.user.update({
        where: { user_id: user.user_id },
        data: { count_program: { increment: 1 } },
      }),
      // Atomic increment teacher
      prisma.user.update({
        where: { user_id: teacher_id },
        data: { count_program: { increment: 1 } },
      }),
      // Set masa aktif pertama kali (opsional): hanya jika start/end_date belum terisi
      prisma.user.update({
        where: { user_id: user.user_id },
        data: {
          start_date: studentData.start_date ?? startUtc.toDate(),
          end_date: studentData.end_date ?? startUtc.add(2, "month").toDate(),
        },
      }),
    ]);

    // --- kirim WhatsApp (tidak dalam transaction) ---
    const formattedTeacherPhone = formatPhoneNumber(teacherData.no_phone ?? "");
    const formattedStudentPhone = formatPhoneNumber(studentData.no_phone ?? "");
    const studentName = studentData.username || studentData.name_group || "Siswa";
    const teacherName = teacherData.username || "Guru";

    const messages = [
      {
        phone: formattedTeacherPhone,
        text: `📅 *Jadwal Meeting*\n\n👨‍🎓 *Siswa:* ${studentName}\n📆 *Tanggal:* ${dayjs(startUtc).format(
          "dddd, DD MMMM YYYY"
        )}\n🕒 *Waktu Mulai:* ${dayjs(startUtc).format("HH:mm")} ⏰\n🕒 *Waktu Selesai:* ${dayjs(
          startUtc.add(programData.duration, "minute")
        ).format("HH:mm")} ⏰\n📝 *Metode:* ${method}\n📍 *Platform:* ${
          platform || "-"
        }\n🔗 *Link:* ${meetLink || "-"}\n\nHarap siapkan pertemuan dengan baik! 👍`,
      },
      {
        phone: formattedStudentPhone,
        text: `📅🔔 *Pengingat Meeting* 📅\n\n👨‍🏫 *Guru:* ${teacherName}\n📆 *Tanggal:* ${dayjs(startUtc).format(
          "dddd, DD MMMM YYYY"
        )}\n🕒 *Waktu Mulai:* ${dayjs(startUtc).format("HH:mm")}\n🕒 *Waktu Selesai:* ${dayjs(
          startUtc.add(programData.duration, "minute")
        ).format("HH:mm")}\n📚 *Program:* ${programData.name}\n📝 *Metode:* ${method}\n📍 *Platform:* ${
          platform || "-"
        }\n🔗 *Link:* ${meetLink || "-"}\n\n🙏 Mohon bersiap sebelum meeting dimulai! 👍`,
      },
    ];

    let waError = false;
    try {
      await Promise.all(
        messages.map((m) => sendWhatsAppMessage(apiKey, numberKey, m.phone, m.text))
      );
    } catch {
      waError = true;
    }

    return NextResponse.json({
      status: 200,
      error: false,
      message: waError
        ? "Jadwal berhasil dibuat, tetapi notifikasi WhatsApp gagal dikirim."
        : "Jadwal berhasil dibuat dan notifikasi WhatsApp berhasil dikirim.",
      data: { meeting_id: createdMeeting.meeting_id },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 500,
        error: true,
        message:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat membuat jadwal",
      },
      { status: 500 }
    );
  }
}
