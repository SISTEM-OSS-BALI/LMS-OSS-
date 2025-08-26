import { useSearchParams } from "next/navigation";
import { use, useMemo, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/app/lib/utils/fetcher";
import { MethodType } from "@/app/model/enums";
import { useForm } from "antd/es/form/Form";
import { message } from "antd";

interface MeetingResponse {
  data: TimesheetTeacherItem[];
}

interface TimesheetTeacherItem {
  meeting_id: string;
  method?: MethodType | null | string;
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
  student?: {
    username: string;
  };
  teacher?: {
    username: string;
  };
}

export default function useTimeSheetTeacherViewModel() {
  const searchParams = useSearchParams();
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const teacher_id = searchParams.get("teacher_id");

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = useForm();

  const modalOpen = () => {
    setIsOpen(true);
  };

  const modalClose = () => {
    setIsOpen(false);
  };

  const handleFinish = async (values: any) => {
    setIsOpen(false);

    // 1. Format data (jaga2 tanggal dari RangePicker => [Moment, Moment])
    const [startDate, endDate] = values.date
      ? [
          values.date[0].format("YYYY-MM-DD"),
          values.date[1].format("YYYY-MM-DD"),
        ]
      : [null, null];

    // 2. Kirim ke API (POST)
    try {
      // Bisa tambahkan loading state
      // setLoading(true);
      const res = await fetch("/api/admin/report/timesheet-detail-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher_id: teacher_id,
          emailTo: values.email,
          dateRange: [startDate, endDate],
          format: values.format,
          columns: values.format === "Pilih Kolom" ? values.columns : null,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        message.success("Laporan berhasil diproses, silakan cek email Anda!");
      } else {
        message.error(json.error || "Terjadi kesalahan, silakan coba lagi.");
      }
    } catch (err: any) {
      message.error("Gagal mengirim permintaan: " + err.message);
    } finally {
      // setLoading(false);
    }
  };
  const {
    data: meetingData,
    error: meetingError,
    mutate: meetingMutate,
  } = useSWR<MeetingResponse>(
    `/api/admin/meeting/showMeetingTeacher?teacher_id=${teacher_id}&month=${month}&year=${year}`,
    fetcher
  );

  return {
    meetingData,
    meetingError,
    meetingMutate,
    month,
    year,
    isOpen,
    modalOpen,
    modalClose,
    handleFinish,
    form,
    loading,
  };
}
