"use client"

import Loading from "@/app/components/Loading"
import { lazy, Suspense } from "react"


const ActivityComponent = lazy(() => import("./ContentComponent"))
export default function Activity() {
    return (
        <Suspense fallback={<Loading />}>
            <ActivityComponent />
        </Suspense>
    )
}