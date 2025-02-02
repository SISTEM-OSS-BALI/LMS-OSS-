import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { getData } from "@/app/lib/db/getData";
import dayjs from "dayjs";
import { createData } from "@/app/lib/db/createData";

export async function POST(
  request: NextRequest,
  params: { params: { meeting_id: string } }
) {
  const meeting_id = params.params.meeting_id;
  const user = authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  const body = await request.json();
  const { reason, imageUrl } = body;
  // const apiKey = process.env.API_KEY_WATZAP!;
  // const numberKey = process.env.NUMBER_KEY_WATZAP!;

  try {
    // const getMeeting = await getData(
    //   "meeting",
    //   {
    //     where: { meeting_id: meeting_id },
    //   },
    //   "findFirst"
    // );

    // const getStudent = await getData(
    //   "user",
    //   {
    //     where: { user_id: getMeeting.student_id },
    //     select: { username: true, no_phone: true },
    //   },
    //   "findFirst"
    // );

    // const getTacher = await getData(
    //   "user",
    //   {
    //     where: { user_id: user.user_id },
    //     select: { username: true },
    //   },
    //   "findFirst"
    // );

    const createTeacherAbsent = await createData("teacherAbsence", {
      meeting_id: meeting_id,
      teacher_id: user.user_id,
      reason: reason,
      imageUrl: imageUrl,
    });

    // const formattedStudentPhone = formatPhoneNumber(getStudent.no_phone);
    // const dateTime = getMeeting.dateTime;

    // await sendWhatsAppMessage(
    //   apiKey,
    //   numberKey,
    //   formattedStudentPhone,
    //   `Meeting dengan guru ${getTacher.username} pada ${dayjs(dateTime).format(
    //     "dddd, DD MMMM YYYY HH:mm"
    //   )}`
    // );

    return NextResponse.json({
      status: 200,
      error: false,
      data: createTeacherAbsent,
    });
  } catch (error) {
    console.error("Error accessing database:", error);
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
