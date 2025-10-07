"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Target,
  Gift,
  Calendar,
  Star,
  Lock,
  Unlock,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import useLifePlanningStore from "@/hooks/use-life-planning-store";
import { cn } from "@/lib/utils";
import type { LifeCalendarEntry, FinancialGoal } from "@/lib/types";

interface GoalCapsule {
  id: string;
  title: string;
  targetYear: number;
  targetAmount: number;
  currentAmount: number;
  category: string;
  status: "locked" | "unlocked" | "achieved";
  description: string;
  icon: string;
}

export function GoalTimeCapsules() {
  const { t } = useTranslation("life-goals");
  const { calendar, settings, getProgressStats } = useLifePlanningStore();
  // const [selectedCapsule] = useState<string | null>(null);
  const currentYear = new Date().getFullYear();

  // Generate goal capsules from calendar data
  const capsules = useMemo(() => {
    if (!calendar || !settings) return [];

    const goals: GoalCapsule[] = [];
    const currentYear = new Date().getFullYear();

    Object.values(calendar).forEach((entry: LifeCalendarEntry) => {
      if (entry.financialGoals) {
        entry.financialGoals.forEach((goal: FinancialGoal) => {
          if (goal.targetAmount && goal.targetDate) {
            const targetYear = new Date(goal.targetDate).getFullYear();
            const progress = Math.min(
              (goal.amount || 0) / goal.targetAmount,
              1
            );
            const status =
              targetYear <= currentYear
                ? progress >= 1
                  ? "achieved"
                  : "unlocked"
                : "locked";

            goals.push({
              id: goal.id,
              title: goal.title,
              targetYear: targetYear,
              targetAmount: goal.targetAmount,
              currentAmount: goal.amount || 0,
              category: goal.type,
              status,
              description: goal.description || "",
              icon: "target",
            });
          }
        });
      }
    });

    return goals.sort((a, b) => a.targetYear - b.targetYear);
  }, [calendar, settings]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "locked":
        return Lock;
      case "unlocked":
        return Unlock;
      case "achieved":
        return Star;
      default:
        return Target;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "locked":
        return "bg-gray-500/20 border-gray-500/30";
      case "unlocked":
        return "bg-blue-500/20 border-blue-500/30";
      case "achieved":
        return "bg-green-500/20 border-green-500/30";
      default:
        return "bg-primary/20 border-primary/30";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "car":
        return "🚗";
      case "house":
        return "🏠";
      case "travel":
        return "✈️";
      case "education":
        return "🎓";
      case "business":
        return "💼";
      case "family":
        return "👨‍👩‍👧‍👦";
      default:
        return "🎯";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" />
            {t("capsules.title")}
          </h3>
          <p className="text-muted-foreground text-sm">
            {t("capsules.description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Calendar className="h-3 w-3" />
            {currentYear}
          </Badge>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary opacity-30" />

        <ScrollArea className="w-full h-[400px]">
          <div className="space-y-4 p-4">
            {capsules.map(capsule => {
              const StatusIcon = getStatusIcon(capsule.status);
              const progress =
                (capsule.currentAmount / capsule.targetAmount) * 100;
              const yearsUntilTarget = capsule.targetYear - currentYear;
              const isCurrentYear = capsule.targetYear === currentYear;
              const isPastYear = capsule.targetYear < currentYear;

              return (
                <Card
                  key={capsule.id}
                  className={cn(
                    "relative ml-8 transition-all duration-300 hover:shadow-lg cursor-pointer",
                    getStatusColor(capsule.status),
                    isCurrentYear && "ring-2 ring-primary/50 shadow-lg",
                    capsule.status === "achieved" && "animate-pulse"
                  )}
                  onClick={() => {
                    /* Select capsule */
                  }}
                >
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      "absolute -left-6 top-4 w-4 h-4 rounded-full border-2 flex items-center justify-center",
                      isCurrentYear
                        ? "bg-primary border-primary"
                        : "bg-background border-muted-foreground"
                    )}
                  >
                    <StatusIcon className="h-2 w-2" />
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="text-2xl">
                          {getCategoryIcon(capsule.category)}
                        </span>
                        {capsule.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={isCurrentYear ? "default" : "secondary"}
                        >
                          {capsule.targetYear}
                        </Badge>
                        {capsule.status === "achieved" && (
                          <Sparkles className="h-4 w-4 text-yellow-500 animate-spin" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {t("capsules.progress")}
                        </span>
                        <span className="font-medium">
                          {capsule.currentAmount.toLocaleString()} /{" "}
                          {capsule.targetAmount.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {Math.round(progress)}% {t("capsules.completed")}
                        </span>
                        <span>
                          {yearsUntilTarget > 0
                            ? `${yearsUntilTarget} ${t("capsules.yearsLeft")}`
                            : isPastYear
                            ? t("capsules.overdue")
                            : t("capsules.thisYear")}
                        </span>
                      </div>
                    </div>

                    {capsule.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {capsule.description}
                      </p>
                    )}

                    {/* Status indicators */}
                    <div className="flex items-center gap-2">
                      {capsule.status === "locked" && (
                        <Badge variant="secondary" className="gap-1">
                          <Lock className="h-3 w-3" />
                          {t("capsules.locked")}
                        </Badge>
                      )}
                      {capsule.status === "unlocked" && (
                        <Badge variant="default" className="gap-1">
                          <Unlock className="h-3 w-3" />
                          {t("capsules.unlocked")}
                        </Badge>
                      )}
                      {capsule.status === "achieved" && (
                        <Badge variant="default" className="gap-1 bg-green-500">
                          <Star className="h-3 w-3" />
                          {t("capsules.achieved")}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>

      {/* Empty state */}
      {capsules.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Gift className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {t("capsules.empty.title")}
          </h3>
          <p className="text-muted-foreground mb-4">
            {t("capsules.empty.description")}
          </p>
          <Button className="gap-2">
            <Target className="h-4 w-4" />
            {t("capsules.empty.addFirst")}
          </Button>
        </div>
      )}

      {/* Statistics */}
      {capsules.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("capsules.stats.total")}
                  </p>
                  <p className="text-2xl font-bold">{capsules.length}</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("capsules.stats.achieved")}
                  </p>
                  <p className="text-2xl font-bold">
                    {capsules.filter(c => c.status === "achieved").length}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Star className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("capsules.stats.unlocked")}
                  </p>
                  <p className="text-2xl font-bold">
                    {capsules.filter(c => c.status === "unlocked").length}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Unlock className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
