import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { Meeting, Program, User, UserProgramRenewal } from "@prisma/client";
import { Form, notification } from "antd";
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

interface RenewelResponse {
  data: UserProgramRenewal;
}

export const useStudentViewModel = () => {
  const { data: studentDataAll, mutate: mutateStudent } = useSWR<UserResponse>(
    "/api/admin/student/show",
    fetcher
  );

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [programId, setProgramId] = useState<string>("");
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isModalDetailVisible, setIsModalDetailVisible] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const { data: renewalData, mutate: mutateRenewal } = useSWR<RenewelResponse>(
    selectedUserId ? `/api/admin/student/${selectedUserId}/showRenewel` : null,
    fetcher
  );

  const { data: programDetail, mutate: mutateProgramDetail } = useSWR(
    selectedUserId
      ? `/api/admin/student/${selectedUserId}/detailProgram`
      : null,
    fetcher
  );

  const {
    data: meetingDataAll,
    isLoading: meetingDataLoading,
    mutate: mutateMeeting,
  } = useSWR<MeetingResponse>("/api/admin/meeting/show", fetcher);

  const {
    data: programDataAll,
    isLoading: programDataLoading,
    mutate: mutateProgram,
  } = useSWR<ProgramResponse>("/api/admin/program/show", fetcher);

  const {
    data: teacherDataAll,
    isLoading: teacherDataLoading,
    mutate: mutateTeacherData,
  } = useSWR<UserResponse>("/api/admin/teacher/show", fetcher);

  const mergedStudent =
    studentDataAll?.data
      .filter((student) => student.is_active === false)
      .map((student) => {
        const meetings =
          meetingDataAll?.data?.filter(
            (meeting) =>
              meeting.student_id === student.user_id &&
              meeting.is_cancelled === true &&
              meeting.absent === true
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
          program_id: program?.program_id,
          program_count: program?.count_program,
        };
      }) ?? [];

  const filteredStudent =
    mergedStudent.filter((student: any) => {
      const username = student.username?.toLowerCase() ?? "";
      const nameGroup = student.name_group?.toLowerCase() ?? "";
      return username.includes(searchTerm) || nameGroup.includes(searchTerm);
    }) ?? [];

  let filteredProgramRenewal;
  if (Array.isArray(renewalData?.data)) {
    filteredProgramRenewal = renewalData.data.map((renewal) => {
      const oldProgram = programDataAll?.data?.find(
        (p) => p.program_id === renewal.old_program_id
      );
      const newProgram = programDataAll?.data?.find(
        (p) => p.program_id === renewal.new_program_id
      );
      return {
        ...renewal,
        old_program_name: oldProgram?.name || "-",
        new_program_name: newProgram?.name || "-",
      };
    });
  } else if (renewalData?.data) {
    const renewal = renewalData.data;
    const oldProgram = programDataAll?.data?.find(
      (p) => p.program_id === renewal.old_program_id
    );
    const newProgram = programDataAll?.data?.find(
      (p) => p.program_id === renewal.new_program_id
    );
    filteredProgramRenewal = {
      ...renewal,
      old_program_name: oldProgram?.name || "-",
      new_program_name: newProgram?.name || "-",
    };
  }

  const handleDelete = async (student_id: string) => {
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
      mutateStudent();
    } catch (error) {
      notification.error({
        message: "Gagal Menghapus Data Siswa",
        description: "Terjadi kesalahan saat menghapus data siswa.",
      });
    }
  };

  const handleFrezeAccount = async (student_id: string, is_active: boolean) => {
    setLoading(true);
    try {
      await crudService.patch(`/api/admin/student/${student_id}/frezeAccount`, {
        is_active: is_active,
      });
      notification.success({
        message: "Berhasil Membekukan Akun Siswa",
      });
      mutateTeacherData();
      mutateMeeting();
      mutateProgram();
      mutateStudent();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      notification.error({
        message: "Gagal Membekukan Akun Siswa",
        description: "Terjadi kesalahan saat menghapus data siswa.",
      });
    }
  };

  const openModal = (student_id: string) => {
    setIsModalVisible(true);
    setSelectedUserId(student_id);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const handleOpenModalDetail = (student_id: string) => {
    setIsModalDetailVisible(true);
    setSelectedUserId(student_id);
  };

  const closeModalDetail = () => {
    setIsModalDetailVisible(false);
  };

  const handleUpdateProgram = async () => {
    setLoadingUpdate(true);
    try {
      await crudService.patch(
        `/api/admin/student/${selectedUserId}/updateProgram`,
        {
          program_id: programId,
          old_program_id: programDetail?.data.program_id,
        }
      );

      notification.success({
        message: "Berhasil Mengubah Program Siswa",
      });

      mutateTeacherData();
      mutateMeeting();
      mutateProgram();
      mutateStudent();
      setSelectedUserId(null);
      mutateRenewal();
      closeModal();
    } catch (error: any) {
      const message =
        error?.message ?? "Terjadi kesalahan saat mengubah program siswa.";

      notification.error({
        message: "Gagal Mengubah Program Siswa",
        description: message,
      });
    } finally {
      setLoadingUpdate(false);
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
    loading,
    handleFrezeAccount,
    openModal,
    isModalVisible,
    closeModal,
    programDataAll,
    form,
    programId,
    setProgramId,
    handleUpdateProgram,
    loadingUpdate,
    handleOpenModalDetail,
    isModalDetailVisible,
    closeModalDetail,
    filteredProgramRenewal,
  };
};
