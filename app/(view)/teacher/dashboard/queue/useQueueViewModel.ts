import { fetcher } from "@/app/lib/utils/fetcher";
import { Meeting } from "@/app/model/meeting";
import { User } from "@/app/model/user";
import { Form, message, notification } from "antd";
import useSWR from "swr";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { crudService } from "@/app/lib/services/crudServices";
import { useDashboardViewModel } from "../../useDashboardViewModel";
dayjs.extend(utc);

interface MeetingResponse {
  data: Meeting[];
}

interface UserResponse {
  data: User[];
}

export const useQueueViewModel = () => {
  const searchParams = useSearchParams();
  const date = searchParams.get("date") || dayjs().format("YYYY-MM-DD");
  const fetchUrl = useMemo(() => {
    let url = "/api/teacher/meeting/show";
    const params = new URLSearchParams();
    if (date) params.append("date", date);
    return `${url}?${params.toString()}`;
  }, [date]);
  const router = useRouter();
  const { data: showTimeData } = useSWR(
    "/api/teacher/meeting/showDateTime",
    fetcher
  );
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const {
    data: meetingData,
    error: meetingError,
    mutate: meetingMutate,
  } = useSWR<MeetingResponse>(fetchUrl, fetcher);
  const { mutateCountProgram } = useDashboardViewModel();

  const {
    data: dataStudent,
    isLoading: isLoadingStudent,
    mutate: mutateDataStudent,
  } = useSWR<UserResponse>("/api/admin/student/show", fetcher);
  const [loading, setLoading] = useState(false);
  const [isModalVisibleAddProgesStudent, setIsModalVisibleAddProgesStudent] =
    useState(false);
  const [form] = Form.useForm();
  const [meetingId, setMeetingId] = useState<string>("");

  const updateAbsentStatus = async (
    meeting_id: string,
    student_id: string,
    absent: boolean
  ) => {
    const payload = {
      meeting_id: meeting_id,
      absent: absent,
      student_id,
    };
    try {
      const response = await crudService.post(
        "/api/teacher/absent/changeAbsent",
        payload
      );
      if (response.status === 200) {
        notification.success({
          message: "Berhasil Absent",
        });
        meetingMutate();
        mutateDataStudent();
        mutateCountProgram();
      }
    } catch (error) {
      console.error("Failed to update arrival status:", error);
      message.error("Failed to update arrival status.");
    }
  };

  const showTimes = useMemo(() => {
    if (!showTimeData) return [];
    const uniqueDates = new Set(
      showTimeData.data.map((item: any) =>
        dayjs.utc(item.dateTime).format("YYYY-MM-DD")
      )
    );
    return Array.from(uniqueDates);
  }, [showTimeData]);

  const mergedData = meetingData?.data.map((meeting: Meeting) => {
    const student = dataStudent?.data.find(
      (student: User) => student.user_id === meeting.student_id
    );
    return {
      ...meeting,
      studentName: student?.username,
    };
  });

  const filteredData = mergedData?.filter((student) =>
    student.studentName?.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const handleChangeDate = (date: any) => {
    if (date) {
      const formatedDate = dayjs(date).format("YYYY-MM-DD");
      router.push(`/teacher/dashboard/queue?date=${formatedDate}`);
    }
  };

  const handleAction = async (meeting_id: string) => {
    setLoading(true);
    try {
      await crudService.delete(
        `/api/teacher/meeting/handleActionTeacher/${meeting_id}`,
        meeting_id
      );
    } catch (error) {
      console.error("Failed to delete meeting:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisibleAddProgesStudent(false);
  };

  const handleGetIdMeeting = (meeting_id: string) => {
    setIsModalVisibleAddProgesStudent(true);
    setMeetingId(meeting_id);
  };

  const handleAddProgresStudent = async (values: any) => {
    setLoading(true);
    const payload = {
      progress: values.progress_student,
      abilityScale : values.ability_scale,
      studentPerformance : values.student_performance
    };
    console.log(payload);
    try {
      await crudService.patch(
        `/api/teacher/meeting/addProgressStudent/${meetingId}`,
        payload
      );
      notification.success({
        message: "Berhasil Menambahkan Progress",
      });
      meetingMutate();
      mutateDataStudent();
      mutateCountProgram();
      setMeetingId("");
      setIsModalVisibleAddProgesStudent(false);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return {
    meetingData,
    updateAbsentStatus,
    dataStudent,
    handleChangeDate,
    filteredData,
    searchKeyword,
    setSearchKeyword,
    showTimes,
    handleAction,
    setIsModalVisibleAddProgesStudent,
    isModalVisibleAddProgesStudent,
    handleCancel,
    form,
    handleGetIdMeeting,
    handleAddProgresStudent,
    loading,
  };
};
