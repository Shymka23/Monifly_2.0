"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import useLifePlanningStore from "@/hooks/use-life-planning-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  Circle,
  Edit,
  Trash2,
  Target,
  DollarSign,
  Calendar,
  Bell,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type {
  PersonalMilestone,
  FinancialGoal,
  MilestoneCategory,
} from "@/lib/types";

interface GoalsListProps {
  year: number;
}

export function GoalsList({ year }: GoalsListProps) {
  const { t } = useTranslation("life-goals");
  const {
    getYearEntry,
    updatePersonalMilestone,
    removePersonalMilestone,
    updateFinancialGoal,
    removeFinancialGoal,
  } = useLifePlanningStore();

  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [milestoneUpdates, setMilestoneUpdates] = useState<
    Partial<PersonalMilestone>
  >({});
  const [goalUpdates, setGoalUpdates] = useState<Partial<FinancialGoal>>({});

  const entry = getYearEntry(year);

  const categories: {
    value: MilestoneCategory;
    label: string;
    icon: string;
  }[] = [
    { value: "career", label: t("categories.career"), icon: "💼" },
    { value: "family", label: t("categories.family"), icon: "👨‍👩‍👧‍👦" },
    { value: "health", label: t("categories.health"), icon: "🏃‍♂️" },
    { value: "education", label: t("categories.education"), icon: "🎓" },
    { value: "travel", label: t("categories.travel"), icon: "✈️" },
    { value: "other", label: t("categories.other"), icon: "⭐" },
  ];

  const goalTypes = [
    { value: "income", label: t("financialGoals.income"), icon: "💰" },
    { value: "expense", label: t("financialGoals.expense"), icon: "💸" },
    { value: "investment", label: t("financialGoals.investment"), icon: "📈" },
    { value: "saving", label: t("financialGoals.saving"), icon: "🏦" },
  ];

  const handleMilestoneToggle = (milestoneId: string, isCompleted: boolean) => {
    updatePersonalMilestone(year, milestoneId, { isCompleted });
  };

  const handleGoalStatusChange = (goalId: string, status: string) => {
    updateFinancialGoal(year, goalId, { status });
  };

  const handleMilestoneEdit = (milestone: PersonalMilestone) => {
    setEditingMilestone(milestone.id);
    setMilestoneUpdates(milestone);
  };

  const handleGoalEdit = (goal: FinancialGoal) => {
    setEditingGoal(goal.id);
    setGoalUpdates(goal);
  };

  const handleMilestoneSave = () => {
    if (editingMilestone && milestoneUpdates.title) {
      updatePersonalMilestone(year, editingMilestone, milestoneUpdates);
      setEditingMilestone(null);
      setMilestoneUpdates({});
    }
  };

  const handleGoalSave = () => {
    if (editingGoal && goalUpdates.title) {
      updateFinancialGoal(year, editingGoal, goalUpdates);
      setEditingGoal(null);
      setGoalUpdates({});
    }
  };

  const handleMilestoneDelete = (milestoneId: string) => {
    if (confirm(t("confirmations.deleteMilestone"))) {
      removePersonalMilestone(year, milestoneId);
    }
  };

  const handleGoalDelete = (goalId: string) => {
    if (confirm(t("confirmations.deleteGoal"))) {
      removeFinancialGoal(year, goalId);
    }
  };

  if (!entry) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">{t("noData.title")}</h3>
          <p className="text-muted-foreground">{t("noData.description")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t("progress.title")} - {year}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {entry.personalMilestones.length}
              </div>
              <div className="text-sm text-muted-foreground">
                {t("progress.milestones")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {entry.personalMilestones.filter(m => m.isCompleted).length}
              </div>
              <div className="text-sm text-muted-foreground">
                {t("progress.completed")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {entry.financialGoals.length}
              </div>
              <div className="text-sm text-muted-foreground">
                {t("progress.financialGoals")}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t("milestones.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {entry.personalMilestones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("milestones.empty")}
            </div>
          ) : (
            <div className="space-y-3">
              {entry.personalMilestones.map(milestone => (
                <div
                  key={milestone.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleMilestoneToggle(
                        milestone.id,
                        !milestone.isCompleted
                      )
                    }
                    className="p-0 h-auto"
                  >
                    {milestone.isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-medium",
                          milestone.isCompleted &&
                            "line-through text-muted-foreground"
                        )}
                      >
                        {milestone.title}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {
                          categories.find(c => c.value === milestone.category)
                            ?.icon
                        }
                        {
                          categories.find(c => c.value === milestone.category)
                            ?.label
                        }
                      </Badge>
                    </div>
                    {milestone.reminders.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Bell className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {milestone.reminders.length} {t("reminders.count")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMilestoneEdit(milestone)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMilestoneDelete(milestone.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t("financialGoals.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {entry.financialGoals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("financialGoals.empty")}
            </div>
          ) : (
            <div className="space-y-3">
              {entry.financialGoals.map(goal => (
                <div key={goal.id} className="p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{goal.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {goalTypes.find(t => t.value === goal.type)?.icon}
                          {goalTypes.find(t => t.value === goal.type)?.label}
                        </Badge>
                        <Badge
                          className={cn(
                            "text-xs",
                            goal.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : goal.status === "active"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          )}
                        >
                          {goal.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 mt-2">
                        <div className="text-sm text-muted-foreground">
                          {goal.currency} {goal.amount?.toLocaleString()} /{" "}
                          {goal.targetAmount?.toLocaleString()}
                        </div>
                        {goal.targetDate && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(goal.targetDate), "MMM yyyy")}
                          </div>
                        )}
                      </div>

                      {goal.targetAmount && goal.amount && (
                        <div className="mt-2">
                          <Progress
                            value={Math.min(
                              (goal.amount / goal.targetAmount) * 100,
                              100
                            )}
                            className="h-2"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Select
                        value={goal.status || "active"}
                        onValueChange={value =>
                          handleGoalStatusChange(goal.id, value)
                        }
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">
                            {t("status.active")}
                          </SelectItem>
                          <SelectItem value="completed">
                            {t("status.completed")}
                          </SelectItem>
                          <SelectItem value="paused">
                            {t("status.paused")}
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGoalEdit(goal)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGoalDelete(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Milestone Dialog */}
      <Dialog
        open={!!editingMilestone}
        onOpenChange={() => setEditingMilestone(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("milestones.edit")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                {t("milestone.title")}
              </label>
              <Input
                value={milestoneUpdates.title || ""}
                onChange={e =>
                  setMilestoneUpdates(prev => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                {t("milestone.category")}
              </label>
              <Select
                value={milestoneUpdates.category}
                onValueChange={(value: MilestoneCategory) =>
                  setMilestoneUpdates(prev => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingMilestone(null)}
              >
                {t("common.cancel")}
              </Button>
              <Button onClick={handleMilestoneSave}>{t("common.save")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={!!editingGoal} onOpenChange={() => setEditingGoal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("financialGoals.edit")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                {t("financialGoals.title")}
              </label>
              <Input
                value={goalUpdates.title || ""}
                onChange={e =>
                  setGoalUpdates(prev => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">
                  {t("financialGoals.amount")}
                </label>
                <Input
                  type="number"
                  value={goalUpdates.amount || ""}
                  onChange={e =>
                    setGoalUpdates(prev => ({
                      ...prev,
                      amount: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  {t("financialGoals.targetAmount")}
                </label>
                <Input
                  type="number"
                  value={goalUpdates.targetAmount || ""}
                  onChange={e =>
                    setGoalUpdates(prev => ({
                      ...prev,
                      targetAmount: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingGoal(null)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleGoalSave}>{t("common.save")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
