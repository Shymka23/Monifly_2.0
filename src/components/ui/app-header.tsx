"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { BudgetWiseLogo } from "@/components/icons/logo";
import {
  Home,
  Settings,
  Bitcoin as BitcoinIcon,
  Target,
  MessageCircle,
  Landmark as DebtIcon,
  Briefcase,
  CalendarClock,
  PanelLeft,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBudgetStore } from "@/hooks/use-budget-store";
import { useTranslation } from "@/hooks/use-translation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import UserAuthMenu from "@/components/ui/user-auth-menu";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

const AVAILABLE_CURRENCIES = [
  "RUB",
  "USD",
  "EUR",
  "UAH",
  "GBP",
  "JPY",
  "CAD",
  "AUD",
  "CHF",
  "CNY",
  "INR",
  "PLN",
  "TRY",
  "KZT",
  "BYN",
];

const menuItems = [
  { href: "/dashboard", labelKey: "navigation.dashboard", icon: Home },
  { href: "/budgeting", labelKey: "navigation.budgeting", icon: CalendarClock },
  {
    href: "/life-goals",
    labelKey: "navigation.lifeGoals",
    icon: Target,
  },
  { href: "/debts", labelKey: "navigation.debts", icon: DebtIcon },
  {
    href: "/ai-assistant",
    labelKey: "navigation.aiAssistant",
    icon: MessageCircle,
  },
  {
    href: "/crypto-portfolio",
    labelKey: "navigation.crypto",
    icon: BitcoinIcon,
  },
  {
    href: "/investment-portfolio",
    labelKey: "navigation.investment",
    icon: Briefcase,
  },
];

export function SidebarNav() {
  const { t } = useTranslation();
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex flex-col w-64 xl:w-72 min-h-screen py-6 px-4 glass border-r border-border/50">
      <div className="flex flex-col items-stretch gap-2">
        {menuItems.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({
                variant: pathname.startsWith(item.href) ? "secondary" : "ghost",
                size: "default",
              }),
              "justify-start gap-3 h-12 px-4 text-left font-medium",
              "transition-all duration-300 hover:scale-[1.02]",
              "animate-fade-in",
              pathname.startsWith(item.href)
                ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                : "hover:bg-muted/50 hover:text-foreground"
            )}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <item.icon className="h-5 w-5 transition-all duration-300" />
            <span className="flex-1">{t(item.labelKey)}</span>
          </Link>
        ))}
        <Link
          href="/settings"
          className={cn(
            buttonVariants({
              variant: pathname.startsWith("/settings") ? "secondary" : "ghost",
              size: "default",
            }),
            "justify-start gap-3 h-12 px-4 text-left font-medium",
            "transition-all duration-300 hover:scale-[1.02]",
            "animate-fade-in",
            pathname.startsWith("/settings")
              ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
              : "hover:bg-muted/50 hover:text-foreground"
          )}
          style={{ animationDelay: `${menuItems.length * 0.1}s` }}
        >
          <Settings className="h-5 w-5 transition-all duration-300" />
          <span className="flex-1">{t("navigation.settings")}</span>
        </Link>
      </div>
    </nav>
  );
}

export default function AppHeader() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { primaryDisplayCurrency, setPrimaryDisplayCurrency } = useBudgetStore(
    state => ({
      primaryDisplayCurrency: state.primaryDisplayCurrency,
      setPrimaryDisplayCurrency: state.setPrimaryDisplayCurrency,
    })
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/50 animate-slide-in-right">
      <div className="container-fluid">
        <div className="flex h-14 lg:h-16 items-center justify-between">
          {/* Left side - Logo and Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Logo - Hidden on mobile, visible on md+ */}
            <Link
              href="/"
              className="hidden sm:block focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <BudgetWiseLogo className="h-8 w-24 lg:h-10 lg:w-32 transition-all duration-500 relative z-10" />
              </div>
            </Link>

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="lg:hidden h-8 w-8 hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-105"
                >
                  <PanelLeft className="h-4 w-4" />
                  <span className="sr-only">{t("navigation.menu")}</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-80 p-0 bg-background/80 backdrop-blur-xl border-r border-border/50"
                hideCloseButton
              >
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between p-4 border-b border-border/20 bg-background/50">
                    <Link
                      href="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className="group transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                        <BudgetWiseLogo className="h-8 w-24 relative z-10" />
                      </div>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMobileMenuOpen(false)}
                      className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-all duration-300 hover:scale-105 hover:rotate-90"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">{t("navigation.close")}</span>
                    </Button>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col gap-2 p-4 flex-1 overflow-y-auto">
                    {menuItems.map((item, index) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          buttonVariants({
                            variant: "ghost",
                            size: "default",
                          }),
                          "justify-start gap-3 h-12 transition-all duration-300",
                          "animate-slide-in-left group",
                          "hover:scale-[1.02] active:scale-95",
                          pathname.startsWith(item.href)
                            ? "bg-primary/10 text-primary hover:bg-primary/20"
                            : "hover:bg-muted/80 hover:text-foreground"
                        )}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <item.icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                        <span className="font-medium">{t(item.labelKey)}</span>
                      </Link>
                    ))}
                    <Link
                      href="/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        buttonVariants({
                          variant: "ghost",
                          size: "default",
                        }),
                        "justify-start gap-3 h-12 transition-all duration-300",
                        "animate-slide-in-left group mt-2",
                        "hover:scale-[1.02] active:scale-95",
                        pathname.startsWith("/settings")
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : "hover:bg-muted/80 hover:text-foreground"
                      )}
                      style={{ animationDelay: `${menuItems.length * 0.05}s` }}
                    >
                      <Settings className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-90" />
                      <span className="font-medium">
                        {t("navigation.settings")}
                      </span>
                    </Link>
                  </nav>

                  {/* Mobile Footer */}
                  <div className="p-4 border-t border-border/20 bg-background/50">
                    <div className="flex items-center justify-between gap-3">
                      <LanguageSwitcher />
                      <Select
                        value={primaryDisplayCurrency}
                        onValueChange={value => {
                          setPrimaryDisplayCurrency(value);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs px-2 w-14 border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {AVAILABLE_CURRENCIES.map(currency => (
                            <SelectItem
                              key={currency}
                              value={currency}
                              className="text-xs"
                            >
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Mobile Logo */}
            <Link
              href="/"
              className="sm:hidden focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <BudgetWiseLogo className="h-6 w-16 relative z-10" />
              </div>
            </Link>
          </div>

          {/* Right side - Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <LanguageSwitcher />
            <Select
              value={primaryDisplayCurrency}
              onValueChange={setPrimaryDisplayCurrency}
            >
              <SelectTrigger className="h-8 text-xs px-2 w-14 border-border/50 bg-background/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {AVAILABLE_CURRENCIES.map(currency => (
                  <SelectItem
                    key={currency}
                    value={currency}
                    className="text-xs"
                  >
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <UserAuthMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
