"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  Check,
  Clock,
  Plus,
  Calendar,
  Star,
  TrendingUp,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { EditYearDialog } from "./edit-year-dialog";
import useLifePlanningStore from "@/hooks/use-life-planning-store";
import { cn } from "@/lib/utils";

const statusIcons = {
  empty: Clock,
  in_progress: Target,
  completed: Check,
};

const statusColors = {
  empty:
    "from-slate-100 to-slate-50 border-slate-200 hover:from-slate-200 hover:to-slate-100 shadow-sm",
  in_progress:
    "from-amber-100 to-amber-50 border-amber-200 hover:from-amber-200 hover:to-amber-100 shadow-md",
  completed:
    "from-emerald-100 to-emerald-50 border-emerald-200 hover:from-emerald-200 hover:to-emerald-100 shadow-md",
};

const statusBadgeColors = {
  empty: "bg-slate-100 text-slate-600 border-slate-200",
  in_progress: "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export function LifeCalendar() {
  const { t } = useTranslation("life-goals");
  const { calendar, settings } = useLifePlanningStore();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const handleYearClick = useCallback((year: number) => {
    setSelectedYear(year);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setSelectedYear(null);
  }, []);

  if (!settings || !calendar) {
    return (
      <Card className="border-2 border-dashed border-muted-foreground/25">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 rounded-full bg-muted/20 mb-6">
            <Calendar className="h-16 w-16 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-foreground">
            {t("calendar.empty.title")}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md text-lg">
            {t("calendar.empty.description")}
          </p>
          <Button size="lg" className="gap-2 px-8 py-3 text-lg">
            <Plus className="h-5 w-5" />
            {t("calendar.empty.addFirst")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: settings.targetAge - settings.currentAge + 1 },
    (_, i) => currentYear + i
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {t("calendar.timeline")}
        </h2>
        <p className="text-muted-foreground text-lg">
          {t("calendar.description")}
        </p>
      </div>

      {/* Calendar Grid */}
      <ScrollArea className="w-full">
        <div className="flex gap-6 p-4">
          {years.map(year => {
            const entry = calendar[year] || {
              year,
              age: settings.currentAge + (year - currentYear),
              status: "empty",
              personalMilestones: [],
              financialGoals: [],
              notes: "",
            };

            const StatusIcon = statusIcons[entry.status];
            const isCurrentYear = year === currentYear;
            const totalGoals =
              entry.personalMilestones.length + entry.financialGoals.length;
            const completedGoals =
              entry.personalMilestones.filter(m => m.isCompleted).length +
              entry.financialGoals.filter(g => g.status === "completed").length;
            const progressPercentage =
              totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

            return (
              <Card
                key={year}
                className={cn(
                  "flex-shrink-0 w-[280px] cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg",
                  "bg-gradient-to-br border-2",
                  statusColors[entry.status],
                  isCurrentYear && "ring-2 ring-primary ring-offset-2"
                )}
                onClick={() => handleYearClick(year)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold">
                          {t("yearLabel", { year, age: entry.age })}
                        </h3>
                        {isCurrentYear && (
                          <Badge variant="default" className="text-xs">
                            Поточний
                          </Badge>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          statusBadgeColors[entry.status]
                        )}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {entry.status === "empty"
                          ? "Порожній"
                          : entry.status === "in_progress"
                          ? "В процесі"
                          : "Завершено"}
                      </Badge>
                    </div>
                    <StatusIcon className="h-6 w-6 text-foreground/70" />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {entry.status === "empty" ? (
                    <div className="text-center py-8">
                      <div className="p-3 rounded-full bg-muted/30 mb-3 mx-auto w-fit">
                        <Clock className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t("empty.description")}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Progress Bar */}
                      {totalGoals > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              Прогрес
                            </span>
                            <span className="font-medium">
                              {Math.round(progressPercentage)}%
                            </span>
                          </div>
                          <Progress
                            value={progressPercentage}
                            className="h-2"
                          />
                        </div>
                      )}

                      {/* Milestones */}
                      {entry.personalMilestones.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                            <Star className="h-3 w-3" />
                            Особисті віхи ({entry.personalMilestones.length})
                          </div>
                          <div className="space-y-1">
                            {entry.personalMilestones
                              .slice(0, 2)
                              .map(milestone => (
                                <div
                                  key={milestone.id}
                                  className="text-xs p-2 rounded-md bg-background/60 border flex items-center gap-2"
                                >
                                  <div
                                    className={cn(
                                      "w-2 h-2 rounded-full",
                                      milestone.isCompleted
                                        ? "bg-green-500"
                                        : "bg-amber-500"
                                    )}
                                  />
                                  <span
                                    className={cn(
                                      "truncate",
                                      milestone.isCompleted &&
                                        "line-through text-muted-foreground"
                                    )}
                                  >
                                    {milestone.title}
                                  </span>
                                </div>
                              ))}
                            {entry.personalMilestones.length > 2 && (
                              <p className="text-xs text-muted-foreground">
                                +{entry.personalMilestones.length - 2} більше...
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Financial Goals */}
                      {entry.financialGoals.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                            <TrendingUp className="h-3 w-3" />
                            Фінансові цілі ({entry.financialGoals.length})
                          </div>
                          <div className="space-y-1">
                            {entry.financialGoals.slice(0, 2).map(goal => (
                              <div
                                key={goal.id}
                                className="text-xs p-2 rounded-md bg-background/60 border flex items-center gap-2"
                              >
                                <div
                                  className={cn(
                                    "w-2 h-2 rounded-full",
                                    goal.status === "completed"
                                      ? "bg-green-500"
                                      : "bg-blue-500"
                                  )}
                                />
                                <span className="truncate">{goal.title}</span>
                              </div>
                            ))}
                            {entry.financialGoals.length > 2 && (
                              <p className="text-xs text-muted-foreground">
                                +{entry.financialGoals.length - 2} більше...
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {entry.notes && (
                        <div className="p-2 rounded-md bg-muted/30">
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {entry.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {selectedYear && (
        <EditYearDialog
          year={selectedYear}
          isOpen={selectedYear !== null}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  );
}
