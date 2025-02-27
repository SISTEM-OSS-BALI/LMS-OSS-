"use client";

import Loading from "@/app/components/Loading";
import { lazy, Suspense } from "react";

const MockTestComponent = lazy(() => import("./MockTestComponent"));

export default function MockTest() {
  return (
    <Suspense fallback={<Loading />}>
      <MockTestComponent />
    </Suspense>
  );
}
