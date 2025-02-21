"use client";

import Loading from "@/app/components/Loading";
import { Suspense, lazy } from "react";

const DashboardComponent = lazy(() => import("./DashboardComponent"));

export default function AdminDashboard() {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardComponent />
    </Suspense>
  );
}
