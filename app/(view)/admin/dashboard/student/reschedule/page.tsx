"use client"

import Loading from "@/app/components/Loading";
import { lazy, Suspense } from "react";

const RescheduleComponent = lazy(() => import("./RescheduleComponent"));
export default function ReschedulePage() {
    return (
        <Suspense fallback={<Loading />}>
            <RescheduleComponent />
        </Suspense>
    );
}