import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

/**
 * Verifies an email/password combination against the database.
 * Returns the safe user fields on success, or null on any failure
 * (wrong email, wrong password) — deliberately generic so the caller
 * can't distinguish "email doesn't exist" from "password is wrong".
 *
 * Extracted from the NextAuth config so it can be tested directly,
 * independent of NextAuth's request/session machinery.
 */
export async function verifyCredentials(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return null;
  }

  // Only return safe fields — never the password hash.
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        return verifyCredentials(credentials.email, credentials.password);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "CUSTOMER" | "ADMIN";
      }
      return session;
    },
  },
};