"use client";

import { useState, useEffect } from "react";
import type { Wallet, WalletIconName } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Banknote,
  Landmark,
  Bitcoin,
  CreditCard,
  PiggyBank,
  Coins,
  Gem,
  Briefcase,
  Wallet as WalletIconLucide,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "@/hooks/use-translation";

const iconMap: Record<WalletIconName, React.ElementType> = {
  Landmark,
  Wallet: WalletIconLucide,
  PiggyBank,
  CreditCard,
  Banknote,
  Coins,
  Bitcoin,
  Gem,
  Briefcase,
};

interface WalletCardProps {
  wallet: Wallet;
  onClick?: () => void;
  isSelected?: boolean;
}

const getWalletIcon = (wallet: Wallet) => {
  // Priority 1: Use the icon specified in the wallet object
  if (wallet.icon && iconMap[wallet.icon as WalletIconName]) {
    const IconComponent = iconMap[wallet.icon as WalletIconName];
    return (
      <IconComponent className="h-6 w-6 transition-all duration-300 group-hover:scale-110" />
    );
  }

  // Priority 2 (Fallback): Guess based on name and currency
  const lowerName = wallet.name.toLowerCase();
  const lowerCurrency = wallet.currency.toLowerCase();

  if (
    lowerCurrency === "btc" ||
    lowerCurrency === "eth" ||
    lowerName.includes("крипто") ||
    lowerName.includes("crypto")
  ) {
    return (
      <Bitcoin className="h-6 w-6 transition-all duration-300 group-hover:scale-110" />
    );
  }
  if (
    lowerName.includes("банк") ||
    lowerName.includes("счет") ||
    lowerName.includes("bank") ||
    lowerName.includes("account")
  ) {
    return (
      <Landmark className="h-6 w-6 transition-all duration-300 group-hover:scale-110" />
    );
  }
  if (lowerName.includes("карта") || lowerName.includes("card")) {
    return (
      <CreditCard className="h-6 w-6 transition-all duration-300 group-hover:scale-110" />
    );
  }
  if (
    lowerName.includes("наличные") ||
    lowerName.includes("кэш") ||
    lowerName.includes("cash")
  ) {
    return (
      <Banknote className="h-6 w-6 transition-all duration-300 group-hover:scale-110" />
    );
  }

  // Default fallback icon
  return (
    <Landmark className="h-6 w-6 transition-all duration-300 group-hover:scale-110" />
  );
};

export function WalletCard({ wallet, onClick, isSelected }: WalletCardProps) {
  const [isClient, setIsClient] = useState(false);
  const isMobile = useIsMobile();
  const [isActive, setIsActive] = useState(false);
  const { t } = useTranslation("common");

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleTouchEnd = () => {
    setIsActive(false);
    if (onClick) onClick();
  };
  const handleTouchStart = () => {
    setIsActive(true);
  };
  const handleTouchCancel = () => {
    setIsActive(false);
  };

  // Simulate growth percentage (in real app this would come from data)
  const growthPercentage =
    Math.random() > 0.5 ? Math.random() * 10 : -(Math.random() * 10);
  const isPositiveGrowth = growthPercentage > 0;

  if (!isClient) {
    return (
      <Card className="glass shadow-modern border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "group relative overflow-hidden glass shadow-modern hover-lift border-border/50",
        "transition-all duration-300 ease-out cursor-pointer",
        "hover:shadow-lg hover:border-primary/30",
        isSelected
          ? "ring-2 ring-primary shadow-lg shadow-primary/20 border-primary/50"
          : "",
        isActive && isMobile ? "scale-95 shadow-lg ring-2 ring-primary/60" : ""
      )}
      onClick={onClick}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchCancel={isMobile ? handleTouchCancel : undefined}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Color indicator stripe */}
      {wallet.color && (
        <div
          className="absolute top-0 left-0 right-0 h-1 opacity-70"
          style={{ background: wallet.color }}
        />
      )}

      <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {wallet.color && (
            <div
              className="w-3 h-3 rounded-full border border-white/20 shadow-sm animate-pulse"
              style={{ background: wallet.color }}
            />
          )}
          <CardTitle className="text-base lg:text-lg font-semibold text-foreground truncate">
            {wallet.name}
          </CardTitle>
        </div>

        <div className="p-2 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 text-primary group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300">
          {getWalletIcon(wallet)}
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-3">
        <div className="space-y-1">
          <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {formatCurrency(wallet.balance, wallet.currency)}
          </div>
          <div className="flex items-center justify-between">
            <CardDescription className="text-xs text-muted-foreground font-medium">
              {wallet.currency}
            </CardDescription>

            {/* Growth indicator */}
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                isPositiveGrowth
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              )}
            >
              {isPositiveGrowth ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(growthPercentage).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/20">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">{t("active")}</span>
        </div>
      </CardContent>
    </Card>
  );
}
