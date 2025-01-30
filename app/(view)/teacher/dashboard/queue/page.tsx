"use client";

import { lazy, Suspense } from "react";
import Loading from "@/app/components/Loading";

const QueueComponent = lazy(() => import("./QueueComponent"));
export default function Queue() {
  return (
    <Suspense fallback={<Loading />}>
      <QueueComponent />
    </Suspense>
  );
}
