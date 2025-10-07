"use client";

import * as React from "react";
import { Pie, PieChart, Cell } from "recharts";
import { Wallet as WalletIcon, AlertTriangle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { useBudgetStore } from "@/hooks/use-budget-store";
import { formatCurrency } from "@/lib/utils";
import { memo, useMemo } from "react";
import { useTranslation } from "@/hooks/use-translation";

export interface WalletDistributionPieChartProps {
  onWalletClick?: (data: { name: string; value: number }) => void;
}

const WalletDistributionPieChart = memo(function WalletDistributionPieChart(
  props: WalletDistributionPieChartProps
) {
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => setIsClient(true), []);

  const { t } = useTranslation(["dashboard", "common"]);
  const { getWalletBalanceDistribution, primaryDisplayCurrency } =
    useBudgetStore(state => ({
      getWalletBalanceDistribution: state.getWalletBalanceDistribution,
      primaryDisplayCurrency: state.primaryDisplayCurrency,
    }));

  const chartData = useMemo(() => {
    if (!isClient) return [];
    const data = getWalletBalanceDistribution();
    // Take top 5 and group rest into "Other"
    if (data.length > 5) {
      const top5 = data.slice(0, 5);
      const otherValue = data
        .slice(5)
        .reduce((acc, item) => acc + item.value, 0);
      const otherEntry = {
        name: t("categories.other"),
        value: otherValue,
        fill: "hsl(var(--muted-foreground) / 0.5)",
      };
      return [...top5, otherEntry];
    }
    return data;
  }, [isClient, getWalletBalanceDistribution]);

  const totalValue = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  if (!isClient) {
    return (
      <Card className="flex flex-col shadow-lg">
        <CardHeader>
          {" "}
          <div className="h-6 w-3/4 bg-muted rounded-md animate-pulse" />{" "}
          <div className="h-4 w-1/2 bg-muted rounded-md animate-pulse mt-1" />{" "}
        </CardHeader>
        <CardContent className="flex-1 grid grid-cols-1 items-center gap-4 p-4">
          <div className="h-[200px] w-full bg-muted rounded-full animate-pulse" />
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-5 w-full bg-muted rounded-md animate-pulse"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="flex flex-col shadow-lg min-h-[350px]">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <WalletIcon className="mr-2 h-5 w-5 text-primary" />
            {t("charts.walletDistribution", { ns: "dashboard" })}
          </CardTitle>
          <CardDescription>
            {t("charts.walletDistributionDescription", {
              currency: primaryDisplayCurrency,
              ns: "dashboard",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center text-center text-muted-foreground p-4">
          <div>
            <AlertTriangle className="mx-auto h-10 w-10 opacity-50 mb-2" />
            <p>{t("charts.noWalletData", { ns: "dashboard" })}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl min-h-[350px]">
      <CardHeader>
        <CardTitle className="text-lg">
          {t("charts.walletDistribution", { ns: "dashboard" })}
        </CardTitle>
        <CardDescription>
          {t("charts.walletDistributionDescription", {
            currency: primaryDisplayCurrency,
            ns: "dashboard",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 grid grid-cols-1 items-center gap-4">
        <div className="relative w-full h-[200px] drop-shadow-lg mx-auto max-w-[200px]">
          <ChartContainer config={{}} className="w-full h-full">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              {chartData.map((entry, index) => {
                const percentage =
                  totalValue > 0 ? (entry.value / totalValue) * 100 : 0;
                const ringGap = 10;
                const ringThickness = 8;
                const maxOuterRadius = 90;
                const outerRadius =
                  maxOuterRadius - index * (ringThickness + ringGap);
                const innerRadius = outerRadius - ringThickness;

                if (innerRadius < 10) return null;

                return (
                  <React.Fragment key={`ring-${entry.name}`}>
                    {/* Background Ring */}
                    <Pie
                      data={[{ value: 100 }]}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      startAngle={90}
                      endAngle={-270}
                      innerRadius={innerRadius}
                      outerRadius={outerRadius}
                      stroke="none"
                      fill="hsl(var(--muted) / 0.2)"
                    />
                    {/* Data Ring */}
                    <Pie
                      data={[
                        { value: percentage },
                        { value: 100 - percentage },
                      ]}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      startAngle={90}
                      endAngle={-270}
                      innerRadius={innerRadius}
                      outerRadius={outerRadius}
                      cornerRadius={8}
                      stroke="none"
                      tooltipType="none"
                      onClick={(_, i) => {
                        if (props.onWalletClick && i === 0) {
                          props.onWalletClick(entry);
                        }
                      }}
                    >
                      <Cell fill={entry.fill} />
                      <Cell fill="transparent" />
                    </Pie>
                  </React.Fragment>
                );
              })}
            </PieChart>
          </ChartContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <WalletIcon className="h-8 w-8 text-muted-foreground/30" />
          </div>
        </div>

        <div className="flex flex-col gap-3 text-sm self-center w-full max-w-xs mx-auto">
          {chartData.map(item => {
            const percentage =
              totalValue > 0 ? (item.value / totalValue) * 100 : 0;
            return (
              <div key={item.name} className="flex items-center gap-2">
                <span
                  className="flex h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="font-semibold text-foreground w-8 text-left">
                  {percentage.toFixed(0)}%
                </span>
                <span
                  className="text-muted-foreground truncate flex-1"
                  title={item.name}
                >
                  {item.name}
                </span>
                <span className="font-semibold text-foreground text-right">
                  {formatCurrency(item.value, primaryDisplayCurrency, true)}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});

export default WalletDistributionPieChart;
