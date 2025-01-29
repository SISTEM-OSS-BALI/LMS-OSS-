import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/app/lib/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { getData } from "@/app/lib/db/getData";
import { google } from "googleapis";
import crypto from "crypto";
import axios from "axios";
import schedule from "node-schedule";
import "dayjs/locale/id";

dayjs.locale("id");

dayjs.extend(utc);

export async function POST(request: NextRequest) {
  const user = authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  const apiKey = process.env.API_KEY_WATZAP!;
  const numberKey = process.env.NUMBER_KEY_WATZAP!;

  try {
    const body = await request.json();
    const { teacher_id, date, time, method, platform } = body;

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
          "Zoom Authentication Client",
          "Meeting dengan guru",
          dateTime.toDate(),
          dateTime.add(1, "hour").toDate()
        );
      } else {
        throw new Error("Platform tidak valid");
      }
    }

    const meetingData = {
      teacher_id,
      student_id: user.user_id,
      method,
      dateTime: dateTime.toDate(),
      ...(method === "ONLINE" && { meetLink, platform }),
    };

    const meeting = await prisma.meeting.create({
      data: meetingData,
    });

    const teacherData = await getData(
      "user",
      {
        where: { user_id: teacher_id },
        select: { username: true, no_phone: true },
      },
      "findFirst"
    );

    const studentData = await getData(
      "user",
      {
        where: { user_id: user.user_id },
        select: { username: true, no_phone: true },
      },
      "findFirst"
    );

    if (!teacherData || !studentData) {
      throw new Error("Data guru atau siswa tidak ditemukan");
    }

    const formattedTeacherPhone = formatPhoneNumber(teacherData.no_phone);
    const formattedStudentPhone = formatPhoneNumber(studentData.no_phone);

    const studentName = studentData.username;
    const teacherName = teacherData.username;

    await sendWhatsAppMessage(
      apiKey,
      numberKey,
      formattedTeacherPhone,
      `Meeting dengan siswa ${studentName} pada ${dayjs(dateTime).format(
        "dddd, DD MMMM YYYY HH:mm"
      )}`
    );
    await sendWhatsAppMessage(
      apiKey,
      numberKey,
      formattedStudentPhone,
      `Meeting dengan guru ${teacherName} pada ${dayjs(dateTime).format(
        "dddd, DD MMMM YYYY HH:mm"
      )}`
    );

    const now = dayjs().add(8, "hour");
    const reminderTime = dateTime.subtract(1, "hour").toDate();

    if (now.isBefore(reminderTime)) {
      schedule.scheduleJob(reminderTime, async () => {
        await sendWhatsAppMessage(
          apiKey,
          numberKey,
          formattedTeacherPhone,
          `Pengingat: Meeting dengan siswa ${studentName} akan dimulai dalam 1 jam pada ${dayjs(
            dateTime
          ).format("dddd, DD MMMM YYYY HH:mm")}`
        );
        await sendWhatsAppMessage(
          apiKey,
          numberKey,
          formattedStudentPhone,
          `Pengingat: Meeting dengan guru ${teacherName} akan dimulai dalam 1 jam pada ${dayjs(
            dateTime
          ).format("dddd, DD MMMM YYYY HH:mm")}`
        );
      });
    } else {
      console.warn("Waktu pengingat sudah lewat, tidak dapat dijadwalkan.");
    }
    return NextResponse.json({
      status: 200,
      error: false,
      data: meeting,
    });
  } catch (error) {
    console.error("Error saving schedule:", error);
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

async function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return oauth2Client;
}

async function getZoomAccessToken() {
  const zoomClientId = process.env.ZOOM_CLIENT_ID;
  const zoomClientSecret = process.env.ZOOM_CLIENT_SECRET;
  const zoomRefreshToken = process.env.ZOOM_REFRESH_TOKEN;

  // Buat URL untuk request token
  const tokenUrl = "https://zoom.us/oauth/token";

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${zoomClientId}:${zoomClientSecret}`
      ).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: zoomRefreshToken || "",
    }).toString(),
  });

  const responseData = await response.json();
  const { access_token } = responseData;

  return access_token;
}

async function createZoomMeeting(
  auth: any,
  summary: string,
  startDateTime: Date,
  endDateTime: Date
) {
  const accessToken = await getZoomAccessToken();

  const zoomMeetingData = {
    topic: summary,
    type: 2, // 2 = Scheduled Meeting
    start_time: startDateTime.toISOString(),
    duration: 60, // durasi dalam menit
    timezone: "Asia/Jakarta",
    agenda: summary,
    settings: {
      host_video: true,
      participant_video: true,
      join_before_host: true,
      mute_upon_entry: true,
      audio: "voip", // hanya VOIP
    },
  };

  try {
    const response = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      zoomMeetingData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data.join_url;
  } catch (error) {
    console.error("Error creating Zoom meeting:", error);
    throw new Error("Failed to create Zoom meeting");
  }
}

const createGoogleMeetEvent = async (
  auth: any,
  summary: string,
  startDateTime: Date,
  endDateTime: Date
) => {
  const calendar = google.calendar({ version: "v3", auth });

  const event = {
    summary,
    start: {
      dateTime: new Date(
        startDateTime.setHours(startDateTime.getHours() - 8)
      ).toISOString(),
      timeZone: "Asia/Jakarta",
    },
    end: {
      dateTime: new Date(
        endDateTime.setHours(endDateTime.getHours() - 8)
      ).toISOString(),
      timeZone: "Asia/Jakarta",
    },
    conferenceData: {
      createRequest: {
        requestId: `meet-${crypto.randomBytes(5).toString("hex")}`,
        conferenceSolutionKey: {
          type: "hangoutsMeet",
        },
      },
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      conferenceDataVersion: 1,
    });
    console.log("Google Meet event created:", response.data);
    return response.data.hangoutLink;
  } catch (error) {
    console.error("Error creating Google Meet event:", error);
    throw new Error("Failed to create Google Meet event");
  }
};

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
