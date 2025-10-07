import { z } from "zod";

const envSchema = z.object({
  // API
  NEXT_PUBLIC_API_URL: z.string().url("Invalid API URL"),

  // Auth
  NEXTAUTH_URL: z.string().url("Invalid NextAuth URL"),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NextAuth secret should be at least 32 characters")
    .optional(),
  NEXT_PUBLIC_DEFAULT_LOGIN_PROVIDER: z
    .enum(["credentials", "google"])
    .default("credentials"),

  // AI Features
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required").optional(),
});

const env = envSchema.safeParse({
  ...process.env,
  NEXT_PUBLIC_API_URL:
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000/api/v1",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  NEXT_PUBLIC_DEFAULT_LOGIN_PROVIDER:
    process.env.NEXT_PUBLIC_DEFAULT_LOGIN_PROVIDER || "credentials",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || undefined,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || undefined,
});

if (!env.success) {
  // Під час білду не кидаємо помилку, тільки логуємо
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `Invalid environment variables: ${JSON.stringify(
        env.error.format(),
        null,
        2
      )}`
    );
  }
} else {
  // Перевіряємо обов'язкові змінні під час рантайму
  if (typeof window === "undefined" && process.env.NODE_ENV === "production") {
    if (!env.data.NEXTAUTH_SECRET) {
      console.error("NEXTAUTH_SECRET is required in production");
    }
    if (!env.data.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not set, AI features will be disabled");
    }
  }
}

export const config = env.success
  ? env.data
  : {
      NEXT_PUBLIC_API_URL:
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000/api/v1",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
      NEXTAUTH_SECRET:
        process.env.NEXTAUTH_SECRET || "default-secret-change-in-production",
      NEXT_PUBLIC_DEFAULT_LOGIN_PROVIDER: "credentials" as const,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
    };
