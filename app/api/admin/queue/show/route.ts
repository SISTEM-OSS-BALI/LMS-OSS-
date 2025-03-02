import { NextRequest, NextResponse } from "next/server";

import { getData } from "@/app/lib/db/getData";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);
  // const url = new URL(request.url);
  // const date = url.searchParams.get("date");

  if (user instanceof NextResponse) {
    return user;
  }

  // const formattedDate = date
  //   ? dayjs.utc(date).format("YYYY-MM-DD")
  //   : dayjs().utc().format("YYYY-MM-DD");

  // const startOfDay = dayjs.utc(formattedDate).startOf("day").toDate();
  // const endOfDay = dayjs.utc(formattedDate).endOf("day").toDate();

  try {
    const getMeetingWithTeacher = await getData(
      "meeting",
      {
        where: {
          // dateTime: {
          //   gte: startOfDay,
          //   lte: endOfDay,
          // },
          
        },
        include: {
          teacher: {
            select: {
              user_id: true,
              username: true,
              count_program: true,
            },
          },
          student: {
            select: {
              user_id: true,
              username: true,
              program_id: true,
              count_program: true,
            },
          },
        },
      },
      "findMany"
    );

    return NextResponse.json({
      status: 200,
      error: false,
      data: getMeetingWithTeacher,
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
