"use client";

import Loading from "@/app/components/Loading";
import dynamic from "next/dynamic";
import { lazy, Suspense } from "react";

const ProgramClient = dynamic(() => import("./ProgramComponent"), {
  ssr: false,
});

export default function Program() {
  return (
    <Suspense fallback={<Loading />}>
      <ProgramClient />
    </Suspense>
  );
}
