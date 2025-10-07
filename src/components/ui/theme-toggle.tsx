"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { t } = useTranslation();
  const [isDark, setIsDark] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const handleToggle = () => {
    setIsAnimating(true);
    setIsDark(!isDark);
    setTimeout(() => setIsAnimating(false), 400);
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "hidden sm:flex items-center justify-center relative",
        "w-12 h-6 rounded-full overflow-hidden",
        "bg-gradient-to-br from-background/90 to-muted/30",
        "backdrop-blur-md border border-border/40",
        "shadow-modern hover:shadow-md",
        "transition-all duration-300 ease-out",
        "hover:scale-105 hover:border-primary/30",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1",
        "group cursor-pointer",
        isAnimating && "animate-pulse"
      )}
      aria-label={isDark ? t("theme.light") : t("theme.dark")}
      title={isDark ? t("theme.light") : t("theme.dark")}
      type="button"
    >
      {/* Background track */}
      <div
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-300 ease-out",
          isDark
            ? "bg-gradient-to-r from-yellow-400/30 to-orange-400/20"
            : "bg-gradient-to-r from-blue-400/30 to-indigo-400/20"
        )}
      />

      {/* Glow effect */}
      <div
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-300 ease-out",
          "theme-toggle-glow"
        )}
      />

      {/* Toggle thumb */}
      <div
        className={cn(
          "absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 ease-out",
          "bg-gradient-to-br shadow-md",
          "flex items-center justify-center",
          isDark
            ? "left-6 bg-gradient-to-br from-yellow-400 to-orange-400"
            : "left-0.5 bg-gradient-to-br from-blue-400 to-indigo-400"
        )}
      >
        {isDark ? (
          <Sun
            className={cn(
              "h-2.5 w-2.5 transition-all duration-300 ease-out",
              "text-white drop-shadow-sm",
              isAnimating && "animate-spin"
            )}
          />
        ) : (
          <Moon
            className={cn(
              "h-2.5 w-2.5 transition-all duration-300 ease-out",
              "text-white drop-shadow-sm",
              isAnimating && "animate-bounce"
            )}
          />
        )}
      </div>

      {/* Ripple effect on click */}
      {isAnimating && (
        <>
          <div
            className={cn(
              "absolute inset-0 rounded-full",
              "bg-gradient-to-br from-primary/20 to-transparent",
              "animate-ping"
            )}
          />
          <div
            className={cn(
              "absolute inset-0 rounded-full",
              "bg-gradient-to-br from-primary/10 to-transparent",
              "animate-ping"
            )}
            style={{ animationDelay: "0.1s" }}
          />
        </>
      )}
    </button>
  );
}
