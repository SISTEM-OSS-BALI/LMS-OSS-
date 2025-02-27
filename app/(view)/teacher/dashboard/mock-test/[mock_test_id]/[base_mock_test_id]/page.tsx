"use client";

import Loading from "@/app/components/Loading";
import { lazy, Suspense } from "react";

const BaseMockTestDetailComponent = lazy(
  () => import("./BaseMockTestDetailComponent")
);

export default function DetailBaseMockTest() {
  return (
    <Suspense fallback={<Loading />}>
      <BaseMockTestDetailComponent />
    </Suspense>
  );
}
