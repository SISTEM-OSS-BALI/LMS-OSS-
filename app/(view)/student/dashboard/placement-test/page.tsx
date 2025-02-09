"use client";

import Loading from "@/app/components/Loading";
import { Suspense, lazy } from "react";

const PlacementTestComponent = lazy(() => import("./PlacementTestComponent"));

export default function PlacementTest() {
    return (
        <Suspense fallback={<Loading />}>
            <PlacementTestComponent />
        </Suspense>
    );
}