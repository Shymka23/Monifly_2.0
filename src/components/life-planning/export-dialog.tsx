"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/use-translation";
import useLifePlanningStore from "@/hooks/use-life-planning-store";
import { LifeCalendarPDF } from "./life-calendar-pdf";
import { PDFViewer } from "@react-pdf/renderer";
import type { LifeCalendarEntry } from "@/lib/types";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
  const { t } = useTranslation("life-goals");
  const { calendar, settings } = useLifePlanningStore();
  const [includeFinancialGoals, setIncludeFinancialGoals] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  if (!settings) {
    return (
      <Dialog open={isOpen} onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{t("export.title")}</DialogTitle>
          </DialogHeader>
          <div className="text-center p-6">
            <p className="text-muted-foreground">
              {t("export.error.settingsNotInitialized")}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const entries = Object.values(calendar).sort((a, b) => a.year - b.year);

  const getMonthlyExpenses = (goals: LifeCalendarEntry["financialGoals"]) => {
    return goals
      .filter(goal => goal.type === "expense")
      .reduce((sum, goal) => sum + (goal.monthlyExpenses || 0), 0);
  };

  const getMonthlyIncome = (goals: LifeCalendarEntry["financialGoals"]) => {
    return goals
      .filter(goal => goal.type === "income")
      .reduce((sum, goal) => sum + (goal.monthlyIncome || 0), 0);
  };

  const formattedEntries = entries.map(entry => ({
    ...entry,
    monthlyExpenses: getMonthlyExpenses(entry.financialGoals),
    monthlyIncome: getMonthlyIncome(entry.financialGoals),
  }));

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{t("export.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold">
              {t("export.subtitle", {
                age: settings.currentAge,
                targetAge: settings.targetAge,
              })}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t("export.description")}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="includeFinancialGoals">
                {t("export.includeFinancialGoals")}
              </Label>
              <Switch
                id="includeFinancialGoals"
                checked={includeFinancialGoals}
                onCheckedChange={setIncludeFinancialGoals}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="includeNotes">{t("export.includeNotes")}</Label>
              <Switch
                id="includeNotes"
                checked={includeNotes}
                onCheckedChange={setIncludeNotes}
              />
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? t("export.back") : t("export.preview")}
            </Button>
            <Button onClick={() => window.print()}>
              {t("export.download")}
            </Button>
          </div>

          {showPreview && (
            <div className="h-[600px] w-full">
              <PDFViewer width="100%" height="100%">
                <LifeCalendarPDF
                  entries={formattedEntries}
                  settings={settings}
                  includeFinancialGoals={includeFinancialGoals}
                  includeNotes={includeNotes}
                />
              </PDFViewer>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
