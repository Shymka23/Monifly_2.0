"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Target,
  CalendarDays as CalendarDaysIcon,
  Info,
  PlusCircle,
  CreditCard,
  TrendingUp,
  TrendingDown,
  NotebookPen,
} from "lucide-react";
import Image from "next/image";
import { useBudgetStore } from "@/hooks/use-budget-store";
import type { FinancialGoal, BudgetEntry, CalendarNote } from "@/lib/types";
import { AddFinancialGoalDialog } from "@/components/financial-goals/add-financial-goal-dialog";
import { FinancialGoalCard } from "@/components/financial-goals/financial-goal-card";
import { AddBudgetEntryDialog } from "@/components/budgeting/AddBudgetEntryDialog";
import { Calendar } from "@/components/ui/calendar";
import type { DayContentProps } from "react-day-picker";
import {
  format,
  parseISO,
  startOfDay,
  isSameDay,
  addDays,
  isWithinInterval,
  differenceInCalendarDays,
} from "date-fns";
import { ru } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import {
  generateGoalReminder,
  type GenerateGoalReminderInput,
  type GenerateGoalReminderOutput,
} from "@/ai/flows/generate-goal-reminder-flow";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn, formatCurrency } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { AddCalendarNoteDialog } from "@/components/financial-goals/AddCalendarNoteDialog";
import { CalendarNoteCard } from "@/components/financial-goals/CalendarNoteCard";
import { AppLoader } from "@/components/ui/app-loader";
import { useTranslation } from "@/hooks/use-translation";

