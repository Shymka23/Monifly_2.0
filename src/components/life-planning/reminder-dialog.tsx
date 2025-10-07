"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import useLifePlanningStore from "@/hooks/use-life-planning-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Reminder } from "@/lib/types";

interface ReminderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneId: string;
  existingReminder?: Reminder;
}

export function ReminderDialog({
  isOpen,
  onClose,
  milestoneId,
  existingReminder,
}: ReminderDialogProps) {
  const { t } = useTranslation("life-planning");
  const { toast } = useToast();
  const dispatch = useLifePlanningStore(state => state.dispatch);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState(existingReminder?.title || "");
  const [description, setDescription] = useState(
    existingReminder?.description || ""
  );
  const [frequency, setFrequency] = useState<string>(
    existingReminder?.frequency || "once"
  );
  const [targetDate, setTargetDate] = useState(
    existingReminder?.targetDate || new Date().toISOString().split("T")[0]
  );

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (!title.trim()) {
        toast({
          title: t("reminders.error.title"),
          description: t("reminders.error.titleRequired"),
          variant: "destructive",
        });
        return;
      }

      const reminderData: Reminder = {
        id: existingReminder?.id || `reminder-${Date.now()}`,
        type: "milestone",
        title: title.trim(),
        description: description.trim() || undefined,
        frequency: frequency as Reminder["frequency"],
        targetDate,
        milestoneId: milestoneId,
        isDismissed: false,
      };

      if (existingReminder) {
        dispatch({
          type: "UPDATE_REMINDER",
          payload: {
            milestoneId,
            reminderId: existingReminder.id,
            data: reminderData,
          },
        });
      } else {
        dispatch({
          type: "ADD_REMINDER",
          payload: {
            milestoneId,
            reminder: reminderData,
          },
        });
      }

      toast({
        title: t("reminders.success.title"),
        description: existingReminder
          ? t("reminders.success.updated")
          : t("reminders.success.added"),
      });

      onClose();
    } catch {
      toast({
        title: t("reminders.error.title"),
        description: t("reminders.error.generic"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {existingReminder
              ? t("reminders.edit.title")
              : t("reminders.add.title")}
          </DialogTitle>
          <DialogDescription>
            {existingReminder
              ? t("reminders.edit.description")
              : t("reminders.add.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t("reminders.fields.title.label")}</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={t("reminders.fields.title.placeholder")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              {t("reminders.fields.description.label")}
            </Label>
            <Input
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t("reminders.fields.description.placeholder")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">
              {t("reminders.fields.frequency.label")}
            </Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">
                  {t("reminders.fields.frequency.once")}
                </SelectItem>
                <SelectItem value="daily">
                  {t("reminders.fields.frequency.daily")}
                </SelectItem>
                <SelectItem value="weekly">
                  {t("reminders.fields.frequency.weekly")}
                </SelectItem>
                <SelectItem value="monthly">
                  {t("reminders.fields.frequency.monthly")}
                </SelectItem>
                <SelectItem value="yearly">
                  {t("reminders.fields.frequency.yearly")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate">
              {t("reminders.fields.targetDate.label")}
            </Label>
            <Input
              id="targetDate"
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? t("reminders.button.submitting")
              : existingReminder
              ? t("reminders.button.update")
              : t("reminders.button.add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
