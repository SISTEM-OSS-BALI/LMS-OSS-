"use client";

import Loading from "@/app/components/Loading";
import { Suspense, lazy } from "react";

const QuestionComponent = lazy(() => import("./QuestionComponent"));

export default function Question() {
  return (
    <Suspense fallback={<Loading />}>
      <QuestionComponent />
    </Suspense>
  );
}
