import { z } from "zod";

// Define environment schema with defaults for development/build
const envSchema = z.object({
  DATABASE_URL: z.string().url("Invalid database URL"),
  NEXT_PUBLIC_API_URL: z.string().url("Invalid API URL"),
  NEXTAUTH_URL: z.string().url("Invalid NextAuth URL"),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NextAuth secret should be at least 32 characters")
    .default("dev-secret-please-change-me-32chars!"),
  NEXT_PUBLIC_DEFAULT_LOGIN_PROVIDER: z
    .enum(["credentials", "google"])
    .default("credentials"),
  GEMINI_API_KEY: z.string().optional().default(""),
  JWT_SECRET: z.string().min(32, "JWT secret should be at least 32 characters"),
  GMAIL_USER: z.string().email("Invalid Gmail address"),
  GMAIL_APP_PASSWORD: z.string(),
  NEXT_PUBLIC_APP_URL: z.string().url("Invalid app URL"),
});

// Parse and export config
export const config = envSchema.parse({
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/monifly",
  NEXT_PUBLIC_API_URL:
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000/api/v1",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXT_PUBLIC_DEFAULT_LOGIN_PROVIDER:
    process.env.NEXT_PUBLIC_DEFAULT_LOGIN_PROVIDER,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  JWT_SECRET: process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || "",
  SMTP_FROM: process.env.SMTP_FROM || "noreply@monifly.com",
  NEXT_PUBLIC_APP_URL:
    process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL,
});
