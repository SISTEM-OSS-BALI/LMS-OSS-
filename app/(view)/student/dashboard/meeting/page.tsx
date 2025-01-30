"use client";

import Loading from "@/app/components/Loading";
import { lazy, Suspense } from "react";

const MeetingComponent = lazy(() => import("./MeetingComponent"));
export default function Meeting() {
  return (
    <Suspense fallback={<Loading />}>
      <MeetingComponent />
    </Suspense>
  );
}
