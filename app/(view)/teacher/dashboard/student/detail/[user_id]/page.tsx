"use client";

import Loading from "@/app/components/Loading";
import { lazy, Suspense } from "react";

const StudentDetailComponent = lazy(() => import("./StudentDetailComponent"));

export default function StudentDetail() {
  return (
    <Suspense fallback={<Loading />}>
      <StudentDetailComponent />
    </Suspense>
  );
}
