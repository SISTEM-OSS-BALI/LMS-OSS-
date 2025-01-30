"use client";

import Loading from "@/app/components/Loading";
import { lazy, Suspense } from "react";

const MaterialComponent = lazy(() => import("./MaterialComponent"));

export default function Material() {
  return (
    <Suspense fallback={<Loading />}>
      <MaterialComponent />
    </Suspense>
  );
}
