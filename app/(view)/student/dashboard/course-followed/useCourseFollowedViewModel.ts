import { fetcher } from "@/app/lib/utils/fetcher";
import { Enrollment } from "@/app/model/course";
import { CourseEnrollment, CourseProgress } from "@prisma/client";
import useSWR from "swr";

interface CourseEnrollmentResponse {
  data: Enrollment[];
}

interface CourseProgressResponse {
  data: CourseProgress[];
}
export function useCourseFollowedViewModel() {
  const { data: courseData, error } = useSWR<CourseEnrollmentResponse>(
    "/api/student/course/courseFollowed",
    fetcher
  );

  const { data: progressData } = useSWR<CourseProgressResponse>(
    `/api/student/material/showCourseProgress`,
    fetcher
  );
  return { courseData, progressData, error };
}
