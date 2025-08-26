import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { Form, Modal, notification } from "antd";
import { useState } from "react";
import useSWR from "swr";
import { EventInput } from "@fullcalendar/core";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import Cookies from "js-cookie";
import { ShiftSchedule } from "@prisma/client";

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

export const useScheduleViewModel = () => {
  const {
    data: scheduleTeacher,
    isLoading: isLoadingSchedule,
    mutate: mutateSchedule,
  } = useSWR<ScheduleTeacherResponse>("/api/teacher/schedule/detail", fetcher);

  const { data: shiftData, } = useSWR<ShiftResponse>(
    "/api/admin/shift",
    fetcher
  );

  return {
    scheduleTeacher,
    isLoadingSchedule,
    mutateSchedule,
    shiftData,
  };
};
