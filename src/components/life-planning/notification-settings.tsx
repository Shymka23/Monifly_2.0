"use client";

import { useTranslation } from "@/hooks/use-translation";
import useLifePlanningStore from "@/hooks/use-life-planning-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function NotificationSettings() {
  const { t } = useTranslation("life-planning");
  const { settings, dispatch } = useLifePlanningStore();

  const updateSettings = (key: string, value: string | boolean | undefined) => {
    if (!settings) return;
    dispatch({
      type: "UPDATE_SETTINGS",
      payload: {
        notifications: {
          ...settings.notifications,
          [key]: value,
        },
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("notifications.settings.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t("notifications.settings.enabled.label")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("notifications.settings.enabled.description")}
            </p>
          </div>
          <Switch
            checked={settings?.notifications?.enabled || false}
            onCheckedChange={value => updateSettings("enabled", value)}
          />
        </div>

        {settings?.notifications?.enabled && (
          <>
            <div className="space-y-2">
              <Label>{t("notifications.settings.reviewFrequency.label")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("notifications.settings.reviewFrequency.description")}
              </p>
              <Select
                value={settings?.notifications?.reviewFrequency || "weekly"}
                onValueChange={value =>
                  updateSettings("reviewFrequency", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">
                    {t("notifications.settings.reviewFrequency.daily")}
                  </SelectItem>
                  <SelectItem value="weekly">
                    {t("notifications.settings.reviewFrequency.weekly")}
                  </SelectItem>
                  <SelectItem value="monthly">
                    {t("notifications.settings.reviewFrequency.monthly")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("notifications.settings.reminderTime.label")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("notifications.settings.reminderTime.description")}
              </p>
              <Input
                type="time"
                value={settings.notifications.reminderTime}
                onChange={e => updateSettings("reminderTime", e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>
                  {t("notifications.settings.browserNotifications.label")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("notifications.settings.browserNotifications.description")}
                </p>
              </div>
              <Switch
                checked={settings.notifications.browserNotifications}
                onCheckedChange={value =>
                  updateSettings("browserNotifications", value)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>
                  {t("notifications.settings.emailNotifications.label")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("notifications.settings.emailNotifications.description")}
                </p>
              </div>
              <Switch
                checked={settings?.notifications?.browserNotifications || false}
                onCheckedChange={value =>
                  updateSettings("browserNotifications", value)
                }
              />
            </div>

            {settings?.notifications?.browserNotifications && (
              <div className="space-y-2">
                <Label>{t("notifications.settings.emailAddress.label")}</Label>
                <Input
                  type="email"
                  value={settings.notifications.emailAddress || ""}
                  onChange={e => updateSettings("emailAddress", e.target.value)}
                  placeholder={t(
                    "notifications.settings.emailAddress.placeholder"
                  )}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
