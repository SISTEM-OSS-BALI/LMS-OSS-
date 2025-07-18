"use client";

import Loading from "@/app/components/Loading";
import { lazy, Suspense } from "react";

const ScheduleComponent = lazy(() => import("./ScheduleComponent"));

export default function Schedule() {
  return (
    <Suspense fallback={<Loading />}>
      <ScheduleComponent />
    </Suspense>
  );
}
