"use client";

import { lazy, Suspense } from "react";
import Loading from "@/app/components/Loading";

const CoursesTeacherComponent = lazy(() => import("./CourseComponent"));

export default function CoursesTeacher() {
  return (
    <Suspense fallback={<Loading />}>
      <CoursesTeacherComponent />
    </Suspense>
  );
}
