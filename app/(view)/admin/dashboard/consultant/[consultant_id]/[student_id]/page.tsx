"use client";

import Loading from "@/app/components/Loading";
import { Suspense, lazy } from "react";

const StudentDetailReportComponent = lazy(
  () => import("./StudentDetailReportComponent")
);
export default function StudentDetail() {
  return (
    <Suspense fallback={<Loading />}>
      <StudentDetailReportComponent />
    </Suspense>
  );
}
