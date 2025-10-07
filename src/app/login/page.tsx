"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BudgetWiseLogo } from "@/components/icons/logo";
import {
  Loader2,
  LogIn,
  Mail,
  KeyRound,
  Chrome,
  Apple,
  Eye,
  EyeOff,
  MessageCircle,
  Send,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const socialProviders = [
  {
    id: "google",
    name: "Google",
    icon: Chrome,
    color: "text-[#4285F4] dark:text-[#4285F4]",
    className:
      "hover:bg-[#4285F4]/10 border-[#4285F4]/30 hover:border-[#4285F4]/50",
  },
  {
    id: "apple",
    name: "Apple",
    icon: Apple,
    color: "text-[#000000] dark:text-white",
    className:
      "hover:bg-black/10 dark:hover:bg-white/10 border-black/30 dark:border-white/30 hover:border-black/50 dark:hover:border-white/50",
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: Send,
    color: "text-[#229ED9] dark:text-[#229ED9]",
    className:
      "hover:bg-[#229ED9]/10 border-[#229ED9]/30 hover:border-[#229ED9]/50",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: MessageCircle,
    color: "text-[#25D366] dark:text-[#25D366]",
    className:
      "hover:bg-[#25D366]/10 border-[#25D366]/30 hover:border-[#25D366]/50",
  },
];

export default function LoginPage() {
  const { t } = useTranslation(["auth"]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard",
      redirect: false,
    });

    setLoading(false);
    if (res?.error) {
      setError(t("login.error"));
    } else {
      window.location.href = "/dashboard";
    }
  };

  const handleSocialLogin = (provider: string) => {
    signIn(provider, { callbackUrl: "/dashboard" });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4 selection:bg-primary/20 selection:text-primary">
      <Card className="w-full max-w-md shadow-2xl overflow-hidden border-primary/20">
        <CardHeader className="text-center space-y-3 p-6 bg-card">
          <Link href="/" className="inline-block mx-auto group">
            <BudgetWiseLogo />
          </Link>
          <CardTitle className="text-2xl sm:text-3xl font-bold flex items-center justify-center text-primary">
            <LogIn className="mr-2 h-6 w-6 sm:h-7 sm:w-7" />
            {t("login.title")}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm sm:text-base">
            {t("login.description")}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("login.email")}</Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="pl-8"
                  placeholder={t("login.emailPlaceholder")}
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("login.password")}</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  {t("login.forgotPassword")}
                </Link>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="pl-8 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-10 text-base font-medium"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-5 w-5" />
              )}
              {loading ? t("login.loading") : t("login.submit")}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <Separator className="flex-grow" />
            <span className="text-sm text-muted-foreground px-4">
              {t("login.or")}
            </span>
            <Separator className="flex-grow" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {socialProviders.map(provider => (
              <Button
                key={provider.id}
                type="button"
                variant="outline"
                className={`h-10 text-sm font-medium bg-background/50 transition-all duration-200 ${provider.className} group`}
                onClick={() => handleSocialLogin(provider.id)}
              >
                <provider.icon
                  className={`mr-2 h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${provider.color}`}
                />
                {provider.name}
              </Button>
            ))}
          </div>
        </CardContent>

        <CardFooter className="p-6 border-t border-border/50 flex flex-col items-center gap-6">
          <p className="text-sm text-muted-foreground">
            {t("login.noAccount")}{" "}
            <Link
              href="/signup"
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              {t("login.signupLink")}
            </Link>
          </p>
          <p className="text-xs text-muted-foreground/75">
            &copy; {new Date().getFullYear()} Monifly.{" "}
            {t("login.footer.rights")}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
