import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/app/lib/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { google } from "googleapis";
import crypto from "crypto";
import axios from "axios";
import { getData } from "@/app/lib/db/getData";

dayjs.extend(utc);

export async function PUT(
  request: NextRequest,
  { params }: { params: { meeting_id: string } }
) {
  const user = authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user; // Mengembalikan respon jika autentikasi gagal
  }

  const meetingId = params.meeting_id;

  if (!meetingId) {
    return NextResponse.json(
      { status: 400, error: "meeting_id tidak disediakan" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { teacher_id, date, time, method, platform } = body;

    // Validasi input
    if (
      !teacher_id ||
      !date ||
      !time ||
      !method ||
      (method === "ONLINE" && !platform)
    ) {
      return NextResponse.json(
        { status: 400, error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // Format tanggal dan waktu
    const dayjsDate = dayjs(date, "DD MMMM YYYY", true);
    if (!dayjsDate.isValid()) {
      throw new Error("Format tanggal tidak valid");
    }

    const [hours, minutes] = time.split(":").map(Number);
    const dateTime = dayjs
      .utc(dayjsDate)
      .set("hour", hours)
      .set("minute", minutes);

    // Cari meeting di database
    const existingMeeting = await prisma.meeting.findUnique({
      where: { meeting_id: meetingId },
    });

    if (!existingMeeting) {
      return NextResponse.json(
        { status: 404, error: "Meeting tidak ditemukan" },
        { status: 404 }
      );
    }

    // Validasi H-2 jam sebelum jadwal sebelumnya
    const now = dayjs().add(8, "hour");
    const previousMeetingTime = dayjs.utc(existingMeeting.dateTime);

    if (previousMeetingTime.diff(now, "minute") < 120) {
      return NextResponse.json(
        {
          status: 400,
          error:
            "Meeting hanya dapat diperbarui maksimal H-2 jam sebelum jadwal sebelumnya.",
        },
        { status: 400 }
      );
    }

    let meetLink;
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

    const getProgramIdStudent = await getData(
      "user",
      {
        where: {
          user_id: user.user_id,
        },
        select: {
          program_id: true,
        },
      },
      "findFirst"
    );

    const getProgramStudent = await getData(
      "program",
      {
        where: {
          program_id: getProgramIdStudent?.program_id,
        },
        select: {
          name: true,
          duration: true,
        },
      },
      "findFirst"
    );

    // Update meeting
    const updatedMeeting = await prisma.meeting.update({
      where: { meeting_id: meetingId },
      data: {
        teacher_id,
        student_id: user.user_id,
        method,
        dateTime: dateTime.toDate(),
        startTime: dateTime.toDate(),
        endTime: dateTime.add(getProgramStudent?.duration!, "minute").toDate(),
        name_program: getProgramStudent?.name,
        ...(method === "ONLINE" && { meetLink, platform }),
      },
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: updatedMeeting,
    });
  } catch (error) {
    console.error("Error updating meeting:", error);
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

function formatPhoneNumber(phone: string): string {
  if (!phone.startsWith("08")) {
    throw new Error("Nomor telepon harus dimulai dengan 08.");
  }

  const formattedPhone = phone.replace(/^0/, "+62");
  if (formattedPhone.length < 11 || formattedPhone.length > 15) {
    throw new Error(
      "Nomor telepon tidak valid. Panjang nomor harus antara 11 hingga 15 digit."
    );
  }

  return formattedPhone;
}

async function sendWhatsAppMessage(
  client: any,
  {
    to,
    variables,
  }: {
    to: string;
    variables: { date: string; time: string; name: string };
  }
) {
  await client.messages.create({
    from: "whatsapp:+14155238886",
    contentSid: process.env.TWILIO_CONTENT_SID,
    contentVariables: JSON.stringify(variables),
    to: `whatsapp:${to}`,
  });
}
