"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";
import useLifePlanningStore from "@/hooks/use-life-planning-store";
import {
  MILESTONE_CATEGORIES,
  MilestoneCategory,
  type LifeCalendarEntry,
  type FinancialGoal,
} from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { DetailedCalendarView } from "./detailed-calendar-view";
import { Calendar, List } from "lucide-react";

interface EditYearDialogProps {
  year: number;
  isOpen: boolean;
  onClose: () => void;
}

export function EditYearDialog({ year, isOpen, onClose }: EditYearDialogProps) {
  const { t } = useTranslation("life-goals");
  const { calendar, settings, updateCalendarEntry } = useLifePlanningStore();
  const { toast } = useToast();

  const entry = calendar[year] || {
    year,
    age: settings?.currentAge
      ? settings.currentAge + (year - new Date().getFullYear())
      : 30,
    status: "empty" as const,
    personalMilestones: [],
    financialGoals: [] as FinancialGoal[],
    notes: "",
  };

  const [notes, setNotes] = useState(entry.notes);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneCategory, setNewMilestoneCategory] =
    useState<MilestoneCategory>(MILESTONE_CATEGORIES[0]);

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) return;

    const updatedEntry: Partial<LifeCalendarEntry> = {
      ...entry,
      personalMilestones: [
        ...entry.personalMilestones,
        {
          id: crypto.randomUUID(),
          title: newMilestoneTitle,
          category: newMilestoneCategory,
          isCompleted: false,
          reminders: [],
        },
      ],
      status: "in_progress" as const,
    };

    updateCalendarEntry(year, updatedEntry);
    setNewMilestoneTitle("");
    toast({
      title: t("messages.milestoneAdded"),
    });
  };

  const handleRemoveMilestone = (id: string) => {
    const updatedEntry: Partial<LifeCalendarEntry> = {
      ...entry,
      personalMilestones: entry.personalMilestones.filter(m => m.id !== id),
    };

    if (updatedEntry.personalMilestones?.length === 0 && !notes) {
      updatedEntry.status = "empty";
    }

    updateCalendarEntry(year, updatedEntry);
    toast({
      title: t("messages.milestoneRemoved"),
    });
  };

  const handleSave = () => {
    const updatedEntry: Partial<LifeCalendarEntry> = {
      ...entry,
      notes,
      status:
        notes || entry.personalMilestones.length > 0 ? "in_progress" : "empty",
    };

    updateCalendarEntry(year, updatedEntry);
    toast({
      title: t("messages.yearUpdated"),
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {year} рік (вік: {entry.age})
          </DialogTitle>
          <DialogDescription>
            Плануйте детально: рік, місяць, тиждень або день
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              Детальний календар
            </TabsTrigger>
            <TabsTrigger value="quick" className="gap-2">
              <List className="h-4 w-4" />
              Швидке додавання
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-4">
            <div className="max-h-[70vh] overflow-y-auto pr-2">
              <DetailedCalendarView year={year} />
            </div>
          </TabsContent>

          <TabsContent value="quick" className="mt-4">
            <div className="space-y-6 py-4">
              {/* Milestones */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">{t("milestones.title")}</h4>

                <div className="flex gap-2">
                  <Input
                    value={newMilestoneTitle}
                    onChange={e => setNewMilestoneTitle(e.target.value)}
                    placeholder={t("milestones.add.placeholder")}
                    className="flex-1"
                  />
                  <Select
                    value={newMilestoneCategory}
                    onValueChange={(value: MilestoneCategory) =>
                      setNewMilestoneCategory(value)
                    }
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MILESTONE_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {t(`milestones.categories.${category}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddMilestone}>
                    {t("common.add")}
                  </Button>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {entry.personalMilestones.map(milestone => (
                    <div
                      key={milestone.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{milestone.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {t(`milestones.categories.${milestone.category}`)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMilestone(milestone.id)}
                      >
                        {t("common.remove")}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("yearEdit.notes.label")}
                </label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={t("yearEdit.notes.placeholder")}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={onClose}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSave}>{t("common.save")}</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
