import useSWR from "swr";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { fetcher } from "@/app/lib/utils/fetcher";
import { User } from "@/app/model/user";
import { useState } from "react";
import { AccessPlacementTest, PlacementTest } from "@prisma/client";

dayjs.extend(utc);

interface UserResponse {
  data: User[];
}

interface PlacementTestResponse {
  data: PlacementTest[]
}

interface AccessPlacementTestResponse {
  data: AccessPlacementTest[]
}

export const useMeetings = () => {
  const { data: showMeetingById } = useSWR(
    "/api/student/meeting/showById",
    fetcher
  );
  const { data: dataTeacher } = useSWR<UserResponse>(
    "/api/admin/teacher/show",
    fetcher
  );

  const { data: countPogramData } = useSWR(
    "/api/student/countProduct",
    fetcher
  );

  const {data: accessPlacemenetTestData} = useSWR<AccessPlacementTestResponse>(
    "/api/student/placementTest/show",
    fetcher
  );

  const { data: placemenetTestData } = useSWR<PlacementTestResponse>(
    "/api/teacher/placementTest/show",
    fetcher
  );

  const formatDateTimeToUTC = (dateTime: string) => {
    return dayjs.utc(dateTime).toISOString();
  };

  const mergedData = accessPlacemenetTestData?.data.map((access) => {
    const placementInfo = placemenetTestData?.data.find(
      (placement) => placement.placement_test_id === access.placement_test_id
    );

    return {
      ...access,
      ...placementInfo,
    };
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent(clickInfo.event.extendedProps);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedEvent(null);
  };

  // Format events
  const events =
    showMeetingById?.data?.map((meeting: any) => {
      const formatDateTimeToUTC = (dateTime: string) => {
        return dayjs.utc(dateTime).toISOString();
      };

      const filteredData = dataTeacher?.data.find(
        (teacher) => teacher.user_id === meeting.teacher_id
      );

      return {
        title: `Meeting with ${filteredData?.username || "Teacher"}`,
        start: formatDateTimeToUTC(meeting.dateTime),
        extendedProps: {
          teacherName: filteredData?.username || "Unknown",
          time: dayjs.utc(meeting.dateTime).format("HH:mm"),
          color: "blue",
          meetLink: meeting.meetLink,
          method: meeting.method,
        },
      };
    }) || [];

  const count_program = countPogramData?.data?.count_program || 0;

  return {
    formatDateTimeToUTC,
    isModalVisible,
    selectedEvent,
    handleEventClick,
    handleModalClose,
    events,
    count_program,
    mergedData
  };
};
