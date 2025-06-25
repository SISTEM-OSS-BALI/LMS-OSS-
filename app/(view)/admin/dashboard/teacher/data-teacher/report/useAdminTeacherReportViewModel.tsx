import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import useSWR from "swr";
import dayjs from "dayjs";
import { fetcher } from "@/app/lib/utils/fetcher";

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
  };
};
