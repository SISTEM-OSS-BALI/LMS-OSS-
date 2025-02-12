import { NextRequest, NextResponse } from "next/server";

import { getData } from "@/app/lib/db/getData";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  const user = authenticateRequest(request);

  const formattedDate = date
    ? dayjs.utc(date).format("YYYY-MM-DD")
    : dayjs().utc().format("YYYY-MM-DD");

  const startOfDay = dayjs.utc(formattedDate).startOf("day").toDate();
  const endOfDay = dayjs.utc(formattedDate).endOf("day").toDate();

  if (user instanceof NextResponse) {
    return user;
  }

  const user_id = user.user_id;
  try {
    const getMeeting = await getData(
      "meeting",
      {
        where: {
          teacher_id: user_id,
          dateTime: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
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
