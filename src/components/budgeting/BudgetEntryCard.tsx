"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  Edit3,
  Trash2,
  TrendingUp,
  TrendingDown,
  Clock,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ru, uk, enUS, de, es, fr } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/hooks/use-translation";
import type { BudgetEntry } from "@/lib/types";
import { TRANSACTION_CATEGORY_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BudgetEntryCardProps {
  budgetEntry: BudgetEntry;
  actualSpending?: number; // For expense budgets with limits
  onEdit: (budgetEntry: BudgetEntry) => void;
  onDelete: (id: string) => void;
}

export function BudgetEntryCard({
  budgetEntry,
  actualSpending,
  onEdit,
  onDelete,
}: BudgetEntryCardProps) {
  const { t, i18n } = useTranslation("budgeting");

  const locales = { uk, ru, en: enUS, de, es, fr };
  const currentLocale =
    locales[i18n.language.split("-")[0] as keyof typeof locales] || enUS;

  const isExpenseBudgetWithLimit =
    budgetEntry.type === "expense" &&
    budgetEntry.frequency === "monthly" &&
    typeof budgetEntry.limit === "number" &&
    budgetEntry.limit > 0 &&
    budgetEntry.isActive;

  const progressPercent =
    isExpenseBudgetWithLimit &&
    actualSpending !== undefined &&
    budgetEntry.limit &&
    budgetEntry.limit > 0
      ? (actualSpending / budgetEntry.limit!) * 100
      : 0;

  const formattedAmount = formatCurrency(
    budgetEntry.amount,
    budgetEntry.currency
  );
  const formattedNextDueDate = budgetEntry.nextDueDate
    ? format(parseISO(budgetEntry.nextDueDate), "PPP", {
        locale: currentLocale,
      })
    : "N/A";
  const categoryLabel =
    TRANSACTION_CATEGORY_LABELS[
      budgetEntry.category as keyof typeof TRANSACTION_CATEGORY_LABELS
    ] || budgetEntry.category;

  const frequencyLabel = t(`periods.${budgetEntry.frequency}`);
  const dayOfMonthLabel = budgetEntry.dayOfMonth
    ? t("card.dayOfMonth", { day: budgetEntry.dayOfMonth })
    : "";

  const isOverBudget = progressPercent > 100;
  const isNearLimit = progressPercent > 75 && progressPercent <= 100;

  return (
    <div className="group relative w-full rounded-2xl glass shadow-modern hover-lift border border-border/50 transition-all duration-300 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Status stripe */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1",
          budgetEntry.isActive
            ? budgetEntry.type === "income"
              ? "bg-green-500"
              : isOverBudget
              ? "bg-red-500"
              : isNearLimit
              ? "bg-yellow-500"
              : "bg-blue-500"
            : "bg-gray-400"
        )}
      />

      <div className="relative z-10 p-3 sm:p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={cn(
                  "p-1.5 rounded-lg transition-all duration-300 flex-shrink-0",
                  budgetEntry.type === "income"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                )}
              >
                {budgetEntry.type === "income" ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-foreground truncate leading-tight">
                {budgetEntry.description}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
              <Badge variant="outline" className="text-xs px-2 py-0">
                {categoryLabel}
              </Badge>
              <span>•</span>
              <span>{frequencyLabel}</span>
              {budgetEntry.frequency === "monthly" && dayOfMonthLabel && (
                <>
                  <span>•</span>
                  <span className="hidden xs:inline">{dayOfMonthLabel}</span>
                  <span className="xs:hidden">{budgetEntry.dayOfMonth}-го</span>
                </>
              )}
            </div>
          </div>

          <Badge
            variant={budgetEntry.isActive ? "default" : "secondary"}
            className={cn(
              "transition-all duration-300 px-2 py-1 text-xs flex-shrink-0",
              budgetEntry.isActive
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400"
            )}
          >
            <span className="hidden sm:inline">
              {budgetEntry.isActive ? t("card.active") : t("card.inactive")}
            </span>
            <span className="sm:hidden">
              {budgetEntry.isActive ? "✓" : "✗"}
            </span>
          </Badge>
        </div>

        {/* Amount and Next Date */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>{t("dialog.amount_label")}</span>
            </div>
            <div
              className={cn(
                "text-xl sm:text-2xl font-bold truncate",
                budgetEntry.type === "income"
                  ? "text-green-600"
                  : "text-red-600"
              )}
            >
              {budgetEntry.type === "income" ? "+" : "-"}
              {formattedAmount}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{t("card.nextDate")}</span>
            </div>
            <div className="text-xs sm:text-sm font-medium text-foreground break-words">
              {formattedNextDueDate}
            </div>
          </div>
        </div>

        {/* Budget Progress (for expense budgets with limits) */}
        {isExpenseBudgetWithLimit &&
          actualSpending !== undefined &&
          budgetEntry.limit && (
            <div className="space-y-2 p-3 rounded-lg bg-muted/20 border border-border/30">
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {t("dialog.limit_label")}
                </span>
                <div className="text-right">
                  <div className="text-xs sm:text-sm font-semibold text-red-600 truncate">
                    {formatCurrency(actualSpending, budgetEntry.currency)}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">
                    {t("card.of")}{" "}
                    {formatCurrency(budgetEntry.limit, budgetEntry.currency)}
                  </div>
                </div>
              </div>

              <Progress
                value={Math.min(100, progressPercent)}
                className="h-2"
                indicatorClassName={cn(
                  "transition-all duration-300",
                  isOverBudget
                    ? "bg-red-500"
                    : isNearLimit
                    ? "bg-yellow-500"
                    : "bg-green-500"
                )}
              />

              <div className="flex justify-between items-center text-xs">
                <span
                  className={cn(
                    "font-medium",
                    isOverBudget
                      ? "text-red-600"
                      : isNearLimit
                      ? "text-yellow-600"
                      : "text-green-600"
                  )}
                >
                  {Math.round(progressPercent)}%
                </span>
                {isOverBudget && (
                  <span className="text-red-600 font-semibold text-[10px] sm:text-xs">
                    +
                    {formatCurrency(
                      actualSpending - budgetEntry.limit,
                      budgetEntry.currency
                    )}
                  </span>
                )}
              </div>
            </div>
          )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-border/20">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(budgetEntry)}
            className="border-border/50 hover:bg-background/80 transition-all duration-300 px-2 sm:px-3"
            title={t("card.edit")}
          >
            <Edit3 className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline text-xs">{t("card.edit")}</span>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(budgetEntry.id)}
            className="hover:bg-destructive/90 transition-all duration-300 px-2 sm:px-3"
            title={t("card.delete")}
          >
            <Trash2 className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline text-xs">{t("card.delete")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
