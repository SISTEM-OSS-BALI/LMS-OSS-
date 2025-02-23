import { fetcher } from "@/app/lib/utils/fetcher";
import { Meeting, Program, User } from "@prisma/client";
import useSWR from "swr";

interface UserResponse {
  data: User[];
}

interface MeetingResponse {
  data: Meeting[];
}

interface ProgramResponse {
  data: Program[];
}

export const useStudentViewModel = () => {
  const { data: studentDataAll } = useSWR<UserResponse>(
    "/api/admin/student/show",
    fetcher
  );

  const { data: meetingDataAll, isLoading: meetingDataLoading } =
    useSWR<MeetingResponse>("/api/admin/meeting/show", fetcher);

  const { data: programDataAll, isLoading: programDataLoading } =
    useSWR<ProgramResponse>("/api/admin/program/show", fetcher);

  const { data: teacherDataAll, isLoading: teacherDataLoading } =
    useSWR<UserResponse>("/api/admin/teacher/show", fetcher);

  const mergedStudent =
    studentDataAll?.data?.map((student) => {
      // Cari semua meeting yang memiliki student_id yang sesuai
      const meetings =
        meetingDataAll?.data?.filter(
          (meeting) =>
            meeting.student_id === student.user_id && meeting.absent === true
        ) ?? [];

      const program = programDataAll?.data?.find(
        (program) => program.program_id === student.program_id
      );

      // Tambahkan informasi nama guru ke setiap meeting
      const meetingsWithTeacher = meetings.map((meeting) => {
        const teacher = teacherDataAll?.data?.find(
          (teacher) => teacher.user_id === meeting.teacher_id
        );

        return {
          ...meeting,
          teacherName: teacher?.username ?? "Unknown",
        };
      });

      return {
        ...student,
        meetings: meetingsWithTeacher,
        program_name: program?.name,
      };
    }) ?? [];

  return {
    mergedStudent,
    studentDataAll,
    meetingDataLoading,
    programDataLoading,
    teacherDataLoading,
  };
};
