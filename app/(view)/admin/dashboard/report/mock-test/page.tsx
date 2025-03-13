"use client";

import Loading from "@/app/components/Loading";
import { lazy, Suspense } from "react";

const ReportPlacementTestComponent = lazy(
  () => import("./ReportMockTestComponent")
);

export default function ReportPlacementTestPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ReportPlacementTestComponent />
    </Suspense>
  );
}
