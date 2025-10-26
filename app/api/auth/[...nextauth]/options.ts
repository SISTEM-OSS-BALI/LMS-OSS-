import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
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
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password || "";

        if (!email || !password) {
          throw new Error("Email dan Password harus diisi");
        }

        const user = await prisma.user.findFirst({
          where: { email },
          orderBy: [
            { is_active: "desc" },
            { createdAt: "desc" },
          ],
        });

        // 2) Kalau tidak ada → error login umum
        if (!user) {
          throw new Error("Email atau Password salah");
        }

        // 3) Kalau belum diverifikasi
        if (!user.is_verified) {
          throw new Error("Email belum diverifikasi");
        }

        // 4) Kalau non-aktif
        if (!user.is_active) {
          throw new Error("Akun dinonaktifkan");
        }

        // 5) Validasi password
        if (!user.password) {
          // jaga-jaga bila kolommu bernama password_hash di schema
          throw new Error("Kredensial tidak valid");
        }
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
          throw new Error("Email atau Password salah");
        }

        // 6) Return payload user ke token
        return {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          role: user.role as Role,
          program_id: user.program_id,
          name_group: user.name_group,
        } as any;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user_id = user.user_id;
        token.username = user.username;
        token.email = user.email;
        token.role = user.role;
        token.program_id = user.program_id;
        token.name_group = user.name_group;
        token.imageUrl = (user as any).imageUrl ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      // optional: refresh sebagian field dari DB
      const dbUser = await prisma.user.findUnique({
        where: { user_id: token.user_id as string },
        select: {
          username: true,
          email: true,
          role: true,
          imageUrl: true,
          name_group: true,
        },
      });

      session.user = {
        user_id: token.user_id as string,
        username: dbUser?.username || (token.username as string),
        email: dbUser?.email || (token.email as string) || "",
        role: (dbUser?.role || token.role) as string,
        program_id: (token.program_id as string) ?? null,
        imageUrl: dbUser?.imageUrl ?? (token as any).imageUrl ?? null,
        name_group: dbUser?.name_group ?? (token as any).name_group ?? null,
      };

      return session;
    },
  },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};
