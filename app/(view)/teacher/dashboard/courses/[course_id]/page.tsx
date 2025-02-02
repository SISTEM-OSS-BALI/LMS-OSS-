"use client";

import Loading from "@/app/components/Loading";
import { Suspense, lazy } from "react";

const CourseDetailComponent = lazy(() => import("./CourseDetailComponent"));

export default function DetailTeacher() {
  return (
    <Suspense fallback={<Loading />}>
      <CourseDetailComponent />
    </Suspense>
  );
}
