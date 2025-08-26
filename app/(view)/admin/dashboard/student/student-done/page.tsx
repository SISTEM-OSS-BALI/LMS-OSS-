"use client";

import Loading from "@/app/components/Loading";
import { lazy, Suspense } from "react";

const StudentComponent = lazy(() => import("./StudentComponent"));

export default function Student() {
  return (
    <Suspense fallback={<Loading />}>
      <StudentComponent />
    </Suspense>
  );
}
