import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/id";
import {
  formatPhoneNumber,
  sendWhatsAppMessage,
} from "@/app/lib/utils/notificationHelper";

dayjs.locale("id");
dayjs.extend(utc);

export async function POST(request: NextRequest) {
  const apiKey = process.env.API_KEY_WATZAP!;
  const numberKey = process.env.NUMBER_KEY_WATZAP!;

  try {
    const students = await getStudents();

    for (const student of students) {
      const formattedPhone = student.no_phone
        ? formatPhoneNumber(student.no_phone)
        : "";

      if (formattedPhone) {
        const message = `👋 Halo ${student.username}, ini pengingat untuk melakukan booking sesi meeting Anda. Jangan sampai terlewat ya! 📅✨

Jika Anda sudah melakukan booking, silakan abaikan pesan ini. 🙏`;

        await sendWhatsAppMessage(apiKey, numberKey, formattedPhone, message);
      }
    }

    return NextResponse.json({
      status: 200,
      error: false,
      data: "Reminders sent",
    });
  } catch (error) {
    console.error("Error sending reminders:", error);
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

async function getStudents() {
  return await prisma.user.findMany({
    where: {
      role: "STUDENT",
    },
    select: {
      username: true,
      no_phone: true,
    },
  });
}
