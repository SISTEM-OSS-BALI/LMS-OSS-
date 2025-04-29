import { Role } from "./enums";
import { Course, CourseEnrollment } from "./course";
import { ScheduleTeacher } from "./schedule";
import {
  CourseProgress,
  MaterialProgress,
  AssignmentProgress,
} from "./progress";

import { StudentAnswerAssignment } from "./assigment";
import { Meeting } from "./meeting";

export interface User {
  user_id: string;
  username: string;
  email: string;
  password: string;
  program_id: string;
  no_phone: string;
  imageUrl: string;
  role: Role;
  region: string;
  color: string;
  is_evaluation: boolean;
  count_program: number;

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

export interface TeacherAbsence {
  teacher_absence_id: string;
  teacher_id: string;
  student_id: string;
  meeting_id: string;
  reason: string;
  imageUrl: string;
  createdAt: Date;
  status: boolean;
  is_delete: boolean;
  updatedAt: Date;
}
