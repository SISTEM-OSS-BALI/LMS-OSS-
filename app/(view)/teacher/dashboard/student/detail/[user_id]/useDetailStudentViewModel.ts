import { fetcher } from "@/app/lib/utils/fetcher";
import { User } from "@/app/model/user";
import { Meeting } from "@/app/model/meeting";
import { Program } from "@/app/model/program";
import { useParams } from "next/navigation";
import useSWR from "swr";

interface StudentResponse {
  data: User[];
}

interface MeetingResponse {
  data: Meeting[];
}

interface ProgramResponse {
  data: Program[];
}

export const useDetailStudentViewModel = () => {
  const { data: studentDataAll, isLoading: isLoadingStudent } = useSWR<StudentResponse>(
    "/api/teacher/student/showAll",
    fetcher
  );
  const { data: meetingDataAll, isLoading: isLoadingMeeting } = useSWR<MeetingResponse>(
    "/api/teacher/student/showMeeting",
    fetcher
  );
  const { data: programDataAll, isLoading: isLoadingProgram } = useSWR<ProgramResponse>(
    "/api/teacher/student/showProgram",
    fetcher
  );

  const query = useParams();
  const student_id = query.user_id;

  const filteredStudent = studentDataAll?.data.find(
    (student) => student.user_id === student_id
  );

  const filteredMeetings = meetingDataAll?.data.filter(
    (meeting) => meeting.student_id === student_id
  );

  const filteredPrograms = programDataAll?.data.filter(
    (program) => program.program_id === filteredStudent?.program_id
  );

  return { filteredStudent, filteredMeetings, filteredPrograms, isLoadingStudent, isLoadingMeeting, isLoadingProgram };
};
