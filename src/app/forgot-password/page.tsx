"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const schema = z.object({
  email: z.string().email("Невірний формат email"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Помилка при відправці запиту");
      }

      toast({
        title: "Успішно!",
        description: "Інструкції для скидання паролю відправлені на вашу пошту",
      });
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t("forgotPassword.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("forgotPassword.description")}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Input
              {...register("email")}
              type="email"
              placeholder={t("forgotPassword.emailPlaceholder")}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? t("forgotPassword.sending")
              : t("forgotPassword.sendButton")}
          </Button>
        </form>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-primary hover:text-primary/90"
          >
            {t("forgotPassword.backToLogin")}
          </Link>
        </div>
      </div>
    </div>
  );
}
