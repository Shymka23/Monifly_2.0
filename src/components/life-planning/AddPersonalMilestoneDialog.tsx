"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import useLifePlanningStore from "@/hooks/use-life-planning-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus, Target, Clock, Bell } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type {
  PersonalMilestone,
  MilestoneCategory,
  Reminder,
  ReminderFrequency,
} from "@/lib/types";

interface AddPersonalMilestoneDialogProps {
  year: number;
  trigger?: React.ReactNode;
}

export function AddPersonalMilestoneDialog({
  year,
  trigger,
}: AddPersonalMilestoneDialogProps) {
  const { t } = useTranslation("life-goals");
  const { addPersonalMilestone } = useLifePlanningStore();
  const [open, setOpen] = useState(false);
  const [milestone, setMilestone] = useState<Partial<PersonalMilestone>>({
    id: "",
    title: "",
    category: "other",
    isCompleted: false,
    reminders: [],
  });
  const [reminder, setReminder] = useState<Partial<Reminder>>({
    id: "",
    title: "",
    description: "",
    targetDate: "",
    isDismissed: false,
    frequency: "once",
    priority: "medium",
  });

  const categories: {
    value: MilestoneCategory;
    label: string;
    icon: string;
  }[] = [
    { value: "career", label: t("categories.career"), icon: "💼" },
    { value: "family", label: t("categories.family"), icon: "👨‍👩‍👧‍👦" },
    { value: "health", label: t("categories.health"), icon: "🏃‍♂️" },
    { value: "education", label: t("categories.education"), icon: "🎓" },
    { value: "travel", label: t("categories.travel"), icon: "✈️" },
    { value: "other", label: t("categories.other"), icon: "⭐" },
  ];

  const frequencies: { value: ReminderFrequency; label: string }[] = [
    { value: "once", label: t("reminders.once") },
    { value: "daily", label: t("reminders.daily") },
    { value: "weekly", label: t("reminders.weekly") },
    { value: "monthly", label: t("reminders.monthly") },
    { value: "yearly", label: t("reminders.yearly") },
  ];

  const priorities = [
    {
      value: "low",
      label: t("priorities.low"),
      color: "bg-green-100 text-green-800",
    },
    {
      value: "medium",
      label: t("priorities.medium"),
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "high",
      label: t("priorities.high"),
      color: "bg-red-100 text-red-800",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!milestone.title || !milestone.category) return;

    const newMilestone: PersonalMilestone = {
      id: `milestone-${Date.now()}`,
      title: milestone.title,
      category: milestone.category,
      isCompleted: false,
      reminders: [],
    };

    addPersonalMilestone(year, newMilestone);
    setOpen(false);
    setMilestone({
      id: "",
      title: "",
      category: "other",
      isCompleted: false,
      reminders: [],
    });
  };

  const handleAddReminder = () => {
    if (!reminder.title || !reminder.targetDate) return;

    const newReminder: Reminder = {
      id: `reminder-${Date.now()}`,
      title: reminder.title,
      description: reminder.description || "",
      targetDate: reminder.targetDate,
      isDismissed: false,
      frequency: reminder.frequency || "once",
      priority: reminder.priority || "medium",
    };

    setMilestone(prev => ({
      ...prev,
      reminders: [...(prev.reminders || []), newReminder],
    }));

    setReminder({
      id: "",
      title: "",
      description: "",
      targetDate: "",
      isDismissed: false,
      frequency: "once",
      priority: "medium",
    });
  };

  const handleRemoveReminder = (reminderId: string) => {
    setMilestone(prev => ({
      ...prev,
      reminders: prev.reminders?.filter(r => r.id !== reminderId) || [],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            {t("addMilestone")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t("addMilestone")} - {year}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t("milestone.title")}</Label>
              <Input
                id="title"
                value={milestone.title || ""}
                onChange={e =>
                  setMilestone(prev => ({ ...prev, title: e.target.value }))
                }
                placeholder={t("milestone.titlePlaceholder")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">{t("milestone.category")}</Label>
              <Select
                value={milestone.category}
                onValueChange={(value: MilestoneCategory) =>
                  setMilestone(prev => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("milestone.selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reminders Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5" />
                {t("reminders.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reminderTitle">{t("reminders.title")}</Label>
                  <Input
                    id="reminderTitle"
                    value={reminder.title || ""}
                    onChange={e =>
                      setReminder(prev => ({ ...prev, title: e.target.value }))
                    }
                    placeholder={t("reminders.titlePlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminderDate">{t("reminders.date")}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !reminder.targetDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {reminder.targetDate
                          ? format(new Date(reminder.targetDate), "PPP")
                          : t("reminders.selectDate")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          reminder.targetDate
                            ? new Date(reminder.targetDate)
                            : undefined
                        }
                        onSelect={date =>
                          setReminder(prev => ({
                            ...prev,
                            targetDate: date
                              ? date.toISOString().split("T")[0]
                              : "",
                          }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reminderFrequency">
                    {t("reminders.frequency")}
                  </Label>
                  <Select
                    value={reminder.frequency}
                    onValueChange={(value: ReminderFrequency) =>
                      setReminder(prev => ({ ...prev, frequency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencies.map(freq => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminderPriority">
                    {t("reminders.priority")}
                  </Label>
                  <Select
                    value={reminder.priority}
                    onValueChange={(value: "low" | "medium" | "high") =>
                      setReminder(prev => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map(priority => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center gap-2">
                            <Badge className={priority.color}>
                              {priority.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminderDescription">
                  {t("reminders.description")}
                </Label>
                <Textarea
                  id="reminderDescription"
                  value={reminder.description || ""}
                  onChange={e =>
                    setReminder(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder={t("reminders.descriptionPlaceholder")}
                  rows={2}
                />
              </div>

              <Button
                type="button"
                onClick={handleAddReminder}
                disabled={!reminder.title || !reminder.targetDate}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("reminders.addReminder")}
              </Button>
            </CardContent>
          </Card>

          {/* Reminders List */}
          {milestone.reminders && milestone.reminders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("reminders.list")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {milestone.reminders.map(rem => (
                    <div
                      key={rem.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">{rem.title}</span>
                          <Badge
                            className={
                              priorities.find(p => p.value === rem.priority)
                                ?.color
                            }
                          >
                            {
                              priorities.find(p => p.value === rem.priority)
                                ?.label
                            }
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(rem.targetDate), "PPP")} •{" "}
                          {
                            frequencies.find(f => f.value === rem.frequency)
                              ?.label
                          }
                        </p>
                        {rem.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {rem.description}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveReminder(rem.id)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={!milestone.title || !milestone.category}
            >
              {t("common.add")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
