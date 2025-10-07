"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Wallet as WalletIcon,
  ListTree,
} from "lucide-react";
import { useBudgetStore } from "@/hooks/use-budget-store";
import { formatCurrency } from "@/lib/utils";
import { useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

interface OverviewDataItem {
  titleKey:
    | "totalBalance"
    | "incomeForPeriod"
    | "expensesForPeriod"
    | "transactionsForPeriod";
  labelPrefix: string;
  icon: React.ElementType;
  descriptionFormat: (currencyOrPeriod: string) => string;
  isCurrency: boolean;
  borderColorClass: string;
  iconColorClass: string;
  valueColorClass: string;
}

export function OverviewCards() {
  const { t } = useTranslation(["common", "dashboard"]);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { primaryDisplayCurrency, filterPeriod, getOverviewData } =
    useBudgetStore(state => ({
      primaryDisplayCurrency: state.primaryDisplayCurrency,
      filterPeriod: state.filterPeriod,
      getOverviewData: state.getOverviewData,
    }));

  const overviewNumericData = useMemo(() => {
    if (!isClient) {
      return {
        totalBalance: 0,
        incomeForPeriod: 0,
        expensesForPeriod: 0,
        transactionsForPeriod: 0,
      };
    }
    return getOverviewData();
  }, [isClient, getOverviewData]);

  const selectedPeriodLabel = t(
    `dashboard:periods.${filterPeriod}`
  ).toLowerCase();

  const overviewDataConfig: OverviewDataItem[] = [
    {
      titleKey: "totalBalance",
      labelPrefix: t("overviewTotalBalance", { ns: "dashboard" }),
      icon: WalletIcon,
      descriptionFormat: (currency: string) =>
        `${t("overviewTotalBalanceDescription", {
          currency,
          ns: "dashboard",
        })}`,
      isCurrency: true,
      borderColorClass: "border-l-primary",
      iconColorClass: "text-primary",
      valueColorClass: "text-primary",
    },
    {
      titleKey: "incomeForPeriod",
      labelPrefix: t("overviewIncome", {
        period: selectedPeriodLabel,
        ns: "dashboard",
      }),
      icon: TrendingUp,
      descriptionFormat: (currency: string) =>
        `${t("overviewIncomeDescription", { currency, ns: "dashboard" })}`,
      isCurrency: true,
      borderColorClass: "border-l-accent",
      iconColorClass: "text-accent",
      valueColorClass: "text-accent",
    },
    {
      titleKey: "expensesForPeriod",
      labelPrefix: t("overviewExpenses", {
        ns: "dashboard",
        period: selectedPeriodLabel,
      }),
      icon: TrendingDown,
      descriptionFormat: (currency: string) =>
        `${t("overviewExpensesDescription", { currency, ns: "dashboard" })}`,
      isCurrency: true,
      borderColorClass: "border-l-destructive",
      iconColorClass: "text-destructive",
      valueColorClass: "text-destructive",
    },
    {
      titleKey: "transactionsForPeriod",
      labelPrefix: t("overviewTransactions", {
        ns: "dashboard",
        period: selectedPeriodLabel,
      }),
      icon: ListTree,
      descriptionFormat: () =>
        t("overviewTransactionsDescription", { ns: "dashboard" }),
      isCurrency: false,
      borderColorClass: "border-l-secondary",
      iconColorClass: "text-primary",
      valueColorClass: "text-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {overviewDataConfig.map(item => (
        <Card
          key={item.titleKey}
          className={cn(
            "shadow-md border-l-4 transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.02] hover:shadow-primary/5",
            item.borderColorClass
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground truncate">
              {item.labelPrefix}
            </CardTitle>
            <item.icon
              className={cn("h-4 w-4 sm:h-5 sm:w-5", item.iconColorClass)}
            />
          </CardHeader>
          <CardContent>
            {isClient ? (
              <>
                <div
                  className={cn(
                    "text-lg sm:text-xl md:text-2xl font-bold",
                    item.valueColorClass
                  )}
                >
                  {item.isCurrency
                    ? formatCurrency(
                        overviewNumericData[item.titleKey],
                        primaryDisplayCurrency
                      )
                    : overviewNumericData[item.titleKey].toString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.descriptionFormat(
                    item.isCurrency
                      ? primaryDisplayCurrency
                      : selectedPeriodLabel
                  )}
                </p>
              </>
            ) : (
              <>
                <div className="h-8 w-3/4 animate-pulse rounded bg-muted/50 mb-1"></div>
                <div className="h-4 w-full animate-pulse rounded bg-muted/50"></div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
