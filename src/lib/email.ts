import nodemailer from "nodemailer";
import { config } from "@/lib/env";

// Типи помилок
export class EmailError extends Error {
  constructor(message: string, public code: string, public details?: unknown) {
    super(message);
    this.name = "EmailError";
  }
}

// Перевіряємо, чи налаштована відправка емейлів
const isEmailConfigured = Boolean(config.GMAIL_USER && config.GMAIL_APP_PASSWORD);

// Створюємо транспортер тільки якщо є конфігурація
const transporter = isEmailConfigured
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.GMAIL_USER,
        pass: config.GMAIL_APP_PASSWORD,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 5,
    })
  : null;

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  priority?: "high" | "normal" | "low";
}

export async function sendEmail({
  to,
  subject,
  html,
  from,
  attachments,
  priority = "normal",
}: EmailOptions): Promise<nodemailer.SentMessageInfo | null> {
  // Якщо емейли не налаштовані, логуємо і повертаємо null
  if (!isEmailConfigured || !transporter) {
    console.log("Email service not configured. Would send:", {
      to,
      subject,
      priority,
    });
    return null;
  }

  try {
    // Перевірка з'єднання
    await transporter.verify();

    // Підготовка повідомлення
    const message = {
      from: {
        name: "Monifly",
        address: from || config.GMAIL_USER,
      },
      to,
      subject,
      html,
      attachments,
      priority,
      headers: {
        "X-Application-Name": "Monifly",
      },
    };

    // Відправка
    const info = await transporter.sendMail(message);

    console.log("Email sent successfully:", {
      messageId: info.messageId,
      to,
      subject,
    });

    return info;
  } catch (error) {
    console.error("Error sending email:", error);

    // Обробка специфічних помилок
    const smtpError = error as { code?: string; responseCode?: number };

    if (smtpError.code === "ECONNREFUSED") {
      throw new EmailError(
        "Не вдалося підключитися до поштового сервера",
        "CONNECTION_ERROR",
        error
      );
    }

    if (smtpError.code === "EAUTH") {
      throw new EmailError(
        "Помилка автентифікації. Перевірте налаштування SMTP",
        "AUTH_ERROR",
        error
      );
    }

    if (smtpError.responseCode && smtpError.responseCode >= 400) {
      throw new EmailError(
        "Помилка відправки. Перевірте правильність адреси отримувача",
        "DELIVERY_ERROR",
        error
      );
    }

    // Загальна помилка
    throw new EmailError("Помилка при відправці email", "UNKNOWN_ERROR", error);
  }
}

// Перевірка з'єднання при старті, якщо сервіс налаштований
if (isEmailConfigured && transporter) {
  transporter
    .verify()
    .then(() => console.log("Email service is ready"))
    .catch(error => console.error("Email service verification failed:", error));
} else {
  console.log("Email service is not configured");
}