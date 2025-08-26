import prisma from "@/lib/prisma";
import { exportMeetingToExcel } from "@/app/(view)/admin/dashboard/teacher/data-teacher/report/timesheet-teacher/file-excel";
import { sendExcelReport } from "@/app/lib/utils/sendEmailExcel";
import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { columns, dateRange, emailTo, teacher_id } = body;

  // 1. Parse date range
  const [start, end] = dateRange;
  const startDate = dayjs(start).startOf("day").toDate();
  const endDate = dayjs(end).endOf("day").toDate();

  try {
    const meetings = await prisma.meeting.findMany({
      where: {
        dateTime: {
          gte: startDate,
          lte: endDate,
        },
        teacher_id: teacher_id,
      },
      include: {
        student: { select: { username: true } },
        teacher: { select: { username: true } },
      },
      orderBy: { dateTime: "asc" },
    });
    const buffer = await exportMeetingToExcel({
      data: meetings,
      columns,
      dateRange,
    });

    // 4. Kirim email
    await sendExcelReport({
      to: emailTo,
      subject: "Laporan Meeting Bulanan",
      html: `<p>Berikut laporan meeting yang Anda minta.</p>`,
      filePath: "",
      filename: "Laporan-Meeting.xlsx",
      attachmentBuffer: buffer,
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  // 3. Generate excel
}
