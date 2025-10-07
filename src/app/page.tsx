"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetWiseLogo } from "@/components/icons/logo";
import Link from "next/link";
import {
  LogIn,
  UserPlus,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Star,
  Shield,
  Zap,
  BarChart3,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const { t } = useTranslation(["landing"]);

  const [isClient, setIsClient] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setIsClient(true);
    setYear(new Date().getFullYear());
  }, []);

  const features = [
    {
      icon: BarChart3,
      title: "Аналітика",
      description: "Отримуйте детальну аналітику та звіти про ваші фінанси",
    },
    {
      icon: Wallet,
      title: "Управління гаманцями",
      description: "Керуйте всіма вашими гаманцями в одному місці",
    },
    {
      icon: TrendingUp,
      title: "Фінансові цілі",
      description: "Встановлюйте та досягайте фінансових цілей",
    },
    {
      icon: Shield,
      title: "Безпека",
      description: "Ваші дані надійно захищені",
    },
  ];

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 p-4 animate-fade-in">
        <div className="container mx-auto flex flex-col items-center justify-center min-h-screen">
          <Card className="w-full max-w-4xl glass shadow-modern border-border/50">
            <CardHeader className="text-center p-8 lg:p-12">
              <div className="mx-auto mb-6">
                <BudgetWiseLogo />
              </div>
              <Skeleton className="h-12 w-3/4 mx-auto rounded-xl" />
              <Skeleton className="h-6 w-full max-w-md mx-auto mt-4 rounded-lg" />
            </CardHeader>
            <CardContent className="p-8 lg:p-12 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
              </div>
              <Separator className="my-8" />
              <div className="flex justify-center gap-4">
                <Skeleton className="h-12 w-36 rounded-xl" />
                <Skeleton className="h-12 w-36 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 selection:bg-primary/20 selection:text-primary">
      <div className="container-fluid py-8 lg:py-16">
        {/* Hero Section */}
        <div className="text-center space-y-8 mb-16 lg:mb-24 animate-fade-in">
          <div className="mx-auto mb-8 animate-float">
            <BudgetWiseLogo className="h-16 w-48 lg:h-20 lg:w-60" />
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-responsive-xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-slide-in-left">
              Розумне управління фінансами
            </h1>
            <p
              className="text-responsive-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-slide-in-right"
              style={{ animationDelay: "0.2s" }}
            >
              Візьміть під контроль свої фінанси з Monifly
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl glass border border-border/30 hover-lift animate-scale-in"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 hidden lg:block">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Card */}
        <Card
          className="w-full max-w-5xl mx-auto glass shadow-modern border-border/50 overflow-hidden animate-scale-in"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

          <CardHeader className="relative z-10 text-center p-8 lg:p-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              <CardTitle className="text-responsive-lg font-bold tracking-tight text-foreground">
                {t("pricing.title")}
              </CardTitle>
              <Sparkles className="h-6 w-6 text-accent animate-pulse" />
            </div>
          </CardHeader>

          <CardContent className="relative z-10 p-8 lg:p-12 space-y-12">
            {/* Pricing Cards */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Free Tier */}
              <div className="space-y-6 p-6 lg:p-8 rounded-3xl glass border border-green-200/50 bg-gradient-to-br from-green-50/50 to-green-100/30 dark:from-green-900/20 dark:to-green-800/10 dark:border-green-800/30 hover-lift">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400 text-sm font-medium">
                    <CheckCircle className="h-4 w-4" />
                    {t("pricing.free.title")}
                  </div>
                  <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                    {t("pricing.free.title")}
                  </div>
                </div>

                <ul className="space-y-3">
                  {[
                    t("pricing.free.features.1"),
                    t("pricing.free.features.2"),
                    t("pricing.free.features.3"),
                    t("pricing.free.features.4"),
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Premium Tier */}
              <div className="relative space-y-6 p-6 lg:p-8 rounded-3xl glass border border-accent/50 bg-gradient-to-br from-accent/5 to-accent/10 hover-lift">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1 rounded-full bg-gradient-to-r from-accent to-primary text-white text-xs font-medium flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {t("pricing.pro.popular")}
                  </div>
                </div>

                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium border border-accent/20">
                    <Zap className="h-4 w-4" />
                    {t("pricing.pro.title")}
                  </div>
                  <div className="text-3xl font-bold text-accent">
                    {t("pricing.pro.price")}
                  </div>
                </div>

                <ul className="space-y-3">
                  {[
                    t("pricing.pro.features.1"),
                    t("pricing.pro.features.2"),
                    t("pricing.pro.features.3"),
                    t("pricing.pro.features.4"),
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Separator className="my-12" />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <Button
                asChild
                size="lg"
                className={cn(
                  "w-full sm:w-auto px-8 py-6 text-base font-semibold",
                  "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90",
                  "text-primary-foreground shadow-lg hover:shadow-xl",
                  "transition-all duration-300 hover:scale-105",
                  "group"
                )}
              >
                <Link href="/login" className="flex items-center gap-2">
                  <LogIn className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  {t("hero.login")}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className={cn(
                  "w-full sm:w-auto px-8 py-6 text-base font-semibold",
                  "border-2 border-accent/30 text-accent hover:bg-accent/10",
                  "hover:border-accent/50 transition-all duration-300 hover:scale-105",
                  "group"
                )}
              >
                <Link href="/signup" className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  {t("hero.signup")}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer
          className="mt-16 lg:mt-24 text-center text-muted-foreground text-sm space-y-2 animate-fade-in"
          style={{ animationDelay: "1s" }}
        >
          <p className="font-medium">
            &copy; {year} Monifly. {t("footer.rights")}.
          </p>
          <p className="text-xs">
            {t("footer.poweredBy")} Next.js {t("footer.and")} Firebase Studio.
          </p>
        </footer>
      </div>
    </div>
  );
}
