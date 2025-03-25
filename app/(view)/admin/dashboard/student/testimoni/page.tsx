"use client";

import Loading from "@/app/components/Loading";
import { Suspense, lazy } from "react";

const TestimoniComponent = lazy(() => import("./TestimoniComponent"));
export default function Testimoni() {
  return (
    <Suspense fallback={<Loading />}>
      <TestimoniComponent />
    </Suspense>
  );
}
