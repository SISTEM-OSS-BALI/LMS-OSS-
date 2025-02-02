"use client";

import Loading from "@/app/components/Loading";
import { lazy, Suspense } from "react";

const TeacherAbsentComponent = lazy(() => import("./AbsentTeacherComponent"));

export default function Absent() {
  return (
    <Suspense fallback={<Loading />}>
      <TeacherAbsentComponent />
    </Suspense>
  );
}
