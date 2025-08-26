import { fetcher } from "@/app/lib/utils/fetcher";
import { Meeting } from "@/app/model/meeting";
import { useParams } from "next/navigation";
import useSWR from "swr";
import {
  Program,
  ProgressMeeting,
  User,
  UserGroup,
  UserProgramRenewal,
} from "@prisma/client";
import { useState } from "react";
import { useForm } from "antd/es/form/Form";
import { crudService } from "@/app/lib/services/crudServices";
import { notification } from "antd";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { useAuth } from "@/app/lib/auth/authServices";
dayjs.extend(isSameOrAfter);

interface UserResponse {
  data: User[];
}

interface MeetingResponse {
  data: Meeting[];
}

interface MemberGroupResponse {
  data: UserGroup[];
}

interface ProgressMeetingResponse {
  data: ProgressMeeting[];
}
interface ProgramResponse {
  data: Program[];
}

interface RenewelResponse {
  data: UserProgramRenewal;
}

export const useProgressViewModel = () => {
  const {
    data: studentDataAll,
    isLoading: isLoadingStudent,
    mutate: mutateStudent,
  } = useSWR<UserResponse>("/api/teacher/student/showAll", fetcher);
  const { data: teacherDataAll } = useSWR<UserResponse>(
    "/api/admin/teacher/show",
    fetcher
  );
  const { userId } = useAuth();
  const { data: memberGroup, isLoading: isLoadingMemberGroup } =
    useSWR<MemberGroupResponse>(
      "/api/teacher/student/showMemberGroup",
      fetcher
    );

  const { data: progressData, mutate: progressMutate } =
    useSWR<ProgressMeetingResponse>(
      `/api/teacher/meeting/showProgress/`,
      fetcher
    );

  const { data: meetingDataAll, isLoading: isLoadingMeeting } =
    useSWR<MeetingResponse>("/api/teacher/student/showMeeting", fetcher);
  const { data: programDataAll, isLoading: isLoadingProgram } =
    useSWR<ProgramResponse>("/api/teacher/student/showProgram", fetcher);
  const [loading, setLoading] = useState(false);
  const [isModalCertificate, setIsModalCertificate] = useState(false);
  const [form] = useForm();
  const query = useParams();
  const student_id = userId;
  const sectionTypes = ["READING", "SPEAKING", "LISTENING", "WRITING"];
  const [selectedGroupMemberId, setSelectedGroupMemberId] = useState<
    string | null
  >(null);
  const { data: renewalData, mutate: mutateRenewal } = useSWR<RenewelResponse>(
    student_id ? `/api/admin/student/${student_id}/showRenewel` : null,
    fetcher
  );

  // const [selectedUserGroupId, setSelectedUserGroupId] = useState<string[]>([]);

  const filteredStudent = studentDataAll?.data.find(
    (student) => student.user_id === student_id
  );
  const isGroup = filteredStudent?.type_student === "GROUP";

  // Dapatkan anggota grup (UserGroup) di mana `userUser_id` mengarah ke student GROUP saat ini
  const userGroup = isGroup
    ? memberGroup?.data.filter(
        (group) => group.userUser_id === filteredStudent?.user_id
      )
    : null;
  const studentRenewals = Array.isArray(renewalData?.data)
    ? renewalData.data
        .filter((r) => r.user_id === filteredStudent?.user_id)
        .sort(
          (a, b) =>
            dayjs(a.renew_date).valueOf() - dayjs(b.renew_date).valueOf()
        )
    : [];

  // Helper untuk tentukan programId & renewalInfo untuk setiap meeting
  function getProgramInfoForMeeting(meetingDate: string) {
    // Cari renewal sebelum/tanggal meeting (paling akhir sebelum/sama dengan meeting)
    let result = {
      programType: "INITIAL_PROGRAM" as
        | "INITIAL_PROGRAM"
        | "OLD_PROGRAM"
        | "NEW_PROGRAM",
      programId: filteredStudent?.program_id ?? null,
      renewal: null as UserProgramRenewal | null,
    };

    for (let i = studentRenewals.length - 1; i >= 0; i--) {
      const renewal = studentRenewals[i];
      if (dayjs(meetingDate).isSameOrAfter(dayjs(renewal.renew_date))) {
        // Setelah/sama dengan renewal: itu new program dari renewal tsb
        result.programType = "NEW_PROGRAM";
        result.programId = renewal.new_program_id;
        result.renewal = renewal;
        return result;
      }
    }
    // Jika tidak ada renewal sebelum meeting: pakai initial program
    if (studentRenewals.length > 0) {
      // Kalau kamu ingin tracking program awal sebelum renewal pertama, pakai old_program_id dari renewal paling awal
      result.programType = "OLD_PROGRAM";
      result.programId =
        studentRenewals[0].old_program_id ||
        filteredStudent?.program_id ||
        null;
      result.renewal = studentRenewals[0];
    }
    return result;
  }

  const filteredMeetings = meetingDataAll?.data
    .filter((meeting) =>
      isGroup
        ? meeting.student_id === filteredStudent?.user_id
        : meeting.student_id === student_id
    )
    .map((meeting) => {
      const teacher = teacherDataAll?.data.find(
        (teacher) => teacher.user_id === meeting.teacher_id
      );

      const programInfo = getProgramInfoForMeeting(
        typeof meeting.createdAt === "string"
          ? meeting.createdAt
          : meeting.createdAt.toISOString()
      );

      if (!isGroup) {
        const progress = progressData?.data.find(
          (p) => p.user_id === student_id && p.meeting_id === meeting.meeting_id
        );

        return {
          ...meeting,
          teacherName: teacher?.username ?? "Unknown",
          progress_student: progress?.progress_student ?? null,
          abilityScale: progress?.abilityScale ?? null,
          studentPerformance: progress?.studentPerformance ?? null,
          programType: programInfo.programType,
          programId: programInfo.programId,
          renewal: programInfo.renewal, // opsional: info renewal terkait
        };
      } else {
        const groupProgress = userGroup?.map((member) => {
          const progress = progressData?.data.find(
            (p) =>
              p.user_group_id === member.user_group_id &&
              p.meeting_id === meeting.meeting_id
          );

          return {
            user_id: member.userUser_id,
            user_group_id: member.user_group_id,
            username: member.username ?? "-",
            progress_student: progress?.progress_student ?? null,
            abilityScale: progress?.abilityScale ?? null,
            studentPerformance: progress?.studentPerformance ?? null,
            programType: programInfo.programType,
            programId: programInfo.programId,
            renewal: programInfo.renewal,
          };
        });

        return {
          ...meeting,
          teacherName: teacher?.username ?? "Unknown",
          groupProgress,
          programType: programInfo.programType,
          programId: programInfo.programId,
          renewal: programInfo.renewal,
        };
      }
    });

  const filteredPrograms = programDataAll?.data.filter(
    (program) => program.program_id === filteredStudent?.program_id
  );

  const handleOpenModal = () => {
    setIsModalCertificate(true);
  };

  const handleCancel = () => {
    setIsModalCertificate(false);
    form.resetFields();
  };

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      const formattedData = values.sections.map(
        (section: any, index: number) => ({
          section_type: sectionTypes[index],
          level: section.level,
          comment: section.comment,
        })
      );

      const payload = {
        student_id: student_id,
        sections: formattedData,
        type: filteredStudent?.type_student,
        user_group_id: selectedGroupMemberId || null,
      };

      await crudService.post(
        `/api/teacher/certificate/inputEvaluation`,
        payload
      );

      notification.success({
        message: "Success",
        description: "Data berhasil disimpan",
      });

      mutateStudent();

      handleCancel();
    } catch (error) {
      setLoading(false);
      console.error("Error pada handleFinish:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    filteredStudent,
    filteredMeetings,
    filteredPrograms,
    isLoadingStudent,
    isLoadingMeeting,
    isLoadingProgram,
    handleOpenModal,
    isModalCertificate,
    handleCancel,
    form,
    handleFinish,
    sectionTypes,
    loading,
    userGroup,
    setSelectedGroupMemberId,
    selectedGroupMemberId,
    programDataAll,
  };
};
