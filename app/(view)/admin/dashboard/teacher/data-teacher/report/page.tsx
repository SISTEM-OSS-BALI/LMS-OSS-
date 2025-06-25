"use client";

import Loading from "@/app/components/Loading";
import { Suspense, lazy } from "react";

const ReportComponent = lazy(() => import("./AdminTeacherReportComponent"));

export default function ReportTeacher() {
  return (
    <Suspense fallback={<Loading />}>
      <ReportComponent />
    </Suspense>
  );
}
