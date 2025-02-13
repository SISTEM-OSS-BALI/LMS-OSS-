import { fetcher } from "@/app/lib/utils/fetcher";
import useSWR from "swr";

export const useDashboardViewModel = () => {
  const { data: countPogramData, mutate: mutateCountProgram } = useSWR(
    "/api/student/countProduct",
    fetcher
  );
  const count_program = countPogramData?.data?.count_program || 0;
  return {
    count_program,
    mutateCountProgram,
  };
};
