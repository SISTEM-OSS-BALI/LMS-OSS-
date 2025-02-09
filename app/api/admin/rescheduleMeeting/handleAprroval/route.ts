import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/app/lib/prisma";
import {
  formatPhoneNumber,
  sendWhatsAppMessage,
} from "@/app/lib/utils/notificationHelper";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  createGoogleMeetEvent,
  createZoomMeeting,
  getOAuthClient,
} from "@/app/lib/utils/meetingHelper";

dayjs.extend(utc);

export async function POST(request: NextRequest) {
  const user = authenticateRequest(request);
  if (user instanceof NextResponse) {
    return user;
  }

  const { reschedule_id, status } = await request.json();
  const apiKey = process.env.API_KEY_WATZAP!;
  const numberKey = process.env.NUMBER_KEY_WATZAP!;

  try {
    const getRescheduleMeeting = await prisma.rescheduleMeeting.findUnique({
      where: { reschedule_meeting_id: reschedule_id },
      include: {
        student: true,
        teacher: true,
        meeting: true, // Ambil juga data meeting sebelumnya
      },
    });

    if (!getRescheduleMeeting) {
      return NextResponse.json(
        {
          status: 404,
          error: true,
          message: "Reschedule meeting tidak ditemukan!",
        },
        { status: 404 }
      );
    }

    // Ambil data siswa dan format nomor telepon
    const studentPhone = formatPhoneNumber(
      getRescheduleMeeting.student.no_phone || ""
    );
    const teacherPhone = formatPhoneNumber(
      getRescheduleMeeting.teacher.no_phone || ""
    );

    const studentName = getRescheduleMeeting.student.username;
    const teacherName = getRescheduleMeeting.teacher.username;
    const meetingDate = getRescheduleMeeting.new_dateTime;
    const formattedDate = dayjs.utc(meetingDate).format("DD MMM YYYY, HH:mm");

    // Ambil metode dan platform sebelumnya
    const previousMethod = getRescheduleMeeting.meeting.method;
    const previousPlatform = getRescheduleMeeting.meeting.platform;
    let newPlatform = getRescheduleMeeting.new_platform;
    let newMeetLink = null;

    if (previousMethod !== getRescheduleMeeting.new_method) {
      if (getRescheduleMeeting.new_method === "ONLINE") {
        if (newPlatform === "GOOGLE_MEET") {
          const auth = await getOAuthClient();
          newMeetLink = await createGoogleMeetEvent(
            auth,
            `Meeting dengan ${teacherName}`,
            dayjs(meetingDate).toDate(),
            dayjs(meetingDate).add(1, "hour").toDate()
          );
        } else if (newPlatform === "ZOOM") {
          newMeetLink = await createZoomMeeting(
            `Meeting dengan ${teacherName}`,
            dayjs(meetingDate).toDate()
          );
        }
      } else {
        newPlatform = null;
        newMeetLink = null;
      }
    }

    if (status === true) {
      // Update meeting dengan data yang baru
      await prisma.meeting.update({
        where: { meeting_id: getRescheduleMeeting.meeting_id },
        data: {
          student_id: getRescheduleMeeting.student_id,
          teacher_id: getRescheduleMeeting.teacher_id,
          dateTime: getRescheduleMeeting.new_dateTime,
          startTime: getRescheduleMeeting.new_startTime,
          endTime: getRescheduleMeeting.new_endTime,
          method: getRescheduleMeeting.new_method,
          platform: newPlatform,
          meetLink: newMeetLink,
        },
      });

      // Set status reschedule menjadi "APPROVED" dan hapus dari daftar pengajuan
      await prisma.rescheduleMeeting.update({
        where: { reschedule_meeting_id: reschedule_id },
        data: { status: "APPROVED", is_deleted: true },
      });

      // 🔹 Kirim Notifikasi WhatsApp ke siswa
      await sendWhatsAppMessage(
        apiKey,
        numberKey,
        studentPhone,
        `✅ Halo ${studentName}, pengajuan reschedule pertemuan Anda telah disetujui!\n\n📅 *Tanggal Baru:* ${formattedDate}\n👨‍🏫 *Guru:* ${teacherName}\n📝 *Metode:* ${
          getRescheduleMeeting.new_method
        }\n📍 *Platform:* ${newPlatform || "-"}\n🔗 *Link:* ${
          newMeetLink || "-"
        }\n\nTerima kasih! 🙏`
      );

      await sendWhatsAppMessage(
        apiKey,
        numberKey,
        teacherPhone,
        `✅ *Meeting Diperbarui!*\n\n📅 *Tanggal Baru:* ${formattedDate}\n👨‍🎓 *Siswa:* ${studentName}\n📝 *Metode:* ${
          getRescheduleMeeting.new_method
        }\n📍 *Platform:* ${newPlatform || "-"}\n🔗 *Link:* ${
          newMeetLink || "-"
        }\n\nHarap periksa jadwal terbaru. Terima kasih! 🙏`
      );

      return NextResponse.json({
        status: 200,
        error: false,
        message: "Reschedule meeting berhasil disetujui dan diperbarui.",
      });
    } else {
      // Jika reschedule ditolak, update status menjadi "REJECTED" dan tandai sebagai terhapus
      await prisma.rescheduleMeeting.update({
        where: { reschedule_meeting_id: reschedule_id },
        data: { status: "REJECTED", is_deleted: true },
      });

      // 🔹 Kirim Notifikasi WhatsApp ke siswa
      await sendWhatsAppMessage(
        apiKey,
        numberKey,
        studentPhone,
        `❌ Halo ${studentName}, pengajuan reschedule pertemuan Anda ditolak karena bukti yang diberikan kurang valid.\n\nMohon periksa kembali dan ajukan ulang jika diperlukan.\nTerima kasih! 🙏`
      );

      return NextResponse.json({
        status: 200,
        error: false,
        message: "Reschedule meeting ditolak.",
      });
    }
  } catch (error) {
    console.error("Error updating reschedule status:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    await prisma.$disconnect();
  }
}
