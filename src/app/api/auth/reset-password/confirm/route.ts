import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { config } from "@/lib/env";
import {
  ValidationError,
  NotFoundError,
  AuthError,
  handleError,
} from "@/lib/errors";

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8, "Пароль повинен містити мінімум 8 символів"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = resetPasswordSchema.parse(body);

    // Перевірка токену
    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT_SECRET) as {
        userId: string;
        email: string;
        type: string;
      };
    } catch (error) {
      throw new AuthError("Недійсний або прострочений токен");
    }

    // Перевірка типу токену
    if (decoded.type !== "password-reset") {
      throw new AuthError("Недійсний тип токену");
    }

    // Пошук користувача
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
        email: decoded.email,
      },
    });

    if (!user) {
      throw new NotFoundError("Користувача не знайдено");
    }

    // Хешування нового паролю
    const hashedPassword = await bcrypt.hash(password, 10);

    // Оновлення паролю
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json(
      { message: "Пароль успішно оновлено" },
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
