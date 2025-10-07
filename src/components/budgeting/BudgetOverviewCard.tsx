"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import type { BudgetEntry } from "@/lib/types";
import { useBudgetStore } from "@/hooks/use-budget-store";

interface BudgetOverviewCardProps {
  budgetEntry: BudgetEntry;
}

export function BudgetOverviewCard({ budgetEntry }: BudgetOverviewCardProps) {
  const { t } = useTranslation("budgeting");
  const { getActualSpendingForBudget } = useBudgetStore();

  const actualSpending = getActualSpendingForBudget(budgetEntry);
  const budgetAmount = budgetEntry.amount;
  const limit = budgetEntry.limit || budgetAmount;

  const percentage = (actualSpending / limit) * 100;
  const remaining = limit - actualSpending;
  const isOverBudget = actualSpending > limit;
  const isNearLimit = percentage >= 80 && percentage < 100;

  return (
    <Card
      className={`hover:shadow-lg transition-all ${
        isOverBudget
          ? "border-destructive/50 bg-destructive/5"
          : isNearLimit
          ? "border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/10"
          : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            {budgetEntry.description}
          </CardTitle>
          <Badge
            variant={
              isOverBudget
                ? "destructive"
                : isNearLimit
                ? "outline"
                : "secondary"
            }
          >
            {budgetEntry.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Прогрес */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("stats.spent")}</span>
            <span
              className={`font-medium ${
                isOverBudget ? "text-destructive" : ""
              }`}
            >
              {formatCurrency(actualSpending, budgetEntry.currency)} /{" "}
              {formatCurrency(limit, budgetEntry.currency)}
            </span>
          </div>
          <Progress
            value={Math.min(percentage, 100)}
            className={`h-2 ${
              isOverBudget
                ? "[&>div]:bg-destructive"
                : isNearLimit
                ? "[&>div]:bg-yellow-500"
                : ""
            }`}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(percentage)}%</span>
            <span>
              {isOverBudget
                ? t("overview.overspent")
                : `${t("stats.remaining")} ${formatCurrency(
                    remaining,
                    budgetEntry.currency
                  )}`}
            </span>
          </div>
        </div>

        {/* Статус */}
        <div className="flex items-center justify-between pt-2 border-t">
          {isOverBudget ? (
            <div className="flex items-center gap-2 text-destructive text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              <span>
                {t("overview.overspentBy")}{" "}
                {formatCurrency(Math.abs(remaining), budgetEntry.currency)}
              </span>
            </div>
          ) : isNearLimit ? (
            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 text-sm font-medium">
              <AlertCircle className="h-4 w-4" />
              <span>{t("overview.nearLimit")}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-500 text-sm font-medium">
              <TrendingDown className="h-4 w-4" />
              <span>{t("stats.withinBudget")}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
