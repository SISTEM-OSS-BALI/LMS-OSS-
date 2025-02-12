import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/app/lib/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import schedule from "node-schedule";
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
  const user = authenticateRequest(request);
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
      .utc(dayjsDate.add(1, "day"))
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
        },
      }),
      prisma.user.findUnique({
        where: { user_id: teacher_id },
        select: { username: true, no_phone: true },
      }),
      prisma.program.findUnique({
        where: { program_id: user.program_id },
        select: { name: true, duration: true },
      }),
    ]);

    if (!studentData || !teacherData || !programData)
      throw new Error("Data tidak ditemukan");

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

    const now = dayjs().add(8, "hour");
    const reminderTime = dateTime.subtract(1, "hour").toDate();

    if (now.isBefore(reminderTime)) {
      schedule.scheduleJob(reminderTime, async () => {
        await sendWhatsAppMessage(
          apiKey,
          numberKey,
          formattedTeacherPhone,
          `⏰ *Pengingat Meeting!*\n\n👨‍🏫 *Guru:* Anda memiliki meeting dengan siswa *${studentName}*.\n📅 *Tanggal:* ${dayjs(
            dateTime
          ).format("dddd, DD MMMM YYYY")}\n⏳ *Waktu:* ${dayjs(dateTime).format(
            "HH:mm"
          )} (Dimulai dalam 1 jam)\n\nMohon bersiap untuk sesi ini. Terima kasih! 🙌`
        );
        await sendWhatsAppMessage(
          apiKey,
          numberKey,
          formattedStudentPhone,
          `⏰ *Pengingat Meeting!*\n\n📚 *Siswa:* Meeting Anda dengan guru *${teacherName}* akan segera dimulai.\n📅 *Tanggal:* ${dayjs(
            dateTime
          ).format("dddd, DD MMMM YYYY")}\n⏳ *Waktu:* ${dayjs(dateTime).format(
            "HH:mm"
          )} (Dimulai dalam 1 jam)\n\nMohon bersiap untuk sesi ini. Terima kasih! 🙌`
        );
      });
    } else {
      console.warn("Waktu pengingat sudah lewat, tidak dapat dijadwalkan.");
    }

    const messages = [
      {
        phone: formattedTeacherPhone,
        text: `📅 *Jadwal Meeting*\n\n👨‍🎓 *Siswa:* ${studentName}\n📅 *Tanggal:* ${dayjs(
          dateTime
        ).format("dddd, DD MMMM YYYY")}\n🕒 *Waktu:* ${dayjs(dateTime).format(
          "HH:mm"
        )}\n📝 *Metode:* ${method}\n📍 *Platform:* ${
          platform || "-"
        }\n🔗 *Link:* ${
          meetLink || "-"
        }\n\nHarap siapkan pertemuan dengan baik!`,
      },
      {
        phone: formattedStudentPhone,
        text: `📅 *Pengingat Meeting*\n\n👨‍🏫 *Guru:* ${teacherName}\n📅 *Tanggal:* ${dayjs(
          dateTime
        ).format("dddd, DD MMMM YYYY")}\n🕒 *Waktu:* ${dayjs(dateTime).format(
          "HH:mm"
        )}\n📝 *Metode:* ${method}\n📍 *Platform:* ${
          platform || "-"
        }\n🔗 *Link:* ${
          meetLink || "-"
        }\n\nMohon bersiap sebelum meeting dimulai!`,
      },
    ];

    await Promise.all(
      messages.map((msg) =>
        sendWhatsAppMessage(apiKey, numberKey, msg.phone, msg.text)
      )
    );

    return NextResponse.json({ status: 200, error: false, message: "Success" });
  } catch (error) {
    console.error("Error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
