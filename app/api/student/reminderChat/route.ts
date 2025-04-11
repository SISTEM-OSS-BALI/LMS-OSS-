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
    const now = dayjs().local(); // untuk memastikan perbandingan akurat

    for (const meeting of meetings) {
      const dateTime = dayjs(meeting.dateTime).local();

      const reminderTime = dateTime.subtract(2, "hour");

      if (now.isAfter(reminderTime) && now.isBefore(dateTime)) {
        const teacher = await prisma.user.findUnique({
          where: { user_id: meeting.teacher_id },
          select: { username: true, no_phone: true },
        });

        const student = await prisma.user.findUnique({
          where: { user_id: meeting.student_id },
          select: {
            username: true,
            no_phone: true,
            program_id: true,
            count_program: true,
          },
        });

        const formattedTeacherPhone = teacher?.no_phone
          ? formatPhoneNumber(teacher.no_phone)
          : null;

        const formattedStudentPhone = student?.no_phone
          ? formatPhoneNumber(student.no_phone)
          : null;

        const program = student?.program_id
          ? await prisma.program.findUnique({
              where: { program_id: student.program_id },
              select: { name: true, count_program: true },
            })
          : null;

        const programStillRunning =
          program && student?.count_program !== program.count_program;

        // ✅ Hanya kirim WA kalau program BELUM selesai
        if (programStillRunning) {
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
            `✅ Reminder sent to ${student?.username} & ${teacher?.username}`
          );
        } else {
          console.log(
            `ℹ️ Program ${program?.name} telah selesai. Tidak dikirim reminder.`
          );
        }

        // Tetap tandai reminder agar tidak dikirim ulang
        await prisma.meeting.update({
          where: { meeting_id: meeting.meeting_id },
          data: { reminder_sent_at: new Date() },
        });
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
    console.error("❌ Error sending reminder:", error);
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
  const next = dayjs(now).add(2, "hour").add(5, "minute").toDate();

  return await prisma.meeting.findMany({
    where: {
      dateTime: {
        gte: now,
        lte: next,
      },
      is_cancelled: null,
      reminder_sent_at: null,
    },
    select: {
      meeting_id: true,
      dateTime: true,
      teacher_id: true,
      student_id: true,
    },
  });
}
