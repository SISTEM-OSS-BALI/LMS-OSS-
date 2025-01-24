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
  module?: Buffer;
  dateTime: Date;
  platform: string
}

