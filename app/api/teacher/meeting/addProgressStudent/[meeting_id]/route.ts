import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getData } from "@/app/lib/db/getData";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { updateData } from "@/app/lib/db/updateData";
import { createData } from "@/app/lib/db/createData";

dayjs.extend(utc);

export async function POST(
  request: NextRequest,
  { params: { meeting_id } }: { params: { meeting_id: string } }
) {
  const user = await authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  const meetingId = meeting_id;

  const body = await request.json();
  const { progress, abilityScale, studentPerformance, user_group_id, user_id } =
    body;

  console.log(
    progress,
    abilityScale,
    studentPerformance,
    user_group_id,
    user_id
  );
  try {
    let createProgress;
    if (user_group_id) {
      createProgress = await prisma.progressMeeting.create({
        data: {
          meeting_id: meetingId,
          progress_student: progress,
          user_group_id: user_group_id,
          abilityScale: abilityScale,
          studentPerformance: studentPerformance,
        },
      });
    } else {
      createProgress = await prisma.progressMeeting.create({
        data: {
          meeting_id: meetingId,
          progress_student: progress,
          user_id: user_id,
          abilityScale: abilityScale,
          studentPerformance: studentPerformance,
        },
      });
    }

    return NextResponse.json({
      status: 200,
      error: false,
      data: createProgress,
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
