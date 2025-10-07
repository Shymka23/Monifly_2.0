"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  ChevronLeft,
  Plus,
  Image as ImageIcon,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import useLifePlanningStore from "@/hooks/use-life-planning-store";
import { cn } from "@/lib/utils";
import { AddDetailedGoalDialog } from "./add-detailed-goal-dialog";
import type { PersonalMilestone, FinancialGoal } from "@/lib/types";

type ViewMode = "year" | "month" | "day";

interface DetailedCalendarViewProps {
  year: number;
}

const MONTHS = [
  "Січень",
  "Лютий",
  "Березень",
  "Квітень",
  "Травень",
  "Червень",
  "Липень",
  "Серпень",
  "Вересень",
  "Жовтень",
  "Листопад",
  "Грудень",
];

const DAYS_OF_WEEK = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

export function DetailedCalendarView({ year }: DetailedCalendarViewProps) {
  const { calendar, updatePersonalMilestone } = useLifePlanningStore();
  const [viewMode, setViewMode] = useState<ViewMode>("year");
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const entry = calendar[year];

  const getItemsForPeriod = (
    month?: number,
    day?: number
  ): (PersonalMilestone | FinancialGoal)[] => {
    if (!entry) return [];

    const allItems = [...entry.personalMilestones, ...entry.financialGoals] as (
      | PersonalMilestone
      | FinancialGoal
    )[];

    return allItems.filter(item => {
      if ("month" in item && item.month !== undefined) {
        if (month !== undefined && item.month !== month) return false;
        if (day !== undefined && item.day !== day) return false;
        return true;
      }
      return month === undefined; // Показуємо елементи без дати тільки на рівні року
    });
  };

  const renderYearView = () => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">{year} рік</h2>
          <p className="text-muted-foreground">
            Оберіть місяць для детального планування
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {MONTHS.map((month, index) => {
            const items = getItemsForPeriod(index);
            const today = new Date();
            const isCurrentMonth =
              today.getMonth() === index && today.getFullYear() === year;

            return (
              <Card
                key={index}
                className={cn(
                  "cursor-pointer hover:shadow-xl transition-all hover:scale-105 hover:-translate-y-1",
                  isCurrentMonth && "ring-2 ring-primary shadow-lg",
                  items.length > 0 &&
                    "bg-gradient-to-br from-primary/5 to-accent/5"
                )}
                onClick={() => {
                  setSelectedMonth(index);
                  setViewMode("month");
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-base font-bold">
                      {month}
                    </CardTitle>
                    {isCurrentMonth && (
                      <Sparkles className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={items.length > 0 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {items.length} {items.length === 1 ? "ціль" : "цілей"}
                    </Badge>
                    {items.some(
                      item => "imageUrl" in item && item.imageUrl
                    ) && <ImageIcon className="h-4 w-4 text-primary" />}
                  </div>
                  {items.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {
                        items.filter(
                          item => "isCompleted" in item && item.isCompleted
                        ).length
                      }{" "}
                      завершено
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    // Тепер місячний вигляд показує календар з днями
    return renderWeekView();
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const renderWeekView = () => {
    const daysInMonth = getDaysInMonth(year, selectedMonth);
    const firstDayOfMonth = new Date(year, selectedMonth, 1).getDay();
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    // Генеруємо календар місяця
    const calendarDays: (number | null)[] = [];

    // Порожні клітинки перед початком місяця
    for (let i = 0; i < adjustedFirstDay; i++) {
      calendarDays.push(null);
    }

    // Дні місяця
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push(i);
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={() => setViewMode("year")}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Назад до року
          </Button>
          <div className="text-center">
            <h3 className="text-2xl font-bold">
              {MONTHS[selectedMonth]} {year}
            </h3>
            <p className="text-sm text-muted-foreground">
              Оберіть день для планування
            </p>
          </div>
          <div className="w-24" /> {/* Spacer для центрування */}
        </div>

        {/* Заголовки днів тижня */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {DAYS_OF_WEEK.map(day => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Календар */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((dayNumber, index) => {
            if (dayNumber === null) {
              return <div key={`empty-${index}`} />;
            }

            const items = getItemsForPeriod(selectedMonth, dayNumber);
            const today = new Date();
            const isToday =
              today.getDate() === dayNumber &&
              today.getMonth() === selectedMonth &&
              today.getFullYear() === year;

            return (
              <Card
                key={dayNumber}
                className={cn(
                  "cursor-pointer hover:shadow-lg transition-all hover:scale-105 min-h-[80px]",
                  isToday && "ring-2 ring-primary",
                  items.length > 0 && "bg-primary/5"
                )}
                onClick={() => {
                  setSelectedDay(dayNumber);
                  setViewMode("day");
                }}
              >
                <CardHeader className="pb-2 pt-3 px-3 space-y-1">
                  <CardTitle
                    className={cn(
                      "text-lg font-bold text-center",
                      isToday && "text-primary"
                    )}
                  >
                    {dayNumber}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-2 pb-2">
                  {items.length > 0 && (
                    <div className="flex flex-col items-center gap-1">
                      <Badge variant="secondary" className="text-[10px] px-1.5">
                        {items.length}
                      </Badge>
                      {items.some(
                        item => "imageUrl" in item && item.imageUrl
                      ) && <ImageIcon className="h-3 w-3 text-primary" />}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const items = getItemsForPeriod(selectedMonth, selectedDay);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("month")}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Назад до календаря
          </Button>
          <div className="text-center">
            <h3 className="text-2xl font-bold">
              {selectedDay} {MONTHS[selectedMonth]} {year}
            </h3>
            <p className="text-sm text-muted-foreground">
              {
                DAYS_OF_WEEK[
                  new Date(year, selectedMonth, selectedDay).getDay() === 0
                    ? 6
                    : new Date(year, selectedMonth, selectedDay).getDay() - 1
                ]
              }
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddDialog(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Додати ціль
          </Button>
        </div>

        <ScrollArea className="h-[500px]">
          <div className="space-y-3">
            {items.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Немає цілей на цей день
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4"
                    onClick={() => setShowAddDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Додати першу ціль
                  </Button>
                </CardContent>
              </Card>
            ) : (
              items.map(item => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Зображення */}
                      {"imageUrl" in item && item.imageUrl ? (
                        <div className="flex-shrink-0">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}

                      {/* Контент */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-lg">
                              {item.title}
                            </h4>
                            {"category" in item && (
                              <Badge variant="outline" className="mt-1">
                                {item.category}
                              </Badge>
                            )}
                            {"type" in item && (
                              <Badge variant="outline" className="mt-1">
                                {item.type}
                              </Badge>
                            )}
                          </div>
                          {"isCompleted" in item && (
                            <Button
                              variant={item.isCompleted ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                updatePersonalMilestone(year, item.id, {
                                  isCompleted: !item.isCompleted,
                                });
                              }}
                            >
                              {item.isCompleted ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>

                        {"description" in item && item.description && (
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        )}

                        {"amount" in item && (
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {item.amount} {item.currency}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        <AddDetailedGoalDialog
          year={year}
          month={selectedMonth}
          day={selectedDay}
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Навігаційні кнопки */}
      <Card className="p-2 bg-muted/50">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant={viewMode === "year" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("year")}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Річний огляд
          </Button>
          <div className="h-6 w-px bg-border" />
          <Button
            variant={viewMode === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("month")}
            disabled={viewMode === "year"}
            className="gap-2"
          >
            Календар місяця
          </Button>
          <div className="h-6 w-px bg-border" />
          <Button
            variant={viewMode === "day" ? "default" : "ghost"}
            size="sm"
            disabled={viewMode === "year"}
            className="gap-2"
          >
            Деталі дня
          </Button>
        </div>
      </Card>

      {/* Контент залежно від режиму перегляду */}
      <div className="min-h-[400px]">
        {viewMode === "year" && renderYearView()}
        {viewMode === "month" && renderMonthView()}
        {viewMode === "day" && renderDayView()}
      </div>
    </div>
  );
}
