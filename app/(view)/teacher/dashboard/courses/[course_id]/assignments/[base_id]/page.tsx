"use client";

import { lazy, Suspense } from "react";

const AssignmentComponent = lazy(() => import("./AssignmentComponent"));
import Loading from "@/app/components/Loading";

export default function Assigment() {
  return (
    <Suspense fallback={<Loading />}>
      <AssignmentComponent />
    </Suspense>
  );
}
