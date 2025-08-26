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
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan Password harus diisi");
        }

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email,
            is_verified: true,
            is_active: true,
          },
        });

        if (!user!.is_verified) {
          throw new Error("Email belum diverifikasi");
        }

        if (!user!.email) {
          throw new Error("Email belum terdaftar");
        }

        if (!(await bcrypt.compare(credentials.password, user!.password))) {
          throw new Error("Email atau Password salah");
        }

        return {
          user_id: user!.user_id,
          username: user!.username,
          email: user!.email,
          role: user!.role as Role,
          program_id: user!.program_id,
          name_group: user!.name_group,
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
      }
      return token;
    },
    async session({ session, token }) {
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
        email: dbUser?.email || token.email || "",
        role: dbUser?.role || (token.role as string),
        program_id: token.program_id as string | null,
        imageUrl:
          dbUser?.imageUrl ||
          (typeof token.imageUrl === "string" ? token.imageUrl : null) ||
          null,
        name_group:
          dbUser?.name_group ??
          (typeof token.name_group === "string" ? token.name_group : null),
      };

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
