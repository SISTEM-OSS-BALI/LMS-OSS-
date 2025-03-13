"use client";

import Loading from "@/app/components/Loading";
import { Suspense, lazy } from "react";

const FreeMockTestComponent = lazy(
  () => import("./FreeMockComponent")
);

export default function FreePlacementTest() {
  return (
    <Suspense fallback={<Loading />}>
      <FreeMockTestComponent />
    </Suspense>
  );
}
