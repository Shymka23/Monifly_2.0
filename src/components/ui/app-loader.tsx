"use client";

import { BudgetWiseLogo } from "@/components/icons/logo";
import { cn } from "@/lib/utils";

interface AppLoaderProps {
  className?: string;
  text?: string;
}

export function AppLoader({
  className,
  text = "Загрузка приложения...",
}: AppLoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[400px] w-full h-full gap-6 bg-transparent p-4",
        className
      )}
    >
      <div className="animate-soft-pulse">
        <BudgetWiseLogo />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
      </div>
      <p className="text-sm font-medium text-muted-foreground">{text}</p>
    </div>
  );
}
