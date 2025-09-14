import { fetcher } from "@/app/lib/utils/fetcher";
import useSWR from "swr";
import { useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Room, ShiftSchedule } from "@prisma/client";

dayjs.extend(utc);

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface ScheduleTime {
  time_id: string;
  day_id: string;
  startTime: string;
  endTime: string;
}

interface ScheduleMonth {}

export interface Teacher {
  user_id: string;
  username: string;
  email: string;
  color: string;
  imageUrl: string;
  ScheduleMonth: ScheduleMonth[];
  days: any;
}

interface ScheduleTeacherResponse {
  data: Teacher;
}

interface ScheduleResponse {
  data: any;
}

interface ShiftResponse {
  data: ShiftSchedule[];
}

interface RoomResponse {
  data: Room[];
}

export const useScheduleViewModel = () => {
  const {
    data: scheduleTeacher,
    isLoading: isLoadingSchedule,
    mutate: mutateSchedule,
  } = useSWR<ScheduleTeacherResponse>("/api/teacher/schedule/detail", fetcher);

  const [selectedDate, setSelectedDate] = useState(dayjs());

  const { data: shiftData } = useSWR<ShiftResponse>(
    "/api/admin/shift",
    fetcher
  );


  return {
    scheduleTeacher,
    isLoadingSchedule,
    mutateSchedule,
    shiftData,
    selectedDate,
    setSelectedDate,
  };
};
