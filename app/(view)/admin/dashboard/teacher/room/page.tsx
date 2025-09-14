"use client"

import Loading from "@/app/components/Loading";
import { lazy, Suspense } from "react";

const RoomComponent = lazy(() => import("./RoomComponent"));

export default function Room() {
    return (
        <Suspense fallback={<Loading />}>
            <RoomComponent />
        </Suspense>
    );
}