import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      user_id: string; // 🔹 Gunakan `user_id` sebagai primary key
      name: string;
      email: string;
      role: string;
      program_id: string | null;
    };
  }

  interface User {
    user_id: string;
    name: string;
    email: string;
    role: string;
    program_id: string | null;
  }
}
