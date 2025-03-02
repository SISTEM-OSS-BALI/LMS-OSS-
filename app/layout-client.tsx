"use client";

import { SessionProvider } from "next-auth/react";
import AuthWrapper from "./lib/auth/authWrapper";
import DndWrapper from "./lib/utils/dndWrapper";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "react-quill/dist/quill.snow.css";

export default function LayoutClient({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SessionProvider>
      <AuthWrapper>
        <AntdRegistry>
          <DndWrapper>{children}</DndWrapper>
        </AntdRegistry>
      </AuthWrapper>
    </SessionProvider>
  );
}
