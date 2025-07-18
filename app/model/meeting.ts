import { MethodType } from "./enums";
import { User } from "./user";

export interface Meeting {
  meeting_id: string;
  teacher: User;
  student: User;
  method?: MethodType;
  meetLink?: string;
  teacher_id: string;
  student_id: string;
  absent?: boolean;
  progress_student: string;
  abilityScale: string;
  studentPerformance: string;
  module?: Buffer;
  dateTime: Date;
  startTime: Date;
  endTime: Date;
  name_program: string;
  is_delete: boolean;
  platform: string;
  createdAt: Date;
}
