"use client";

import Loading from "@/app/components/Loading";
import { lazy, Suspense } from "react";

const PlacementTestComponent = lazy(() => import("./PlacementTestComponent"));

export default function PlacementTest() {
  return (
    <Suspense fallback={<Loading />}>
      <PlacementTestComponent />
    </Suspense>
  );
}
