"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useBudgetStore } from "@/hooks/use-budget-store";
import {
  Edit3,
  ImagePlus,
  Save,
  ShieldCheck,
  Download,
  BadgeDollarSign,
  Star,
  User,
  Globe,
  Palette,
  Trash2,
  Database,
  Shield,
  Key,
  Smartphone,
  Mail,
  Calendar,
  Activity,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/hooks/use-translation";
import { LanguageCode, SUPPORTED_LANGUAGES } from "@/lib/i18n-new";
import type { SubscriptionStatus } from "@/lib/types";
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
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { NotificationSettings } from "@/components/life-planning/notification-settings";

export default function SettingsPage() {
  const { t } = useTranslation(["settings", "common"]);

  const {
    userProfile,
    updateUserProfile,
    language,
    subscriptionStatus,
    subscriptionRenewalDate,
    upgradeToPro,
    cancelSubscription,
  } = useBudgetStore(state => ({
    userProfile: state.userProfile,
    updateUserProfile: state.updateUserProfile,
    language: state.language,
    subscriptionStatus: state.subscriptionStatus,
    subscriptionRenewalDate: state.subscriptionRenewalDate,
    upgradeToPro: state.upgradeToPro,
    cancelSubscription: state.cancelSubscription,
  }));
  const { toast } = useToast();

  const [firstName, setFirstName] = useState(userProfile.firstName || "");
  const [lastName, setLastName] = useState(userProfile.lastName || "");
  const [email, setEmail] = useState(userProfile.email || "");
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    userProfile.avatarDataUrl
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isTwoFactorAuthEnabled, setIsTwoFactorAuthEnabled] = useState(
    !!userProfile.isTwoFactorEnabled
  );

  const [autoBackup, setAutoBackup] = useState(true);
  const [dataRetention, setDataRetention] = useState("1_year");
  const [sessionTimeout, setSessionTimeout] = useState("30_min");
  const [currencyDisplay, setCurrencyDisplay] = useState("primary");
  const [dateFormat, setDateFormat] = useState("DD.MM.YYYY");
  const [timeFormat, setTimeFormat] = useState("24h");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(
    language as LanguageCode
  );

  const [dialogAction, setDialogAction] = useState<
    "upgrade_monthly" | "upgrade_yearly" | "cancel" | null
  >(null);

  useEffect(() => {
    setFirstName(userProfile.firstName || "");
    setLastName(userProfile.lastName || "");
    setEmail(userProfile.email || "");
    setAvatarPreview(userProfile.avatarDataUrl);
    setIsTwoFactorAuthEnabled(!!userProfile.isTwoFactorEnabled);
  }, [userProfile]);

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        updateUserProfile({ avatarDataUrl: result });
        toast({
          title: t("personal.changeAvatarButton"),
          description: t("personal.description"),
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(undefined);
    updateUserProfile({ avatarDataUrl: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast({ title: t("personal.removeAvatarButton") });
  };

  const handleSavePersonalInfo = () => {
    if (!firstName.trim()) {
      toast({
        title: t("error", { ns: "common", defaultValue: "Error" }),
        description: t("firstNameRequired", {
          ns: "settings",
          defaultValue: "First name is required",
        }),
        variant: "destructive",
      });
      return;
    }
    updateUserProfile({ firstName, lastName, email });
    setIsEditingInfo(false);
    toast({
      title: t("infoSaved", {
        ns: "settings",
        defaultValue: "Information saved",
      }),
      description: t("personal.description"),
    });
  };

  const handleToggleTwoFactorAuth = (checked: boolean) => {
    setIsTwoFactorAuthEnabled(checked);
    updateUserProfile({ isTwoFactorEnabled: checked });
    toast({
      title: checked
        ? t("twoFactorAuthEnabledToast")
        : t("twoFactorAuthDisabledToast"),
      description: t("changed", {
        ns: "settings",
        defaultValue: "Setting changed",
      }),
    });
  };

  const handleExportData = () => {
    toast({
      title: t("exportDataToast", {
        ns: "settings",
        defaultValue: "Export requested",
      }),
      description: t("exportProcessing", {
        ns: "settings",
        defaultValue: "Processing (simulation)",
      }),
    });
  };

  const handleSecuritySettings = (setting: string, value: string | boolean) => {
    switch (setting) {
      case "autoBackup":
        setAutoBackup(value as boolean);
        break;
      case "dataRetention":
        setDataRetention(value as string);
        break;
      case "sessionTimeout":
        setSessionTimeout(value as string);
        break;
    }
    toast({
      title: t("securityUpdated", {
        ns: "settings",
        defaultValue: "Security settings updated",
      }),
      description: t("saved", { ns: "settings", defaultValue: "Saved" }),
    });
  };

  const handleDisplaySettings = (setting: string, value: string) => {
    switch (setting) {
      case "currency":
        setCurrencyDisplay(value);
        break;
      case "dateFormat":
        setDateFormat(value);
        break;
      case "timeFormat":
        setTimeFormat(value);
        break;
    }
    toast({
      title: t("displayUpdated", {
        ns: "settings",
        defaultValue: "Display settings updated",
      }),
      description: t("saved", { ns: "settings", defaultValue: "Saved" }),
    });
  };

  const handleLanguageChange = (newLanguage: string) => {
    const validLanguage = SUPPORTED_LANGUAGES.find(
      lang => lang.code === newLanguage
    );

    if (validLanguage) {
      const languageCode = validLanguage.code as LanguageCode;
      setSelectedLanguage(languageCode);
      // Оновлюємо мову в store
      useBudgetStore.getState().setLanguage(languageCode);
      toast({
        title: t("languageChanged", {
          ns: "settings",
          defaultValue: "Language changed",
        }),
        description: t("interfaceSwitchedTo", {
          ns: "settings",
          defaultValue: "Interface switched to {{lang}}",
          lang: validLanguage.name,
        }),
      });
    }
  };

  const handleSubscriptionConfirm = () => {
    if (dialogAction === "upgrade_monthly") {
      upgradeToPro("monthly");
    } else if (dialogAction === "upgrade_yearly") {
      upgradeToPro("yearly");
    } else if (dialogAction === "cancel") {
      cancelSubscription();
    }
    setDialogAction(null);
  };

  const getInitials = () => {
    const first = firstName?.[0]?.toUpperCase() || "";
    const last = lastName?.[0]?.toUpperCase() || "";
    return first + last || "PN";
  };

  const getSubscriptionDialogContent = () => {
    switch (dialogAction) {
      case "upgrade_monthly":
        return {
          title: "Подтвердите ежемесячную подписку",
          description:
            "Вы собираетесь оформить подписку Monifly Pro за 5 EUR в месяц. Платеж будет списываться ежемесячно. Вы можете отменить подписку в любой момент.",
          actionText: "Оплатить 5 EUR",
        };
      case "upgrade_yearly":
        return {
          title: "Подтвердите годовую подписку",
          description:
            "Вы собираетесь оформить подписку Monifly Pro за 50 EUR в год. Это выгодное предложение, которое экономит ваши деньги. Вы можете отменить подписку в любой момент.",
          actionText: "Оплатить 50 EUR",
        };
      case "cancel":
        return {
          title: "Отменить подписку?",
          description:
            "Вы уверены, что хотите отменить подписку? Вы потеряете доступ к Pro-функциям в конце текущего оплаченного периода.",
          actionText: "Да, отменить",
        };
      default:
        return { title: "", description: "", actionText: "" };
    }
  };
  const dialogContent = getSubscriptionDialogContent();

  const planLabels: Record<SubscriptionStatus, string> = {
    free: "Базовый (Бесплатно)",
    pro_monthly: "Pro (Ежемесячно)",
    pro_yearly: "Pro (Ежегодно)",
    active: "Активна",
    trial: "Пробний період",
    expired: "Закінчився",
    cancelled: "Скасована",
  };

  return (
    <div className="container-fluid space-responsive animate-fade-in">
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
          {t("title")}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground hidden sm:block">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Information & Avatar Section */}
          <Card className="shadow-modern hover-lift">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl flex items-center">
                <User className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                {t("personal.title")}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t("personal.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  <Avatar className="h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 border-2 border-primary/50">
                    {avatarPreview ? (
                      <AvatarImage src={avatarPreview} alt="User avatar" />
                    ) : null}
                    <AvatarFallback className="text-xl sm:text-2xl lg:text-3xl bg-muted">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute bottom-0 right-0 h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-background/80 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    title={t("changeAvatarButton")}
                  >
                    <ImagePlus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div className="flex-grow space-y-1 text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold">
                    {firstName || "..."} {lastName}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {email || "..."}
                  </p>
                  {avatarPreview && (
                    <Button
                      variant="link"
                      size="sm"
                      className="text-xs text-destructive p-0 h-auto"
                      onClick={handleRemoveAvatar}
                    >
                      {t("removeAvatarButton")}
                    </Button>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label htmlFor="firstName">{t("firstNameLabel")}</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    disabled={!isEditingInfo}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">{t("lastNameLabel")}</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    disabled={!isEditingInfo}
                  />
                </div>
                <div>
                  <Label htmlFor="email">{t("emailLabel")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={!isEditingInfo}
                  />
                </div>

                {isEditingInfo ? (
                  <div className="flex gap-2">
                    <Button onClick={handleSavePersonalInfo} size="sm">
                      <Save className="mr-2 h-4 w-4" /> {t("saveChangesButton")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingInfo(false)}
                    >
                      {t("buttons.cancel", {
                        ns: "common",
                        defaultValue: "Cancel",
                      })}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingInfo(true)}
                  >
                    <Edit3 className="mr-2 h-4 w-4" /> {t("personal.editData")}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings Section */}
          <NotificationSettings />

          {/* Security Settings Section */}
          <Card className="shadow-modern hover-lift">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl flex items-center">
                <Shield className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                {t("security.title")}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t("security.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="space-y-1">
                  <Label
                    htmlFor="auto-backup"
                    className="text-base font-medium"
                  >
                    {t("security.autoBackup")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("security.autoBackupDesc")}
                  </p>
                </div>
                <Switch
                  id="auto-backup"
                  checked={autoBackup}
                  onCheckedChange={checked =>
                    handleSecuritySettings("autoBackup", checked)
                  }
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="data-retention"
                    className="text-sm font-medium"
                  >
                    {t("security.dataRetention")}
                  </Label>
                  <select
                    id="data-retention"
                    value={dataRetention}
                    onChange={e =>
                      handleSecuritySettings("dataRetention", e.target.value)
                    }
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="6_months">
                      {t("security.dataRetention_6_months")}
                    </option>
                    <option value="1_year">
                      {t("security.dataRetention_1_year")}
                    </option>
                    <option value="2_years">
                      {t("security.dataRetention_2_years")}
                    </option>
                    <option value="forever">
                      {t("security.dataRetention_forever")}
                    </option>
                  </select>
                </div>

                <div>
                  <Label
                    htmlFor="session-timeout"
                    className="text-sm font-medium"
                  >
                    {t("security.sessionTimeout")}
                  </Label>
                  <select
                    id="session-timeout"
                    value={sessionTimeout}
                    onChange={e =>
                      handleSecuritySettings("sessionTimeout", e.target.value)
                    }
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="15_min">
                      {t("security.timeout_15_min")}
                    </option>
                    <option value="30_min">
                      {t("security.timeout_30_min")}
                    </option>
                    <option value="1_hour">
                      {t("security.timeout_1_hour")}
                    </option>
                    <option value="4_hours">
                      {t("security.timeout_4_hours")}
                    </option>
                    <option value="never">{t("security.timeout_never")}</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Display Settings Section */}
          <Card className="shadow-modern hover-lift">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl flex items-center">
                <Palette className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                {t("display.title")}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t("display.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="language-select"
                    className="text-sm font-medium"
                  >
                    {t("display.language")}
                  </Label>
                  <select
                    id="language-select"
                    value={selectedLanguage}
                    onChange={e => handleLanguageChange(e.target.value)}
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                    <option value="uk">Українська</option>
                    <option value="de">Deutsch</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                  </select>
                </div>

                <div>
                  <Label
                    htmlFor="currency-display"
                    className="text-sm font-medium"
                  >
                    {t("display.currency")}
                  </Label>
                  <select
                    id="currency-display"
                    value={currencyDisplay}
                    onChange={e =>
                      handleDisplaySettings("currency", e.target.value)
                    }
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="primary">
                      {t("display.currencyPrimary")}
                    </option>
                    <option value="all">{t("display.currencyAll")}</option>
                    <option value="converted">
                      {t("display.currencyConverted")}
                    </option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="date-format" className="text-sm font-medium">
                    {t("display.dateFormat")}
                  </Label>
                  <select
                    id="date-format"
                    value={dateFormat}
                    onChange={e =>
                      handleDisplaySettings("dateFormat", e.target.value)
                    }
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="time-format" className="text-sm font-medium">
                    {t("display.timeFormat")}
                  </Label>
                  <select
                    id="time-format"
                    value={timeFormat}
                    onChange={e =>
                      handleDisplaySettings("timeFormat", e.target.value)
                    }
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="24h">{t("display.time24")}</option>
                    <option value="12h">{t("display.time12")}</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Column */}
        <div className="space-y-8">
          {/* Quick Actions Section */}
          <Card className="shadow-modern hover-lift">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl flex items-center">
                <Zap className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                {t("quickActions.title")}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t("quickActions.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setIsEditingInfo(true)}
              >
                <Edit3 className="mr-2 h-4 w-4" />
                {t("quickActions.editProfile")}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleExportData}
              >
                <Download className="mr-2 h-4 w-4" />
                {t("quickActions.exportData")}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled
              >
                <Key className="mr-2 h-4 w-4" />
                {t("quickActions.changePassword")}
              </Button>
            </CardContent>
          </Card>

          {/* Subscription Section */}
          <Card className="shadow-modern hover-lift">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl flex items-center">
                <BadgeDollarSign className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                {t("subscription.title")}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t("subscription.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border bg-muted/20">
                <Label className="text-sm font-medium">
                  {t("subscription.currentPlan")}
                </Label>
                <p className="text-lg font-bold text-foreground mt-1">
                  {planLabels[subscriptionStatus]}
                </p>
              </div>
              {subscriptionStatus !== "free" && subscriptionRenewalDate && (
                <div className="p-4 rounded-lg border bg-muted/20">
                  <Label className="text-sm font-medium">
                    {t("subscription.nextPaymentDate")}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(subscriptionRenewalDate), "PPP", {
                      locale: ru,
                    })}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-3">
              {subscriptionStatus === "free" ? (
                <>
                  <Button
                    onClick={() => setDialogAction("upgrade_yearly")}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    <Star className="mr-2 h-4 w-4" />
                    {t("subscription.upgradeYearly")}
                    <Badge variant="secondary" className="ml-2">
                      {t("subscription.bestValue")}
                    </Badge>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDialogAction("upgrade_monthly")}
                  >
                    {t("subscription.upgradeMonthly")}
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setDialogAction("cancel")}
                >
                  {t("subscription.cancel")}
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Account Settings Section */}
          <Card className="shadow-modern hover-lift">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl flex items-center">
                <ShieldCheck className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                {t("accountSettings.title")}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t("accountSettings.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="space-y-1">
                  <Label
                    htmlFor="twoFactorAuth"
                    className="text-base font-medium"
                  >
                    {t("accountSettings.twoFactorAuthLabel")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("accountSettings.twoFactorAuthDescription")}
                  </p>
                </div>
                <Switch
                  id="twoFactorAuth"
                  aria-label={t("accountSettings.twoFactorAuthLabel")}
                  checked={isTwoFactorAuthEnabled}
                  onCheckedChange={handleToggleTwoFactorAuth}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled
                >
                  <Key className="mr-2 h-4 w-4" />
                  {t("accountSettings.changePasswordButton")}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleExportData}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {t("accountSettings.exportDataButton")}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled
                >
                  <Database className="mr-2 h-4 w-4" />
                  Резервне копіювання
                </Button>
              </div>

              <Separator />

              <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                <h4 className="text-sm font-medium text-destructive mb-2">
                  {t("accountSettings.dangerZone")}
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  {t("accountSettings.dangerZoneDesc")}
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  disabled
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("accountSettings.deleteAccountButton")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Information Section */}
          <Card className="shadow-modern hover-lift">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl flex items-center">
                <Activity className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                {t("accountInfo.title")}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t("accountInfo.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg border bg-muted/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-xs font-medium">
                      {t("accountInfo.registrationDate")}
                    </Label>
                  </div>
                  <p className="text-sm font-medium">
                    {format(new Date("2024-01-15"), "dd.MM.yyyy")}
                  </p>
                </div>

                <div className="p-3 rounded-lg border bg-muted/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-xs font-medium">
                      {t("accountInfo.emailConfirmed")}
                    </Label>
                  </div>
                  <p className="text-sm font-medium text-green-600">
                    {t("accountInfo.yes")}
                  </p>
                </div>

                <div className="p-3 rounded-lg border bg-muted/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-xs font-medium">
                      {t("accountInfo.lastLogin")}
                    </Label>
                  </div>
                  <p className="text-sm font-medium">Сьогодні, 14:30</p>
                </div>

                <div className="p-3 rounded-lg border bg-muted/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-xs font-medium">
                      {t("accountInfo.interfaceLanguage")}
                    </Label>
                  </div>
                  <p className="text-sm font-medium">
                    {language === "ru"
                      ? "Русский"
                      : language === "en"
                      ? "English"
                      : language === "uk"
                      ? "Українська"
                      : language === "de"
                      ? "Deutsch"
                      : language === "es"
                      ? "Español"
                      : language === "fr"
                      ? "Français"
                      : language}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="text-sm font-medium">
                  {t("accountInfo.usageStats")}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 rounded-lg border bg-muted/20">
                    <p className="text-lg font-bold text-primary">127</p>
                    <p className="text-xs text-muted-foreground">
                      {t("accountInfo.transactions")}
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg border bg-muted/20">
                    <p className="text-lg font-bold text-primary">8</p>
                    <p className="text-xs text-muted-foreground">
                      {t("accountInfo.goals")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog
        open={!!dialogAction}
        onOpenChange={open => !open && setDialogAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogContent.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDialogAction(null)}>
              {t("buttons.cancel", { ns: "common", defaultValue: "Cancel" })}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubscriptionConfirm}
              className={
                dialogAction === "cancel"
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-primary hover:bg-primary/90"
              }
            >
              {dialogContent.actionText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
