"use client";

import { useTranslation } from "react-i18next";
import {
  SUPPORTED_LANGUAGES,
  LanguageCode,
  changeLanguage,
  getSupportedLanguage,
} from "@/lib/i18n-new";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleChangeLanguage = (lng: LanguageCode) => {
    changeLanguage(lng);
  };

  const currentLanguage =
    getSupportedLanguage(i18n.language) || SUPPORTED_LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 h-8 px-2 text-muted-foreground hover:text-foreground"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline-flex items-center gap-1">
            <span className="text-lg leading-none">{currentLanguage.flag}</span>
            <span className="font-medium">
              {currentLanguage.code.toUpperCase()}
            </span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {SUPPORTED_LANGUAGES.map(language => {
          const isSelected = i18n.language === language.code;
          return (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleChangeLanguage(language.code)}
              className={cn(
                "flex items-center justify-between",
                isSelected ? "bg-accent" : ""
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg leading-none">{language.flag}</span>
                <span className="font-medium">{language.name}</span>
              </div>
              {isSelected && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
