"use client";

import React from "react"; // Make sure to import React
import Loading from "@/app/components/Loading";
import { Suspense, lazy } from "react";

const ConsultantComponent = lazy(() => import("./ConsultantComponent"));

export default function ConsultantPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ConsultantComponent />
    </Suspense>
  );
}
