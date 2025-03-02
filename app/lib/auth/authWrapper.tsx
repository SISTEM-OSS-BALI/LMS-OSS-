"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthWrapper({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const authRoutes = ["/", "/register"];
  const shouldProtect = !authRoutes.includes(pathname);

  useEffect(() => {
    if (status === "loading") return; // 🔹 Jangan redirect sebelum sesi dimuat

    if (shouldProtect && !session) {
      router.push("/"); // 🔹 Redirect jika user belum login
    }
  }, [session, status, router, shouldProtect]);

  return <>{children}</>;
}
