import ExcelJS from "exceljs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(utc);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface TimesheetTeacherItem {
  meeting_id: string;
  method?: string | null;
  meetLink?: string | null;
  platform?: string | null;
  teacher_id: string;
  student_id: string;
  is_started?: boolean | null;
  alpha?: boolean | null;
  absent?: boolean | null;
  started_time?: string | null;
  finished_time?: string | null;
  dateTime?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  name_program?: string | null;
  is_cancelled?: boolean | null;
  status?: string | null;
  reminder_sent_at?: string | null;
  createdAt?: string | null;
  student?: { username: string };
  teacher?: { username: string };
}

export async function exportMeetingToExcel({
  data,
  columns,
  dateRange,
}: {
  data: TimesheetTeacherItem[];
  columns: string[];
  dateRange: [string, string];
}): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Laporan Meeting");

  /** === Mapping kolom header === */
  const headerMap: Record<string, string> = {
    "student.username": "Nama Siswa",
    name_program: "Nama Program",
    waktu: "Waktu",
    dateTime: "Tanggal",
    duration: "Durasi",
    lateness: "Selisih Waktu",
    status: "Status",
    "teacher.username": "Pembuat",
  };

  worksheet.addRow(columns.map((col) => headerMap[col] || col));

  /** === Helper umum === */
  const toUtc = (d?: string | null) => (d ? dayjs.utc(d) : null);

  const humanizeMs = (ms: number) => {
    const totalSeconds = Math.round(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h} jam ${m} menit ${s} detik`;
  };

  /** Jadwal durasi */
  const scheduledMs = (r: TimesheetTeacherItem) => {
    const s = toUtc(r.startTime);
    const e = toUtc(r.endTime);
    return s && e ? e.diff(s) : null;
  };

  /** Durasi aktual */
  const actualMs = (r: TimesheetTeacherItem) => {
    const s = toUtc(r.started_time);
    const e = toUtc(r.finished_time);
    if (!s || !e) return null;
    const diff = e.diff(s);
    return diff < 0 ? 0 : diff;
  };

  /** Delta durasi (selisih aktual - jadwal) */
  const deltaMs = (r: TimesheetTeacherItem) => {
    const S = scheduledMs(r);
    const A = actualMs(r);
    return S != null && A != null ? A - S : null;
  };

  /** Format waktu jadwal */
  const formatWaktu = (r: TimesheetTeacherItem) => {
    const s = toUtc(r.startTime);
    const e = toUtc(r.endTime);
    return s && e ? `${s.format("HH:mm")} - ${e.format("HH:mm")}` : "-";
  };

  /** Format durasi */
  const formatDurasi = (r: TimesheetTeacherItem) => {
    const ms = actualMs(r);
    return ms != null ? humanizeMs(ms) : "-";
  };

  /** Format selisih durasi (lateness) */
  const formatLateness = (r: TimesheetTeacherItem) => {
    const ms = deltaMs(r);
    if (ms == null) return "-";
    if (ms === 0) return "Tepat waktu";
    const status = ms > 0 ? "-" : "+";
    return `${status} ${humanizeMs(Math.abs(ms))}`;
  };

  /** === Filter data sesuai range tanggal === */
  const [start, end] = dateRange;
  const startDate = dayjs.utc(start);
  const endDate = dayjs.utc(end);

  const filtered = data.filter((item) => {
    const date = toUtc(item.dateTime);
    return (
      date &&
      date.isSameOrAfter(startDate, "day") &&
      date.isSameOrBefore(endDate, "day")
    );
  });

  /** === Isi baris Excel === */
  for (const item of filtered) {
    worksheet.addRow(
      columns.map((col) => {
        switch (col) {
          case "student.username":
            return item.student?.username || "-";
          case "name_program":
            return item.name_program || "-";
          case "waktu":
            return formatWaktu(item);
          case "dateTime":
            return item.dateTime
              ? dayjs.utc(item.dateTime).format("YYYY-MM-DD")
              : "-";
          case "duration":
            return formatDurasi(item);
          case "lateness":
            return formatLateness(item);
          case "status":
            return item.status || "-";
          case "teacher.username":
            return item.teacher?.username || "-";
          default:
            return (item as any)[col] ?? "-";
        }
      })
    );
  }

  worksheet.columns.forEach((col) => {
    col.width = 20;
  });

  return workbook.xlsx.writeBuffer();
}
