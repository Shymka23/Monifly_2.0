"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const schema = z
  .object({
    password: z.string().min(8, "Пароль має бути не менше 8 символів"),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Паролі не співпадають",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast({
        title: "Помилка!",
        description: "Токен для скидання паролю не знайдено",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Помилка при зміні паролю");
      }

      toast({
        title: "Успішно!",
        description: "Ваш пароль було успішно змінено",
      });

      router.push("/login");
    } catch (error) {
      toast({
        title: "Помилка!",
        description:
          error instanceof Error ? error.message : "Щось пішло не так",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">
            {t("resetPassword.invalidToken")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("resetPassword.invalidTokenDescription")}
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push("/forgot-password")}
          >
            {t("resetPassword.requestNewToken")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t("resetPassword.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("resetPassword.description")}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Input
              {...register("password")}
              type="password"
              placeholder={t("resetPassword.newPasswordPlaceholder")}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Input
              {...register("confirmPassword")}
              type="password"
              placeholder={t("resetPassword.confirmPasswordPlaceholder")}
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? t("resetPassword.resetting")
              : t("resetPassword.resetButton")}
          </Button>
        </form>
      </div>
    </div>
  );
}
