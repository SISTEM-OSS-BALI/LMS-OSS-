"use client";

import Loading from "@/app/components/Loading";
import { Suspense, lazy } from "react";

const CourseFollowedComponent = lazy(() => import("./CourseFollowedComponent"));

export default function CourseFollowed() {
  <Suspense fallback={<Loading />}>
    <CourseFollowedComponent />
  </Suspense>;
}
