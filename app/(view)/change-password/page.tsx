"use client";

import Loading from "@/app/components/Loading";
import { Suspense, lazy } from "react";

const ChangePasswordComponent = lazy(() => import("./ChangePasswordComponent"));

export default function ChangePassword() {
  return (
    <Suspense fallback={<Loading />}>
      <ChangePasswordComponent />
    </Suspense>
  );
}
