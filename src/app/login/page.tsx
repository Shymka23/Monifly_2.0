"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const schema = z.object({
  email: z.string().email("Невірний формат email"),
  password: z.string().min(8, "Пароль має бути не менше 8 символів"),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
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
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push("/dashboard");
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
          <h1 className="text-2xl font-bold">{t("login.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("login.description")}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Input
              {...register("email")}
              type="email"
              placeholder={t("login.emailPlaceholder")}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Input
              {...register("password")}
              type="password"
              placeholder={t("login.passwordPlaceholder")}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:text-primary/90"
            >
              {t("login.forgotPassword")}
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t("login.signingIn") : t("login.signIn")}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {t("login.noAccount")}{" "}
            <Link href="/signup" className="text-primary hover:text-primary/90">
              {t("login.signUp")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
