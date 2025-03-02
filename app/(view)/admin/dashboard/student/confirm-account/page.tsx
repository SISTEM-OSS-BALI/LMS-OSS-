"use client";

import Loading from "@/app/components/Loading";
import { lazy, Suspense } from "react";

const ConfirmAccountComponent = lazy(() => import("./ConfirmAccountComponent"));

export default function ConfirmAccount() {
  return (
    <Suspense fallback={<Loading />}>
      <ConfirmAccountComponent />
    </Suspense>
  );
}
