"use client";

import Loading from "@/app/components/Loading";
import { Suspense, lazy } from "react";

const FreePlacementTestComponent = lazy(
  () => import("./FreePlacementComponent")
);

export default function FreePlacementTest() {
  return (
    <Suspense fallback={<Loading />}>
      <FreePlacementTestComponent />
    </Suspense>
  );
}
