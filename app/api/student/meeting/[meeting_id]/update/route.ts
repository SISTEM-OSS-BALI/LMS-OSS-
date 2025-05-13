import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/lib/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { getData } from "@/app/lib/db/getData";
import {
  createGoogleMeetEvent,
  createZoomMeeting,
  getOAuthClient,
} from "@/app/lib/utils/meetingHelper";
import {
  formatPhoneNumber,
  sendWhatsAppMessage,
} from "@/app/lib/utils/notificationHelper";
import { get } from "http";

dayjs.extend(utc);

export async function PUT(
  request: NextRequest,
  { params }: { params: { meeting_id: string } }
) {
  const user = await authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  const meetingId = params.meeting_id;

  if (!meetingId) {
    return NextResponse.json(
      { status: 400, error: "meeting_id tidak disediakan" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { teacher_id, date, time, method, platform } = body;

    // Validasi input
    if (
      !teacher_id ||
      !date ||
      !time ||
      !method ||
      (method === "ONLINE" && !platform)
    ) {
      return NextResponse.json(
        { status: 400, error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const getUser = await getData(
      "user",
      {
        where: { user_id: user.user_id },
      },
      "findFirst"
    );

    if (getUser.is_active === false) {
      return NextResponse.json({ status: 403, error: "User tidak aktif" });
    }

    // Format tanggal dan waktu
    const dayjsDate = dayjs(date, "DD MMMM YYYY", true);
    if (!dayjsDate.isValid()) {
      throw new Error("Format tanggal tidak valid");
    }

    const [hours, minutes] = time.split(":").map(Number);
    const dateTime = dayjs
      .utc(dayjsDate)
      .set("hour", hours)
      .set("minute", minutes);

    // Cari meeting di database
    const existingMeeting = await prisma.meeting.findUnique({
      where: { meeting_id: meetingId },
      include: { teacher: true, student: true },
    });

    if (!existingMeeting) {
      return NextResponse.json(
        { status: 404, error: "Meeting tidak ditemukan" },
        { status: 404 }
      );
    }

    // Validasi H-12 jam sebelum jadwal sebelumnya
    const now = dayjs().add(8, "hour");
    const previousMeetingTime = dayjs.utc(existingMeeting.dateTime);

    if (previousMeetingTime.diff(now, "minute") < 720) {
      return NextResponse.json(
        {
          status: 400,
          error:
            "Meeting hanya dapat diperbarui maksimal 12 jam sebelum jadwal sebelumnya.",
        },
        { status: 400 }
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
      } else {
        throw new Error("Platform tidak valid");
      }
    }

    const getProgramIdStudent = await getData(
      "user",
      {
        where: {
          user_id: user.user_id,
        },
        select: {
          program_id: true,
        },
      },
      "findFirst"
    );

    const getProgramStudent = await getData(
      "program",
      {
        where: {
          program_id: getProgramIdStudent?.program_id,
        },
        select: {
          name: true,
          duration: true,
        },
      },
      "findFirst"
    );

    // Update meeting
    const updatedMeeting = await prisma.meeting.update({
      where: { meeting_id: meetingId },
      data: {
        teacher_id,
        student_id: user.user_id,
        method,
        dateTime: dateTime.toDate(),
        startTime: dateTime.toDate(),
        endTime: dateTime.add(getProgramStudent?.duration!, "minute").toDate(),
        name_program: getProgramStudent?.name,
        ...(method === "ONLINE" && { meetLink, platform }),
      },
    });

    // 🔹 Kirim Notifikasi WhatsApp ke guru dan siswa
    const apiKey = process.env.API_KEY_WATZAP!;
    const numberKey = process.env.NUMBER_KEY_WATZAP!;
    const formattedTeacherPhone = formatPhoneNumber(
      existingMeeting.teacher.no_phone ?? ""
    );
    const formattedStudentPhone = formatPhoneNumber(
      existingMeeting.student.no_phone ?? ""
    );
    const studentName = existingMeeting.student.username;
    const teacherName = existingMeeting.teacher.username;
    const formattedDate = dayjs(dateTime).format("dddd, DD MMMM YYYY HH:mm");

    const messages = [
      {
        phone: formattedTeacherPhone,
        text: `🔄💡 *Update Pertemuan!*\n\n👨‍🏫 *Guru:* ${teacherName} 👋\n👨‍🎓 *Siswa:* ${studentName} 👋\n📚 *Program:* ${
          getProgramStudent?.name
        } 📖\n📅 *Tanggal Baru:* ${formattedDate} 📆\n📝 *Metode:* ${method} 📝\n📍 *Platform:* ${
          platform || "-"
        } 📱\n🔗 *Link:* ${
          meetLink || "-"
        } 📈\n\n🙏 Harap periksa jadwal terbaru. 👍`,
      },
      {
        phone: formattedStudentPhone,
        text: `🔄 *Update Pertemuan!*\n\n👨‍🎓 *Siswa:* ${studentName}\n👨‍🏫 *Guru:* ${teacherName}\n📅 *Tanggal Baru:* ${formattedDate}\n📝 *Metode:* ${method}\n📍 *Platform:* ${
          platform || "-"
        }\n🔗 *Link:* ${meetLink || "-"}\n\nHarap periksa jadwal terbaru.`,
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
