"use client";

import Loading from "@/app/components/Loading";
import { lazy, Suspense } from "react";

const QueueComponent = lazy(() => import("./QueueComponent"));

export default function Queue() {
  return (
    <Suspense fallback={<Loading />}>
      <QueueComponent />
    </Suspense>
  );
}
