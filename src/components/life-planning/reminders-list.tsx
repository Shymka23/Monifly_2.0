"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import useLifePlanningStore from "@/hooks/use-life-planning-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Bell,
  BellOff,
  Calendar,
  Check,
  Clock,
  Edit,
  Trash,
} from "lucide-react";
import { ReminderDialog } from "./reminder-dialog";
import { format } from "date-fns";
import type { Reminder } from "@/lib/types";

interface RemindersListProps {
  milestoneId: string;
  reminders: Reminder[];
  onUpdate: () => void;
}

export function RemindersList({
  milestoneId,
  reminders,
  onUpdate,
}: RemindersListProps) {
  const { t } = useTranslation("life-planning");
  const dispatch = useLifePlanningStore(state => state.dispatch);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(
    null
  );
  const [showAddDialog, setShowAddDialog] = useState(false);

  const sortedReminders = useMemo(() => {
    return [...reminders].sort((a, b) => {
      if (a.isDismissed && !b.isDismissed) return 1;
      if (!a.isDismissed && b.isDismissed) return -1;
      return (
        new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
      );
    });
  }, [reminders]);

  const handleDismiss = (reminder: Reminder) => {
    dispatch({
      type: "DISMISS_REMINDER",
      payload: { milestoneId, reminderId: reminder.id },
    });
    onUpdate();
  };

  const handleDelete = (reminder: Reminder) => {
    dispatch({
      type: "REMOVE_REMINDER",
      payload: { milestoneId, reminderId: reminder.id },
    });
    onUpdate();
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case "daily":
        return <Clock className="h-4 w-4" />;
      case "weekly":
      case "monthly":
      case "yearly":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{t("reminders.title")}</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddDialog(true)}
        >
          <Bell className="mr-2 h-4 w-4" />
          {t("reminders.button.add")}
        </Button>
      </div>

      <div className="space-y-2">
        {sortedReminders.map(reminder => (
          <Card
            key={reminder.id}
            className={cn(
              "transition-colors",
              reminder.isDismissed && "bg-muted/50"
            )}
          >
            <CardHeader className="p-4">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center space-x-2">
                  {getFrequencyIcon(reminder.frequency || "once")}
                  <span>{reminder.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {!reminder.isDismissed ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismiss(reminder)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Badge variant="outline">
                      <BellOff className="mr-1 h-3 w-3" />
                      {t("reminders.dismissed")}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedReminder(reminder)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(reminder)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              {reminder.description && (
                <p className="mb-2 text-sm text-muted-foreground">
                  {reminder.description}
                </p>
              )}
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>
                  {format(new Date(reminder.targetDate), "dd.MM.yyyy")}
                </span>
                {reminder.frequency && reminder.frequency !== "once" && (
                  <Badge variant="secondary">
                    {t(`reminders.fields.frequency.${reminder.frequency}`)}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {reminders.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            {t("reminders.empty")}
          </p>
        )}
      </div>

      {showAddDialog && (
        <ReminderDialog
          isOpen={true}
          onClose={() => {
            setShowAddDialog(false);
            onUpdate();
          }}
          milestoneId={milestoneId}
        />
      )}

      {selectedReminder && (
        <ReminderDialog
          isOpen={true}
          onClose={() => {
            setSelectedReminder(null);
            onUpdate();
          }}
          milestoneId={milestoneId}
          existingReminder={selectedReminder}
        />
      )}
    </div>
  );
}
