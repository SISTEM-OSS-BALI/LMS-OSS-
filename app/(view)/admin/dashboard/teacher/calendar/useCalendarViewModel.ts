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
const { data: showScheduleTeacherAll, mutate: mutateShowScheduleTeacherAll, isLoading: isLoadingSchedule } =
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

  const events = scheduleData.data.flatMap((schedule: any) => {
    const teacher: { region?: keyof typeof regionColorMapping; username?: string } = schedule.teacher;
    const teacherColor = regionColorMapping[teacher?.region as keyof typeof regionColorMapping] || "#3b82f6";

    return schedule.blocks.flatMap((block: any) =>
      block.times.map((time: any) => {
        const startDate = dayjs(block.start_date);
        const endDate = dayjs(block.end_date);

        const startTime = dayjs(time.start_time).utc().format("HH:mm");
        const endTime = dayjs(time.end_time).utc().format("HH:mm");

        return {
          id: time.id,
          title: `${teacher?.username || "Guru"} (${startTime} - ${endTime})`,
          startRecur: startDate.format("YYYY-MM-DD"),
          endRecur: endDate.add(1, "day").format("YYYY-MM-DD"),
          backgroundColor: teacherColor,
          extendedProps: {
            teacherName: teacher?.username,
            region: teacher?.region,
            blockId: block.id,
            scheduleMonthId: schedule.id,
            startTime, 
            endTime, 
          },
        };
      })
    );
  });

  return events;
};

const events = mapScheduleToEvents(showScheduleTeacherAll);

    return {
        events,
        isLoading,
        regionColorMapping,
        showScheduleTeacherAll,
        dataTeacher,
        isLoadingSchedule
    }
}