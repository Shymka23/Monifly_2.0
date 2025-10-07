"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon } from "lucide-react";
import { useBudgetStore } from "@/hooks/use-budget-store";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import type { Debt, Wallet as WalletType, DebtPaymentData } from "@/lib/types";
import { Textarea } from "../ui/textarea";

interface RecordPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt;
  wallets: WalletType[];
  onRecordPayment: (paymentData: DebtPaymentData) => void;
}

export function RecordPaymentDialog({
  isOpen,
  onClose,
  debt,
  wallets,
  onRecordPayment,
}: RecordPaymentDialogProps) {
  const { toast } = useToast();
  const { convertCurrency } = useBudgetStore();

  const [amount, setAmount] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState<string | undefined>(
    wallets.length > 0 ? wallets[0].id : undefined
  );
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const remainingDebtAmount =
    (debt.initialAmount || 0) - (debt.paidAmount || 0);

  useEffect(() => {
    if (isOpen) {
      // Pre-fill amount with remaining debt if it's a reasonable positive value
      if (remainingDebtAmount > 0) {
        setAmount(remainingDebtAmount.toFixed(2)); // Default to full remaining amount
      } else {
        setAmount("");
      }
      setSelectedWalletId(wallets.length > 0 ? wallets[0].id : undefined);
      setPaymentDate(new Date());
      setNote("");
      setIsSubmitting(false);
    }
  }, [isOpen, debt, wallets, remainingDebtAmount]);

  const handleSubmit = () => {
    const paymentAmountNum = parseFloat(amount);
    if (
      !selectedWalletId ||
      isNaN(paymentAmountNum) ||
      paymentAmountNum <= 0 ||
      !paymentDate
    ) {
      toast({
        title: "Неверный ввод",
        description:
          "Пожалуйста, заполните все поля корректно. Сумма должна быть положительной.",
        variant: "destructive",
      });
      return;
    }

    if (paymentAmountNum > remainingDebtAmount + 0.001) {
      // Add small tolerance for float precision
      toast({
        title: "Сумма превышает остаток",
        description: `Сумма платежа не может превышать остаток по долгу (${formatCurrency(
          remainingDebtAmount,
          debt.currency
        )}).`,
        variant: "destructive",
      });
      return;
    }

    const selectedWallet = wallets.find(w => w.id === selectedWalletId);
    if (!selectedWallet) {
      toast({ title: "Кошелек не найден", variant: "destructive" });
      return;
    }

    // If paying a debt, check if wallet has enough balance (converted to debt currency)
    if (debt.type === "iOwe") {
      const paymentAmountInWalletCurrency = convertCurrency(
        paymentAmountNum,
        debt.currency,
        selectedWallet.currency
      );
      if (selectedWallet.balance < paymentAmountInWalletCurrency) {
        toast({
          title: "Недостаточно средств",
          description: `На кошельке "${
            selectedWallet.name
          }" недостаточно средств (${formatCurrency(
            selectedWallet.balance,
            selectedWallet.currency
          )}) для совершения платежа (${formatCurrency(
            paymentAmountInWalletCurrency,
            selectedWallet.currency
          )}).`,
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);
    const paymentData: DebtPaymentData = {
      id: `${debt.id}-${Date.now()}`,
      debtId: debt.id,
      amount: paymentAmountNum,
      currency: debt.currency,
      date: paymentDate.toISOString(),
      paymentAmount: paymentAmountNum,
      walletId: selectedWalletId,
      paymentDate: paymentDate.toISOString(),
      note: note.trim() || undefined,
    };

    onRecordPayment(paymentData);
    toast({
      title: "Платеж зарегистрирован",
      description: `Платеж по долгу успешно записан.`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CalendarIcon className="mr-2 h-6 w-6 text-primary" />
            {debt.type === "iOwe"
              ? "Запись об оплате долга"
              : "Запись о получении средств"}
          </DialogTitle>
          <DialogDescription>
            Кому: {debt.personName} ({debt.description}). <br />
            Остаток: {formatCurrency(remainingDebtAmount, debt.currency)}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-1">
            <Label htmlFor="amount">Сумма платежа ({debt.currency}) *</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder={`Макс: ${remainingDebtAmount.toFixed(2)}`}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="wallet">
              {debt.type === "iOwe"
                ? "Списать с кошелька *"
                : "Зачислить на кошелек *"}
            </Label>
            <Select
              value={selectedWalletId}
              onValueChange={setSelectedWalletId}
            >
              <SelectTrigger id="wallet">
                <SelectValue placeholder="Выберите кошелек" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map(w => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name} ({formatCurrency(w.balance, w.currency)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="paymentDate">Дата платежа *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !paymentDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paymentDate ? (
                    format(paymentDate, "PPP", { locale: ru })
                  ) : (
                    <span>Выберите дату</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={paymentDate}
                  onSelect={setPaymentDate}
                  initialFocus
                  locale={ru}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1">
            <Label htmlFor="note">Примечание (необязательно)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Например, частичная оплата"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Отмена
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <CalendarIcon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CalendarIcon className="mr-2 h-4 w-4" />
            )}
            Записать платеж
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
