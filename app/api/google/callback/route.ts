import { NextRequest, NextResponse } from "next/server";
import { oauth2Client } from "@/app/lib/utils/google";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) return new NextResponse("Code not found", { status: 400 });

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);


  return NextResponse.redirect(new URL("/dashboard", req.url));
}
