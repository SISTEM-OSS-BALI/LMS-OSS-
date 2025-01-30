"use client";

import Loading from "@/app/components/Loading";
import { lazy, Suspense } from "react";

const ProgramComponent = lazy(() => import("./ProgramComponent"));

export default function Program() {
  return (
    <Suspense fallback={<Loading />}>
      <ProgramComponent />
    </Suspense>
  );
}
