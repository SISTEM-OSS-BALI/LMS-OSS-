import { fetcher } from "@/app/lib/utils/fetcher";
import { User } from "@/app/model/user"
import useSWR from "swr";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
interface TeacherResponse {
    data: User[]
}

export const useCalendarViewModel = () => {
const { data: showScheduleTeacherAll, mutate: mutateShowScheduleTeacherAll } =
  useSWR(`/api/admin/schedule/showScheduleAll`, fetcher);
const {
  data: dataTeacher,
  isLoading,
  mutate: mutateDataTeacher,
} = useSWR<TeacherResponse>("/api/admin/teacher/show", fetcher);

const dayToIndex = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

// const color = [
//   "rgb(229, 115, 115)",
//   "rgb(255, 182, 77)",
//   "rgb(78, 182, 171)",
//   "rgb(66, 133, 244)",
//   "rgb(102, 187, 106)",
// ];

 const regionColorMapping = {
   Singaraja: "rgb(229, 115, 115)",
   Denpasar: "rgb(255, 182, 77)",
   Karangasem: "rgb(66, 133, 244)",
   // Add more regions and colors as needed
 };

// Fungsi untuk memetakan data dari API ke format event FullCalendar
const mapScheduleToEvents = (scheduleData: any) => {
  if (!scheduleData || !Array.isArray(scheduleData.data)) return [];

  const events = scheduleData.data.flatMap((schedule: any) =>
    schedule.days.flatMap((day: any) =>
      day.times.map((time: any) => {
        const dayIndex = dayToIndex[day.day as keyof typeof dayToIndex];

        const startTime = dayjs(time.startTime).utc().format("HH:mm");
        const endTime = dayjs(time.endTime).utc().format("HH:mm");

        const filteredData = dataTeacher?.data.find(
          (teacher) => teacher.user_id === schedule.teacher_id
        );

        return {
          id: time.time_id,
          daysOfWeek: [dayIndex],
          extendedProps: {
            teacherName: filteredData?.username,
            startTime: startTime,
            endTime: endTime,
            region: filteredData?.region,
          },
        };
      })
    )
  );

  return events;
};

const events = mapScheduleToEvents(showScheduleTeacherAll);

    return {
        events,
        isLoading,
        regionColorMapping,
        showScheduleTeacherAll,
        dataTeacher
    }
}