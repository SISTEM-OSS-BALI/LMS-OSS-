"use client"

import Loading from "@/app/components/Loading"
import { lazy, Suspense } from "react"

const AdminTeacherComponent = lazy(() => import("./AdminTeacherComponent"))

export default function AdminTeacher() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminTeacherComponent />
    </Suspense>
  )
}