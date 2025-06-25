"use client"

import Loading from "@/app/components/Loading";
import { Suspense, lazy } from "react";

const StatisticComponent = lazy(() => import("./StatisticComponent"));

export default function Page() {
    return (
        <Suspense fallback={<Loading />}>
            <StatisticComponent />
        </Suspense>
    )
}