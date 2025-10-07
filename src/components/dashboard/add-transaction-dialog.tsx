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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, PlusCircle } from "lucide-react";
import { useBudgetStore } from "@/hooks/use-budget-store";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
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
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  TRANSACTION_CATEGORIES,
  type TransactionType,
  type TransactionCategory,
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

export function AddTransactionDialog({
  onTransactionAdded,
}: { onTransactionAdded?: (walletId: string) => void } = {}) {
  const { t } = useTranslation(["common", "transaction"]);
  const [open, setOpen] = useState(false);
  const {
    wallets,
    addTransaction,
    getWalletById,
    primaryDisplayCurrency,
    customTransactionCategories,
  } = useBudgetStore(state => ({
    wallets: state.wallets,
    addTransaction: state.addTransaction,
    getWalletById: state.getWalletById,
    primaryDisplayCurrency: state.primaryDisplayCurrency,
    customTransactionCategories: state.customTransactionCategories,
  }));
  const { toast } = useToast();

  const [selectedWalletId, setSelectedWalletId] = useState<string | undefined>(
    wallets.length > 0 ? wallets[0].id : undefined
  );
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionCurrency, setTransactionCurrency] = useState<
    string | undefined
  >(undefined);
  const [type, setType] = useState<TransactionType>("expense");
  const [category, setCategory] = useState<TransactionCategory>("other");
  const [date, setDate] = useState<Date | undefined>(new Date());

  const allCategories = useMemo(() => {
    const defaultCats = (TRANSACTION_CATEGORIES as readonly string[]).map(c => {
      const key = c.charAt(0).toLowerCase() + c.slice(1);
      return {
        value: c,
        label: t(`categories.${key}`),
      };
    });
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
  }, [customTransactionCategories, t]);

  useEffect(() => {
    if (wallets.length > 0 && !selectedWalletId) {
      setSelectedWalletId(wallets[0].id);
    }
  }, [wallets, selectedWalletId]);

  useEffect(() => {
    if (selectedWalletId) {
      const wallet = getWalletById(selectedWalletId);
      setTransactionCurrency(wallet?.currency || primaryDisplayCurrency);
    }
  }, [selectedWalletId, getWalletById, primaryDisplayCurrency]);

  const handleSubmit = () => {
    if (
      !selectedWalletId ||
      !description.trim() ||
      isNaN(parseFloat(amount)) ||
      parseFloat(amount) <= 0 ||
      !transactionCurrency ||
      !category.trim() ||
      !date
    ) {
      toast({
        title: t("errors.invalidInputTitle"),
        description: t("errors.invalidInputDescription"),
        variant: "destructive",
      });
      return;
    }
    addTransaction(
      selectedWalletId,
      description,
      parseFloat(amount),
      transactionCurrency,
      type,
      category,
      date.toISOString()
    );
    if (onTransactionAdded) onTransactionAdded(selectedWalletId);
    const wallet = getWalletById(selectedWalletId);
    toast({
      title: t("toasts.transactionAddedTitle"),
      description: t("toasts.transactionAddedDescription", {
        description,
        wallet: wallet?.name || "",
      }),
    });
    // Reset form
    setDescription("");
    setAmount("");
    const currentSelectedWallet = getWalletById(selectedWalletId);
    setTransactionCurrency(
      currentSelectedWallet?.currency || primaryDisplayCurrency
    );
    setType("expense");
    setCategory("other");
    setDate(new Date());
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="text-xs sm:text-sm">
          <PlusCircle className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
          {t("add", { ns: "transaction" })}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{t("addTitle", { ns: "transaction" })}</DialogTitle>
          <DialogDescription>
            {t("addDescription", { ns: "transaction" })}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="wallet" className="text-right">
              {t("wallet", { ns: "transaction" })} *
            </Label>
            <Select
              value={selectedWalletId}
              onValueChange={setSelectedWalletId}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={t("placeholders.selectWallet")} />
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
            <Label htmlFor="description" className="text-right">
              {t("description", { ns: "transaction" })} *
            </Label>
            <Input
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="col-span-3"
              placeholder={t("egDescription", { ns: "transaction" })}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              {t("amount", { ns: "transaction" })} *
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="col-span-3"
              placeholder={t("egAmount", { ns: "transaction" })}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="transactionCurrency" className="text-right">
              {t("currency", { ns: "transaction" })} *
            </Label>
            <Select
              value={transactionCurrency}
              onValueChange={setTransactionCurrency}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={t("placeholders.currency")} />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_CURRENCIES.map(c => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              {t("type", { ns: "transaction" })} *
            </Label>
            <RadioGroup
              defaultValue="expense"
              value={type}
              onValueChange={(value: TransactionType) => setType(value)}
              className="col-span-3 flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income">
                  {t("income", { ns: "transaction" })}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense">
                  {t("expense", { ns: "transaction" })}
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="category" className="text-right pt-2">
              {t("category", { ns: "transaction" })} *
            </Label>
            <div className="col-span-3 space-y-2">
              <Input
                id="category"
                value={category}
                onChange={e =>
                  setCategory(e.target.value as TransactionCategory)
                }
                placeholder={t("categoryPlaceholder", { ns: "transaction" })}
              />
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                {allCategories.map(cat => (
                  <Badge
                    key={cat.value}
                    variant={category === cat.label ? "default" : "secondary"}
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
            <Label htmlFor="date" className="text-right">
              {t("date", { ns: "transaction" })} *
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
                    <span>{t("placeholders.selectDate")}</span>
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
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            {t("cancel", { ns: "transaction" })}
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            {t("add", { ns: "transaction" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
