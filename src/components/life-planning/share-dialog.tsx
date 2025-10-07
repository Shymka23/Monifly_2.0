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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  FacebookShareButton,
  TwitterShareButton,
  TelegramShareButton,
  WhatsappShareButton,
  LinkedinShareButton,
  FacebookIcon,
  TwitterIcon,
  TelegramIcon,
  WhatsappIcon,
  LinkedinIcon,
} from "react-share";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareDialog({ isOpen, onClose }: ShareDialogProps) {
  const { t } = useTranslation("life-planning");
  const { settings } = useLifePlanningStore();
  const [includeFinancialGoals, setIncludeFinancialGoals] = useState(false);
  const [includeNotes, setIncludeNotes] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const title = t("share.title");
  const description = t("share.description", {
    age: settings?.currentAge || 0,
    targetAge: settings?.targetAge || 0,
  });

  const shareText = `${title}\n\n${description}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("share.title")}</DialogTitle>
          <DialogDescription>
            {t("share.description", {
              age: settings?.currentAge || 0,
              targetAge: settings?.targetAge || 0,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="financial-goals">
              {t("share.includeFinancialGoals")}
            </Label>
            <Switch
              id="financial-goals"
              checked={includeFinancialGoals}
              onCheckedChange={setIncludeFinancialGoals}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="notes">{t("share.includeNotes")}</Label>
            <Switch
              id="notes"
              checked={includeNotes}
              onCheckedChange={setIncludeNotes}
            />
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <FacebookShareButton url={shareUrl} hashtag="#LifePlanning">
              <FacebookIcon size={32} round />
            </FacebookShareButton>

            <TwitterShareButton url={shareUrl} title={shareText}>
              <TwitterIcon size={32} round />
            </TwitterShareButton>

            <TelegramShareButton url={shareUrl} title={shareText}>
              <TelegramIcon size={32} round />
            </TelegramShareButton>

            <WhatsappShareButton url={shareUrl} title={shareText}>
              <WhatsappIcon size={32} round />
            </WhatsappShareButton>

            <LinkedinShareButton url={shareUrl} title={title}>
              <LinkedinIcon size={32} round />
            </LinkedinShareButton>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("share.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
