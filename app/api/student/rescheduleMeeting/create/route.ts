import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export async function POST(request: NextRequest) {
  const user = authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  try {
    const body = await request.json();
    const {
      teacher_id,
      meeting_id,
      date,
      time,
      method,
      platform,
      reason,
      option_reason,
      imageUrl,
    } = body;

    if (!teacher_id || !meeting_id || !reason || !option_reason) {
      return NextResponse.json(
        { status: 400, error: true, message: "Data tidak lengkap!" },
        { status: 400 }
      );
    }

    const dayjsDate = dayjs(date, "DD MMMM YYYY", true);
    if (!dayjsDate.isValid()) {
      throw new Error("Format tanggal tidak valid");
    }

    const [hours, minutes] = time.split(":").map(Number);
    const dateTime = dayjs
      .utc(dayjsDate.add(1, "day"))
      .set("hour", hours)
      .set("minute", minutes);

    const getTeacher = await prisma.user.findUnique({
      where: {
        user_id: teacher_id,
      },
      select: {
        user_id: true,
        username: true,
      },
    });

    const getStudent = await prisma.user.findUnique({
      where: {
        user_id: user.user_id,
      },
      select: {
        user_id: true,
        username: true,
        program_id: true,
      },
    });

    const getProgram = await prisma.program.findUnique({
      where: {
        program_id: getStudent?.program_id ?? "",
      },
      select: {
        name: true,
        duration: true,
      },
    });

    const createReschedule = await prisma.rescheduleMeeting.create({
      data: {
        teacher_id,
        meeting_id,
        teacher_name: getTeacher?.username ?? "",
        student_name: getStudent?.username ?? "",
        student_id: getStudent?.user_id ?? "",
        new_dateTime: dateTime.toDate(),
        new_startTime: dateTime.toDate(),
        program_name: getProgram?.name ?? "",
        new_endTime: dateTime.add(getProgram?.duration!, "minute").toDate(),
        new_platform: platform,
        new_method: method,
        reason,
        option_reason,
        imageUrl,
      },
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: createReschedule,
      message: "Reschedule meeting berhasil diajukan.",
    });
  } catch (error) {
    console.error("Error creating reschedule:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    await prisma.$disconnect();
  }
}
