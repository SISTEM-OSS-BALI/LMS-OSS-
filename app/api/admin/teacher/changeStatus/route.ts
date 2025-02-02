import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/app/lib/prisma";
import { deleteData } from "@/app/lib/db/deleteData";
import { getData } from "@/app/lib/db/getData";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export async function POST(request: NextRequest) {
  const user = authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  const body = await request.json();
  const { teacher_absence_id, status, meeting_id } = body;

  const apiKey = process.env.API_KEY_WATZAP!;
  const numberKey = process.env.NUMBER_KEY_WATZAP!;

  try {
    const updateAbsent = await prisma.teacherAbsence.update({
      where: { teacher_absence_id },
      data: { status },
    });

    const getMeeting = await getData("meeting", {
      where: {
        meeting_id: meeting_id,
      },
    });

    const getStudent = await getData(
      "user",
      {
        where: {
          user_id: getMeeting.student_id,
        },
      },
      "findFirst"
    );

    const getTeacher = await getData(
      "user",
      {
        where: {
          user_id: getMeeting.teacher_id,
        },
      },
      "findFirst"
    );

    const formattedStudentPhone = formatPhoneNumber(getStudent.no_phone);

    await sendWhatsAppMessage(
      apiKey,
      numberKey,
      formattedStudentPhone,
      `Meeting dengan guru ${getTeacher.username} pada ${dayjs
        .utc(getMeeting.startTime)
        .format("dddd, DD MMMM YYYY HH:mm")} sampai ${dayjs
        .utc(getMeeting.endTime)
        .format("dddd, DD MMMM YYYY HH:mm")} Di Batalkan Akibat ${
        getTeacher.username
      } berhalangan hadir`
    );

    await deleteData("meeting", {
      meeting_id,
    });
    return NextResponse.json({
      status: 200,
      error: false,
      data: updateAbsent,
    });
  } catch (error) {
    console.error("Error updating absent status:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
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
