"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold">{t("landing.title")}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t("landing.description")}
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/login">{t("landing.login")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/signup">{t("landing.signup")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
