"use client";

import React from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function AuthWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();

  const authRoutes = ["/", "/register"];
  const shouldWrap = !authRoutes.includes(pathname);

  useEffect(() => {
    if (shouldWrap) {
      const token = Cookies.get("token");
      if (!token) {
        router.push("/");
      }
    }
  }, [router, shouldWrap, pathname]);

  return <>{children}</>;
}
