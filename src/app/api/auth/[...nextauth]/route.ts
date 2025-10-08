import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { config } from "@/lib/env";
import api from "@/lib/api";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Введіть email та пароль");
        }

        try {
          const loginData = {
            email: credentials.email,
            password: credentials.password,
          };

          logger.info("Attempting login with:", { email: loginData.email });

          const response = await api.post("/auth/login", loginData);

          const { data } = response.data;
          const { user, accessToken } = data;

          if (user && accessToken) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.avatar,
              accessToken,
            };
          }

          return null;
        } catch (error) {
          const apiError = error as {
            response?: {
              data?: { message?: string };
              status?: number;
            };
          };
          const errorMessage =
            apiError.response?.data?.message || "Помилка входу";
          logger.error("Login failed:", {
            error: errorMessage,
            response: apiError.response?.data,
            status: apiError.response?.status,
          });
          throw new Error(errorMessage);
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: config.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
