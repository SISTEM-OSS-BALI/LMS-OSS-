"use client";

import Loading from "@/app/components/Loading";
import { lazy, Suspense } from "react";

const DetailReporyComponent = lazy(() => import("./TimeSheetComponent"));

export default function DetailReportTeacher() {
  return (
    <Suspense fallback={<Loading />}>
      <DetailReporyComponent />
    </Suspense>
  );
}
