import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/app/lib/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import cron from "node-cron";
import "dayjs/locale/id";

dayjs.locale("id");
dayjs.extend(utc);

let cronJobInitialized = false;

export async function POST(request: NextRequest) {
  const apiKey = process.env.API_KEY_WATZAP!;
  const numberKey = process.env.NUMBER_KEY_WATZAP!;

  try {
    const students = await getStudents();

    for (const student of students) {
      const formattedStudentPhone = student.no_phone
        ? formatPhoneNumber(student.no_phone)
        : "";
      await sendWhatsAppMessage(
        apiKey,
        numberKey,
        formattedStudentPhone,
        `Hallo ${student.username}, jangan lupa booking meeting!`
      );
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

async function sendWhatsAppMessage(
  apiKey: string,
  numberKey: string,
  phoneNo: string,
  message: string
) {
  const response = await fetch("https://api.watzap.id/v1/send_message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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

  const data = await response.json();
  return data;
}

function formatPhoneNumber(phone: string): string {
  if (phone.startsWith("0")) {
    return "62" + phone.slice(1);
  }
  return phone;
}

// Initialize the cron job to run daily at 8 AM
if (!cronJobInitialized) {
  cron.schedule("0 8 * * *", async () => {
    const apiKey = process.env.API_KEY_WATZAP!;
    const numberKey = process.env.NUMBER_KEY_WATZAP!;

    try {
      const students = await getStudents();

      for (const student of students) {
        const formattedStudentPhone = student.no_phone
          ? formatPhoneNumber(student.no_phone)
          : "";
        await sendWhatsAppMessage(
          apiKey,
          numberKey,
          formattedStudentPhone,
          `Hallo ${student.username}, jangan lupa booking meeting!`
        );
      }

      console.log("Daily reminders sent");
    } catch (error) {
      console.error("Error sending daily reminders:", error);
    } finally {
      await prisma.$disconnect();
    }
  });

  cronJobInitialized = true;
}
