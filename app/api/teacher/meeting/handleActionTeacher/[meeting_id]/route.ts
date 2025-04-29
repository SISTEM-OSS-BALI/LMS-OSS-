import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { getData } from "@/app/lib/db/getData";
import { createData } from "@/app/lib/db/createData";
import { formatPhoneNumber } from "@/app/lib/utils/notificationHelper";
import prisma from "@/lib/prisma";
import dayjs from "dayjs";

async function sendWhatsAppMessage(
  apiKey: string,
  numberKey: string,
  phoneNo: string,
  message: string
) {
  const response = await fetch("https://api.watzap.id/v1/send_message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      number_key: numberKey,
      phone_no: phoneNo,
      message: message,
      wait_until_send: "1",
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send WhatsApp message: ${response.statusText}`);
  }

  return await response.json();
}

export async function POST(
  request: NextRequest,
  params: { params: { meeting_id: string } }
) {
  const meeting_id = params.params.meeting_id;
  const user = await authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  const body = await request.json();
  const { reason, imageUrl } = body;
  const apiKey = process.env.API_KEY_WATZAP!;
  const numberKey = process.env.NUMBER_KEY_WATZAP!;

  try {
    const getMeeting = await prisma.meeting.findUnique({
      where: { meeting_id },
    });

    if (!getMeeting) {
      return new NextResponse(JSON.stringify({ error: "Meeting not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    await createData("teacherAbsence", {
      meeting_id: meeting_id,
      teacher_id: user.user_id,
      student_id: getMeeting.student_id,
      reason: reason,
      startTime: getMeeting?.startTime ?? new Date(),
      endTime: getMeeting?.endTime ?? new Date(),
      imageUrl: imageUrl,
      status: false,
    });

    const getAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { user_id: true, no_phone: true, username: true },
    });

    if (!getAdmin) {
      console.error("Admin not found!");
      return new NextResponse(JSON.stringify({ error: "Admin not found" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const adminPhone = formatPhoneNumber(getAdmin.no_phone ?? "");

    const adminMessage =
      `🚨 *Pengajuan Absen Guru* 🚨\n\n` +
      `Halo, *${getAdmin.username}*! 👋\n\n` +
      `Guru *${user.username}* telah mengajukan ketidakhadiran pada jadwal berikut:\n\n` +
      `📅 *Jadwal*: ${dayjs().format("dddd, DD MMMM YYYY HH:mm")}\n` +
      `📢 *Alasan*: ${reason}\n\n` +
      `Mohon segera ditindaklanjuti. Terima kasih! 🙏✨`;

    await sendWhatsAppMessage(apiKey, numberKey, adminPhone, adminMessage);

    return NextResponse.json({
      status: 200,
      error: false,
      data: "Success",
    });
  } catch (error) {
    console.error("Error accessing database:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    await prisma.$disconnect();
  }
}
