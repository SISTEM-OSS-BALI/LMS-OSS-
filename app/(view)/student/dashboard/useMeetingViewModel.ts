import useSWR from "swr";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { fetcher } from "@/app/lib/utils/fetcher";
import { User } from "@/app/model/user";
import { useState } from "react";

dayjs.extend(utc);

interface UserResponse {
  data: User[];
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

  const formatDateTimeToUTC = (dateTime: string) => {
    return dayjs.utc(dateTime).toISOString();
  };

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
           color: "blue", // Ant Design primary color
           meetLink: meeting.meetLink,
           method: meeting.method,
         },
       };
     }) || [];

  return {
    formatDateTimeToUTC,
    isModalVisible,
    selectedEvent,
    handleEventClick,
    handleModalClose,
    events
  };
};
