"use client";

import { useState, useEffect } from "react";
import { useBudgetStore } from "@/hooks/use-budget-store";
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BudgetWiseLogo } from "../icons/logo";
import { Loader2, KeyRound, Lock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function PinLockScreen() {
  const { userProfile, setAppPin, unlockApp } = useBudgetStore();
  const { toast } = useToast();

  const isSetupMode = !userProfile.appPin;

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError("");
    setIsLoading(true);

    if (isSetupMode) {
      if (pin.length < 4) {
        setError("Пин-код должен состоять минимум из 4 цифр.");
        setIsLoading(false);
        return;
      }
      if (pin !== confirmPin) {
        setError("Пин-коды не совпадают.");
        setIsLoading(false);
        return;
      }
      setTimeout(() => {
        setAppPin(pin);
        toast({
          title: "Пин-код установлен!",
          description: "Ваше приложение защищено.",
        });
      }, 500);
    } else {
      setTimeout(() => {
        const isUnlocked = unlockApp(pin);
        if (!isUnlocked) {
          setError("Неверный пин-код.");
          setPin("");
        }
        setIsLoading(false);
      }, 500);
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timer);
    }
    return;
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
      <Card
        className={cn(
          "w-full max-w-sm shadow-2xl border-primary/20 transition-all",
          error && "animate-shake"
        )}
      >
        <CardHeader className="text-center p-6">
          <div className="mx-auto mb-4 group">
            <BudgetWiseLogo />
          </div>
          <CardTitle className="text-2xl flex items-center justify-center">
            {isSetupMode ? (
              <ShieldCheck className="mr-2 h-6 w-6 text-primary" />
            ) : (
              <Lock className="mr-2 h-6 w-6 text-primary" />
            )}
            {isSetupMode ? "Защитите ваш аккаунт" : "Приложение заблокировано"}
          </CardTitle>
          <CardDescription>
            {isSetupMode
              ? "Создайте пин-код для быстрого и безопасного доступа к вашим данным."
              : "Пожалуйста, введите ваш пин-код."}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handlePinSubmit}>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="pin">
                {isSetupMode ? "Новый пин-код (минимум 4 цифры)" : "Пин-код"}
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="pin"
                  type="password"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="••••"
                  required
                  className="pl-8 text-center tracking-[0.5em]"
                  autoFocus
                />
              </div>
            </div>
            {isSetupMode && (
              <div className="space-y-2">
                <Label htmlFor="confirmPin">Подтвердите пин-код</Label>
                <div className="relative">
                  <KeyRound className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPin"
                    type="password"
                    value={confirmPin}
                    onChange={e => setConfirmPin(e.target.value)}
                    placeholder="••••"
                    required
                    className="pl-8 text-center tracking-[0.5em]"
                  />
                </div>
              </div>
            )}
            {error && (
              <p className="text-sm font-medium text-destructive text-center">
                {error}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-4 p-6">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isSetupMode ? (
                <ShieldCheck className="mr-2 h-4 w-4" />
              ) : (
                <Lock className="mr-2 h-4 w-4" />
              )}
              {isSetupMode ? "Установить пин-код" : "Разблокировать"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
