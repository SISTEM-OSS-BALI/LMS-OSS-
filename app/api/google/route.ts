import { oauth2Client } from "@/app/lib/utils/google";
import { NextResponse } from "next/server";

export async function GET() {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent", // supaya dapat refresh_token
    scope: ["https://www.googleapis.com/auth/calendar"],
  });

  return NextResponse.redirect(url);
}
