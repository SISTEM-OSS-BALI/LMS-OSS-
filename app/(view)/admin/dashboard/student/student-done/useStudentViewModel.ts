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

// Backend kadang kirim single / array ⇒ handle keduanya
interface RenewelResponse {
  data: UserProgramRenewal | UserProgramRenewal[];
}

/* ----------------------- Helpers ----------------------- */

type MeetingStatus = "PENDING" | "PROGRESS" | "FINISHED" | "CANCEL";

const toBool = (v: any) => v === true || v === 1 || v === "1";
const isNonEmpty = (s: any) => typeof s === "string" && s.trim().length > 0;

const deriveMeetingStatus = (m: Partial<Meeting>): MeetingStatus => {
  // Hormati kolom status jika ada
  const raw = (m as any)?.status as MeetingStatus | undefined;
  if (raw === "CANCEL") return "CANCEL";
  if (raw === "FINISHED") return "FINISHED";
  if (raw === "PROGRESS") return "PROGRESS";
  if (raw === "PENDING") return "PENDING";

  // Fallback dari flag
  if (toBool((m as any).is_cancelled)) return "CANCEL";
  if (isNonEmpty((m as any).finished_time)) return "FINISHED";
  if (toBool((m as any).is_started)) return "PROGRESS";
  return "PENDING";
};

const getSortableDate = (m: any): number => {
  const candidate =
    m?.dateTime ?? m?.startTime ?? m?.createdAt ?? m?.started_time ?? null;
  const t = candidate ? new Date(candidate).getTime() : 0;
  return Number.isFinite(t) ? t : 0;
};

/* ============================================================= */

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

  /* ----------------------- Merge & Enrich ----------------------- */

  const mergedStudent =
    studentDataAll?.data
      // versi ini menargetkan siswa TIDAK aktif (ikuti kode kamu terakhir)
      ?.filter((student) => (student as any).is_active === false)
      ?.map((student) => {
        // semua meeting milik student ini
        const meetingsAll =
          meetingDataAll?.data?.filter(
            (m) => m.student_id === (student as any).user_id
          ) ?? [];

        // enrich teacher + status
        const meetingsAllWithTeacher = meetingsAll.map((m) => {
          const teacher = teacherDataAll?.data?.find(
            (t) => t.user_id === m.teacher_id
          );
          const derivedStatus = deriveMeetingStatus(m) as MeetingStatus;
          return {
            ...m,
            teacherName: teacher?.username ?? "Unknown",
            derivedStatus,
          };
        });

        // ⬇️ tampilkan FINISHED + CANCEL
        const finishedOrCancelMeetings = meetingsAllWithTeacher.filter(
          (m) => m.derivedStatus === "FINISHED" || m.derivedStatus === "CANCEL"
        );

        // metrik opsional
        const countFinished = meetingsAllWithTeacher.filter(
          (m) => m.derivedStatus === "FINISHED"
        ).length;
        const countCancel = meetingsAllWithTeacher.filter(
          (m) => m.derivedStatus === "CANCEL"
        ).length;

        // status terbaru per student
        const latestMeeting = meetingsAll
          .slice()
          .sort((a, b) => getSortableDate(b) - getSortableDate(a))[0];
        const latestStatus: MeetingStatus = latestMeeting
          ? deriveMeetingStatus(latestMeeting)
          : "PENDING";

        // data program
        const program = programDataAll?.data?.find(
          (p) => p.program_id === (student as any).program_id
        );

        return {
          ...student,

          // 👉 inilah yang dipakai UI: gabungan FINISHED + CANCEL
          meetings: finishedOrCancelMeetings,

          // kalau butuh semua meeting: meetingsAllWithTeacher

          latestStatus,
          countFinished,
          countCancel,

          program_name: program?.name,
          program_id: program?.program_id,
          program_count: (program as any)?.count_program,
        };
      }) ?? [];

  const filteredStudent =
    mergedStudent?.filter((student: any) => {
      const username = student?.username?.toLowerCase() ?? "";
      const nameGroup = student?.name_group?.toLowerCase() ?? "";
      return username.includes(searchTerm) || nameGroup.includes(searchTerm);
    }) ?? [];

  /* ----------------------- Renewal normalize ----------------------- */

  let filteredProgramRenewal:
    | (UserProgramRenewal & {
        old_program_name: string;
        new_program_name: string;
      })[]
    | (UserProgramRenewal & {
        old_program_name: string;
        new_program_name: string;
      })
    | undefined;

  if (Array.isArray(renewalData?.data)) {
    filteredProgramRenewal = renewalData.data.map((renewal) => {
      const oldProgram = programDataAll?.data?.find(
        (p) => p.program_id === (renewal as any).old_program_id
      );
      const newProgram = programDataAll?.data?.find(
        (p) => p.program_id === (renewal as any).new_program_id
      );
      return {
        ...(renewal as UserProgramRenewal),
        old_program_name: oldProgram?.name || "-",
        new_program_name: newProgram?.name || "-",
      };
    });
  } else if (renewalData?.data) {
    const renewal = renewalData.data as UserProgramRenewal;
    const oldProgram = programDataAll?.data?.find(
      (p) => p.program_id === (renewal as any).old_program_id
    );
    const newProgram = programDataAll?.data?.find(
      (p) => p.program_id === (renewal as any).new_program_id
    );
    filteredProgramRenewal = {
      ...renewal,
      old_program_name: oldProgram?.name || "-",
      new_program_name: newProgram?.name || "-",
    };
  }

  /* ----------------------- Actions ----------------------- */

  const handleDelete = async (student_id: string) => {
    try {
      await crudService.delete(
        `/api/admin/student/${student_id}/delete`,
        student_id
      );
      notification.success({ message: "Berhasil Menghapus Data Siswa" });
      mutateTeacherData();
      mutateMeeting();
      mutateProgram();
      mutateStudent();
    } catch {
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
        is_active,
      });
      notification.success({
        message: "Berhasil Membekukan Akun Siswa",
      });
      mutateTeacherData();
      mutateMeeting();
      mutateProgram();
      mutateStudent();
    } catch {
      notification.error({
        message: "Gagal Membekukan Akun Siswa",
        description: "Terjadi kesalahan saat menghapus data siswa.",
      });
    } finally {
      setLoading(false);
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
          old_program_id: (programDetail as any)?.data?.program_id,
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

  /* ----------------------- Return ----------------------- */

  return {
    // data utama
    mergedStudent,
    filteredStudent,

    // sumber data mentah & loading
    studentDataAll,
    meetingDataLoading,
    programDataLoading,
    teacherDataLoading,

    // renewals yang sudah diperkaya nama program
    filteredProgramRenewal,

    // search
    handleSearch,

    // actions
    handleDelete,
    handleFrezeAccount,
    openModal,
    isModalVisible,
    closeModal,
    handleOpenModalDetail,
    isModalDetailVisible,
    closeModalDetail,

    // update program
    form,
    programDataAll,
    programId,
    setProgramId,
    handleUpdateProgram,
    loadingUpdate,

    // state umum
    loading,
  };
};
