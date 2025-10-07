"use client";

import * as React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegendContent,
} from "@/components/ui/chart";
import { useBudgetStore } from "@/hooks/use-budget-store";
import { formatCurrency } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { fr, ru, de, es, enUS, uk } from "date-fns/locale";
import { memo, useMemo } from "react";

import { useTranslation } from "@/hooks/use-translation";

const locales = {
  uk,
  fr,
  ru,
  de,
  es,
  en: enUS,
};

// chartConfig will be created dynamically in component to support translations

interface MonthlySummaryChartProps {
  onDataClick?: (data: {
    date: string;
    income: number;
    expenses: number;
    balance: number;
  }) => void;
}

const MonthlySummaryChart = memo(function MonthlySummaryChart(
  props: MonthlySummaryChartProps
) {
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => setIsClient(true), []);

  const { t, i18n } = useTranslation(["dashboard", "common"]);
  const { getPeriodTransactionSummary, primaryDisplayCurrency, filterPeriod } =
    useBudgetStore(state => ({
      getPeriodTransactionSummary: state.getPeriodTransactionSummary,
      primaryDisplayCurrency: state.primaryDisplayCurrency,
      filterPeriod: state.filterPeriod,
    }));

  const chartData = useMemo(() => {
    if (!isClient) return [];
    return getPeriodTransactionSummary();
  }, [isClient, getPeriodTransactionSummary]);

  const selectedPeriodLabel = t(`periods.${filterPeriod}`);

  const chartConfig = useMemo(
    () => ({
      income: {
        label: t("charts.income"),
        color: "hsl(var(--chart-2))",
      },
      expenses: {
        label: t("charts.expenses"),
        color: "hsl(var(--destructive))",
      },
      balance: {
        label: t("charts.balance"),
        color: "hsl(var(--primary))",
      },
    }),
    [t]
  );

  const handlePointClick = (event: {
    activePayload?: Array<{
      payload: {
        date: string;
        income: number;
        expenses: number;
        balance: number;
      };
    }>;
  }) => {
    if (
      props.onDataClick &&
      event &&
      event.activePayload &&
      event.activePayload.length > 0
    ) {
      const dataPoint = event.activePayload[0].payload;
      props.onDataClick(dataPoint);
    }
  };

  if (!isClient) {
    return (
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>{t("charts.fundsFlow")}</CardTitle>
          <CardDescription>{t("loading")}</CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="h-[220px] sm:h-[300px] w-full animate-pulse rounded-lg bg-muted/50" />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>
            {t("charts.fundsFlow")} ({selectedPeriodLabel})
          </CardTitle>
          <CardDescription>
            {t("charts.fundsFlowDescriptionShort", {
              currency: primaryDisplayCurrency,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[220px] sm:h-[300px] flex items-center justify-center text-center text-muted-foreground p-4">
            {t("charts.noExpensesData", {
              period: selectedPeriodLabel.toLowerCase(),
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">
          {t("charts.fundsFlow", { period: selectedPeriodLabel })}
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          {t("charts.fundsFlowDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[220px] md:h-[300px]">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0,
              }}
              onClick={handlePointClick}
              className="cursor-pointer"
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={5}
                fontSize={9}
                interval={
                  chartData.length > 15
                    ? Math.floor(chartData.length / 7)
                    : chartData.length > 7
                    ? 1
                    : 0
                }
                tickFormatter={date => {
                  const locale =
                    locales[
                      i18n.language.split("-")[0] as keyof typeof locales
                    ] || enUS;
                  return format(parseISO(date), "d MMM", { locale });
                }}
              />
              <YAxis
                tickFormatter={value =>
                  formatCurrency(value, primaryDisplayCurrency, true)
                }
                tickLine={false}
                axisLine={false}
                tickMargin={5}
                fontSize={9}
                width={60}
              />
              <ChartTooltip
                cursor={true}
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <div>
                        <span
                          style={{
                            color:
                              chartConfig[name as keyof typeof chartConfig]
                                ?.color,
                          }}
                        >
                          {chartConfig[name as keyof typeof chartConfig]?.label}
                          :
                        </span>
                        <span className="ml-1 font-semibold">
                          {formatCurrency(
                            value as number,
                            primaryDisplayCurrency
                          )}
                        </span>
                      </div>
                    )}
                    labelFormatter={(label, payload) => {
                      if (
                        payload &&
                        payload.length > 0 &&
                        payload[0].payload.date
                      ) {
                        const locale =
                          locales[
                            i18n.language.split("-")[0] as keyof typeof locales
                          ] || enUS;
                        return format(
                          parseISO(payload[0].payload.date),
                          filterPeriod === "currentYear" ||
                            filterPeriod === "lastYear"
                            ? "LLLL yyyy"
                            : "PPP",
                          { locale }
                        );
                      }
                      return label;
                    }}
                  />
                }
              />
              <Legend content={<ChartLegendContent />} />
              <Line
                dataKey="income"
                type="monotone"
                stroke="var(--color-income)"
                strokeWidth={2}
                dot={{
                  r: 3,
                  fill: "var(--color-income)",
                  strokeWidth: 1,
                  stroke: "var(--color-income)",
                }}
                activeDot={{ r: 5, strokeWidth: 2 }}
                name={t("charts.income")}
              />
              <Line
                dataKey="expenses"
                type="monotone"
                stroke="var(--color-expenses)"
                strokeWidth={2}
                dot={{
                  r: 3,
                  fill: "var(--color-expenses)",
                  strokeWidth: 1,
                  stroke: "var(--color-expenses)",
                }}
                activeDot={{ r: 5, strokeWidth: 2 }}
                name={t("charts.expenses")}
              />
              <Line
                dataKey="balance"
                type="monotone"
                stroke="var(--color-balance)"
                strokeWidth={2}
                dot={{
                  r: 3,
                  fill: "var(--color-balance)",
                  strokeWidth: 1,
                  stroke: "var(--color-balance)",
                }}
                activeDot={{ r: 5, strokeWidth: 2 }}
                name={t("charts.balance")}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
});

export default MonthlySummaryChart;
