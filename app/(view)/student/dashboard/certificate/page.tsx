"use client";

import Loading from "@/app/components/Loading";
import { Suspense, lazy } from "react";

const CertificateComponent = lazy(() => import("./CertificateComponent"));

export default function Certificate() {
  return (
    <Suspense fallback={<Loading />}>
      <CertificateComponent />
    </Suspense>
  );
}
