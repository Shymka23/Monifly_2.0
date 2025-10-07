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
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/use-translation";
import useLifePlanningStore from "@/hooks/use-life-planning-store";
import { useToast } from "@/hooks/use-toast";

interface OnboardingDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingDialog({ isOpen, onClose }: OnboardingDialogProps) {
  const { t } = useTranslation("life-goals");
  const { initializeCalendar } = useLifePlanningStore();
  const { toast } = useToast();
  const [age, setAge] = useState("30");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const currentAge = parseInt(age, 10);
    if (isNaN(currentAge) || currentAge < 0 || currentAge > 100) {
      toast({
        title: t("onboarding.error.title"),
        description: t("onboarding.error.invalidAge"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await initializeCalendar({
        currentAge,
        targetAge: 100,
        notifications: {
          enabled: true,
          reviewFrequency: "monthly",
          reminderTime: "09:00",
          browser: true,
          email: false,
        },
        defaultCurrency: "EUR",
      });

      toast({
        title: t("onboarding.success.title"),
        description: t("onboarding.success.description"),
      });
      onClose();
    } catch {
      toast({
        title: t("onboarding.error.title"),
        description: t("onboarding.error.generic"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("onboarding.title")}</DialogTitle>
          <DialogDescription>{t("onboarding.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("onboarding.age.label")}
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              value={age}
              onChange={e => setAge(e.target.value)}
              placeholder={t("onboarding.age.placeholder")}
            />
            <p className="text-sm text-muted-foreground">
              {t("onboarding.age.help")}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? t("onboarding.button.submitting")
              : t("onboarding.button.submit")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
