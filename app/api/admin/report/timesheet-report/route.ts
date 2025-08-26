import prisma from "@/lib/prisma";
import {
  exportMeetingToExcel,
  // (opsional) TimesheetTeacherItem kalau perlu dipakai di sini
} from "@/app/(view)/admin/dashboard/teacher/data-teacher/report/timesheet-teacher/file-excel";
import { sendExcelReport } from "@/app/lib/utils/sendEmailExcel";
import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";
import { Buffer } from "node:buffer";

const iso = (d?: Date | null) => (d ? d.toISOString() : null);

// Helper untuk startTime/endTime jika di DB bisa Date/string
const toStringTime = (v: unknown) => {
  if (v == null) return null;
  if (typeof v === "string") return v; // sudah string (mis. "HH:mm")
  if (v instanceof Date) return v.toISOString(); // Date → ISO
  return String(v); // fallback
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { columns, dateRange, emailTo } = body as {
      columns: string[];
      dateRange: [string | Date, string | Date];
      emailTo: string;
    };

    // 1) Parse date range (awal & akhir hari)
    const [start, end] = dateRange;
    const startDate = dayjs(start).startOf("day").toDate();
    const endDate = dayjs(end).endOf("day").toDate();

    // 2) Ambil data meeting
    const meetings = await prisma.meeting.findMany({
      where: {
        dateTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        student: { select: { username: true } },
        teacher: { select: { username: true } },
      },
      orderBy: { dateTime: "asc" },
    });

    // 3) Map → TimesheetTeacherItem (semua Date → string)
    const mapped = meetings.map((m) => ({
      meeting_id: m.meeting_id,
      method: (m as any).method ?? null,
      meetLink: (m as any).meetLink ?? null,
      platform: (m as any).platform ?? null,
      teacher_id: m.teacher_id,
      student_id: m.student_id,
      is_started: (m as any).is_started ?? null,
      alpha: (m as any).alpha ?? null,
      absent: (m as any).absent ?? null,
      started_time: iso((m as any).started_time ?? null),
      finished_time: iso((m as any).finished_time ?? null),
      dateTime: iso(m.dateTime),
      startTime: toStringTime((m as any).startTime ?? null),
      endTime: toStringTime((m as any).endTime ?? null),
      name_program: (m as any).name_program ?? null,
      is_cancelled: (m as any).is_cancelled ?? null,
      status: (m as any).status ?? null,
      reminder_sent_at: iso((m as any).reminder_sent_at ?? null),
      createdAt: iso(m.createdAt),
      student: m.student
        ? { username: m.student.username ?? "-" }
        : { username: "-" },
      teacher: m.teacher
        ? { username: m.teacher.username ?? "-" }
        : { username: "-" },
    }));

    // 4) Generate Excel (kirim dateRange sebagai ISO string)
    const excelOutput = await exportMeetingToExcel({
      data: mapped,
      columns,
      dateRange: [startDate.toISOString(), endDate.toISOString()],
    });

    // 5) Pastikan bentuknya Buffer (jaga-jaga kalau util masih return ArrayBuffer/Uint8Array)
    const attachmentBuffer: Buffer = Buffer.isBuffer(excelOutput)
      ? excelOutput
      : (excelOutput as any) instanceof ArrayBuffer
      ? Buffer.from(excelOutput)
      : ArrayBuffer.isView(excelOutput) // Uint8Array, dll.
      ? Buffer.from(excelOutput as ArrayBufferView as Uint8Array)
      : Buffer.from(excelOutput as any);

    // 6) Kirim email
    await sendExcelReport({
      to: emailTo,
      subject: "Laporan Meeting Bulanan",
      html: `<p>Berikut laporan meeting yang Anda minta.</p>`,
      filePath: "",
      filename: "Laporan-Meeting.xlsx",
      attachmentBuffer,
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
