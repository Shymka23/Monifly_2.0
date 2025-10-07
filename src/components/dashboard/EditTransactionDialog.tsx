"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Calendar as CalendarIcon, Save, Edit3 } from "lucide-react";
import { useBudgetStore } from "@/hooks/use-budget-store";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatCurrency } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import type {
  Transaction,
  TransactionType,
  TransactionCategory,
  Wallet,
  TransactionUpdatePayload,
} from "@/lib/types";
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_CATEGORY_LABELS,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";

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

interface EditTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit: Transaction | null;
  wallets: Wallet[];
}

export function EditTransactionDialog({
  isOpen,
  onClose,
  transactionToEdit,
  wallets,
}: EditTransactionDialogProps) {
  const {
    updateTransaction,
    getWalletById,
    primaryDisplayCurrency,
    customTransactionCategories,
  } = useBudgetStore(state => ({
    updateTransaction: state.updateTransaction,
    getWalletById: state.getWalletById,
    primaryDisplayCurrency: state.primaryDisplayCurrency,
    customTransactionCategories: state.customTransactionCategories,
  }));
  const { toast } = useToast();

  const [selectedWalletId, setSelectedWalletId] = useState<string | undefined>(
    undefined
  );
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  // transactionCurrency is the currency of the amount field in the dialog
  const [transactionCurrency, setTransactionCurrency] = useState<
    string | undefined
  >(undefined);
  const [type, setType] = useState<TransactionType>("expense");
  const [category, setCategory] = useState<TransactionCategory>("other");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allCategories = useMemo(() => {
    const defaultCats = (TRANSACTION_CATEGORIES as readonly string[]).map(
      c => ({
        value: c,
        label:
          TRANSACTION_CATEGORY_LABELS[
            c as keyof typeof TRANSACTION_CATEGORY_LABELS
          ] || c,
      })
    );
    const customCats = customTransactionCategories.map(c => ({
      value: c,
      label: c,
    }));
    const combined = [...defaultCats, ...customCats];
    return combined
      .filter(
        (item, index, self) =>
          index ===
          self.findIndex(
            t => t.value.toLowerCase() === item.value.toLowerCase()
          )
      )
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [customTransactionCategories]);

  useEffect(() => {
    if (isOpen && transactionToEdit) {
      const originalWallet = getWalletById(transactionToEdit.walletId);
      setSelectedWalletId(transactionToEdit.walletId);
      setDescription(transactionToEdit.description);
      // Amount in dialog is shown in its original transaction currency
      setAmount(
        transactionToEdit.amount
          .toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 8,
          })
          .replace(",", ".")
      );
      setTransactionCurrency(
        originalWallet?.currency || primaryDisplayCurrency
      );
      setType(transactionToEdit.type);
      setCategory(transactionToEdit.category);
      setDate(parseISO(transactionToEdit.date));
      setIsSubmitting(false);
    } else if (isOpen && !transactionToEdit) {
      // Reset if opened without a transaction (should not happen for edit)
      setSelectedWalletId(wallets.length > 0 ? wallets[0].id : undefined);
      setDescription("");
      setAmount("");
      setTransactionCurrency(
        getWalletById(wallets.length > 0 ? wallets[0].id : "")?.currency ||
          primaryDisplayCurrency
      );
      setType("expense");
      setCategory("other");
      setDate(new Date());
      setIsSubmitting(false);
    }
  }, [
    isOpen,
    transactionToEdit,
    wallets,
    getWalletById,
    primaryDisplayCurrency,
  ]);

  // Update transactionCurrency if selectedWalletId changes and the dialog is for editing
  useEffect(() => {
    if (isOpen && transactionToEdit && selectedWalletId) {
      const currentSelectedWallet = getWalletById(selectedWalletId);
      if (currentSelectedWallet) {
        // If the wallet changed, we might want to offer converting the amount or keeping it in original currency.
        // For simplicity, let's assume the amount field's currency changes WITH the wallet.
        // The actual `transactionToEdit.amount` is in `originalWallet.currency`.
        // If the user changes the wallet, the amount displayed should ideally be converted or re-entered.
        // Let's keep the amount as is, and `transactionCurrency` reflects the NEW selected wallet's currency.
        // The user will then be effectively entering the amount in the NEW wallet's currency.
        setTransactionCurrency(currentSelectedWallet.currency);
      }
    }
  }, [selectedWalletId, isOpen, transactionToEdit, getWalletById]);

  const handleSubmit = () => {
    if (
      !transactionToEdit ||
      !selectedWalletId ||
      !description.trim() ||
      isNaN(parseFloat(amount)) ||
      parseFloat(amount) <= 0 ||
      !transactionCurrency ||
      !category.trim() ||
      !date
    ) {
      toast({
        title: "Неверный ввод",
        description:
          "Пожалуйста, заполните все поля корректно. Сумма должна быть положительной.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);

    const payload: TransactionUpdatePayload = {
      id: transactionToEdit.id,
      description,
      type,
      category,
      date: date.toISOString(),
      walletId: selectedWalletId, // Always pass the selected wallet as walletId
      amount: parseFloat(amount), // The amount entered in the dialog
    };

    updateTransaction(transactionToEdit.id, payload);

    toast({
      title: "Транзакция обновлена",
      description: `Транзакция "${description}" успешно обновлена.`,
    });

    setIsSubmitting(false);
    onClose();
  };

  if (!transactionToEdit) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={openState => {
        if (!openState) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Edit3 className="mr-2 h-5 w-5 text-primary" />
            Редактировать транзакцию
          </DialogTitle>
          <DialogDescription>
            Измените детали существующей транзакции.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-wallet" className="text-right">
              Кошелек
            </Label>
            <Select
              value={selectedWalletId}
              onValueChange={setSelectedWalletId}
            >
              <SelectTrigger id="edit-wallet" className="col-span-3">
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-description" className="text-right">
              Описание
            </Label>
            <Input
              id="edit-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-amount" className="text-right">
              Сумма
            </Label>
            <Input
              id="edit-amount"
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-transactionCurrency" className="text-right">
              Валюта
            </Label>
            <Select
              value={transactionCurrency}
              onValueChange={setTransactionCurrency}
            >
              <SelectTrigger
                id="edit-transactionCurrency"
                className="col-span-3"
              >
                <SelectValue placeholder="Валюта" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_CURRENCIES.map(c => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="col-start-2 col-span-3 text-xs text-muted-foreground">
              Сумма будет в этой валюте. Если кошелек другой валюты, произойдет
              конвертация.
            </span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-type" className="text-right">
              Тип
            </Label>
            <RadioGroup
              value={type}
              onValueChange={(value: TransactionType) => setType(value)}
              className="col-span-3 flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="edit-income" />
                <Label htmlFor="edit-income">Доход</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="edit-expense" />
                <Label htmlFor="edit-expense">Расход</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="edit-category" className="text-right pt-2">
              Категория
            </Label>
            <div className="col-span-3 space-y-2">
              <Input
                id="edit-category"
                value={category}
                onChange={e =>
                  setCategory(e.target.value as TransactionCategory)
                }
                placeholder="Выберите или введите новую категорию"
              />
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                {allCategories.map(cat => (
                  <Badge
                    key={cat.value}
                    variant={category === cat.value ? "default" : "secondary"}
                    onClick={() =>
                      setCategory(cat.value as TransactionCategory)
                    }
                    className="cursor-pointer"
                  >
                    {cat.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-date" className="text-right">
              Дата
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? (
                    format(date, "PPP", { locale: ru })
                  ) : (
                    <span>Выберите дату</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={ru}
                  disabled={d => d > new Date() || d < new Date("1900-01-01")}
                />
              </PopoverContent>
            </Popover>
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
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
