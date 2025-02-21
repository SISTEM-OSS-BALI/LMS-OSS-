"use client"

import Loading from "@/app/components/Loading"
import { Suspense, lazy } from "react"

const BasePlacementDetailComponent = lazy(
  () => import("./BasePlacementDetailComponent")
);

export default function BasePlacementDetail() {
    return (
        <Suspense fallback={<Loading />}>
            <BasePlacementDetailComponent />
        </Suspense>
    )
}