import { fetcher } from "@/app/lib/utils/fetcher";
import {
  Program,
  ProgressMeeting,
  User,
  UserGroup,
  UserProgramRenewal,
} from "@prisma/client";
import { useParams } from "next/navigation";
import useSWR from "swr";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { useState } from "react";
import { Meeting } from "@/app/model/meeting";
dayjs.extend(isSameOrAfter);

interface StudentResponse {
  data: User[];
}

interface MeetingResponse {
  data: Meeting[];
}

interface ProgramResponse {
  data: Program[];
}

interface MemberGroupResponse {
  data: UserGroup[];
}

interface RenewelResponse {
  data: UserProgramRenewal;
}

interface ProgressMeetingResponse {
  data: ProgressMeeting[];
}

export const useStudentDetailReportViewModel = () => {
  const query = useParams();
  const student_id = query.student_id;
 const [selectedGroupMemberId, setSelectedGroupMemberId] = useState<
     string | null
   >(null);
  const { data: studentDataAll, isLoading: isLoadingStudent } =
    useSWR<StudentResponse>("/api/teacher/student/showAll", fetcher);
  const { data: memberGroup, isLoading: isLoadingMemberGroup } =
    useSWR<MemberGroupResponse>(
      "/api/teacher/student/showMemberGroup",
      fetcher
    );
  const { data: teacherDataAll } = useSWR<StudentResponse>(
    "/api/admin/teacher/show",
    fetcher
  );
  const { data: renewalData, mutate: mutateRenewal } = useSWR<RenewelResponse>(
    student_id ? `/api/admin/student/${student_id}/showRenewel` : null,
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
  return {
    filteredMeetings,
    filteredPrograms,
    filteredStudent,
    isLoadingStudent,
    isLoadingMeeting,
    isLoadingProgram,
    programDataAll,
    selectedGroupMemberId,
    setSelectedGroupMemberId,
    userGroup,
  };
};
