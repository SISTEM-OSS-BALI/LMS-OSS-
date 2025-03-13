import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getData } from "@/app/lib/db/getData";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { updateData } from "@/app/lib/db/updateData";

dayjs.extend(utc);

export async function PATCH(
  request: NextRequest,
  { params: { meeting_id } }: { params: { meeting_id: string } }
) {
  const user = await authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  const meetingId = meeting_id;

  const body = await request.json();
  const { progress, abilityScale, studentPerformance } = body;


  try {
    const updateMeeting = await updateData(
      "meeting",
      { meeting_id: meetingId },
      {
        progress_student: progress,
        abilityScale: abilityScale,
        studentPerformance: studentPerformance
      }
    );

    return NextResponse.json({
      status: 200,
      error: false,
      data: updateMeeting,
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
