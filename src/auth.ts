import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/lib/auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        if (!email) return null;
        const user = await prisma.user.findUnique({
          where: { email: email.trim() },
        });
        if (!user) return null;
        const password = credentials?.password as string | undefined;
        if (process.env.NODE_ENV === "production" && process.env.DEMO_PASSWORD && password !== process.env.DEMO_PASSWORD) {
          return null;
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth: session, request }) {
      const pathname = request.nextUrl.pathname;
      if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) return true;
      if (session?.user) return true;
      const login = new URL("/login", request.url);
      login.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(login);
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as UserRole) ?? "SALES_REP";
      }
      return session;
    },
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  trustHost: true,
  secret: process.env.AUTH_SECRET || (process.env.NODE_ENV === "development" ? "dev-secret-change-in-production" : undefined),
});
