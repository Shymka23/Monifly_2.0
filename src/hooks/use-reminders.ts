import { useCallback, useEffect, useMemo } from "react";
import useLifePlanningStore from "./use-life-planning-store";
import { useToast } from "./use-toast";
import { useTranslation } from "./use-translation";
import type { Reminder } from "@/lib/types";

export const sortReminders = (
  a: { reminder: Reminder },
  b: { reminder: Reminder }
) => {
  // Сортування за статусом (не dismissed йдуть першими)
  if (a.reminder.isDismissed && !b.reminder.isDismissed) return 1;
  if (!a.reminder.isDismissed && b.reminder.isDismissed) return -1;

  // Якщо статус однаковий, сортуємо за датою
  return (
    new Date(a.reminder.targetDate).getTime() -
    new Date(b.reminder.targetDate).getTime()
  );
};

export const useReminders = () => {
  const { t } = useTranslation("life-goals");
  const { toast } = useToast();
  const { settings } = useLifePlanningStore();

  const activeReminders = useMemo(() => {
    if (!settings) return [];

    // Оскільки LifeCalendarSettings не має calendar, повертаємо порожній масив
    // Це буде виправлено пізніше, коли буде додана правильна структура
    return [];
  }, [settings]);

  const checkReminders = useCallback(() => {
    if (!settings || !settings.notifications.enabled) return;

    const [hour, minute] = settings.notifications.reminderTime
      .split(":")
      .map(Number);
    const now = new Date();
    const reminderTime = new Date(now);
    reminderTime.setHours(hour, minute, 0, 0);

    if (
      settings.notifications.browserNotifications &&
      now.getTime() >= reminderTime.getTime()
    ) {
      activeReminders.forEach(({ reminder }: { reminder: Reminder }) => {
        // Логіка сповіщень
        if (!reminder.isDismissed) {
          // Показати сповіщення
          toast({
            title: reminder.title,
            description: reminder.description,
          });
        }
      });
    }
  }, [settings?.notifications, activeReminders, t, toast]);

  useEffect(() => {
    // Request notification permission if enabled
    if (settings?.notifications.browserNotifications) {
      Notification.requestPermission();
    }

    // Check reminders every minute
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [settings?.notifications.browserNotifications, checkReminders]);

  return {
    allReminders: [], // This will be removed as per the new_code
    activeReminders,
  };
};
