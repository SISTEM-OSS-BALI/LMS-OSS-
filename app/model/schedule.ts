import { DayOfWeek, MethodType } from "./enums";

export interface ScheduleTeacher {
  schedule_id: string;
  teacher_id: string;
  days: ScheduleDay[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleDay {
  day_id: string;
  schedule_id: string;
  day: DayOfWeek;
  isAvailable: boolean;
  times: ScheduleTime[];
}

export interface ScheduleTime {
  time_id: string;
  day_id: string;
  startTime: Date;
  endTime: Date;
}

// export interface Meeting {
//   meeting_id: string;
//   teacher_id: string;
//   student_id: string;
//   method?: MethodType;
//   meetLink?: string;
//   dateTime: string;
// }
