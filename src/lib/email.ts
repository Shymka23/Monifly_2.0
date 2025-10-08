import nodemailer from "nodemailer";
import { config } from "@/lib/env";

// Типи помилок
interface SMTPError extends Error {
  code?: string;
  responseCode?: number;
  command?: string;
}

export class EmailError extends Error {
  constructor(message: string, public code: string, public details?: unknown) {
    super(message);
    this.name = "EmailError";
  }
}

// Конфігурація транспортера
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.GMAIL_USER,
    pass: config.GMAIL_APP_PASSWORD,
  },
  // Додаткові налаштування
  pool: true, // Використовувати пул з'єднань
  maxConnections: 5, // Максимальна кількість одночасних з'єднань
  maxMessages: 100, // Максимальна кількість повідомлень на з'єднання
  rateDelta: 1000, // Мінімальний час між відправками (мс)
  rateLimit: 5, // Максимальна кількість повідомлень за rateDelta
});

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
  from = config.GMAIL_USER,
  attachments,
  priority = "normal",
}: EmailOptions): Promise<nodemailer.SentMessageInfo> {
  try {
    // Перевірка з'єднання
    await transporter.verify();

    // Підготовка повідомлення
    const message = {
      from: {
        name: "Monifly",
        address: from,
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

    // Приводимо помилку до типу SMTPError
    const smtpError = error as SMTPError;

    // Обробка специфічних помилок
    if (smtpError.code === "ECONNREFUSED") {
      throw new EmailError(
        "Не вдалося підключитися до поштового сервера",
        "CONNECTION_ERROR",
        smtpError
      );
    }

    if (smtpError.code === "EAUTH") {
      throw new EmailError(
        "Помилка автентифікації. Перевірте налаштування SMTP",
        "AUTH_ERROR",
        smtpError
      );
    }

    if (smtpError.responseCode && smtpError.responseCode >= 400) {
      throw new EmailError(
        "Помилка відправки. Перевірте правильність адреси отримувача",
        "DELIVERY_ERROR",
        smtpError
      );
    }

    // Загальна помилка
    throw new EmailError("Помилка при відправці email", "UNKNOWN_ERROR", error);
  }
}

// Перевірка з'єднання при старті
transporter
  .verify()
  .then(() => console.log("Email service is ready"))
  .catch((error: Error) =>
    console.error("Email service verification failed:", error)
  );
