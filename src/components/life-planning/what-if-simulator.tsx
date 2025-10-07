"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Save,
  BarChart3,
  Calculator,
  Lightbulb,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import useLifePlanningStore from "@/hooks/use-life-planning-store";
import { cn } from "@/lib/utils";

interface Scenario {
  id: string;
  name: string;
  description: string;
  factors: {
    income: number;
    expenses: number;
    investment: number;
    risk: number;
  };
  outcomes: {
    year1: number;
    year5: number;
    year10: number;
    year20: number;
  };
  probability: number;
  color: string;
}

export function WhatIfSimulator() {
  const { t } = useTranslation("life-goals");
  const {} = useLifePlanningStore();
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Simulation parameters
  const [baseIncome, setBaseIncome] = useState(50000);
  const [baseExpenses, setBaseExpenses] = useState(35000);
  const [investmentRate, setInvestmentRate] = useState(0.07);
  const [riskFactor, setRiskFactor] = useState(0.1);

  // Generate scenarios
  const scenarios = useMemo(() => {
    const baseScenarios: Scenario[] = [
      {
        id: "conservative",
        name: t("simulator.scenarios.conservative"),
        description: t("simulator.scenarios.conservativeDesc"),
        factors: {
          income: 1.02, // 2% growth
          expenses: 1.03, // 3% growth
          investment: 0.04, // 4% return
          risk: 0.05, // 5% risk
        },
        outcomes: {
          year1: 0,
          year5: 0,
          year10: 0,
          year20: 0,
        },
        probability: 0.8,
        color: "from-green-500 to-emerald-500",
      },
      {
        id: "moderate",
        name: t("simulator.scenarios.moderate"),
        description: t("simulator.scenarios.moderateDesc"),
        factors: {
          income: 1.04, // 4% growth
          expenses: 1.03, // 3% growth
          investment: 0.07, // 7% return
          risk: 0.15, // 15% risk
        },
        outcomes: {
          year1: 0,
          year5: 0,
          year10: 0,
          year20: 0,
        },
        probability: 0.6,
        color: "from-blue-500 to-cyan-500",
      },
      {
        id: "aggressive",
        name: t("simulator.scenarios.aggressive"),
        description: t("simulator.scenarios.aggressiveDesc"),
        factors: {
          income: 1.06, // 6% growth
          expenses: 1.04, // 4% growth
          investment: 0.12, // 12% return
          risk: 0.3, // 30% risk
        },
        outcomes: {
          year1: 0,
          year5: 0,
          year10: 0,
          year20: 0,
        },
        probability: 0.3,
        color: "from-purple-500 to-pink-500",
      },
      {
        id: "crisis",
        name: t("simulator.scenarios.crisis"),
        description: t("simulator.scenarios.crisisDesc"),
        factors: {
          income: 0.95, // -5% growth
          expenses: 1.08, // 8% growth
          investment: -0.05, // -5% return
          risk: 0.5, // 50% risk
        },
        outcomes: {
          year1: 0,
          year5: 0,
          year10: 0,
          year20: 0,
        },
        probability: 0.1,
        color: "from-red-500 to-orange-500",
      },
    ];

    // Calculate outcomes for each scenario
    return baseScenarios.map(scenario => {
      const outcomes = { ...scenario.outcomes };
      let currentValue = baseIncome - baseExpenses;

      for (let year = 1; year <= 20; year++) {
        const incomeGrowth = Math.pow(scenario.factors.income, year);
        const expenseGrowth = Math.pow(scenario.factors.expenses, year);
        const investmentGrowth = Math.pow(
          1 + scenario.factors.investment,
          year
        );

        const newIncome = baseIncome * incomeGrowth;
        const newExpenses = baseExpenses * expenseGrowth;
        const savings = newIncome - newExpenses;

        currentValue = (currentValue + savings) * investmentGrowth;

        if (year === 1) outcomes.year1 = Math.round(currentValue);
        if (year === 5) outcomes.year5 = Math.round(currentValue);
        if (year === 10) outcomes.year10 = Math.round(currentValue);
        if (year === 20) outcomes.year20 = Math.round(currentValue);
      }

      return { ...scenario, outcomes };
    });
  }, [baseIncome, baseExpenses, investmentRate, riskFactor, t]);

  const getScenarioIcon = (scenarioId: string) => {
    switch (scenarioId) {
      case "conservative":
        return Target;
      case "moderate":
        return TrendingUp;
      case "aggressive":
        return Zap;
      case "crisis":
        return TrendingDown;
      default:
        return Brain;
    }
  };

  const getOutcomeColor = (value: number) => {
    if (value > 1000000) return "text-green-600";
    if (value > 500000) return "text-blue-600";
    if (value > 100000) return "text-yellow-600";
    if (value > 0) return "text-orange-600";
    return "text-red-600";
  };

  const getOutcomeIcon = (value: number) => {
    if (value > 1000000) return TrendingUp;
    if (value > 0) return Target;
    return TrendingDown;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            {t("simulator.title")}
          </h3>
          <p className="text-muted-foreground text-sm">
            {t("simulator.description")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isRunning ? "destructive" : "default"}
            size="sm"
            onClick={() => setIsRunning(!isRunning)}
            className="gap-2"
          >
            {isRunning ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isRunning ? t("simulator.pause") : t("simulator.run")}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setBaseIncome(50000);
              setBaseExpenses(35000);
              setInvestmentRate(0.07);
              setRiskFactor(0.1);
            }}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {t("simulator.reset")}
          </Button>
        </div>
      </div>

      {/* Parameters */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            {t("simulator.parameters")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>{t("simulator.baseIncome")}</span>
                  <span className="font-medium">
                    ${baseIncome.toLocaleString()}
                  </span>
                </div>
                <Slider
                  value={[baseIncome]}
                  onValueChange={value => setBaseIncome(value[0])}
                  min={20000}
                  max={200000}
                  step={5000}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>{t("simulator.baseExpenses")}</span>
                  <span className="font-medium">
                    ${baseExpenses.toLocaleString()}
                  </span>
                </div>
                <Slider
                  value={[baseExpenses]}
                  onValueChange={value => setBaseExpenses(value[0])}
                  min={10000}
                  max={150000}
                  step={5000}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>{t("simulator.investmentRate")}</span>
                  <span className="font-medium">
                    {(investmentRate * 100).toFixed(1)}%
                  </span>
                </div>
                <Slider
                  value={[investmentRate]}
                  onValueChange={value => setInvestmentRate(value[0])}
                  min={0.01}
                  max={0.2}
                  step={0.01}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>{t("simulator.riskFactor")}</span>
                  <span className="font-medium">
                    {(riskFactor * 100).toFixed(1)}%
                  </span>
                </div>
                <Slider
                  value={[riskFactor]}
                  onValueChange={value => setRiskFactor(value[0])}
                  min={0.01}
                  max={0.5}
                  step={0.01}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {scenarios.map(scenario => {
          const ScenarioIcon = getScenarioIcon(scenario.id);
          const isSelected = selectedScenario === scenario.id;

          return (
            <Card
              key={scenario.id}
              className={cn(
                "cursor-pointer transition-all duration-300 hover:shadow-lg",
                `bg-gradient-to-br ${scenario.color}`,
                isSelected && "ring-2 ring-primary shadow-xl"
              )}
              onClick={() =>
                setSelectedScenario(isSelected ? null : scenario.id)
              }
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ScenarioIcon className="h-5 w-5" />
                    <span className="font-bold text-sm">{scenario.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(scenario.probability * 100)}%
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {scenario.description}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">1Y</div>
                      <div
                        className={cn(
                          "font-bold",
                          getOutcomeColor(scenario.outcomes.year1)
                        )}
                      >
                        ${(scenario.outcomes.year1 / 1000).toFixed(0)}k
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">5Y</div>
                      <div
                        className={cn(
                          "font-bold",
                          getOutcomeColor(scenario.outcomes.year5)
                        )}
                      >
                        ${(scenario.outcomes.year5 / 1000).toFixed(0)}k
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">10Y</div>
                      <div
                        className={cn(
                          "font-bold",
                          getOutcomeColor(scenario.outcomes.year10)
                        )}
                      >
                        ${(scenario.outcomes.year10 / 1000).toFixed(0)}k
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">20Y</div>
                      <div
                        className={cn(
                          "font-bold",
                          getOutcomeColor(scenario.outcomes.year20)
                        )}
                      >
                        ${(scenario.outcomes.year20 / 1000).toFixed(0)}k
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Scenario Details */}
      {selectedScenario && (
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                {t("simulator.scenarioDetails")}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedScenario(null)}
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const scenario = scenarios.find(s => s.id === selectedScenario);
              if (!scenario) return null;

              return (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">
                      {(() => {
                        const Icon = getScenarioIcon(scenario.id);
                        return <Icon className="h-8 w-8" />;
                      })()}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{scenario.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {scenario.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      {
                        label: t("simulator.year1"),
                        value: scenario.outcomes.year1,
                        year: 1,
                      },
                      {
                        label: t("simulator.year5"),
                        value: scenario.outcomes.year5,
                        year: 5,
                      },
                      {
                        label: t("simulator.year10"),
                        value: scenario.outcomes.year10,
                        year: 10,
                      },
                      {
                        label: t("simulator.year20"),
                        value: scenario.outcomes.year20,
                        year: 20,
                      },
                    ].map(outcome => {
                      const OutcomeIcon = getOutcomeIcon(outcome.value);
                      return (
                        <div key={outcome.year} className="text-center">
                          <div className="text-sm text-muted-foreground mb-1">
                            {outcome.label}
                          </div>
                          <div
                            className={cn(
                              "text-2xl font-bold mb-1",
                              getOutcomeColor(outcome.value)
                            )}
                          >
                            ${outcome.value.toLocaleString()}
                          </div>
                          <div className="flex items-center justify-center gap-1">
                            <OutcomeIcon className="h-4 w-4" />
                            <span className="text-xs text-muted-foreground">
                              {outcome.value > 0
                                ? t("simulator.positive")
                                : t("simulator.negative")}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-4">
                    <div className="text-sm font-medium">
                      {t("simulator.factors")}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">
                          {t("simulator.incomeGrowth")}
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          {((scenario.factors.income - 1) * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">
                          {t("simulator.expenseGrowth")}
                        </div>
                        <div className="text-lg font-bold text-red-600">
                          {((scenario.factors.expenses - 1) * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">
                          {t("simulator.investmentReturn")}
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          {(scenario.factors.investment * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">
                          {t("simulator.riskLevel")}
                        </div>
                        <div className="text-lg font-bold text-orange-600">
                          {(scenario.factors.risk * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button className="gap-2">
                      <Save className="h-4 w-4" />
                      {t("simulator.saveScenario")}
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Lightbulb className="h-4 w-4" />
                      {t("simulator.getAdvice")}
                    </Button>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            {t("simulator.comparison")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scenarios.map(scenario => (
              <div key={scenario.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = getScenarioIcon(scenario.id);
                      return <Icon className="h-4 w-4" />;
                    })()}
                    <span className="font-medium">{scenario.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(scenario.probability * 100)}%
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${scenario.outcomes.year20.toLocaleString()}
                  </div>
                </div>
                <Progress
                  value={Math.min(
                    (scenario.outcomes.year20 / 2000000) * 100,
                    100
                  )}
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
