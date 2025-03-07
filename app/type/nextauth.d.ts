import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      user_id: string; // 🔹 Gunakan `user_id` sebagai primary key
      username: string;
      email: string;
      role: string;
      program_id: string | null;
      imageUrl: string | null;
    };
  }

  interface User {
    user_id: string;
    username: string;
    email: string;
    role: string;
    program_id: string | null;
    imageUrl: string | null;
  }
}
