"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useBudgetStore } from "@/hooks/use-budget-store";
import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

export function BudgetStats() {
  const { t } = useTranslation("budgeting");
  const {
    budgetEntries,
    getActualSpendingForBudget,
    primaryDisplayCurrency,
    convertCurrency,
  } = useBudgetStore();

  const stats = useMemo(() => {
    let totalBudget = 0;
    let totalSpent = 0;
    let overBudgetCount = 0;
    let withinBudgetCount = 0;

    budgetEntries
      .filter(entry => entry.type === "expense" && entry.isActive)
      .forEach(entry => {
        const actual = getActualSpendingForBudget(entry);
        const limit = entry.limit || entry.amount;

        // Конвертуємо в основну валюту
        const budgetInPrimary = convertCurrency(
          limit,
          entry.currency,
          primaryDisplayCurrency
        );
        const spentInPrimary = convertCurrency(
          actual,
          entry.currency,
          primaryDisplayCurrency
        );

        totalBudget += budgetInPrimary;
        totalSpent += spentInPrimary;

        if (actual > limit) {
          overBudgetCount++;
        } else {
          withinBudgetCount++;
        }
      });

    const remaining = totalBudget - totalSpent;
    const percentageUsed =
      totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return {
      totalBudget,
      totalSpent,
      remaining,
      percentageUsed,
      overBudgetCount,
      withinBudgetCount,
      totalEntries: overBudgetCount + withinBudgetCount,
    };
  }, [
    budgetEntries,
    getActualSpendingForBudget,
    primaryDisplayCurrency,
    convertCurrency,
  ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
              {t("stats.totalBudget")}
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {formatCurrency(stats.totalBudget, primaryDisplayCurrency)}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            {stats.totalEntries}{" "}
            {stats.totalEntries === 1
              ? t("stats.categories")
              : t("stats.categories")}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-500 rounded-lg">
              <TrendingDown className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs text-green-700 dark:text-green-300 font-medium">
              {t("stats.spent")}
            </span>
          </div>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            {formatCurrency(stats.totalSpent, primaryDisplayCurrency)}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            {stats.percentageUsed.toFixed(1)}% {t("stats.ofBudget")}
          </p>
        </CardContent>
      </Card>

      <Card
        className={`bg-gradient-to-br ${
          stats.remaining >= 0
            ? "from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800"
            : "from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-200 dark:border-red-800"
        }`}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div
              className={`p-2 rounded-lg ${
                stats.remaining >= 0 ? "bg-emerald-500" : "bg-red-500"
              }`}
            >
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span
              className={`text-xs font-medium ${
                stats.remaining >= 0
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-red-700 dark:text-red-300"
              }`}
            >
              {stats.remaining >= 0
                ? t("stats.remaining")
                : t("stats.overspent")}
            </span>
          </div>
          <p
            className={`text-2xl font-bold ${
              stats.remaining >= 0
                ? "text-emerald-900 dark:text-emerald-100"
                : "text-red-900 dark:text-red-100"
            }`}
          >
            {formatCurrency(Math.abs(stats.remaining), primaryDisplayCurrency)}
          </p>
          <p
            className={`text-xs mt-1 ${
              stats.remaining >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {stats.remaining >= 0
              ? t("stats.withinBudget")
              : t("stats.needToCut")}
          </p>
        </CardContent>
      </Card>

      <Card
        className={`bg-gradient-to-br ${
          stats.overBudgetCount === 0
            ? "from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800"
            : "from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800"
        }`}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div
              className={`p-2 rounded-lg ${
                stats.overBudgetCount === 0 ? "bg-purple-500" : "bg-orange-500"
              }`}
            >
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <span
              className={`text-xs font-medium ${
                stats.overBudgetCount === 0
                  ? "text-purple-700 dark:text-purple-300"
                  : "text-orange-700 dark:text-orange-300"
              }`}
            >
              {t("stats.status")}
            </span>
          </div>
          <p
            className={`text-2xl font-bold ${
              stats.overBudgetCount === 0
                ? "text-purple-900 dark:text-purple-100"
                : "text-orange-900 dark:text-orange-100"
            }`}
          >
            {stats.overBudgetCount}
          </p>
          <p
            className={`text-xs mt-1 ${
              stats.overBudgetCount === 0
                ? "text-purple-600 dark:text-purple-400"
                : "text-orange-600 dark:text-orange-400"
            }`}
          >
            {stats.overBudgetCount === 0
              ? t("stats.allGood")
              : `${stats.overBudgetCount} ${t("stats.categoriesOver")}`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
