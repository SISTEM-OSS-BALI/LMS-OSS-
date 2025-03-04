"use client";

import Loading from "@/app/components/Loading";
import { lazy, Suspense } from "react";

const PlacementTestComponent = lazy(() => import("./PlacemenetTestComponent"));

export default function HistoryTest() {
  return (
    <Suspense fallback={<Loading />}>
      <PlacementTestComponent />
    </Suspense>
  );
}
