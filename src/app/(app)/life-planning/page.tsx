"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import useLifePlanningStore from "@/hooks/use-life-planning-store";
import { OnboardingDialog } from "@/components/life-planning/onboarding-dialog";
import { LifeCalendar } from "@/components/life-planning/life-calendar";
import { FinancialProjections } from "@/components/life-planning/financial-projections";
import { FutureVisionCard } from "@/components/life-planning/future-vision";
import { ExportDialog } from "@/components/life-planning/export-dialog";
import { ShareDialog } from "@/components/life-planning/share-dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";

export default function LifePlanningPage() {
  const { t } = useTranslation("life-planning");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const initialized = useLifePlanningStore(state => state.initialized);

  useEffect(() => {
    if (!initialized) {
      setShowOnboarding(true);
    }
  }, [initialized]);

  return (
    <div className="container space-y-8 py-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-lg text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowShare(true)}>
            <Share2 className="mr-2 h-4 w-4" />
            {t("share.shareButton")}
          </Button>
          <Button variant="outline" onClick={() => setShowExport(true)}>
            <Download className="mr-2 h-4 w-4" />
            {t("export.download")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LifeCalendar />
        </div>
        <div className="space-y-8">
          <FutureVisionCard />
          <FinancialProjections year={new Date().getFullYear()} />
        </div>
      </div>

      <OnboardingDialog
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      <ExportDialog isOpen={showExport} onClose={() => setShowExport(false)} />

      <ShareDialog isOpen={showShare} onClose={() => setShowShare(false)} />
    </div>
  );
}
