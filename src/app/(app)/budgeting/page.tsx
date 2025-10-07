"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PlusCircle,
  CalendarClock,
  BarChart,
  PieChart,
  List,
} from "lucide-react";
import { useBudgetStore } from "@/hooks/use-budget-store";
import type { BudgetEntry } from "@/lib/types";
import { AddBudgetEntryDialog } from "@/components/budgeting/AddBudgetEntryDialog";
import { BudgetEntryCard } from "@/components/budgeting/BudgetEntryCard";
import { BudgetStats } from "@/components/budgeting/BudgetStats";
import { BudgetCharts } from "@/components/budgeting/BudgetCharts";
import { BudgetOverviewCard } from "@/components/budgeting/BudgetOverviewCard";
import { useToast } from "@/hooks/use-toast";
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
import { AppLoader } from "@/components/ui/app-loader";
import { useTranslation } from "@/hooks/use-translation";

export default function BudgetingPage() {
  const { t } = useTranslation("budgeting");

  const { budgetEntries, deleteBudgetEntry } = useBudgetStore();

  const [isClient, setIsClient] = useState(false);
  const [isAddEntryDialogOpen, setIsAddEntryDialogOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<BudgetEntry | null>(null);
  const [entryToDeleteId, setEntryToDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const budgetEntriesList = useMemo(() => {
    if (!isClient) return [];
    return budgetEntries;
  }, [isClient, budgetEntries]);

  const handleOpenAddDialog = () => {
    setEntryToEdit(null);
    setIsAddEntryDialogOpen(true);
  };

  const handleOpenEditDialog = (entry: BudgetEntry) => {
    setEntryToEdit(entry);
    setIsAddEntryDialogOpen(true);
  };

  const handleDeleteEntry = (entryId: string) => {
    deleteBudgetEntry(entryId);
    toast({ title: t("budgetEntryDeleted") });
    setEntryToDeleteId(null);
  };

  if (!isClient) {
    return <AppLoader text={t("budgetLoading")} />;
  }

  return (
    <>
      <div className="container-fluid space-responsive animate-fade-in">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
                {t("title")}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground hidden sm:block">
                {t("subtitle")}
              </p>
            </div>
            <Button
              onClick={handleOpenAddDialog}
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              <PlusCircle className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">{t("addBudgetEntry")}</span>
              <span className="xs:hidden">{t("addBudgetEntryShort")}</span>
            </Button>
          </div>
        </div>

        {budgetEntriesList.length > 0 ? (
          <>
            {/* Статистика */}
            <BudgetStats />

            {/* Вкладки */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="overview" className="gap-2">
                  <PieChart className="h-4 w-4" />
                  {t("tabs.overview")}
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2">
                  <BarChart className="h-4 w-4" />
                  {t("tabs.analytics")}
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-2">
                  <List className="h-4 w-4" />
                  {t("tabs.list")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {budgetEntriesList.map(entry => (
                    <BudgetOverviewCard key={entry.id} budgetEntry={entry} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <BudgetCharts />
              </TabsContent>

              <TabsContent value="list" className="space-y-4">
                <div className="grid-responsive gap-4">
                  {budgetEntriesList.map(entry => (
                    <BudgetEntryCard
                      key={entry.id}
                      budgetEntry={entry}
                      onEdit={() => handleOpenEditDialog(entry)}
                      onDelete={() => setEntryToDeleteId(entry.id)}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card className="text-center p-8 sm:p-12 border-dashed border-2 border-muted-foreground/20 bg-gradient-to-br from-muted/20 to-transparent animate-fade-in">
            <CardContent className="space-y-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-primary/20 to-transparent rounded-full flex items-center justify-center animate-bounce-subtle">
                <CalendarClock className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">
                  {t("empty.budgetEntries")}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto mb-6">
                  {t("empty.budgetEntriesDescription")}
                </p>
                <Button onClick={handleOpenAddDialog} size="lg">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  {t("empty.createFirst")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <AddBudgetEntryDialog
        isOpen={isAddEntryDialogOpen}
        onClose={() => setIsAddEntryDialogOpen(false)}
        entryToEdit={entryToEdit}
      />

      <AlertDialog
        open={!!entryToDeleteId}
        onOpenChange={open => !open && setEntryToDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("notifications.deleteTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("notifications.deleteDescription")} "
              {budgetEntries.find(e => e.id === entryToDeleteId)?.description}"
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEntryToDeleteId(null)}>
              {t("notifications.deleteCancel", {
                defaultValue: t("buttons.cancel", { ns: "common" }),
              })}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                entryToDeleteId && handleDeleteEntry(entryToDeleteId)
              }
              className="bg-destructive hover:bg-destructive/90"
            >
              {t("notifications.deleteConfirm", {
                defaultValue: t("buttons.delete", { ns: "common" }),
              })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
