import prisma from "@/lib/prisma";
import {
  exportMeetingToExcel,
  TimesheetTeacherItem,
} from "@/app/(view)/admin/dashboard/teacher/data-teacher/report/timesheet-teacher/file-excel";
import { sendExcelReport } from "@/app/lib/utils/sendEmailExcel";
import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";

const iso = (d?: Date | null) => (d ? d.toISOString() : null);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { columns, dateRange, emailTo, teacher_id } = body as {
      columns: string[];
      dateRange: [string | Date, string | Date];
      emailTo: string;
      teacher_id: string;
    };

    // 1) Normalize date range ke Date
    const [start, end] = dateRange;
    const startDate = dayjs(start).startOf("day").toDate();
    const endDate = dayjs(end).endOf("day").toDate();

    // 2) Query ke Prisma
    const meetings = await prisma.meeting.findMany({
      where: {
        dateTime: { gte: startDate, lte: endDate },
        teacher_id,
      },
      include: {
        student: { select: { username: true } },
        teacher: { select: { username: true } },
      },
      orderBy: { dateTime: "asc" },
    });

    // 3) Map ke TimesheetTeacherItem (semua date -> string)
    const mapped: TimesheetTeacherItem[] = meetings.map((m) => ({
      meeting_id: m.meeting_id,
      method: m.method,
      meetLink: m.meetLink,
      platform: m.platform,
      teacher_id: m.teacher_id,
      student_id: m.student_id,
      is_started: m.is_started,
      // alpha: m.alpha,
      absent: m.absent,
      started_time: iso(m.started_time),
      finished_time: iso(m.finished_time),
      dateTime: iso(m.dateTime),
      startTime: iso(m.startTime as unknown as Date | null), // jika di DB bertipe Date
      endTime: iso(m.endTime as unknown as Date | null), // sesuaikan dengan tipe di schema
      name_program: m.name_program,
      is_cancelled: m.is_cancelled,
      status: m.status,
      reminder_sent_at: iso(m.reminder_sent_at as Date | null),
      createdAt: iso(m.createdAt),
      student: m.student ? { username: m.student.username } : null,
      teacher: m.teacher ? { username: m.teacher.username } : null,
    }));

    // 4) Generate excel (kita kirim dateRange sebagai string ISO)
    const buffer = await exportMeetingToExcel({
      data: mapped,
      columns,
      dateRange: [startDate.toISOString(), endDate.toISOString()],
    });

    // 5) Kirim email (buffer sudah Buffer Node)
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
    console.error(error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal error" },
      { status: 500 }
    );
  }
}
