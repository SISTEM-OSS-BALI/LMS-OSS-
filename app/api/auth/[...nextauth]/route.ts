import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "email@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and Password are required");
        }

        // 🔹 Cari user berdasarkan email (gunakan `findFirst` karena `email` bukan Primary Key)
        const user = await prisma.user.findFirst({
          where: { email: credentials.email, is_verified: true },
        });

        if (user && !user.is_verified) {
          throw new Error("Akun belum aktif, silakan verifikasi email Anda");
        }

        if (
          !user ||
          !(await bcrypt.compare(credentials.password, user.password))
        ) {
          throw new Error("Invalid email or password");
        }

        return {
          user_id: user.user_id, // Gunakan `user_id` sesuai dengan Prisma
          name: user.username,
          email: user.email,
          role: user.role as Role,
          program_id: user.program_id,
        } as any; // 🔹 Gunakan `as any` untuk mengatasi TypeScript strict mode
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user_id = user.user_id; // 🔹 Gunakan `user_id`
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.program_id = user.program_id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        user_id: token.user_id as string, // 🔹 Gunakan `user_id`
        name: token.name as string,
        email: token.email as string,
        role: token.role as string,
        program_id: token.program as string | null,
      };
      return session;
    },
  },
  pages: {
    signIn: "/login", // Redirect ke halaman login jika belum login
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
