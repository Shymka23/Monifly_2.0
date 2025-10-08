import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { config } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { ValidationError, NotFoundError, handleError } from "@/lib/errors";

// Схема валідації для запиту скидання паролю
const requestResetSchema = z.object({
  email: z.string().email("Невірний формат email"),
});

// Схема валідації для встановлення нового паролю
const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8, "Пароль повинен містити мінімум 8 символів"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = requestResetSchema.parse(body);

    // Пошук користувача
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundError("Користувача з таким email не знайдено");
    }

    // Створення токену для скидання паролю
    const resetToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        type: "password-reset",
      },
      config.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Формування посилання для скидання паролю
    const resetLink = `${config.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    // Відправка емейлу
    await sendEmail({
      to: user.email,
      subject: "Скидання паролю",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #00B3B3; text-align: center;">Скидання паролю</h1>
          <p>Ви отримали цей лист, тому що запросили скидання паролю для вашого облікового запису Monifly.</p>
          <p>Для встановлення нового паролю, будь ласка, натисніть на кнопку нижче:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #00B3B3; 
                      color: white; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 5px;
                      display: inline-block;">
              Скинути пароль
            </a>
          </div>
          <p>Посилання дійсне протягом 15 хвилин.</p>
          <p style="color: #666; font-size: 14px;">Якщо ви не запитували скидання паролю, проігноруйте цей лист.</p>
          <hr style="border: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            &copy; ${new Date().getFullYear()} Monifly. Всі права захищені.
          </p>
        </div>
      `,
    });

    return NextResponse.json(
      { message: "Інструкції для скидання паролю відправлені на вашу пошту" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Невірні дані", error.errors);
    }

    const { error: errorMessage, status } = handleError(error);
    return NextResponse.json({ error: errorMessage }, { status });
  }
}
