import { fetcher } from "@/app/lib/utils/fetcher";
import { Form, message, notification } from "antd";
import useSWR from "swr";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { crudService } from "@/app/lib/services/crudServices";
import { useDashboardViewModel } from "../home/useDashboardViewModel";
import { Meeting, ProgressMeeting, User, UserGroup } from "@prisma/client";

dayjs.extend(utc);

interface MeetingResponse {
  data: Meeting[];
}

interface UserResponse {
  data: User[];
}

interface MemberGroupResponse {
  data: UserGroup[];
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

  const { data: progressData, mutate: progressMutate } = useSWR(
    `/api/teacher/meeting/showProgress/`,
    fetcher
  );

  const { data: memberGroup, isLoading: isLoadingMemberGroup } =
    useSWR<MemberGroupResponse>(
      "/api/teacher/student/showMemberGroup",
      fetcher
    );

  const {
    data: teacherAbsenceData,
    mutate: programDataMutate,
    isLoading: isLoadingProgram,
  } = useSWR("/api/teacher/teacherAbsent/show", fetcher);

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
  const [isModalVisibleAddAction, setIsModalVisibleAddAction] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);
  const [loadingState, setLoadingState] = useState<{
    [key: string]: boolean | null;
  }>({});
  const [selectedUserGroupId, setSelectedUserGroupId] = useState<
    string | undefined
  >(undefined);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(
    undefined
  );

  const updateAbsentStatus = async (
    meeting_id: string,
    student_id: string,
    absent: boolean
  ) => {
    const payload = {
      meeting_id,
      absent,
      student_id,
    };

    setLoadingState((prev) => ({
      ...prev,
      [meeting_id]: absent ? true : false,
    }));

    try {
      const response = await crudService.post(
        "/api/teacher/absent/changeAbsent",
        payload
      );

      // Jika status 200 tapi message error, treat as error
      const isError =
        typeof response.message === "string" &&
        (response.message.toLowerCase().includes("gagal") ||
          response.message.toLowerCase().includes("hanya bisa mengupdate") ||
          response.message.toLowerCase().includes("tidak bisa") ||
          response.error); // bisa juga cek response.error

      if (response.status === 200 && !isError) {
        notification.success({
          message: "Absensi Berhasil",
          description: response.message || "Absensi telah diperbarui.",
        });
      } else {
        notification.error({
          message: "Absensi Gagal",
          description: response.message || "Terjadi kesalahan saat absensi.",
        });
      }

      meetingMutate();
      progressMutate();
      mutateDataStudent();
      mutateCountProgram();
    } catch (error: any) {
      notification.error({
        message: "Absensi Gagal",
        description:
          error?.message || "Gagal terhubung ke server. Silakan coba lagi.",
      });
      console.error("Failed to update absent status:", error);
    } finally {
      setLoadingState((prev) => ({
        ...prev,
        [meeting_id]: null,
      }));
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

    const isGroup = student?.type_student === "GROUP";

    const groupMember = isGroup
      ? memberGroup?.data
          .filter((g) => g.userUser_id === meeting.student_id)
          .map((member) => ({
            ...member,
            // meetings: meetingData?.data.filter(
            //   (m) =>
            //     m.student_id === member.userUser_id &&
            //     m.meeting_id === meeting.meeting_id
            // ),
          }))
      : null;

    const teacherAbsence = teacherAbsenceData?.data.find(
      (t: Meeting) => t.meeting_id === meeting.meeting_id
    );

    const filteredProgress = progressData?.data.filter(
      (progress: any) => progress.meeting_id === meeting.meeting_id
    );

    return {
      ...meeting,
      studentName: student?.username,
      groupMember,
      nameGroup: student?.name_group,
      teacherAbsence,
      typeStudent: student?.type_student,
      progress: filteredProgress?.progress_student ?? null,
    };
  });

  const filteredData = mergedData?.filter((student) =>
    (
      student.studentName?.toLowerCase() ||
      student.nameGroup?.toLowerCase() ||
      ""
    )
      .toLowerCase()
      .includes(searchKeyword.toLowerCase())
  );

  const handleChangeDate = (date: any) => {
    if (date) {
      const formatedDate = dayjs(date).format("YYYY-MM-DD");
      router.push(`/teacher/dashboard/queue?date=${formatedDate}`);
    }
  };

  const handleOpenModalAction = (meeting_id: string) => {
    setIsModalVisibleAddAction(true);
    setMeetingId(meeting_id);
  };

  const handleAction = async (values: any) => {
    setLoading(true);
    const payload = {
      reason: values.reason,
      imageUrl: imageUrl,
    };
    setLoading(true);
    try {
      await crudService.post(
        `/api/teacher/meeting/handleActionTeacher/${meetingId}`,
        payload
      );
      notification.success({
        message: "Berhasil Menambahkan Aksi",
        description:
          "Permintaan anda telah dikirim ke admin, tunggu konfirmasi melalui Whatsapp.",
      });
      setLoading(false);
      handleCancelAddAction();
      meetingMutate();
      mutateDataStudent();
      mutateCountProgram();
      setMeetingId("");
    } catch (error) {
      notification.error({
        message: "Gagal Menambahkan Action",
        description:
          "Pastikan Gambar Tercompres, jika tidak bisa silahkan hubung admin",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisibleAddProgesStudent(false);
    setMeetingId("");
    form.resetFields();
  };

  const handleCancelAddAction = () => {
    setIsModalVisibleAddAction(false);
    setMeetingId("");
    form.resetFields();
    setImageUrl(null);
  };

  const handleOpenModalAddProges = (
    meeting_id: string,
    user_group_id?: string,
    user_id?: string
  ) => {
    setIsModalVisibleAddProgesStudent(true);
    setMeetingId(meeting_id);
    if (user_id) {
      setSelectedUserId(user_id);
    } else {
      setSelectedUserGroupId(user_group_id);
    }

    const findProgres = progressData?.data.find((progress: ProgressMeeting) => {
      if (user_id) {
        return (
          progress.user_id === user_id && progress.meeting_id === meeting_id
        );
      } else {
        return (
          progress.user_group_id === user_group_id &&
          progress.meeting_id === meeting_id
        );
      }
    });

    if (findProgres) {
      form.setFieldsValue({
        progress_student: findProgres.progress_student,
        ability_scale: findProgres.abilityScale,
        student_performance: findProgres.studentPerformance,
      });
    }
  };

  const handleAddProgresStudent = async (values: any) => {
    setLoading(true);
    let payload;
    if (selectedUserGroupId) {
      payload = {
        user_group_id: selectedUserGroupId,
        progress: values.progress_student,
        abilityScale: values.ability_scale,
        studentPerformance: values.student_performance,
      };
    } else {
      payload = {
        user_id: selectedUserId,
        progress: values.progress_student,
        abilityScale: values.ability_scale,
        studentPerformance: values.student_performance,
      };
    }
    try {
      await crudService.post(
        `/api/teacher/meeting/addProgressStudent/${meetingId}`,
        payload
      );
      notification.success({
        message: "Berhasil Menambahkan Progress",
      });
      meetingMutate();
      progressMutate();
      mutateDataStudent();
      mutateCountProgram();
      setMeetingId("");
      setIsModalVisibleAddProgesStudent(false);
    } catch (error) {
      notification.error({
        message: "Gagal Menambahkan Progress",
      });
    } finally {
      setLoading(false);
    }
  };

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (info: any) => {
    if (info.file.status === "done") {
      const base64 = await getBase64(info.file.originFileObj as File);
      setImageUrl(base64);
    }
    setFileList(info.fileList);
  };

  const handleBeforeUpload = async (file: any) => {
    const base64 = await getBase64(file);
    setImageUrl(base64);
    return false;
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
    handleOpenModalAddProges,
    handleAddProgresStudent,
    loading,
    handleOpenModalAction,
    isModalVisibleAddAction,
    handleCancelAddAction,
    imageUrl,
    setImageUrl,
    handleFileChange,
    handleBeforeUpload,
    fileList,
    teacherAbsenceData,
    loadingState,
  };
};
