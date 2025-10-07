"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BudgetWiseLogo } from "@/components/icons/logo";
import { Loader2, UserPlus, Chrome, Mail, KeyRound, Apple } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface SignUpFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const validateForm = (values: SignUpFormValues) => {
  const errors: Record<string, string> = {};

  if (!values.firstName.trim()) {
    errors.firstName = "Пожалуйста, введите ваше имя.";
  }

  if (!values.email.trim()) {
    errors.email = "Адрес электронной почты обязателен.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email =
      "Пожалуйста, введите действительный адрес электронной почты.";
  }

  if (values.password.length < 8) {
    errors.password = "Пароль должен содержать не менее 8 символов.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Пожалуйста, подтвердите ваш пароль.";
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Пароли не совпадают.";
  }

  return errors;
};

export default function SignUpPage() {
  const { t } = useTranslation(["auth"]);

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<SignUpFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: SignUpFormValues) {
    const errors = validateForm(values);

    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([field, message]) => {
        form.setError(field as keyof SignUpFormValues, { message });
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call for registration
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsLoading(false);
    toast({
      title: t("signup.success.title"),
      description: t("signup.success.description"),
    });
    form.reset();
  }

  const handleSocialSignUp = (provider: string) => {
    toast({
      title: t("signup.oauth.title", { provider }),
      description: t("signup.oauth.description"),
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4 selection:bg-primary/20 selection:text-primary">
      <Card className="w-full max-w-md shadow-2xl overflow-hidden border-primary/20">
        <CardHeader className="text-center space-y-3 p-6 bg-card">
          <Link href="/" className="inline-block mx-auto group">
            <BudgetWiseLogo />
          </Link>
          <CardTitle className="text-2xl sm:text-3xl font-bold flex items-center justify-center text-primary">
            <UserPlus className="mr-2 h-6 w-6 sm:h-7 sm:w-7" />
            {t("signup.title")}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm sm:text-base">
            {t("signup.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("signup.firstName")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("signup.lastName")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("signup.email")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="email" {...field} className="pl-8" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("signup.password")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          className="pl-8"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("signup.confirmPassword")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          className="pl-8"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full text-base py-3"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-5 w-5" />
                )}
                {t("signup.submit")}
              </Button>
            </form>
          </Form>

          <div className="my-6 flex items-center">
            <Separator className="flex-grow" />
            <span className="mx-3 text-xs text-muted-foreground uppercase">
              {t("signup.or")}
            </span>
            <Separator className="flex-grow" />
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full text-base py-3"
              onClick={() => handleSocialSignUp("Google")}
            >
              <Chrome className="mr-2 h-5 w-5" />
              {t("signup.continueWith", { provider: "Google" })}
            </Button>
            <Button
              variant="outline"
              className="w-full text-base py-3"
              onClick={() => handleSocialSignUp("Apple")}
            >
              <Apple className="mr-2 h-5 w-5" />
              {t("signup.continueWith", { provider: "Apple" })}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-center justify-center text-sm p-6 border-t">
          <p className="text-muted-foreground">
            {t("signup.alreadyHaveAccount")}{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              {t("signup.loginLink")}
            </Link>
          </p>
          <div className="mt-4 border-t pt-3 w-full space-y-2">
            <p className="font-medium text-foreground text-center">
              {t("signup.availablePlans")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-center text-xs">
              <div className="border rounded-lg p-2">
                <h4 className="font-semibold">{t("signup.basic.title")}</h4>
                <p className="font-bold">{t("signup.basic.price")}</p>
                <p className="text-muted-foreground">
                  {t("signup.basic.features")}
                </p>
              </div>
              <div className="border-2 border-primary rounded-lg p-2 relative">
                <Badge
                  variant="destructive"
                  className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0 text-[10px]"
                >
                  {t("signup.pro.badge")}
                </Badge>
                <h4 className="font-semibold text-primary">
                  {t("signup.pro.title")}
                </h4>
                <p className="font-bold">{t("signup.pro.price")}</p>
                <p className="text-muted-foreground">
                  {t("signup.pro.priceMonthly")}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              {t("signup.plansNote")}
            </p>
          </div>
          <Separator className="my-4" />
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>
              {t("signup.agreement", {
                terms: (
                  <Link href="/terms" className="underline hover:text-primary">
                    {t("signup.termsOfUse")}
                  </Link>
                ),
                privacy: (
                  <Link
                    href="/privacy"
                    className="underline hover:text-primary"
                  >
                    {t("signup.privacyPolicy")}
                  </Link>
                ),
              })}
            </p>
          </div>
        </CardFooter>
      </Card>
      <footer className="mt-8 text-center text-muted-foreground text-xs">
        <p>
          &copy; {new Date().getFullYear()} Monifly. {t("signup.footer.rights")}
        </p>
      </footer>
    </div>
  );
}
