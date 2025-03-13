"use client";

import Loading from "@/app/components/Loading";
import { Suspense, lazy } from "react";

const ResultComponent = lazy(() => import("./ResultComponent"));

export default function Result() {
  return (
    <Suspense fallback={<Loading />}>
      <ResultComponent />
    </Suspense>
  );
}
