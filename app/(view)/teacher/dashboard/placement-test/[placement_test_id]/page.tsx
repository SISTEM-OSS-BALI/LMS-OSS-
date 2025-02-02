"use client";

import Loading from "@/app/components/Loading";
import { lazy, Suspense } from "react";

const PlacementTestDetailComponent = lazy(
  () => import("./DetailPlacementComponent")
);

export default function PlacementTestDetail() {
  return (
    <Suspense fallback={<Loading />}>
      <PlacementTestDetailComponent />
    </Suspense>
  );
}
