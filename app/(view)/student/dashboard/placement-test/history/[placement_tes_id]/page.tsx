import Loading from "@/app/components/Loading";
import { Suspense, lazy } from "react";

const HistoryComponent = lazy(() => import("./HistoryComponent"));

export default function History() {
    return (
        <Suspense fallback={<Loading />}>
            <HistoryComponent />
        </Suspense>
    );
}   