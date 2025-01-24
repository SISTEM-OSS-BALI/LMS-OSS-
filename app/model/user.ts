import { Role } from "./enums";
import { Course, CourseEnrollment } from "./course";
import { ScheduleTeacher } from "./schedule";
import {
  CourseProgress,
  MaterialProgress,
  AssignmentProgress,
} from "./progress";

import { Meeting } from "./schedule";
import { StudentAnswerAssignment } from "./assigment";

export interface User {
  user_id: string;
  username: string;
  email: string;
  password: string;
  no_phone?: string;
  role: Role;

  coursesTeaching: Course[];
  scheduleTeacher: ScheduleTeacher[];
  coursesEnrolled: CourseEnrollment[];
  materialCourseProgress: CourseProgress[];
  materialProgress: MaterialProgress[];
  assignmentProgress: AssignmentProgress[];
  studentAnswers: StudentAnswerAssignment[];
  meetingTeacher: Meeting[];
  meetingStudent: Meeting[];
}
