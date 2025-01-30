"use client"

import Loading from "@/app/components/Loading"
import { lazy, Suspense } from "react"

const CourseComponent = lazy(() => import("./CourseComponent"))

export default function Courses() {
  return (
    <Suspense fallback={<Loading />}>
      <CourseComponent />
    </Suspense>
  )
}