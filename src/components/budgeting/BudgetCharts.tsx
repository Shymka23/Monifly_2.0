"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBudgetStore } from "@/hooks/use-budget-store";
import { useMemo } from "react";
import { useTranslation } from "@/hooks/use-translation";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

interface BarShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  deviation?: number;
}

export function BudgetCharts() {
  const { t } = useTranslation("budgeting");
  const { budgetEntries, getActualSpendingForBudget } = useBudgetStore();

  // Дані для графіка порівняння бюджет vs фактичні витрати
  const comparisonData = useMemo(() => {
    return budgetEntries
      .filter(entry => entry.type === "expense" && entry.isActive)
      .map(entry => {
        const actual = getActualSpendingForBudget(entry);
        const limit = entry.limit || entry.amount;
        return {
          name:
            entry.description.length > 12
              ? entry.description.substring(0, 12) + "..."
              : entry.description,
          fullName: entry.description,
          budget: limit,
          actual: actual,
          deviation: actual - limit,
          currency: entry.currency,
        };
      });
  }, [budgetEntries, getActualSpendingForBudget]);

  // Дані для кругового графіка розподілу бюджету
  const budgetDistribution = useMemo(() => {
    const expenseBudgets = budgetEntries.filter(
      entry => entry.type === "expense" && entry.isActive
    );

    return expenseBudgets.map(entry => ({
      name:
        entry.description.length > 20
          ? entry.description.substring(0, 20) + "..."
          : entry.description,
      fullName: entry.description,
      value: entry.limit || entry.amount,
      currency: entry.currency,
    }));
  }, [budgetEntries]);

  // Дані для відхилення від бюджету
  const deviationData = useMemo(() => {
    return budgetEntries
      .filter(entry => entry.type === "expense" && entry.isActive)
      .map(entry => {
        const actual = getActualSpendingForBudget(entry);
        const limit = entry.limit || entry.amount;
        const deviationPercent = ((actual - limit) / limit) * 100;
        return {
          name:
            entry.description.length > 12
              ? entry.description.substring(0, 12) + "..."
              : entry.description,
          fullName: entry.description,
          deviation: deviationPercent,
          deviationAmount: actual - limit,
          currency: entry.currency,
        };
      })
      .sort((a, b) => b.deviation - a.deviation);
  }, [budgetEntries, getActualSpendingForBudget]);

  if (budgetEntries.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Графік порівняння бюджет vs фактичні витрати */}
      <Card>
        <CardHeader>
          <CardTitle>{t("charts.budgetVsActual")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border rounded-lg p-3 shadow-lg max-w-xs">
                        <p className="font-semibold break-words">
                          {data.fullName || data.name}
                        </p>
                        <p className="text-sm">
                          {t("charts.budget")}:{" "}
                          <span className="text-primary font-medium">
                            {formatCurrency(data.budget, data.currency)}
                          </span>
                        </p>
                        <p className="text-sm">
                          {t("charts.actual")}:{" "}
                          <span
                            className={
                              data.actual > data.budget
                                ? "text-destructive font-medium"
                                : "text-green-600 font-medium"
                            }
                          >
                            {formatCurrency(data.actual, data.currency)}
                          </span>
                        </p>
                        <p className="text-sm">
                          {t("charts.deviation")}:{" "}
                          <span
                            className={
                              data.deviation > 0
                                ? "text-destructive font-medium"
                                : "text-green-600 font-medium"
                            }
                          >
                            {data.deviation > 0 ? "+" : ""}
                            {formatCurrency(data.deviation, data.currency)}
                          </span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar
                dataKey="budget"
                name={t("charts.budget")}
                fill={COLORS[0]}
              />
              <Bar
                dataKey="actual"
                name={t("charts.actual")}
                fill={COLORS[1]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Кругова діаграма розподілу бюджету */}
      <Card>
        <CardHeader>
          <CardTitle>{t("charts.distribution")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={budgetDistribution}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {budgetDistribution.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border rounded-lg p-3 shadow-lg max-w-xs">
                        <p className="font-semibold break-words">
                          {data.fullName || data.name}
                        </p>
                        <p className="text-sm">
                          {formatCurrency(data.value, data.currency)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                wrapperStyle={{ fontSize: "12px", maxWidth: "150px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Графік відхилень від бюджету */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{t("charts.deviations")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deviationData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                label={{
                  value: t("charts.deviationLabel"),
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border rounded-lg p-3 shadow-lg max-w-xs">
                        <p className="font-semibold break-words mb-2">
                          {data.fullName || data.name}
                        </p>
                        <p className="text-sm">
                          {t("charts.deviation")}:{" "}
                          <span
                            className={
                              data.deviation > 0
                                ? "text-destructive font-medium"
                                : "text-green-600 font-medium"
                            }
                          >
                            {data.deviation > 0 ? "+" : ""}
                            {data.deviation.toFixed(1)}%
                          </span>
                        </p>
                        <p className="text-sm">
                          {t("dialog.amount_label")}:{" "}
                          <span
                            className={
                              data.deviationAmount > 0
                                ? "text-destructive font-medium"
                                : "text-green-600 font-medium"
                            }
                          >
                            {data.deviationAmount > 0 ? "+" : ""}
                            {formatCurrency(
                              data.deviationAmount,
                              data.currency
                            )}
                          </span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="deviation"
                name={t("charts.deviation")}
                fill={COLORS[2]}
                shape={(props: BarShapeProps) => {
                  const { x, y, width, height, deviation } = props;
                  const color =
                    (deviation || 0) > 0
                      ? "hsl(var(--destructive))"
                      : "hsl(var(--chart-3))";
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={color}
                    />
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
