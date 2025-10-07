"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import useLifePlanningStore from "@/hooks/use-life-planning-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus, DollarSign, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { FinancialGoal } from "@/lib/types";

interface AddFinancialGoalDialogProps {
  year: number;
  trigger?: React.ReactNode;
}

export function AddFinancialGoalDialog({
  year,
  trigger,
}: AddFinancialGoalDialogProps) {
  const { t } = useTranslation("life-goals");
  const { addFinancialGoal } = useLifePlanningStore();
  const [open, setOpen] = useState(false);
  const [goal, setGoal] = useState<Partial<FinancialGoal>>({
    id: "",
    type: "saving",
    amount: 0,
    currency: "USD",
    title: "",
    description: "",
    targetAmount: 0,
    targetDate: "",
    isRecurring: false,
    monthlyContribution: 0,
  });

  const goalTypes = [
    { value: "income", label: t("financialGoals.income"), icon: "💰" },
    { value: "expense", label: t("financialGoals.expense"), icon: "💸" },
    { value: "investment", label: t("financialGoals.investment"), icon: "📈" },
    { value: "saving", label: t("financialGoals.saving"), icon: "🏦" },
  ];

  const currencies = [
    { value: "USD", label: "USD ($)", symbol: "$" },
    { value: "EUR", label: "EUR (€)", symbol: "€" },
    { value: "UAH", label: "UAH (₴)", symbol: "₴" },
    { value: "GBP", label: "GBP (£)", symbol: "£" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!goal.title || !goal.type || !goal.targetAmount) return;

    const newGoal: FinancialGoal = {
      id: `goal-${Date.now()}`,
      type: goal.type,
      amount: goal.amount || 0,
      currency: goal.currency || "USD",
      title: goal.title,
      description: goal.description || "",
      targetAmount: goal.targetAmount,
      targetDate: goal.targetDate,
      isRecurring: goal.isRecurring || false,
      monthlyContribution: goal.monthlyContribution || 0,
      monthlyExpenses: goal.monthlyExpenses,
      monthlyIncome: goal.monthlyIncome,
      status: "active",
    };

    addFinancialGoal(year, newGoal);
    setOpen(false);
    setGoal({
      id: "",
      type: "saving",
      amount: 0,
      currency: "USD",
      title: "",
      description: "",
      targetAmount: 0,
      targetDate: "",
      isRecurring: false,
      monthlyContribution: 0,
    });
  };

  const calculateMonthlyContribution = () => {
    if (!goal.targetAmount || !goal.targetDate) return 0;

    const targetDate = new Date(goal.targetDate);
    const currentDate = new Date();
    const monthsRemaining = Math.max(
      1,
      (targetDate.getFullYear() - currentDate.getFullYear()) * 12 +
        (targetDate.getMonth() - currentDate.getMonth())
    );

    return Math.ceil(
      (goal.targetAmount - (goal.amount || 0)) / monthsRemaining
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            {t("addFinancialGoal")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t("addFinancialGoal")} - {year}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t("financialGoals.title")}</Label>
              <Input
                id="title"
                value={goal.title || ""}
                onChange={e =>
                  setGoal(prev => ({ ...prev, title: e.target.value }))
                }
                placeholder={t("financialGoals.titlePlaceholder")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">{t("financialGoals.type")}</Label>
              <Select
                value={goal.type}
                onValueChange={(
                  value: "income" | "expense" | "investment" | "saving"
                ) => setGoal(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("financialGoals.selectType")} />
                </SelectTrigger>
                <SelectContent>
                  {goalTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              {t("financialGoals.description")}
            </Label>
            <Textarea
              id="description"
              value={goal.description || ""}
              onChange={e =>
                setGoal(prev => ({ ...prev, description: e.target.value }))
              }
              placeholder={t("financialGoals.descriptionPlaceholder")}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentAmount">
                {t("financialGoals.currentAmount")}
              </Label>
              <div className="flex">
                <Select
                  value={goal.currency}
                  onValueChange={value =>
                    setGoal(prev => ({ ...prev, currency: value }))
                  }
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(currency => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="currentAmount"
                  type="number"
                  value={goal.amount || ""}
                  onChange={e =>
                    setGoal(prev => ({
                      ...prev,
                      amount: Number(e.target.value),
                    }))
                  }
                  placeholder="0"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAmount">
                {t("financialGoals.targetAmount")}
              </Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-input bg-muted text-sm">
                  {currencies.find(c => c.value === goal.currency)?.symbol}
                </span>
                <Input
                  id="targetAmount"
                  type="number"
                  value={goal.targetAmount || ""}
                  onChange={e =>
                    setGoal(prev => ({
                      ...prev,
                      targetAmount: Number(e.target.value),
                    }))
                  }
                  placeholder="0"
                  className="flex-1"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDate">
                {t("financialGoals.targetDate")}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !goal.targetDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {goal.targetDate
                      ? format(new Date(goal.targetDate), "PPP")
                      : t("financialGoals.selectDate")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={
                      goal.targetDate ? new Date(goal.targetDate) : undefined
                    }
                    onSelect={date =>
                      setGoal(prev => ({
                        ...prev,
                        targetDate: date
                          ? date.toISOString().split("T")[0]
                          : "",
                      }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Monthly Contribution Calculation */}
          {goal.targetAmount && goal.targetDate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5" />
                  {t("financialGoals.monthlyContribution")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="monthlyContribution">
                        {t("financialGoals.monthlyContribution")}
                      </Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 border border-r-0 border-input bg-muted text-sm">
                          {
                            currencies.find(c => c.value === goal.currency)
                              ?.symbol
                          }
                        </span>
                        <Input
                          id="monthlyContribution"
                          type="number"
                          value={goal.monthlyContribution || ""}
                          onChange={e =>
                            setGoal(prev => ({
                              ...prev,
                              monthlyContribution: Number(e.target.value),
                            }))
                          }
                          placeholder="0"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{t("financialGoals.suggestedContribution")}</Label>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {
                              currencies.find(c => c.value === goal.currency)
                                ?.symbol
                            }
                            {calculateMonthlyContribution().toLocaleString()}
                          </span>
                          <Badge variant="secondary">
                            {t("financialGoals.perMonth")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t("financialGoals.suggestedDescription")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      checked={goal.isRecurring || false}
                      onChange={e =>
                        setGoal(prev => ({
                          ...prev,
                          isRecurring: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                    <Label htmlFor="isRecurring" className="text-sm">
                      {t("financialGoals.isRecurring")}
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Fields for Income/Expense Goals */}
          {(goal.type === "income" || goal.type === "expense") && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("financialGoals.additionalInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goal.type === "income" && (
                    <div className="space-y-2">
                      <Label htmlFor="monthlyIncome">
                        {t("financialGoals.monthlyIncome")}
                      </Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 border border-r-0 border-input bg-muted text-sm">
                          {
                            currencies.find(c => c.value === goal.currency)
                              ?.symbol
                          }
                        </span>
                        <Input
                          id="monthlyIncome"
                          type="number"
                          value={goal.monthlyIncome || ""}
                          onChange={e =>
                            setGoal(prev => ({
                              ...prev,
                              monthlyIncome: Number(e.target.value),
                            }))
                          }
                          placeholder="0"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  )}

                  {goal.type === "expense" && (
                    <div className="space-y-2">
                      <Label htmlFor="monthlyExpenses">
                        {t("financialGoals.monthlyExpenses")}
                      </Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 border border-r-0 border-input bg-muted text-sm">
                          {
                            currencies.find(c => c.value === goal.currency)
                              ?.symbol
                          }
                        </span>
                        <Input
                          id="monthlyExpenses"
                          type="number"
                          value={goal.monthlyExpenses || ""}
                          onChange={e =>
                            setGoal(prev => ({
                              ...prev,
                              monthlyExpenses: Number(e.target.value),
                            }))
                          }
                          placeholder="0"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={!goal.title || !goal.type || !goal.targetAmount}
            >
              {t("common.add")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
