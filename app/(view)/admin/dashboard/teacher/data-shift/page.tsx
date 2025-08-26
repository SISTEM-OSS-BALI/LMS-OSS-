"use client";

import Loading from "@/app/components/Loading";
import { Suspense, lazy } from "react";

const ShiftComponent = lazy(() => import("./ShiftComponent"));

export default function Shift() {
  return (
    <Suspense fallback={<Loading />}>
      <ShiftComponent />
    </Suspense>
  );
}
