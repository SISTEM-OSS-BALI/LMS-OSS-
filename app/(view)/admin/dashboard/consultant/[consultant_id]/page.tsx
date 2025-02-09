"use client";

import Loading from "@/app/components/Loading";
import { Suspense, lazy } from "react";

const ConsultantDetailComponent = lazy(
  () => import("./ConsultantDetailComponent")
);

export default function DetailConsultant() {
  return (
    <Suspense fallback={<Loading />}>
      <ConsultantDetailComponent />
    </Suspense>
  );
}
