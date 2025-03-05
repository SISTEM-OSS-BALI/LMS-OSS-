"use client";

import { useSession } from "next-auth/react";

export const useAuth = () => {
  const { data: session } = useSession();

  return {
    isLoggedIn: !!session?.user, 
    userId: session?.user?.user_id || null,
    username: session?.user?.name || null,
    role: session?.user?.role || null,
    program_id: session?.user?.program_id || null,
  };
};
