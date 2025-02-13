import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { Meeting, RescheduleMeeting } from "@prisma/client";
import { message, notification } from "antd";
import { useState } from "react";
import useSWR from "swr";

interface RescheduleResponse {
  data: RescheduleMeeting[];
}

interface MeetingResponse {
  data: Meeting[];
}

export const useRescheduleViewModel = () => {
  const { data: dataReschedule, mutate: rescheduleMutate, isLoading: isLoadingReschedule } =
    useSWR<RescheduleResponse>("/api/admin/rescheduleMeeting/show", fetcher);
  const { data: dataMeeting, mutate: meetingMutate } = useSWR<MeetingResponse>(
    "/api/student/meeting/show",
    fetcher
  );

  const [loadingState, setLoadingState] = useState<{
    [key: string]: string | null;
  }>({});

  const mergedData = dataReschedule?.data.map((reschedule) => {
    const meeting = dataMeeting?.data.find(
      (meeting) => meeting.meeting_id === reschedule.meeting_id
    );
    return {
      ...reschedule,
      ...meeting,
    };
  });

  const handleApproveReschedule = async (
    reschedule_meeting_id: string,
    status: boolean
  ) => {
    const payload = {
      reschedule_id: reschedule_meeting_id,
      status: status,
    };

    // Hanya tombol yang diklik yang masuk mode loading
    setLoadingState((prev) => ({
      ...prev,
      [reschedule_meeting_id]: status ? "APPROVED" : "REJECTED",
    }));

    try {
      const response = await crudService.post(
        "/api/admin/rescheduleMeeting/handleAprroval",
        payload
      );

      if (response.status === 200) {
        notification.success({ message: "Berhasil Verifikasi" });
        meetingMutate();
        rescheduleMutate();
      }
    } catch (error) {
      console.error("Failed to update arrival status:", error);
      message.error("Failed to update arrival status.");
    } finally {
      // Matikan loading hanya untuk tombol yang diklik
      setLoadingState((prev) => ({ ...prev, [reschedule_meeting_id]: null }));
    }
  };

  return { mergedData, handleApproveReschedule, loadingState, isLoadingReschedule };
};
