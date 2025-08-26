'use client' 

import Loading from "@/app/components/Loading";
import { lazy, Suspense } from "react";

const MyProgressComponent = lazy(() => import("./ProgressComponent"));

export default function MyProgress() {
    return (
        <Suspense fallback={<Loading />}>
            <MyProgressComponent />
        </Suspense>
    );
}

