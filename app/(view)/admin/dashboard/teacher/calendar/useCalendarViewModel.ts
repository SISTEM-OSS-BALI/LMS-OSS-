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
    const teacher = schedule.teacher as
      | { region?: keyof typeof regionColorMapping; username?: string }
      | undefined;

    const teacherColor =
      regionColorMapping[teacher?.region as keyof typeof regionColorMapping] ||
      "#3b82f6";

    return (schedule.blocks ?? []).flatMap((block: any) =>
      (block.times ?? []).map((time: any) => {
        // Ambil jam dari SHIFT
        const shiftStart = dayjs(time?.shift?.start_time).utc().format("HH:mm");
        const shiftEnd = dayjs(time?.shift?.end_time).utc().format("HH:mm");

        // Range tanggal inklusif (FullCalendar pakai endRecur eksklusif → +1 hari)
        const startDate = dayjs(block.start_date).utc();
        const endDate = dayjs(block.end_date).utc().add(1, "day");

        // Nama room (aman kalau null)
        const roomName = time?.room?.name ?? "-";

        return {
          id: time.id,
          // Recurring harian sepanjang rentang block, pada jam shift
          startRecur: startDate.format("YYYY-MM-DD"),
          endRecur: endDate.format("YYYY-MM-DD"),
          startTime: shiftStart, // <— penting: taruh di level event
          endTime: shiftEnd, // <— penting: taruh di level event

          // Warna per region
          backgroundColor: teacherColor,
          borderColor: teacherColor,

          // Simpan detail di extendedProps untuk renderer
          extendedProps: {
            teacherName: teacher?.username ?? "Teacher",
            region: teacher?.region,
            blockId: block.id,
            scheduleMonthId: schedule.id,
            roomName,
            shiftStart,
            shiftEnd,
            color: teacherColor,
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