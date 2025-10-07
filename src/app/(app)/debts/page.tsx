"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Landmark,
  PlusCircle,
  AlertTriangle,
  HandCoins,
  Users,
} from "lucide-react";
import { useBudgetStore } from "@/hooks/use-budget-store";
import type { Debt } from "@/lib/types";
import { AddDebtDialog } from "@/components/debts/AddDebtDialog";
import { DebtCard } from "@/components/debts/DebtCard";
import { RecordPaymentDialog } from "@/components/debts/RecordPaymentDialog";
import { useToast } from "@/hooks/use-toast";
import {
  differenceInCalendarDays,
  parseISO,
  startOfDay,
  isWithinInterval,
  addDays,
} from "date-fns";
import { AppLoader } from "@/components/ui/app-loader";
import React from "react";
import { useTranslation } from "@/hooks/use-translation";

export default function DebtsPage() {
  const { t } = useTranslation("debts");

  const {
    debts,
    getDebtsIOwe,
    getDebtsOwedToMe,
    deleteDebt,
    recordDebtPayment,
    wallets,
  } = useBudgetStore(state => ({
    debts: state.debts,
    getDebtsIOwe: state.getDebtsIOwe,
    getDebtsOwedToMe: state.getDebtsOwedToMe,
    deleteDebt: state.deleteDebt,
    recordDebtPayment: state.recordDebtPayment,
    wallets: state.wallets,
  }));

  const [isClient, setIsClient] = useState(false);
  const [isAddDebtDialogOpen, setIsAddDebtDialogOpen] = useState(false);
  const [isRecordPaymentDialogOpen, setIsRecordPaymentDialogOpen] =
    useState(false);
  const [selectedDebtForPayment, setSelectedDebtForPayment] =
    useState<Debt | null>(null);
  const [remindersShown, setRemindersShown] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const debtsIOwe = React.useMemo(() => getDebtsIOwe(), [getDebtsIOwe]);
  const debtsOwedToMe = React.useMemo(
    () => getDebtsOwedToMe(),
    [getDebtsOwedToMe]
  );

  useEffect(() => {
    if (isClient && debts.length > 0) {
      const today = startOfDay(new Date());
      const reminderWindowEnd = addDays(today, 7);

      [...debtsIOwe, ...debtsOwedToMe].forEach(debt => {
        if (debt.dueDate && !remindersShown.has(debt.id)) {
          const dueDate = startOfDay(parseISO(debt.dueDate));
          if (
            isWithinInterval(dueDate, { start: today, end: reminderWindowEnd })
          ) {
            const daysRemaining = differenceInCalendarDays(dueDate, today);
            toast({
              title: `🔔 ${t("debtReminderTitle")}: ${debt.personName}`,
              description: `${t("debtReminderDescription")} ${
                debt.type === "iOwe"
                  ? t("debtPaymentAction")
                  : t("debtReceiving")
              } ${t("debtAmountWord")} (${debt.description}) ${
                daysRemaining === 0
                  ? t("today")
                  : `${t("inDays")} ${daysRemaining} ${t("days")}`
              }`,
              duration: 10000,
            });
            setRemindersShown(prev => new Set(prev).add(debt.id));
          }
        }
      });
    }
  }, [isClient, debts, debtsIOwe, debtsOwedToMe, toast, remindersShown]);

  const handleOpenRecordPaymentDialog = (debt: Debt) => {
    setSelectedDebtForPayment(debt);
    setIsRecordPaymentDialogOpen(true);
  };

  const handleDeleteDebt = (debtId: string) => {
    deleteDebt(debtId);
    toast({
      title: t("debtDeleted"),
      description: t("debtDeletedDescription"),
    });
  };

  if (!isClient) {
    return <AppLoader text={t("debtsLoading")} />;
  }

  return (
    <>
      <div className="container-fluid space-responsive animate-fade-in">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
            {t("debtsTitle")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground hidden sm:block">
            {t("debtsManageDescription")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
              <Landmark className="h-6 w-6 text-primary" />
            </div>
            <div className="hidden sm:block">
              <h3 className="text-sm font-semibold text-foreground">
                {t("debtsTitle")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t("debtsManageDescription")}
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsAddDebtDialogOpen(true)}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            <PlusCircle className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">{t("addDebt")}</span>
            <span className="xs:hidden">{t("add")}</span>
          </Button>
        </div>

        <Tabs defaultValue="iOwe" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-flex">
            <TabsTrigger value="iOwe" className="text-xs sm:text-sm">
              <HandCoins className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4 text-red-500" />
              <span className="hidden xs:inline">{t("iOwe")}</span>
              <span className="xs:hidden">{t("owe")}</span>
            </TabsTrigger>
            <TabsTrigger value="owedToMe" className="text-xs sm:text-sm">
              <Users className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4 text-green-500" />
              <span className="hidden xs:inline">{t("owedToMe")}</span>
              <span className="xs:hidden">{t("owed")}</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="iOwe" className="mt-6">
            <Card className="shadow-modern hover-lift">
              <CardHeader className="bg-red-50 dark:bg-red-950/20">
                <CardTitle className="text-sm sm:text-lg text-red-700 dark:text-red-300">
                  <span className="hidden sm:inline">
                    {t("myCurrentDebts")}
                  </span>
                  <span className="sm:hidden">{t("myDebts")}</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {t("myDebtsDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {debtsIOwe.length > 0 ? (
                  debtsIOwe.map(debt => (
                    <DebtCard
                      key={debt.id}
                      debt={debt}
                      onRecordPayment={() =>
                        handleOpenRecordPaymentDialog(debt)
                      }
                      onDelete={() => handleDeleteDebt(debt.id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-500/20 to-transparent rounded-full flex items-center justify-center animate-bounce-subtle mb-4">
                      <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="text-responsive-lg font-semibold mb-2">
                      {t("empty.myDebts")}
                    </h3>
                    <p className="text-responsive-base text-muted-foreground">
                      {t("empty.myDebtsDescription")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="owedToMe" className="mt-6">
            <Card className="shadow-modern hover-lift">
              <CardHeader className="bg-green-50 dark:bg-green-950/20">
                <CardTitle className="text-sm sm:text-lg text-green-700 dark:text-green-300">
                  <span className="hidden sm:inline">
                    {t("sections.debtsToMe")}
                  </span>
                  <span className="sm:hidden">
                    {t("sections.debtsToMeShort")}
                  </span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {t("sections.debtsToMeDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {debtsOwedToMe.length > 0 ? (
                  debtsOwedToMe.map(debt => (
                    <DebtCard
                      key={debt.id}
                      debt={debt}
                      onRecordPayment={() =>
                        handleOpenRecordPaymentDialog(debt)
                      }
                      onDelete={() => handleDeleteDebt(debt.id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500/20 to-transparent rounded-full flex items-center justify-center animate-bounce-subtle mb-4">
                      <AlertTriangle className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-responsive-lg font-semibold mb-2">
                      {t("empty.debtsToMe")}
                    </h3>
                    <p className="text-responsive-base text-muted-foreground">
                      {t("empty.debtsToMeDescription")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AddDebtDialog
        isOpen={isAddDebtDialogOpen}
        onClose={() => setIsAddDebtDialogOpen(false)}
      />
      {selectedDebtForPayment && (
        <RecordPaymentDialog
          isOpen={isRecordPaymentDialogOpen}
          onClose={() => {
            setIsRecordPaymentDialogOpen(false);
            setSelectedDebtForPayment(null);
          }}
          debt={selectedDebtForPayment}
          wallets={wallets}
          onRecordPayment={recordDebtPayment}
        />
      )}
    </>
  );
}
