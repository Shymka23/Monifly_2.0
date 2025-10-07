"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import {
  CalendarDays,
  CheckCircle2,
  Edit,
  Target,
  Trash2,
  TrendingUp,
  XCircle,
} from "lucide-react";
import {
  format,
  parseISO,
  differenceInCalendarDays,
  startOfDay,
} from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { FinancialGoal } from "@/lib/types";

interface FinancialGoalCardProps {
  goal: FinancialGoal;
  primaryDisplayCurrency: string;
  onEdit: (goal: FinancialGoal) => void;
  onDelete: (goalId: string) => void;
}

export function FinancialGoalCard({
  goal,
  primaryDisplayCurrency,
  onEdit,
  onDelete,
}: FinancialGoalCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  let progressPercent = 0;
  if (goal.status === "achieved") {
    progressPercent = 100;
  } else if (goal.projectedCompletionDate && goal.targetDate) {
    const today = startOfDay(new Date());
    const startDate = startOfDay(parseISO(goal.targetDate));
    const projectedDate = startOfDay(parseISO(goal.projectedCompletionDate));

    if (today >= projectedDate) {
      progressPercent = 100;
    } else if (today > startDate) {
      const totalDuration = differenceInCalendarDays(projectedDate, startDate);
      const elapsedDuration = differenceInCalendarDays(today, startDate);
      if (totalDuration > 0) {
        progressPercent = Math.min(
          100,
          Math.max(0, (elapsedDuration / totalDuration) * 100)
        );
      } else if (totalDuration === 0 && elapsedDuration >= 0) {
        // if start and projected are same day
        progressPercent = 100;
      }
    }
  }

  const formattedTargetAmount = formatCurrency(
    goal.targetAmount || 0,
    goal.targetCurrency || primaryDisplayCurrency
  );
  const formattedMonthlyContribution = formatCurrency(
    goal.monthlyContribution || 0,
    primaryDisplayCurrency
  ); // Assuming monthlyContribution is stored in primaryDisplayCurrency
  const formattedProjectedDate = goal.projectedCompletionDate
    ? format(parseISO(goal.projectedCompletionDate), "PPP", { locale: ru })
    : "Неопределенно";

  const statusColors = {
    active: "text-blue-500 border-blue-500",
    achieved: "text-green-500 border-green-500",
    cancelled: "text-red-500 border-red-500",
  };
  const statusIcons = {
    active: <Target className="h-4 w-4" />,
    achieved: <CheckCircle2 className="h-4 w-4" />,
    cancelled: <XCircle className="h-4 w-4" />,
  };
  const statusText = {
    active: "Активна",
    achieved: "Достигнута",
    cancelled: "Отменена",
  };

  const handleDeleteConfirm = () => {
    onDelete(goal.id);
    setIsDeleteDialogOpen(false); // This will be handled by onOpenChange if AlertDialogCancel is used
  };

  return (
    <>
      <Card className="shadow-lg hover:shadow-xl transition-shadow flex flex-col h-full">
        <CardHeader>
          {goal.imageUrl && (
            <div className="relative w-full h-40 mb-4 rounded-md overflow-hidden">
              <Image
                src={goal.imageUrl}
                alt={goal.name || goal.title || "Цель"}
                layout="fill"
                objectFit="cover"
                data-ai-hint="goal item visual"
              />
            </div>
          )}
          <CardTitle className="text-xl font-semibold text-foreground flex items-center justify-between">
            {goal.name}
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full border flex items-center gap-1 ${
                statusColors[
                  (goal.status as keyof typeof statusColors) || "active"
                ]
              }`}
            >
              {
                statusIcons[
                  (goal.status as keyof typeof statusIcons) || "active"
                ]
              }{" "}
              {statusText[(goal.status as keyof typeof statusText) || "active"]}
            </span>
          </CardTitle>
          {goal.description && (
            <CardDescription className="text-sm text-muted-foreground line-clamp-2">
              {goal.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-3 flex-grow">
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-sm text-muted-foreground">
                Прогресс (по времени):
              </span>
              <span className="text-lg font-bold text-primary">
                {formattedTargetAmount}
              </span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <p className="text-xs text-muted-foreground text-right mt-1">
              {Math.round(progressPercent)}%
            </p>
          </div>

          <div className="flex items-center text-sm">
            <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
            <span className="text-muted-foreground">Ежемес. взнос:</span>
            <span className="font-medium text-foreground ml-1">
              {formattedMonthlyContribution}
            </span>
          </div>

          <div className="flex items-center text-sm">
            <CalendarDays className="h-4 w-4 mr-2 text-blue-500" />
            <span className="text-muted-foreground">Прогноз:</span>
            <span className="font-medium text-foreground ml-1">
              {formattedProjectedDate}
            </span>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(goal)}>
            <Edit className="mr-1 h-3 w-3" /> Ред.
          </Button>
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-1 h-3 w-3" /> Удал.
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Удалить цель "{goal.name}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  Это действие нельзя будет отменить. Вы уверены, что хотите
                  удалить эту финансовую цель?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteConfirm}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </>
  );
}
