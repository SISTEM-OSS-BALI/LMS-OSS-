import { MaterialAssignmentBase } from "./material";
import { CourseProgress } from "./progress";


export interface Teacher {
  user_id: string;
  username: string;
  email: string;
  color: string;
  imageUrl: string;
}
export interface Course {
  course_id: string;
  name: string;
  teacher: Teacher;
  code_course: string;
  createdAt: Date;

  materialsAssignmentBase: MaterialAssignmentBase[];
  progressCourse: CourseProgress[];
  students: CourseEnrollment[];
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  completed: boolean;
  course: {
    course_id: string;
    name: string;
    teacher: {
      user_id: string;
      username: string;
      email: string;
    };
    materialsAssigmentBase: {
      base_id: string;
      title: string;
      position: number;
      createdAt: string;
    }[];
  };
}

export interface CourseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  completed: boolean;
  enrolledAt: Date;
}