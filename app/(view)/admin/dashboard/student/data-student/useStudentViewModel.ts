import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { Meeting, Program, User } from "@prisma/client";
import { notification } from "antd";
import { useState } from "react";
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

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const { data: meetingDataAll, isLoading: meetingDataLoading, mutate: mutateMeeting } =
    useSWR<MeetingResponse>("/api/admin/meeting/show", fetcher);

  const { data: programDataAll, isLoading: programDataLoading, mutate: mutateProgram } =
    useSWR<ProgramResponse>("/api/admin/program/show", fetcher);

  const {
    data: teacherDataAll,
    isLoading: teacherDataLoading,
    mutate: mutateTeacherData,
  } = useSWR<UserResponse>("/api/admin/teacher/show", fetcher);

  const mergedStudent =
    studentDataAll?.data?.map((student) => {
      const meetings =
        meetingDataAll?.data?.filter(
          (meeting) =>
            meeting.student_id === student.user_id && meeting.absent !== null
        ) ?? [];

      const program = programDataAll?.data?.find(
        (program) => program.program_id === student.program_id
      );

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

  const filteredStudent =
    mergedStudent.filter((student: any) =>
      student.username.toLowerCase().includes(searchTerm)
    ) ?? [];

  const handleDelete = async (student_id: string) => {
    setLoading(true);
    try {
      await crudService.delete(
        `/api/admin/student/${student_id}/delete`,
        student_id
      );
      notification.success({
        message: "Berhasil Menghapus Data Siswa",
      });
      mutateTeacherData();
      mutateMeeting();
      mutateProgram();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      notification.error({
        message: "Gagal Menghapus Data Siswa",
        description: "Terjadi kesalahan saat menghapus data siswa.",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    mergedStudent,
    studentDataAll,
    meetingDataLoading,
    programDataLoading,
    teacherDataLoading,
    handleSearch,
    filteredStudent,
    handleDelete,
  };
};
