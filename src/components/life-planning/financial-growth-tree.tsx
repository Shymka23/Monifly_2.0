"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TreePine,
  Leaf,
  TrendingUp,
  DollarSign,
  Target,
  Star,
  Calendar,
  Activity,
  BarChart3,
  Plus,
  Trash2,
  Edit,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import useLifePlanningStore from "@/hooks/use-life-planning-store";
import { cn } from "@/lib/utils";
import type { LifeCalendarEntry, FinancialGoal } from "@/lib/types";

interface TreeBranch {
  id: string;
  name: string;
  type: "income" | "investment" | "expense" | "goal";
  amount: number;
  growthRate: number;
  color: string;
  level: number;
  parentId?: string;
  children: string[];
  status: "growing" | "mature" | "declining" | "dead";
  startYear: number;
  endYear?: number;
}

export function FinancialGrowthTree() {
  const { t } = useTranslation("life-goals");
  const { calendar, getProgressStats } = useLifePlanningStore();
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const currentYear = new Date().getFullYear();

  // Generate tree branches from calendar data
  const treeBranches = useMemo(() => {
    if (!calendar) return [];

    const branches: TreeBranch[] = [];
    const currentYear = new Date().getFullYear();

    // Root branch - current financial position
    branches.push({
      id: "root",
      name: t("tree.root"),
      type: "income",
      amount: 50000, // Base income
      growthRate: 0.03,
      color: "from-green-600 to-emerald-600",
      level: 0,
      children: [],
      status: "growing",
      startYear: currentYear,
    });

    // Generate branches from calendar milestones
    Object.values(calendar).forEach((entry: LifeCalendarEntry) => {
      if (entry.financialGoals) {
        entry.financialGoals.forEach((goal: FinancialGoal) => {
          if (goal.targetAmount && goal.targetDate) {
            const targetYear = new Date(goal.targetDate).getFullYear();
            const yearsUntilTarget = targetYear - currentYear;
            const growthRate = yearsUntilTarget > 0 ? 0.05 : 0.02;

            branches.push({
              id: goal.id,
              name: goal.title,
              type: goal.type === "investment" ? "investment" : "goal",
              amount: goal.targetAmount,
              growthRate,
              color: getBranchColor(goal.type),
              level: 1,
              parentId: "root",
              children: [],
              status: yearsUntilTarget > 0 ? "growing" : "mature",
              startYear: currentYear,
              endYear: targetYear,
            });
          }
        });
      }
    });

    return branches;
  }, [calendar, t]);

  const getBranchColor = (category: string) => {
    const colors = {
      car: "from-blue-500 to-cyan-500",
      house: "from-green-500 to-emerald-500",
      travel: "from-purple-500 to-pink-500",
      education: "from-yellow-500 to-orange-500",
      business: "from-indigo-500 to-blue-500",
      family: "from-pink-500 to-rose-500",
      investment: "from-emerald-500 to-green-500",
      general: "from-gray-500 to-slate-500",
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const getBranchIcon = (type: string) => {
    switch (type) {
      case "income":
        return DollarSign;
      case "investment":
        return TrendingUp;
      case "expense":
        return Target;
      case "goal":
        return Star;
      default:
        return Leaf;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "growing":
        return "text-green-500";
      case "mature":
        return "text-blue-500";
      case "declining":
        return "text-yellow-500";
      case "dead":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "growing":
        return TrendingUp;
      case "mature":
        return Star;
      case "declining":
        return Target;
      case "dead":
        return Trash2;
      default:
        return Activity;
    }
  };

  const calculateBranchValue = (branch: TreeBranch) => {
    const yearsPassed = currentYear - branch.startYear;
    const growthFactor = Math.pow(1 + branch.growthRate, yearsPassed);
    return branch.amount * growthFactor;
  };

  const getBranchSize = (branch: TreeBranch) => {
    const value = calculateBranchValue(branch);
    const maxValue = Math.max(
      ...treeBranches.map(b => calculateBranchValue(b))
    );
    return Math.max(20, (value / maxValue) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <TreePine className="h-6 w-6 text-primary" />
            {t("tree.title")}
          </h3>
          <p className="text-muted-foreground text-sm">
            {t("tree.description")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "2d" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("2d")}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            {t("tree.view2d")}
          </Button>
          <Button
            variant={viewMode === "3d" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("3d")}
            className="gap-2"
          >
            <TreePine className="h-4 w-4" />
            {t("tree.view3d")}
          </Button>
        </div>
      </div>

      {/* Tree Visualization */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TreePine className="h-5 w-5 text-primary" />
            {t("tree.visualization")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-[500px] overflow-hidden bg-gradient-to-b from-green-50 to-blue-50 rounded-lg">
            {/* Tree Trunk */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-32 bg-gradient-to-t from-amber-800 to-amber-600 rounded-t-lg"></div>

            {/* Tree Branches */}
            {treeBranches.map((branch, index) => {
              if (branch.id === "root") return null;

              const BranchIcon = getBranchIcon(branch.type);
              const StatusIcon = getStatusIcon(branch.status);
              const size = getBranchSize(branch);
              const angle = (index * 45) % 360;
              const distance = 100 + branch.level * 50;
              const x = 200 + Math.cos((angle * Math.PI) / 180) * distance;
              const y = 200 - Math.sin((angle * Math.PI) / 180) * distance;

              return (
                <div
                  key={branch.id}
                  className={cn(
                    "absolute transition-all duration-500 hover:scale-110 cursor-pointer",
                    `bg-gradient-to-r ${branch.color}`
                  )}
                  style={{
                    left: x - size / 2,
                    top: y - size / 2,
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    transform: `rotate(${angle}deg)`,
                  }}
                  onClick={() => setSelectedBranch(branch.id)}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <BranchIcon className="h-6 w-6 text-white" />
                  </div>

                  {/* Branch connection line */}
                  <div
                    className="absolute bg-amber-600"
                    style={{
                      width: "2px",
                      height: distance,
                      left: "50%",
                      top: "100%",
                      transform: `rotate(${-angle}deg)`,
                      transformOrigin: "top",
                    }}
                  />

                  {/* Status indicator */}
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                    <StatusIcon className="h-2 w-2 text-green-500" />
                  </div>
                </div>
              );
            })}

            {/* Root node */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
              <DollarSign className="h-8 w-8 text-white" />
            </div>

            {/* Year indicator */}
            <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 border">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-bold">{currentYear}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branch Details */}
      {selectedBranch && (
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TreePine className="h-5 w-5 text-primary" />
                {t("tree.branchDetails")}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedBranch(null)}
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const branch = treeBranches.find(b => b.id === selectedBranch);
              if (!branch) return null;

              const currentValue = calculateBranchValue(branch);
              const BranchIcon = getBranchIcon(branch.type);
              const StatusIcon = getStatusIcon(branch.status);

              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center",
                        `bg-gradient-to-r ${branch.color}`
                      )}
                    >
                      <BranchIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{branch.name}</h4>
                      <div className="flex items-center gap-2">
                        <StatusIcon
                          className={cn(
                            "h-4 w-4",
                            getStatusColor(branch.status)
                          )}
                        />
                        <span className="text-sm text-muted-foreground">
                          {branch.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        {t("tree.initialValue")}
                      </div>
                      <div className="text-lg font-bold">
                        ${branch.amount.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        {t("tree.currentValue")}
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        ${currentValue.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        {t("tree.growthRate")}
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {(branch.growthRate * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        {t("tree.yearsActive")}
                      </div>
                      <div className="text-lg font-bold text-purple-600">
                        {currentYear - branch.startYear}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t("tree.growthProgress")}</span>
                      <span>
                        {Math.round(
                          ((currentValue - branch.amount) / branch.amount) * 100
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={Math.min(
                        ((currentValue - branch.amount) / branch.amount) * 100,
                        100
                      )}
                      className="h-2"
                    />
                  </div>

                  {branch.endYear && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("tree.targetYear")}
                      </span>
                      <Badge variant="outline">{branch.endYear}</Badge>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button size="sm" className="gap-2">
                      <Edit className="h-4 w-4" />
                      {t("tree.editBranch")}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      {t("tree.addSubBranch")}
                    </Button>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Tree Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("tree.stats.totalBranches")}
                </p>
                <p className="text-2xl font-bold">{treeBranches.length - 1}</p>
              </div>
              <div className="p-2 rounded-lg bg-green-500/10">
                <TreePine className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("tree.stats.growingBranches")}
                </p>
                <p className="text-2xl font-bold">
                  {treeBranches.filter(b => b.status === "growing").length}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("tree.stats.matureBranches")}
                </p>
                <p className="text-2xl font-bold">
                  {treeBranches.filter(b => b.status === "mature").length}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("tree.stats.totalValue")}
                </p>
                <p className="text-2xl font-bold">
                  $
                  {treeBranches
                    .reduce((acc, b) => acc + calculateBranchValue(b), 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-purple-500/10">
                <DollarSign className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branch List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            {t("tree.allBranches")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {treeBranches
              .filter(b => b.id !== "root")
              .map(branch => {
                const BranchIcon = getBranchIcon(branch.type);
                const StatusIcon = getStatusIcon(branch.status);
                const currentValue = calculateBranchValue(branch);

                return (
                  <div
                    key={branch.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer",
                      selectedBranch === branch.id && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedBranch(branch.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          `bg-gradient-to-r ${branch.color}`
                        )}
                      >
                        <BranchIcon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium">{branch.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {branch.type.toUpperCase()} • {branch.startYear}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          ${currentValue.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          +
                          {Math.round(
                            ((currentValue - branch.amount) / branch.amount) *
                              100
                          )}
                          %
                        </div>
                      </div>
                      <StatusIcon
                        className={cn("h-5 w-5", getStatusColor(branch.status))}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