export default function FinancialGoalsPage() {
  const { t } = useTranslation("financial-goals");

  const {
    financialGoals,
    primaryDisplayCurrency,
    convertCurrency,
    deleteFinancialGoal,
    budgetEntries,
    calendarNotes,
    updateCalendarNote,
    deleteCalendarNote,
  } = useBudgetStore(state => ({
    financialGoals: state.financialGoals,
    primaryDisplayCurrency: state.primaryDisplayCurrency,
    convertCurrency: state.convertCurrency,
    deleteFinancialGoal: state.deleteFinancialGoal,
    budgetEntries: state.budgetEntries,
    calendarNotes: state.calendarNotes,
    updateCalendarNote: state.updateCalendarNote,
    deleteCalendarNote: state.deleteCalendarNote,
  }));

  const [isClient, setIsClient] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<
    Date | undefined
  >(undefined);
  const [goalsForSelectedDate, setGoalsForSelectedDate] = useState<
    FinancialGoal[]
  >([]);
  const [budgetEntriesForSelectedDate, setBudgetEntriesForSelectedDate] =
    useState<BudgetEntry[]>([]);
  const [calendarNotesForSelectedDate, setCalendarNotesForSelectedDate] =
    useState<CalendarNote[]>([]);
  const [remindersGenerated, setRemindersGenerated] = useState(false);
  const { toast } = useToast();

  // Dialog states
  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false);
  const [isAddBudgetEntryDialogOpen, setIsAddBudgetEntryDialogOpen] =
    useState(false);
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false);

  // States for editing/deleting items
  const [goalToEdit, setGoalToEdit] = useState<FinancialGoal | null>(null);
  const [goalToDeleteId, setGoalToDeleteId] = useState<string | null>(null);
  const [budgetEntryToEdit, setBudgetEntryToEdit] =
    useState<BudgetEntry | null>(null);
  const [noteToEdit, setNoteToEdit] = useState<CalendarNote | null>(null);
  const [noteToDeleteId, setNoteToDeleteId] = useState<string | null>(null);

  const [defaultStartDateForBudget, setDefaultStartDateForBudget] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const activeGoals = useMemo(() => {
    if (!isClient) return [];
    return financialGoals
      .filter(goal => goal.status === "active")
      .sort((a, b) => {
        const dateA = a.projectedCompletionDate
          ? parseISO(a.projectedCompletionDate).getTime()
          : Infinity;
        const dateB = b.projectedCompletionDate
          ? parseISO(b.projectedCompletionDate).getTime()
          : Infinity;
        return dateA - dateB;
      });
  }, [isClient, financialGoals]);

  // --- Memoized Maps for Calendar Events ---
  const goalDates = useMemo(() => {
    if (!isClient) return [];
    return financialGoals
      .filter(goal => goal.projectedCompletionDate)
      .map(goal => startOfDay(parseISO(goal.projectedCompletionDate!)));
  }, [isClient, financialGoals]);

  const budgetEntryDates = useMemo(() => {
    if (!isClient) return [];
    return budgetEntries
      .filter(entry => entry.nextDueDate)
      .map(entry => startOfDay(parseISO(entry.nextDueDate!)));
  }, [isClient, budgetEntries]);

  const calendarNoteDates = useMemo(() => {
    if (!isClient) return [];
    return calendarNotes.map(note => startOfDay(parseISO(note.date)));
  }, [isClient, calendarNotes]);

  const combinedEventDates = useMemo(() => {
    const allDates = [...goalDates, ...budgetEntryDates, ...calendarNoteDates];
    return Array.from(new Set(allDates.map(date => date.toISOString()))).map(
      dateStr => parseISO(dateStr)
    );
  }, [goalDates, budgetEntryDates, calendarNoteDates]);

  const goalsByDateMap = useMemo(() => {
    const map = new Map<string, FinancialGoal[]>();
    if (!isClient) return map;
    financialGoals.forEach(goal => {
      if (goal.projectedCompletionDate) {
        const dateStr = format(
          startOfDay(parseISO(goal.projectedCompletionDate)),
          "yyyy-MM-dd"
        );
        if (!map.has(dateStr)) {
          map.set(dateStr, []);
        }
        map.get(dateStr)!.push(goal);
      }
    });
    return map;
  }, [isClient, financialGoals]);

  const budgetEntriesByDateMap = useMemo(() => {
    const map = new Map<string, BudgetEntry[]>();
    if (!isClient) return map;
    budgetEntries.forEach(entry => {
      if (entry.nextDueDate) {
        const dateStr = format(
          startOfDay(parseISO(entry.nextDueDate)),
          "yyyy-MM-dd"
        );
        if (!map.has(dateStr)) {
          map.set(dateStr, []);
        }
        map.get(dateStr)!.push(entry);
      }
    });
    return map;
  }, [isClient, budgetEntries]);

  const calendarNotesByDateMap = useMemo(() => {
    const map = new Map<string, CalendarNote[]>();
    if (!isClient) return map;
    calendarNotes.forEach(note => {
      const dateStr = format(startOfDay(parseISO(note.date)), "yyyy-MM-dd");
      if (!map.has(dateStr)) {
        map.set(dateStr, []);
      }
      map.get(dateStr)!.push(note);
    });
    return map;
  }, [isClient, calendarNotes]);

  useEffect(() => {
    if (selectedCalendarDate) {
      const dateStr = format(startOfDay(selectedCalendarDate), "yyyy-MM-dd");
      setGoalsForSelectedDate(goalsByDateMap.get(dateStr) || []);
      setBudgetEntriesForSelectedDate(
        budgetEntriesByDateMap.get(dateStr) || []
      );
      setCalendarNotesForSelectedDate(
        calendarNotesByDateMap.get(dateStr) || []
      );
    } else {
      setGoalsForSelectedDate([]);
      setBudgetEntriesForSelectedDate([]);
      setCalendarNotesForSelectedDate([]);
    }
  }, [
    selectedCalendarDate,
    goalsByDateMap,
    budgetEntriesByDateMap,
    calendarNotesByDateMap,
  ]);

  useEffect(() => {
    if (isClient && financialGoals.length > 0 && !remindersGenerated) {
      const today = startOfDay(new Date());
      const reminderWindowEnd = addDays(today, 7);
      const upcomingGoalsForReminder = financialGoals.filter(goal => {
        if (!goal.projectedCompletionDate || goal.status !== "active")
          return false;
        const projectedDate = startOfDay(
          parseISO(goal.projectedCompletionDate!)
        );
        return isWithinInterval(projectedDate, {
          start: today,
          end: reminderWindowEnd,
        });
      });
      if (upcomingGoalsForReminder.length > 0) {
        upcomingGoalsForReminder.forEach(async goal => {
          try {
            if (
              !goal.monthlyContribution ||
              !goal.name ||
              !goal.projectedCompletionDate ||
              !goal.targetAmount ||
              !goal.targetCurrency
            ) {
              return; // Пропускаємо цілі без необхідних даних
            }

            const monthlyContributionInTargetCurrency = convertCurrency(
              goal.monthlyContribution,
              primaryDisplayCurrency,
              goal.targetCurrency
            );
            const input: GenerateGoalReminderInput = {
              goalName: goal.name,
              daysRemaining: differenceInCalendarDays(
                parseISO(goal.projectedCompletionDate),
                today
              ),
              targetAmount: goal.targetAmount,
              targetCurrency: goal.targetCurrency,
              monthlyContribution: monthlyContributionInTargetCurrency,
            };
            const output: GenerateGoalReminderOutput =
              await generateGoalReminder(input);
            toast({
              title: `📌 ${t("reminderGoal")}: ${goal.name}`,
              description: output.reminderMessage,
              duration: 10000,
            });
          } catch {
            toast({
              title: t("error"),
              description: t("errorGeneratingReminder"),
              variant: "destructive",
            });
          }
        });
        setRemindersGenerated(true);
      }
    }
  }, [
    isClient,
    financialGoals,
    toast,
    remindersGenerated,
    primaryDisplayCurrency,
    convertCurrency,
  ]);

  const openEditGoalDialog = (goal: FinancialGoal) => {
    setGoalToEdit(goal);
    setIsAddGoalDialogOpen(true);
  };

  const openAddNewGoalDialog = () => {
    setGoalToEdit(null);
    setIsAddGoalDialogOpen(true);
  };

  const handleOpenAddGoalForDate = () => {
    if (selectedCalendarDate) {
      setGoalToEdit(null);
      setIsAddGoalDialogOpen(true);
    }
  };

  const handleOpenAddBudgetEntryForDate = () => {
    if (selectedCalendarDate) {
      setBudgetEntryToEdit(null);
      setDefaultStartDateForBudget(selectedCalendarDate.toISOString());
      setIsAddBudgetEntryDialogOpen(true);
    }
  };

  const handleOpenAddNoteForDate = () => {
    if (selectedCalendarDate) {
      setNoteToEdit(null);
      setIsAddNoteDialogOpen(true);
    }
  };

  const handleQuickRecord = () => {
    setNoteToEdit(null);
    setIsAddNoteDialogOpen(true);
  };

  const handleEditNote = (note: CalendarNote) => {
    setNoteToEdit(note);
    setIsAddNoteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsAddGoalDialogOpen(false);
    setGoalToEdit(null);
    setIsAddBudgetEntryDialogOpen(false);
    setBudgetEntryToEdit(null);
    setDefaultStartDateForBudget(undefined);
    setIsAddNoteDialogOpen(false);
    setNoteToEdit(null);
  };

  const handleDeleteGoal = (goalId: string) => {
    deleteFinancialGoal(goalId);
    toast({
      title: t("goalDeleted"),
      description: t("goalDeletedDescription"),
    });
    setGoalToDeleteId(null);
  };

  const handleDeleteNote = (noteId: string) => {
    deleteCalendarNote(noteId);
    toast({ title: t("noteDeleted") });
    setNoteToDeleteId(null);
  };

  function CustomDayContent(props: DayContentProps) {
    const dateStr = format(props.date, "yyyy-MM-dd");
    const goalsForDay = goalsByDateMap.get(dateStr);
    const budgetEventsForDay = budgetEntriesByDateMap.get(dateStr);
    const notesForDay = calendarNotesByDateMap.get(dateStr);

    const goalWithImage = goalsForDay?.find(
      g => g.imageUrl && g.status === "active"
    );
    const hasGoal = goalsForDay && goalsForDay.length > 0;
    const hasBudgetEvent = budgetEventsForDay && budgetEventsForDay.length > 0;
    const hasNote = notesForDay && notesForDay.length > 0;

    let dayIndicator = null;
    if (goalWithImage && goalWithImage.imageUrl && goalWithImage.name) {
      dayIndicator = (
        <Image
          src={goalWithImage.imageUrl}
          alt={goalWithImage.name}
          layout="fill"
          className="absolute inset-0 object-cover opacity-30 group-hover:opacity-50 transition-opacity rounded-md"
          data-ai-hint="goal calendar image"
        />
      );
    } else if (hasGoal) {
      dayIndicator = (
        <Target className="absolute top-0.5 right-0.5 h-2 w-2 text-primary opacity-70" />
      );
    }

    return (
      <div className="relative w-full h-full flex items-center justify-center group">
        {dayIndicator}
        {hasBudgetEvent && (
          <CreditCard
            className={`absolute bottom-0.5 left-0.5 h-2 w-2 ${
              hasGoal ? "text-green-500" : "text-blue-500"
            } opacity-70`}
          />
        )}
        {hasNote && (
          <NotebookPen className="absolute bottom-0.5 right-0.5 h-2 w-2 text-yellow-500 opacity-80" />
        )}
        <span className="z-10 relative text-[0.65rem] font-medium">
          {format(props.date, "d")}
        </span>
      </div>
    );
  }

  if (!isClient) {
    return <AppLoader text={t("goalsLoading")} />;
  }

  return (
    <>
      <div className="container-fluid space-responsive animate-fade-in">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
            {t("title")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground hidden sm:block">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div className="hidden sm:block">
              <h3 className="text-sm font-semibold text-foreground">
                {t("sections.goals")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t("sections.goalsDescription")}
              </p>
            </div>
          </div>

          <Button
            onClick={() => openAddNewGoalDialog()}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            <PlusCircle className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">{t("actions.addGoal")}</span>
            <span className="xs:hidden">{t("actions.addGoalShort")}</span>
          </Button>
        </div>

        {activeGoals.length > 0 && (
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 sm:p-4 rounded-xl glass border border-border/50 mb-6">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                <h2 className="text-sm sm:text-lg font-semibold text-foreground">
                  <span className="hidden sm:inline">
                    {t("sections.activeGoals")}
                  </span>
                  <span className="sm:hidden">{t("sections.activeGoals")}</span>
                </h2>
              </div>
            </div>
            <ScrollArea className="w-full whitespace-nowrap pb-3">
              <div className="flex space-x-3">
                {activeGoals.map(goal => (
                  <div key={goal.id} className="min-w-[280px] md:min-w-[320px]">
                    <FinancialGoalCard
                      goal={goal}
                      primaryDisplayCurrency={primaryDisplayCurrency}
                      onEdit={() => openEditGoalDialog(goal)}
                      onDelete={() => setGoalToDeleteId(goal.id)}
                    />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}

        <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 sm:p-4 rounded-xl glass border border-border/50 mb-6">
            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="h-4 w-4 text-primary" />
              <h2 className="text-sm sm:text-lg font-semibold text-foreground">
                <span className="hidden sm:inline">
                  {t("sections.calendarDescription")}
                </span>
                <span className="sm:hidden">{t("sections.calendar")}</span>
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleQuickRecord}
              className="text-xs"
            >
              <NotebookPen className="mr-1 h-3 w-3" />
              <span className="hidden xs:inline">{t("actions.addNote")}</span>
              <span className="xs:hidden">{t("actions.addNoteShort")}</span>
            </Button>
          </div>
        </div>

        <div className="mt-6 flex flex-col lg:flex-row gap-4 lg:gap-6">
          <div className="lg:w-auto lg:flex-shrink-0">
            <Card className="w-full shadow-modern border-primary/10 bg-card/95 backdrop-blur-sm h-full hover-lift">
              <CardHeader className="bg-primary/5 p-3 sm:p-4 rounded-t-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <CardTitle className="flex items-center text-sm sm:text-lg font-semibold text-primary-foreground">
                      <CalendarDaysIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      Календар
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-xs mt-1">
                      Цілі(
                      <Target className="inline h-2.5 w-2.5" />
                      ), операції(
                      <CreditCard className="inline h-2.5 w-2.5" />
                      ), нотатки(
                      <NotebookPen className="inline h-2.5 w-2.5" />)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex justify-center p-1 sm:p-1.5">
                <div className="w-full max-w-xs sm:max-w-sm mx-auto">
                  <Calendar
                    mode="single"
                    selected={selectedCalendarDate}
                    onSelect={setSelectedCalendarDate}
                    className="w-full"
                    locale={ru}
                    modifiers={{
                      eventDay: combinedEventDates,
                      past: { before: startOfDay(new Date()) },
                    }}
                    modifiersClassNames={{
                      eventDay: "border !border-accent rounded-md relative",
                      selected:
                        "!bg-primary !text-primary-foreground rounded-md",
                      today:
                        "!bg-secondary !text-secondary-foreground !font-bold rounded-md",
                    }}
                    disabled={date => {
                      const isPastNonEventDate =
                        date < startOfDay(new Date()) &&
                        !combinedEventDates.some(gd => isSameDay(gd, date));
                      return isPastNonEventDate;
                    }}
                    captionLayout="dropdown-buttons"
                    fromYear={new Date().getFullYear() - 5}
                    toYear={new Date().getFullYear() + 10}
                    classNames={{
                      caption:
                        "flex justify-center items-center relative pt-1 mb-2",
                      caption_dropdowns: "flex items-center gap-x-1",
                      caption_label: "text-sm sr-only",
                      day: cn(
                        "h-auto min-h-[2.2rem] sm:min-h-[2.5rem] w-full aspect-square p-0 relative focus-within:relative focus-within:z-20 hover:bg-accent hover:text-accent-foreground rounded-sm text-[0.65rem] sm:text-xs",
                        "focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1"
                      ),
                      day_selected:
                        "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90",
                      day_today:
                        "bg-secondary text-secondary-foreground !font-semibold",
                      day_outside:
                        "text-muted-foreground opacity-30 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
                      day_disabled: "text-muted-foreground opacity-30",
                      head_cell:
                        "text-muted-foreground rounded-sm w-[14.28%] font-normal text-[0.65rem]",
                      cell: "w-[14.28%] p-px",
                      nav_button: "h-6 w-6 sm:h-7 sm:w-7",
                      nav_button_previous: "absolute left-0.5 top-0",
                      nav_button_next: "absolute right-0.5 top-0",
                      dropdown:
                        "rdp-dropdown bg-card border rounded-md shadow text-xs p-0.5",
                      dropdown_month: "rdp-dropdown_month space-y-0.5 p-0.5",
                      dropdown_year: "rdp-dropdown_year space-y-0.5 p-0.5",
                      month: "space-y-1 w-full",
                      table: "w-full border-collapse",
                      row: "flex w-full mt-px",
                    }}
                    components={{ DayContent: CustomDayContent }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex-grow lg:w-1/2">
            {selectedCalendarDate ? (
              <Card className="w-full shadow-modern bg-card/90 backdrop-blur-sm h-full hover-lift">
                <CardHeader className="bg-secondary/10 p-3 sm:p-4 rounded-t-lg">
                  <CardTitle className="flex items-center text-sm sm:text-lg text-secondary-foreground">
                    <Info className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">
                      {t("calendar.eventsOn")}{" "}
                      {format(selectedCalendarDate, "PPP", { locale: ru })}
                    </span>
                    <span className="sm:hidden">
                      {t("calendar.eventsOnDate", {
                        date: format(selectedCalendarDate, "dd.MM.yyyy"),
                      })}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-3 sm:p-4">
                  {goalsForSelectedDate.length === 0 &&
                    budgetEntriesForSelectedDate.length === 0 &&
                    calendarNotesForSelectedDate.length === 0 && (
                      <p className="text-muted-foreground text-sm text-center py-4">
                        {t("messages.noGoals", {
                          defaultValue: "Nothing planned for this date.",
                        })}
                      </p>
                    )}
                  {calendarNotesForSelectedDate.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm flex items-center gap-1.5 text-muted-foreground">
                        <NotebookPen className="h-4 w-4 text-yellow-500" />
                        {t("sections.notes", { defaultValue: "Notes" })}
                      </h4>
                      {calendarNotesForSelectedDate.map(note => (
                        <CalendarNoteCard
                          key={note.id}
                          note={note}
                          onEdit={() => handleEditNote(note)}
                          onDelete={() => setNoteToDeleteId(note.id)}
                          onToggleComplete={isCompleted =>
                            updateCalendarNote(note.id, { isCompleted })
                          }
                        />
                      ))}
                    </div>
                  )}
                  {goalsForSelectedDate.map(goal => (
                    <FinancialGoalCard
                      key={goal.id}
                      goal={goal}
                      primaryDisplayCurrency={primaryDisplayCurrency}
                      onEdit={() => openEditGoalDialog(goal)}
                      onDelete={() => setGoalToDeleteId(goal.id)}
                    />
                  ))}
                  {budgetEntriesForSelectedDate.map(entry => (
                    <Card key={entry.id} className="shadow-sm">
                      <CardHeader className="pb-2 pt-3 px-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                          {entry.type === "income" ? (
                            <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                          )}
                          {entry.description}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {entry.category} -{" "}
                          {formatCurrency(entry.amount, entry.currency)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground px-3 pb-2">
                        {entry.frequency === "monthly"
                          ? t("schedule.monthlyOn", {
                              day: entry.dayOfMonth,
                              defaultValue: `Monthly, on ${entry.dayOfMonth}`,
                            })
                          : t("schedule.once", { defaultValue: "One-time" })}
                      </CardContent>
                    </Card>
                  ))}
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2 pt-2">
                    <Button
                      onClick={handleOpenAddGoalForDate}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      <Target className="mr-1 h-3 w-3" />
                      <span className="hidden xs:inline">
                        {t("actions.addGoal")}
                      </span>
                      <span className="xs:hidden">
                        {t("actions.addGoalShort")}
                      </span>
                    </Button>
                    <Button
                      onClick={handleOpenAddBudgetEntryForDate}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      <CreditCard className="mr-1 h-3 w-3" />
                      <span className="hidden xs:inline">
                        {t("sections.plannedOperations", { ns: "budgeting" })}
                      </span>
                      <span className="xs:hidden">
                        {t("sections.plannedOperationsShort", {
                          ns: "budgeting",
                        })}
                      </span>
                    </Button>
                    <Button
                      onClick={handleOpenAddNoteForDate}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      <NotebookPen className="mr-1 h-3 w-3" />
                      <span className="hidden xs:inline">
                        {t("actions.addNote")}
                      </span>
                      <span className="xs:hidden">
                        {t("actions.addNoteShort")}
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="w-full shadow-modern bg-card/90 backdrop-blur-sm h-full flex items-center justify-center border-dashed hover-lift">
                <CardContent className="text-center text-muted-foreground p-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-muted/30 to-transparent rounded-full flex items-center justify-center animate-bounce-subtle mb-4">
                    <CalendarDaysIcon className="h-8 w-8 opacity-50" />
                  </div>
                  <h3 className="text-responsive-lg font-semibold mb-2">
                    {t("messages.noGoals")}
                  </h3>
                  <p className="text-responsive-base text-muted-foreground max-w-md mx-auto">
                    {t("messages.addFirstGoal")}
                  </p>
                  <Button onClick={() => openAddNewGoalDialog()} size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t("actions.addGoal")}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {financialGoals.length === 0 &&
          !activeGoals.length &&
          !selectedCalendarDate && (
            <Card className="text-center p-12 border-dashed border-2 border-muted-foreground/20 bg-gradient-to-br from-muted/20 to-transparent animate-fade-in mt-6">
              <CardContent className="space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-muted/30 to-transparent rounded-full flex items-center justify-center animate-bounce-subtle">
                  <Target className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-responsive-lg font-semibold">
                  {t("messages.noGoals")}
                </h3>
                <p className="text-responsive-base text-muted-foreground max-w-md mx-auto mb-6">
                  {t("messages.addFirstGoal")}
                </p>
                <Button onClick={() => openAddNewGoalDialog()} size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t("actions.addGoal")}
                </Button>
              </CardContent>
            </Card>
          )}

        {financialGoals.length > 0 &&
          activeGoals.length === 0 &&
          !selectedCalendarDate && (
            <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 sm:p-4 rounded-xl glass border border-border/50 mb-6">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <h2 className="text-sm sm:text-lg font-semibold text-foreground">
                    <span className="hidden sm:inline">
                      {t("sections.goals")}
                    </span>
                    <span className="sm:hidden">{t("sections.goals")}</span>
                  </h2>
                </div>
              </div>
              <div className="grid-responsive gap-4">
                {financialGoals.map(goal => (
                  <FinancialGoalCard
                    key={goal.id}
                    goal={goal}
                    primaryDisplayCurrency={primaryDisplayCurrency}
                    onEdit={() => openEditGoalDialog(goal)}
                    onDelete={() => setGoalToDeleteId(goal.id)}
                  />
                ))}
              </div>
            </div>
          )}
      </div>

      <AddFinancialGoalDialog
        isOpen={isAddGoalDialogOpen}
        onClose={handleDialogClose}
        goalToEdit={goalToEdit}
        defaultProjectedCompletionDate={
          selectedCalendarDate ? selectedCalendarDate.toISOString() : undefined
        }
      />
      <AddBudgetEntryDialog
        isOpen={isAddBudgetEntryDialogOpen}
        onClose={handleDialogClose}
        entryToEdit={budgetEntryToEdit}
        defaultStartDate={defaultStartDateForBudget}
        defaultFrequency={"once"}
      />
      <AddCalendarNoteDialog
        isOpen={isAddNoteDialogOpen}
        onClose={handleDialogClose}
        noteToEdit={noteToEdit}
        defaultDate={selectedCalendarDate}
      />

      <AlertDialog
        open={!!goalToDeleteId}
        onOpenChange={open => !open && setGoalToDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            {" "}
            <AlertDialogTitle>
              {t("dialogs.confirmDeleteTitle", {
                defaultValue: "Are you sure?",
              })}
            </AlertDialogTitle>{" "}
            <AlertDialogDescription>
              {t("dialogs.confirmDeleteDescription", {
                defaultValue:
                  "This action is irreversible. The financial goal will be deleted.",
              })}
            </AlertDialogDescription>{" "}
          </AlertDialogHeader>
          <AlertDialogFooter>
            {" "}
            <AlertDialogCancel onClick={() => setGoalToDeleteId(null)}>
              {t("buttons.cancel", { ns: "common" })}
            </AlertDialogCancel>{" "}
            <AlertDialogAction
              onClick={() => goalToDeleteId && handleDeleteGoal(goalToDeleteId)}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {t("buttons.delete", { ns: "common" })}
            </AlertDialogAction>{" "}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={!!noteToDeleteId}
        onOpenChange={open => !open && setNoteToDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            {" "}
            <AlertDialogTitle>
              {t("dialogs.deleteNoteTitle", { defaultValue: "Delete note?" })}
            </AlertDialogTitle>{" "}
            <AlertDialogDescription>
              {t("dialogs.deleteNoteDescription", {
                defaultValue:
                  "This action is irreversible. The note will be deleted.",
              })}
            </AlertDialogDescription>{" "}
          </AlertDialogHeader>
          <AlertDialogFooter>
            {" "}
            <AlertDialogCancel onClick={() => setNoteToDeleteId(null)}>
              {t("buttons.cancel", { ns: "common" })}
            </AlertDialogCancel>{" "}
            <AlertDialogAction
              onClick={() => noteToDeleteId && handleDeleteNote(noteToDeleteId)}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {t("buttons.delete", { ns: "common" })}
            </AlertDialogAction>{" "}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
