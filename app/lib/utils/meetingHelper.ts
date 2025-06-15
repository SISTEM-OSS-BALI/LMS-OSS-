import { google } from "googleapis";
import crypto from "crypto";
import axios from "axios";

export async function getOAuthClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
  });

  return oauth2Client;
}

export async function createGoogleMeetEvent(
  auth: any,
  summary: string,
  startDateTime: Date,
  endDateTime: Date
) {
  const calendar = google.calendar({ version: "v3", auth });

  const event = {
    summary,
    start: { dateTime: startDateTime.toISOString(), timeZone: "Asia/Jakarta" },
    end: { dateTime: endDateTime.toISOString(), timeZone: "Asia/Jakarta" },
    conferenceData: {
      createRequest: {
        requestId: `meet-${crypto.randomBytes(5).toString("hex")}`,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: event,
    conferenceDataVersion: 1,
  });

  return response.data.hangoutLink;
}

export async function getZoomAccessToken() {
  const tokenUrl = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`;

  const response = await axios.post(
    tokenUrl,
    {},
    {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
    }
  );

  console.log(response.data.access_token);

  return response.data.access_token;
}

export async function createZoomMeeting(topic: string, startTime: Date) {
  try {
    console.log("[Zoom] Generating access token...");
    const accessToken = await getZoomAccessToken();
    console.log("[Zoom] Access token berhasil didapatkan.");

    const meetingData = {
      topic,
      type: 2, // Scheduled meeting
      start_time: startTime.toISOString(),
      duration: 60,
      timezone: "Asia/Jakarta",
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: true,
        mute_upon_entry: true,
        audio: "voip",
      },
    };

    console.log(
      "[Zoom] Mengirim data meeting:",
      JSON.stringify(meetingData, null, 2)
    );

    const response = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      meetingData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("[Zoom] Meeting berhasil dibuat:", response.data);
    return response.data.join_url;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error("[Zoom] Gagal membuat meeting - Axios error:");
      console.error("Status:", error.response?.status);
      console.error("Data:", error.response?.data);
    } else {
      console.error("[Zoom] Gagal membuat meeting - General error:");
      console.error(error);
    }
    throw new Error("Gagal membuat Zoom meeting.");
  }
}
