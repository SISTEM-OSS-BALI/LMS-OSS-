import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { createData } from "@/app/lib/db/createData";
import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { tanggal, alasan } = body;

    console.log("Received data:", { tanggal, alasan });

    if (!tanggal) {
      return NextResponse.json(
        { error: "Field 'tanggal' is required" },
        { status: 400 }
      );
    }

    const user = await authenticateRequest(request);
    if (user instanceof NextResponse) return user;

    // Konversi tanggal ke zona waktu Asia/Makassar (WITA, GMT+8)
    const date = dayjs(tanggal).add(8, "hour")
    console.log("Converted date:", date);
    await createData("teacherLeave", {
      teacher_id: user.user_id,
      leave_date: date.toDate(),
      reason: alasan || null,
    });

    return NextResponse.json(
      { success: true, message: "Jadwal libur berhasil disimpan" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error saat menyimpan data libur:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}