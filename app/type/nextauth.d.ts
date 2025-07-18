import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      user_id: string; 
      username: string;
      email: string;
      role: string;
      program_id: string | null;
      imageUrl: string | null;
      name_group: string | null
    };
    accessToken?: string;
  }

  interface User {
    user_id: string;
    username: string;
    email: string;
    role: string;
    program_id: string | null;
    imageUrl: string | null;
    name_group: string | null
  }
}
