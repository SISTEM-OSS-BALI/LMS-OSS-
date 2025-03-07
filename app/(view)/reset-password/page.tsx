"use client";

import Loading from "@/app/components/Loading";
import { Suspense, lazy } from "react";

const ResetPasswordComponent = lazy(() => import("./ResetPasswordComponent"));

export default function ResetPassword() {
    return (
        <Suspense fallback={<Loading />}>
            <ResetPasswordComponent />
        </Suspense>
    );
}