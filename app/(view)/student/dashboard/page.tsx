"use client";

import Loading from "@/app/components/Loading";
import { Suspense, lazy } from "react";

const DashboardComponent = lazy(() => import("./DashboardComponent"));

export default function StudentDashboard() {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardComponent />
    </Suspense>
  );
}
