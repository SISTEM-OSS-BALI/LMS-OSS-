import { fetcher } from "@/app/lib/utils/fetcher";
import useSWR from "swr";

interface Program {
  id: string;
  name: string;
}
interface Student {
  id: string;
  name: string;
  program: Program | null;
}


interface Meeting {
  id: string;
  dateTime: string;
  started_time: string;
  is_cancelled: boolean;
  finished_time: string;
  absent: boolean | null;
  student: Student | null;
}
interface MeetingResponse {
  data: Meeting[];
}

interface MeetingResponse {
  data: Meeting[];
}

export default function useActivityViewModel() {
  const { data: meetingData, isLoading: isLoadingMeeting } =
    useSWR<MeetingResponse>("/api/teacher/meeting/showById", fetcher);
  return {
    meetingData,
  };
}
