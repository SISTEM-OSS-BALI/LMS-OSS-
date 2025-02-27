"use client";

import Loading from "@/app/components/Loading";
import { lazy, Suspense } from "react";

const MockTestDetailComponent = lazy(() => import("./DetailMockTestComponent"));

export default function MockTestDetail() {
  return (
    <Suspense fallback={<Loading />}>
      <MockTestDetailComponent />
    </Suspense>
  );
}
