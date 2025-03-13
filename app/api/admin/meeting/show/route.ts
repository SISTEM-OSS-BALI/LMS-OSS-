import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getData } from "@/app/lib/db/getData";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);


  if (user instanceof NextResponse) {
    return user;
  }

  try {
    const getMeeting = await getData(
      "meeting",
      {
        orderBy: {
          dateTime: "asc",
        },
      },
      "findMany"
    );

    return NextResponse.json({ status: 200, error: false, data: getMeeting });
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
