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

interface StudentNewPerWeek {
  week: number;
  total_students: number;
  month: string;
  year: number;
}

interface StudentPerProgram {
  program_id: string;
  program_name: string;
  total_students: number;
}

interface MonthlyStudentDataResponse {
  data: MonthlyStudentData[];
}

interface StudentNewPerWeekResponse {
  data: StudentNewPerWeek[];
}

interface StudentPerProgramResponse {
  data: StudentPerProgram[];
}

export const useDashboard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const year = searchParams.get("year") || dayjs().format("YYYY");
  const fetchUrlMonthlyStudentData = useMemo(() => {
    let url = "/api/admin/student/calculateTotalStudent";
    const params = new URLSearchParams();
    if (year) params.append("year", year);
    return `${url}?${params.toString()}`;
  }, [year]);

  const fetchUrlStudentNewPerWeek = useMemo(() => {
    let url = "/api/admin/student/studentNewPerWeek";
    const params = new URLSearchParams();
    if (year) params.append("year", year);
    return `${url}?${params.toString()}`;
  }, [year]);

  const fetchUrlStudentPerProgram = useMemo(() => {
    let url = "/api/admin/student/totalStudentPerProgram";
    const params = new URLSearchParams();
    if (year) params.append("year", year);
    return `${url}?${params.toString()}`;
  }, [year]);

  const { data: monthlyStudentData, isLoading: isLoadingMonthly } =
    useSWR<MonthlyStudentDataResponse>(fetchUrlMonthlyStudentData, fetcher);

  const { data: dataStudentNewPerWeek, isLoading: isLoadingStudentNewPerWeek } =
    useSWR<StudentNewPerWeekResponse>(fetchUrlStudentNewPerWeek, fetcher);

  const { data: dataStudentPerProgram, isLoading: isLoadingStudentPerProgram } =
    useSWR<StudentPerProgramResponse>(fetchUrlStudentPerProgram, fetcher);

  const changeYear = (year: number) => {
    setSelectedYear(year);
    router.replace(`/admin/dashboard/home?year=${year}`);
  };

  return {
    loading,
    setLoading,
    monthlyStudentData,
    setSelectedYear,
    selectedYear,
    changeYear,
    isLoadingMonthly,
    dataStudentNewPerWeek,
    isLoadingStudentNewPerWeek,
    dataStudentPerProgram,
    isLoadingStudentPerProgram,
  };
};
