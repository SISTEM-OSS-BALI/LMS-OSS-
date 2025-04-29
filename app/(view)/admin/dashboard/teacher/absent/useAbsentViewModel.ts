import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { Meeting } from "@/app/model/meeting";
import { TeacherAbsence, User } from "@/app/model/user";
import { message, notification } from "antd";
import { useState } from "react";
import useSWR from "swr";

interface AbsentResponse {
  data: TeacherAbsence[];
}

interface UserResponse {
  data: User[];
}

interface MeetingResponse {
  data: Meeting[];
}

export const useAbsentViewModel = () => {
  const {
    data: dataAbsent,
    mutate: absentMutate,
    isLoading: isLoadingAbsent,
  } = useSWR<AbsentResponse>("/api/admin/teacher/showAbsent", fetcher);

  const { data: dataStudent } = useSWR<UserResponse>(
    "/api/admin/student/show",
    fetcher
  );

  const {
    data: dataTeacher,
    isLoading: isLoadingTeacher,
    mutate: mutateDataTeacher,
  } = useSWR<UserResponse>("/api/admin/teacher/show", fetcher);

  const {
    data: queueData,
    error: queueError,
    mutate: queueMutate,
  } = useSWR<MeetingResponse>("/api/admin/queue/show", fetcher);

  const [loadingId, setLoadingId] = useState<string | null>(null);

  const mergedData = dataAbsent?.data.map((absent) => {
    const teacher = dataTeacher?.data.find(
      (teacher) => teacher.user_id === absent.teacher_id
    );
    const student = dataStudent?.data.find(
      (student) => student.user_id === absent.student_id
    );
    const meeting = queueData?.data.find(
      (meeting) =>
        meeting.teacher_id === absent.teacher_id &&
        meeting.student_id === absent.student_id
    );

    return {
      ...absent,
      teacher_name: teacher?.username || "",
      student_name: student?.username || "",
      startTime: meeting?.startTime || "",
      endTime: meeting?.endTime || "",
      name_program: meeting?.name_program || "",
    };
  });


  const updateAbsentStatus = async (
    teacher_absence_id: string,
    status: boolean,
    meeting_id: string
  ) => {
    const payload = {
      teacher_absence_id: teacher_absence_id,
      status: status,
      meeting_id,
    };
    try {
      setLoadingId(teacher_absence_id); // ⏳ set loading ID

      const response = await crudService.post(
        "/api/admin/teacher/changeStatus",
        payload
      );
      if (response.status === 200) {
        notification.success({
          message: "Berhasil Konfirmasi",
        });
        absentMutate();
      }
    } catch (error) {
      console.error("Failed to update arrival status:", error);
      message.error("Failed to update arrival status.");
    } finally {
      setLoadingId(null); // ✅ setelah selesai reset loading
    }
  };

  return {
    mergedData,
    updateAbsentStatus,
    isLoadingAbsent,
    isLoadingTeacher,
    loadingId,
  };
};
