"use client";

import { Suspense, lazy } from "react";

const ProfileComponent = lazy(() => import("./ProfileComponent"));

export default function Profile() {
  return (
    <Suspense>
      <ProfileComponent />
    </Suspense>
  );
}
