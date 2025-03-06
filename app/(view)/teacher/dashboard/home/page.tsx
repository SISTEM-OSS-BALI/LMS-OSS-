"use client";

import Loading from "@/app/components/Loading";
import { lazy, Suspense } from "react";

const DashboardComponent = lazy(() => import("./DashboardComponent"));

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardComponent />
    </Suspense>
  );
}
