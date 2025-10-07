"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dna,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import useLifePlanningStore from "@/hooks/use-life-planning-store";
import { cn } from "@/lib/utils";

interface DNAPoint {
  year: number;
  income: number;
  expenses: number;
  balance: number;
  health: "excellent" | "good" | "warning" | "critical";
  events: string[];
}

export function FinanceDNAStrand() {
  const { t } = useTranslation("life-goals");
  const { calendar, settings } = useLifePlanningStore();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Generate DNA data from calendar
  const dnaData = useMemo(() => {
    if (!calendar || !settings) return [];

    const currentYear = new Date().getFullYear();
    const data: DNAPoint[] = [];

    // Generate data for next 20 years
    for (let year = currentYear; year <= currentYear + 20; year++) {
      const baseIncome = 50000; // Base income
      const growthRate = 0.03; // 3% annual growth
      const income = baseIncome * Math.pow(1 + growthRate, year - currentYear);

      const baseExpenses = 35000; // Base expenses
      const expenseGrowth = 0.025; // 2.5% annual growth
      const expenses =
        baseExpenses * Math.pow(1 + expenseGrowth, year - currentYear);

      const balance = income - expenses;

      // Determine health based on balance
      let health: DNAPoint["health"] = "excellent";
      if (balance < 0) health = "critical";
      else if (balance < 10000) health = "warning";
      else if (balance < 20000) health = "good";

      // Add some random events
      const events: string[] = [];
      if (year === currentYear + 5) events.push("Major Investment");
      if (year === currentYear + 10) events.push("House Purchase");
      if (year === currentYear + 15) events.push("Retirement Planning");

      data.push({
        year,
        income,
        expenses,
        balance,
        health,
        events,
      });
    }

    return data;
  }, [calendar, settings]);

  const getHealthColor = (health: DNAPoint["health"]) => {
    switch (health) {
      case "excellent":
        return "text-green-500";
      case "good":
        return "text-blue-500";
      case "warning":
        return "text-yellow-500";
      case "critical":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getHealthIcon = (health: DNAPoint["health"]) => {
    switch (health) {
      case "excellent":
        return CheckCircle;
      case "good":
        return TrendingUp;
      case "warning":
        return AlertTriangle;
      case "critical":
        return TrendingDown;
      default:
        return Activity;
    }
  };

  const getBalanceColor = (balance: number) => {
    if (balance < 0) return "text-red-500";
    if (balance < 10000) return "text-yellow-500";
    if (balance < 20000) return "text-blue-500";
    return "text-green-500";
  };

  // Calculate DNA strand points
  const getDNAPoints = () => {
    const points: Array<{
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      year: number;
      balance: number;
      health: string;
    }> = [];
    const centerX = 200;
    const centerY = 150;
    const radius = 100;

    dnaData.forEach((point, index) => {
      const angle = (index / dnaData.length) * Math.PI * 2;
      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle + 0.1) * radius;
      const y2 = centerY + Math.sin(angle + 0.1) * radius;

      points.push({
        x1,
        y1,
        x2,
        y2,
        year: point.year,
        balance: point.balance,
        health: point.health,
      });
    });

    return points;
  };

  const dnaPoints = getDNAPoints();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Dna className="h-6 w-6 text-primary" />
            {t("dna.title")}
          </h3>
          <p className="text-muted-foreground text-sm">
            {t("dna.description")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAnimating(!isAnimating)}
            className="gap-2"
          >
            <Zap className="h-4 w-4" />
            {isAnimating ? t("dna.stopPulse") : t("dna.startPulse")}
          </Button>
        </div>
      </div>

      {/* DNA Visualization */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            {t("dna.visualization")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-[400px] overflow-hidden">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 400 300"
              className="absolute inset-0"
            >
              {/* DNA Strand 1 (Income) */}
              <path
                d={dnaPoints
                  .map(
                    point =>
                      `M ${point.x1} ${point.y1} Q ${point.x1 + 20} ${
                        point.y1 + 20
                      } ${point.x2} ${point.y2}`
                  )
                  .join(" ")}
                stroke="url(#incomeGradient)"
                strokeWidth="3"
                fill="none"
                className={cn(
                  "transition-all duration-1000",
                  isAnimating && "animate-pulse"
                )}
              />

              {/* DNA Strand 2 (Expenses) */}
              <path
                d={dnaPoints
                  .map(
                    point =>
                      `M ${point.x1 + 10} ${point.y1 + 10} Q ${point.x1 + 30} ${
                        point.y1 + 30
                      } ${point.x2 + 10} ${point.y2 + 10}`
                  )
                  .join(" ")}
                stroke="url(#expenseGradient)"
                strokeWidth="3"
                fill="none"
                className={cn(
                  "transition-all duration-1000",
                  isAnimating && "animate-pulse"
                )}
                style={{ animationDelay: "0.5s" }}
              />

              {/* Connection lines */}
              {dnaPoints.map((point, index) => (
                <line
                  key={index}
                  x1={point.x1}
                  y1={point.y1}
                  x2={point.x1 + 10}
                  y2={point.y1 + 10}
                  stroke="url(#connectionGradient)"
                  strokeWidth="1"
                  className="opacity-50"
                />
              ))}

              {/* Data points */}
              {dnaPoints.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x1}
                  cy={point.y1}
                  r="4"
                  fill={point.balance > 0 ? "#10B981" : "#EF4444"}
                  className={cn(
                    "transition-all duration-300 cursor-pointer hover:r-6",
                    hoveredPoint === index && "r-6 opacity-80"
                  )}
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onClick={() => setSelectedYear(point.year)}
                />
              ))}

              {/* Gradients */}
              <defs>
                <linearGradient
                  id="incomeGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient
                  id="expenseGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="100%" stopColor="#DC2626" />
                </linearGradient>
                <linearGradient
                  id="connectionGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#6B7280" />
                  <stop offset="100%" stopColor="#9CA3AF" />
                </linearGradient>
              </defs>
            </svg>

            {/* Legend */}
            <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 border">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>{t("dna.income")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>{t("dna.expenses")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span>{t("dna.connections")}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t("dna.incomeProjection")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dnaData.slice(0, 5).map(point => (
              <div
                key={point.year}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{point.year}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">
                    ${point.income.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t("dna.annual")}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-primary" />
              {t("dna.expenseProjection")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dnaData.slice(0, 5).map(point => (
              <div
                key={point.year}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{point.year}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-red-600">
                    ${point.expenses.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t("dna.annual")}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Financial Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {dnaData.slice(0, 4).map(point => {
          const HealthIcon = getHealthIcon(point.health);
          return (
            <Card
              key={point.year}
              className={cn(
                "transition-all duration-300 hover:shadow-lg",
                selectedYear === point.year && "ring-2 ring-primary"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-bold">{point.year}</span>
                  </div>
                  <HealthIcon
                    className={cn("h-5 w-5", getHealthColor(point.health))}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t("dna.balance")}</span>
                    <span
                      className={cn(
                        "font-bold",
                        getBalanceColor(point.balance)
                      )}
                    >
                      ${point.balance.toLocaleString()}
                    </span>
                  </div>

                  <Progress
                    value={Math.min(
                      Math.max((point.balance / 50000) * 100, 0),
                      100
                    )}
                    className="h-2"
                  />

                  <div className="text-xs text-muted-foreground">
                    {point.events.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {point.events[0]}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Year Details */}
      {selectedYear && (
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                {t("dna.yearDetails", { year: selectedYear })}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedYear(null)}
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const point = dnaData.find(p => p.year === selectedYear);
              if (!point) return null;

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ${point.income.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t("dna.income")}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        ${point.expenses.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t("dna.expenses")}
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className={cn(
                          "text-2xl font-bold",
                          getBalanceColor(point.balance)
                        )}
                      >
                        ${point.balance.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t("dna.balance")}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t("dna.healthStatus")}</span>
                      <Badge
                        variant="outline"
                        className={getHealthColor(point.health)}
                      >
                        {point.health.toUpperCase()}
                      </Badge>
                    </div>

                    {point.events.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {t("dna.majorEvents")}
                        </div>
                        {point.events.map((event, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Zap className="h-3 w-3 text-yellow-500" />
                            {event}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("dna.stats.healthyYears")}
                </p>
                <p className="text-2xl font-bold">
                  {
                    dnaData.filter(
                      p => p.health === "excellent" || p.health === "good"
                    ).length
                  }
                </p>
              </div>
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("dna.stats.warningYears")}
                </p>
                <p className="text-2xl font-bold">
                  {dnaData.filter(p => p.health === "warning").length}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/5 to-pink-500/5 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("dna.stats.criticalYears")}
                </p>
                <p className="text-2xl font-bold">
                  {dnaData.filter(p => p.health === "critical").length}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-red-500/10">
                <TrendingDown className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
