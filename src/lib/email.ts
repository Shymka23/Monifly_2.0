import nodemailer from "nodemailer";
import { config } from "@/lib/env";
import { EmailError } from "@/lib/errors";

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }[];
  priority?: "high" | "normal" | "low";
}

let transporter: nodemailer.Transporter | null = null;

function initializeTransporter() {
  if (!config.GMAIL_USER || !config.GMAIL_APP_PASSWORD) {
    console.warn(
      "Email service not fully configured. GMAIL_USER or GMAIL_APP_PASSWORD is missing."
    );
    transporter = null;
    return;
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.GMAIL_USER,
      pass: config.GMAIL_APP_PASSWORD,
    },
    pool: true, // Enable connection pooling
    maxConnections: 5, // Max number of connections in the pool
    maxMessages: 100, // Max messages to send using a single connection
    rateLimit: 5, // Max messages to send in 1 second
  });

  transporter
    .verify()
    .then(() => console.log("Email service is ready"))
    .catch(error => console.error("Email service verification failed:", error));
}

initializeTransporter(); // Initialize on startup

export const sendEmail = async (options: EmailOptions) => {
  if (!transporter) {
    console.error("Email service is not initialized. Cannot send email.");
    throw new EmailError(
      "Email service is not initialized",
      "SERVICE_UNAVAILABLE"
    );
  }

  const message = {
    from: config.SMTP_FROM || config.GMAIL_USER,
    to: options.to,
    subject: options.subject,
    html: options.html,
    attachments: options.attachments,
    priority: options.priority,
    headers: {
      "X-Priority":
        options.priority === "high"
          ? "1"
          : options.priority === "low"
          ? "5"
          : "3",
      "X-MSMail-Priority": options.priority?.toUpperCase() || "NORMAL",
      Importance:
        options.priority === "high"
          ? "high"
          : options.priority === "low"
          ? "low"
          : "normal",
    },
  };

  try {
    // Відправка
    const info = await transporter.sendMail(message);

    console.log("Email sent successfully:", {
      messageId: info.messageId,
      envelope: info.envelope,
      accepted: info.accepted,
      rejected: info.rejected,
    });
    return info;
  } catch (error: unknown) {
    if (error instanceof Error) {
      if ("responseCode" in error && typeof error.responseCode === "number") {
        if (error.responseCode >= 400 && error.responseCode < 500) {
          throw new EmailError(
            `Client error sending email: ${error.message}`,
            "CLIENT_ERROR",
            error
          );
        } else if (error.responseCode >= 500) {
          throw new EmailError(
            `Server error sending email: ${error.message}`,
            "SERVER_ERROR",
            error
          );
        }
      }
      if (error.message.includes("Invalid login")) {
        throw new EmailError(
          "Невірні облікові дані Gmail",
          "AUTH_ERROR",
          error
        );
      }
      if (error.message.includes("rate limit")) {
        throw new EmailError(
          "Перевищено ліміт відправки листів",
          "RATE_LIMIT_EXCEEDED",
          error
        );
      }
    }
    throw new EmailError("Помилка при відправці email", "UNKNOWN_ERROR", error);
  }
};
