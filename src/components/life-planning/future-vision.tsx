"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/use-translation";
import useLifePlanningStore from "@/hooks/use-life-planning-store";
import { useToast } from "@/hooks/use-toast";
import { Target, Star } from "lucide-react";
import type { FutureVision } from "@/lib/types";

export function FutureVisionCard() {
  const { t } = useTranslation("life-goals");
  const { futureVision, settings, updateFutureVision } = useLifePlanningStore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FutureVision>(
    futureVision || {
      targetAge: settings?.targetAge || 100,
      occupation: "",
      expectedAssets: 0,
      happinessScore: 7,
      lifestyle: "",
      legacyGoals: [],
      defaultCurrency: "EUR",
    }
  );

  const handleSubmit = () => {
    try {
      updateFutureVision(formData);
      setIsEditing(false);
      toast({
        title: t("futureVision.success.title"),
        description: t("futureVision.success.description"),
      });
    } catch {
      toast({
        title: t("futureVision.error.title"),
        description: t("futureVision.error.generic"),
        variant: "destructive",
      });
    }
  };

  if (!futureVision && !isEditing) {
    return (
      <Card className="shadow-modern hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Target className="mr-2 h-5 w-5 text-primary" />
            {t("futureVision.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center p-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-transparent rounded-full flex items-center justify-center mb-4">
            <Star className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground mb-4">
            {t("futureVision.empty.description")}
          </p>
          <Button onClick={() => setIsEditing(true)}>
            {t("futureVision.empty.button")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isEditing) {
    return (
      <Card className="shadow-modern">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Target className="mr-2 h-5 w-5 text-primary" />
            {t("futureVision.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("futureVision.fields.occupation.label")}
            </label>
            <Input
              value={formData.occupation}
              onChange={e =>
                setFormData({ ...formData, occupation: e.target.value })
              }
              placeholder={t("futureVision.fields.occupation.placeholder")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("futureVision.fields.assets.label")}
            </label>
            <Input
              type="number"
              value={formData.expectedAssets}
              onChange={e =>
                setFormData({
                  ...formData,
                  expectedAssets: parseInt(e.target.value, 10) || 0,
                })
              }
              placeholder={t("futureVision.fields.assets.placeholder")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("futureVision.fields.happiness.label")}
            </label>
            <Input
              type="number"
              min="1"
              max="10"
              value={formData.happinessScore}
              onChange={e =>
                setFormData({
                  ...formData,
                  happinessScore: parseInt(e.target.value, 10) || 7,
                })
              }
              placeholder={t("futureVision.fields.happiness.placeholder")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("futureVision.fields.lifestyle.label")}
            </label>
            <Textarea
              value={formData.lifestyle}
              onChange={e =>
                setFormData({ ...formData, lifestyle: e.target.value })
              }
              placeholder={t("futureVision.fields.lifestyle.placeholder")}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSubmit}>{t("common.save")}</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-modern hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Target className="mr-2 h-5 w-5 text-primary" />
          {t("futureVision.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-1">
            {t("futureVision.fields.occupation.label")}
          </h4>
          <p className="text-muted-foreground">{futureVision?.occupation}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-1">
            {t("futureVision.fields.assets.label")}
          </h4>
          <p className="text-muted-foreground">
            {new Intl.NumberFormat(undefined, {
              style: "currency",
              currency: settings?.defaultCurrency || "EUR",
            }).format(futureVision?.expectedAssets ?? 0)}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-1">
            {t("futureVision.fields.happiness.label")}
          </h4>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent"
              style={{
                width: `${((futureVision?.happinessScore ?? 7) / 10) * 100}%`,
              }}
            />
          </div>
          <span className="text-sm mt-1 block text-right">
            {futureVision?.happinessScore ?? 7}/10
          </span>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-1">
            {t("futureVision.fields.lifestyle.label")}
          </h4>
          <p className="text-muted-foreground">{futureVision?.lifestyle}</p>
        </div>

        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => setIsEditing(true)}
        >
          {t("common.edit")}
        </Button>
      </CardContent>
    </Card>
  );
}
