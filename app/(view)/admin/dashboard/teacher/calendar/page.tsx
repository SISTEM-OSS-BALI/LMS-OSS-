"use client";

import Loading from "@/app/components/Loading";
import { lazy, Suspense } from "react";

const CalendarTeacherComponent = lazy(
  () => import("./CalendarTeacherComponent")
);

export default function CalendarTeacher() {
  return (
    <Suspense fallback={<Loading />}>
      <CalendarTeacherComponent />
    </Suspense>
  );
}
