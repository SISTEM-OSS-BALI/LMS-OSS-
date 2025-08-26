import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import useSWR from "swr";
import dayjs from "dayjs";
import { fetcher } from "@/app/lib/utils/fetcher";
import { message } from "antd";
import { useForm } from "antd/es/form/Form";

export const useAdminTeacherViewModel = () => {
  const router = useRouter();

  const initialYear = dayjs().year();
  const initialMonth = dayjs().month() + 1;

  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);

  // Build URL for fetching data
  const fetchUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("year", selectedYear.toString());
    params.set("month", selectedMonth.toString());
    return `/api/admin/teacher/report/countTeacher?${params.toString()}`;
  }, [selectedYear, selectedMonth]);

  // Fetch data using SWR
  const { data, error, isLoading } = useSWR(fetchUrl, fetcher);
  const {
    data: dataTeacherAbsent,
    error: errorTeacherAbsent,
    isLoading: isLoadingDataTeaceherAbsent,
  } = useSWR("/api/admin/teacher/report/countTeacherAbsent", fetcher);

  const changeDate = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    router.replace(
      `/admin/dashboard/teacher/data-teacher/report?year=${year}&month=${month}`
    );
  };

  const [isOpen, setIsOpen] = useState(false);
  const [form] = useForm();
  const [loading, setLoading] = useState(false);

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
      const res = await fetch("/api/admin/report/timesheet-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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

  return {
    data: data?.data || [],
    error,
    isLoading,
    setSelectedYear,
    setSelectedMonth,
    selectedYear,
    selectedMonth,
    changeDate,
    dataTeacherAbsent: dataTeacherAbsent?.data || [],
    errorTeacherAbsent,
    isLoadingDataTeaceherAbsent,
    modalOpen,
    modalClose,
    form,
    isOpen,
    handleFinish,
    loading
  };
};
