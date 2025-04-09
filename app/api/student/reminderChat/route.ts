import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/id";
import {
  formatPhoneNumber,
  sendWhatsAppMessage,
} from "@/app/lib/utils/notificationHelper";

dayjs.extend(utc);
dayjs.locale("id");

export async function POST(request: NextRequest) {
  const apiKey = process.env.API_KEY_WATZAP!;
  const numberKey = process.env.NUMBER_KEY_WATZAP!;

  try {
    const meetings = await getUpcomingMeetings();
    const now = dayjs().utc();

    for (const meeting of meetings) {
      const dateTime = dayjs.utc(meeting.dateTime);
      const reminderTime = dateTime.subtract(2, "hour");

      // ✅ Kirim pengingat hanya jika sekarang adalah 2 jam sebelum meeting
      if (now.isAfter(reminderTime) && now.isBefore(dateTime)) {
        const teacher = await prisma.user.findUnique({
          where: { user_id: meeting.teacher_id },
          select: { username: true, no_phone: true },
        });

        const student = await prisma.user.findUnique({
          where: { user_id: meeting.student_id },
          select: { username: true, no_phone: true },
        });

        const formattedTeacherPhone = teacher?.no_phone
          ? formatPhoneNumber(teacher.no_phone)
          : null;
        const formattedStudentPhone = student?.no_phone
          ? formatPhoneNumber(student.no_phone)
          : null;

        if (formattedTeacherPhone) {
          await sendWhatsAppMessage(
            apiKey,
            numberKey,
            formattedTeacherPhone,
            `⏰ *Pengingat Meeting!*\n\n👨‍🏫 *Guru:* Anda memiliki meeting dengan siswa *${
              student?.username
            }*.\n📅 *Tanggal:* ${dateTime.format(
              "dddd, DD MMMM YYYY"
            )}\n⏳ *Waktu:* ${dateTime.format(
              "HH:mm"
            )} (Dimulai dalam 2 jam)\n\nMohon bersiap untuk sesi ini. Terima kasih! 🙌`
          );
        }

        if (formattedStudentPhone) {
          await sendWhatsAppMessage(
            apiKey,
            numberKey,
            formattedStudentPhone,
            `⏰ *Pengingat Meeting!*\n\n📚 *Siswa:* Meeting Anda dengan guru *${
              teacher?.username
            }* akan segera dimulai.\n📅 *Tanggal:* ${dateTime.format(
              "dddd, DD MMMM YYYY"
            )}\n⏳ *Waktu:* ${dateTime.format(
              "HH:mm"
            )} (Dimulai dalam 2 jam)\n\nMohon bersiap untuk sesi ini. Terima kasih! 🙌`
          );
        }

        console.log(
          `✅ Pengingat dikirim ke ${student?.username} & ${teacher?.username}`
        );
      } else {
        console.log("⏳ Bukan waktu pengingat atau sudah lewat.");
      }
    }

    return NextResponse.json({
      status: 200,
      error: false,
      data: "Processed reminders",
    });
  } catch (error) {
    console.error("❌ Error:", error);
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

async function getUpcomingMeetings() {
  const now = new Date();
  const next = dayjs(now).add(2, "hour").add(5, "minutes").toDate(); // buffer 5 menit

  return await prisma.meeting.findMany({
    where: {
      dateTime: {
        gte: now,
        lte: next,
      },
      is_cancelled: null,
    },
    select: {
      meeting_id: true,
      dateTime: true,
      teacher_id: true,
      student_id: true,
    },
  });
}
