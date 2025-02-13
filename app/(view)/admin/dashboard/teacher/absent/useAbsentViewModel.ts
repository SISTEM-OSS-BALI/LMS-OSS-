import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { Meeting } from "@/app/model/meeting";
import { TeacherAbsence, User } from "@/app/model/user";
import { message, notification } from "antd";
import useSWR from "swr";

interface AbsentResponse {
  data: TeacherAbsence[];
}

interface TeacherResponse {
  data: User[];
}

interface MeetingResponse {
  data: Meeting[];
}

export const useAbsentViewModel = () => {
  const { data: dataAbsent, mutate: absentMutate, isLoading: isLoadingAbsent } = useSWR<AbsentResponse>(
    "/api/admin/teacher/showAbsent",
    fetcher
  );

  const {
    data: dataTeacher,
    isLoading: isLoadingTeacher,
    mutate: mutateDataTeacher,
  } = useSWR<TeacherResponse>("/api/admin/teacher/show", fetcher);

  const {
    data: queueData,
    error: queueError,
    mutate: queueMutate,
  } = useSWR<MeetingResponse>("/api/admin/queue/show", fetcher);

  const mergedData = dataAbsent?.data.map((absent) => {
    const teacher = dataTeacher?.data.find(
      (teacher) => teacher.user_id === absent.teacher_id
    );
    const meeting = queueData?.data.find(
      (meeting) => meeting.teacher_id === absent.teacher_id
    );
    return {
      ...absent,
      teacher_name: teacher?.username || "",
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
    }
  };
  return { mergedData, updateAbsentStatus, isLoadingAbsent, isLoadingTeacher };
};
