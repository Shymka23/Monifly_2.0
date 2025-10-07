"use client";

import type { Debt } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, cn } from "@/lib/utils";
import {
  CalendarDays,
  Trash2,
  Coins,
  Users,
  AlertTriangle,
  HandCoins,
} from "lucide-react";
import { format, parseISO } from "date-fns";
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
import { Badge } from "@/components/ui/badge";

interface DebtCardProps {
  debt: Debt;
  onRecordPayment: (debt: Debt) => void;
  onDelete: (debtId: string) => void;
}

export function DebtCard({ debt, onRecordPayment, onDelete }: DebtCardProps) {
  const progressPercent =
    (debt.initialAmount || 0) > 0
      ? ((debt.paidAmount || 0) / (debt.initialAmount || 1)) * 100
      : 0;
  const remainingAmount = (debt.initialAmount || 0) - (debt.paidAmount || 0);

  const formattedInitialAmount = formatCurrency(
    debt.initialAmount || 0,
    debt.currency
  );
  const formattedPaidAmount = formatCurrency(
    debt.paidAmount || 0,
    debt.currency
  );
  const formattedRemainingAmount = formatCurrency(
    remainingAmount,
    debt.currency
  );

  const formattedDueDate = debt.dueDate
    ? format(parseISO(debt.dueDate), "PPP", { locale: ru })
    : "Не указана";

  const isOverdue =
    debt.dueDate &&
    parseISO(debt.dueDate) < new Date() &&
    debt.status !== "paid" &&
    debt.status !== "cancelled";

  const statusText: Record<NonNullable<Debt["status"]>, string> = {
    pending: "Ожидает",
    partiallyPaid: "Частично выплачен",
    paid: "Выплачен",
    cancelled: "Отменен",
  };

  const statusVariant: Record<
    NonNullable<Debt["status"]>,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    pending: "outline",
    partiallyPaid: "secondary",
    paid: "default", // 'default' often is primary color, good for 'paid'
    cancelled: "destructive",
  };

  return (
    <Card
      className={cn(
        "shadow-md hover:shadow-lg transition-shadow",
        isOverdue && "border-red-500 ring-1 ring-red-500/50"
      )}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center">
              {debt.type === "iOwe" ? (
                <HandCoins className="mr-2 h-5 w-5 text-red-500" />
              ) : (
                <Users className="mr-2 h-5 w-5 text-green-500" />
              )}
              {debt.type === "iOwe"
                ? `Я должен: ${debt.personName}`
                : `Мне должен: ${debt.personName}`}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground line-clamp-2">
              {debt.description}
            </CardDescription>
          </div>
          <Badge variant={statusVariant[debt.status || "pending"]}>
            {statusText[debt.status || "pending"]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-sm text-muted-foreground">
              {debt.type === "iOwe"
                ? "Осталось выплатить:"
                : "Осталось получить:"}
            </span>
            <span className="text-lg font-bold text-primary">
              {formattedRemainingAmount}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <p className="text-xs text-muted-foreground text-right mt-1">
            {debt.type === "iOwe"
              ? `Выплачено ${formattedPaidAmount} из ${formattedInitialAmount}`
              : `Получено ${formattedPaidAmount} из ${formattedInitialAmount}`}
            ({Math.round(progressPercent)}%)
          </p>
        </div>

        <div className="flex items-center text-sm">
          <Coins className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-muted-foreground">Общая сумма:</span>
          <span className="font-medium text-foreground ml-1">
            {formattedInitialAmount}
          </span>
        </div>

        <div
          className={cn(
            "flex items-center text-sm",
            isOverdue && "text-red-600 font-semibold"
          )}
        >
          <CalendarDays className="h-4 w-4 mr-2" />
          <span className="text-muted-foreground">
            {isOverdue ? "Срок истек:" : "Срок до:"}
          </span>
          <span className="font-medium ml-1">{formattedDueDate}</span>
          {isOverdue && <AlertTriangle className="ml-2 h-4 w-4 text-red-500" />}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-end gap-2">
        {debt.status !== "paid" && debt.status !== "cancelled" && (
          <Button
            variant="default"
            size="sm"
            onClick={() => onRecordPayment(debt)}
          >
            <Coins className="mr-1 h-3 w-3" />{" "}
            {debt.type === "iOwe" ? "Заплатить" : "Получено"}
          </Button>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-1 h-3 w-3" /> Удалить
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Удалить долг?</AlertDialogTitle>
              <AlertDialogDescription>
                Это действие нельзя будет отменить. Вы уверены, что хотите
                удалить запись о долге{" "}
                {debt.type === "iOwe"
                  ? ` перед ${debt.personName}`
                  : ` от ${debt.personName}`}{" "}
                ({debt.description})?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(debt.id)}
                className="bg-destructive hover:bg-destructive/90"
              >
                Удалить
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
