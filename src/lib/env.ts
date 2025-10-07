import { z } from "zod";

const envSchema = z.object({
  // API
  NEXT_PUBLIC_API_URL: z.string().url("Invalid API URL"),

  // Auth
  NEXTAUTH_URL: z.string().url("Invalid NextAuth URL"),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NextAuth secret should be at least 32 characters"),
  NEXT_PUBLIC_DEFAULT_LOGIN_PROVIDER: z
    .enum(["credentials", "google"])
    .default("credentials"),

  // AI Features
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
});

const env = envSchema.safeParse({
  ...process.env,
  NEXT_PUBLIC_API_URL:
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000/api/v1",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  NEXT_PUBLIC_DEFAULT_LOGIN_PROVIDER:
    process.env.NEXT_PUBLIC_DEFAULT_LOGIN_PROVIDER || "credentials",
});

if (!env.success) {
  throw new Error(
    `Invalid environment variables: ${JSON.stringify(
      env.error.format(),
      null,
      2
    )}`
  );
  process.exit(1);
}

export const config = env.data;
