import { fetcher } from "@/app/lib/utils/fetcher";
import { Meeting } from "@prisma/client";
import useSWR from "swr";


interface MeetingResponse {
  data: Meeting[]
}

export const useDashboardViewModel = () => {
  const { data: countPogramData, mutate: mutateCountProgram } = useSWR(
    "/api/student/countProduct",
    fetcher
  );

  const { data: meetingData, isLoading: isLoadingMeeting } = useSWR<MeetingResponse>(
    "/api/teacher/meeting/showById",
    fetcher
  );
  const count_program = countPogramData?.data?.count_program || 0;
  return {
    count_program,
    mutateCountProgram,
    meetingData,
    isLoadingMeeting
  };
};
