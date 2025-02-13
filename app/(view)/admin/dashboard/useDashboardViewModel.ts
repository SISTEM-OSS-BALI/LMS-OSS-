import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import useSWR from "swr";
import dayjs from "dayjs";

interface MonthlyStudentData {
  month: string;
  total_students: number;
}

interface MonthlyStudentDataResponse {
  data: MonthlyStudentData[];
}

export const useDashboard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [newRescheduleCount, setNewRescheduleCount] = useState(0);
  const [newTeacherAbsance, setNewTeacherAbsance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const year = searchParams.get("year") || dayjs().format("YYYY");
  const fetchUrl = useMemo(() => {
    let url = "/api/admin/student/calculateTotalStudent";
    const params = new URLSearchParams();
    if (year) params.append("year", year);
    return `${url}?${params.toString()}`;
  }, [year]);
  const { data: monthlyStudentData, isLoading: isLoadingMonthly } = useSWR<MonthlyStudentDataResponse>(
    fetchUrl,
    fetcher
  );

  const fetchDataWithLastChecked = async (
    endpoint: string,
    lastCheckedKey: string,
    setStateCallback: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const lastChecked = localStorage.getItem(lastCheckedKey) || "";

    try {
      const query = lastChecked ? `?lastChecked=${lastChecked}` : "";
      const response = await crudService.get(`${endpoint}${query}`);
      setStateCallback(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleRescheduleClick = () => {
    localStorage.setItem("lastCheckedRescheduleTime", Date.now().toString());
    setNewRescheduleCount(0);
    router.push("/admin/dashboard/student/reschedule");
  };

  const handleAbsentClick = () => {
    localStorage.setItem("lastCheckedTeacherAbsence", Date.now().toString());
    setNewTeacherAbsance(0);
    router.push("/admin/dashboard/teacher/absent");
  };

  const changeYear = (year: number) => {
    setSelectedYear(year);
    router.replace(`/admin/dashboard?year=${year}`);
  };

  return {
    newRescheduleCount,
    setNewRescheduleCount,
    newTeacherAbsance,
    setNewTeacherAbsance,
    loading,
    setLoading,
    fetchDataWithLastChecked,
    handleRescheduleClick,
    handleAbsentClick,
    monthlyStudentData,
    setSelectedYear,
    selectedYear,
    changeYear,
    isLoadingMonthly
  };
};
