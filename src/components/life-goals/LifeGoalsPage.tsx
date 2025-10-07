"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  CalendarClock,
  TrendingUp,
  Star,
  Settings,
  BarChart3,
  PieChart,
  Goal,
} from "lucide-react";
import { LifeCalendar } from "@/components/life-planning/life-calendar";
import { OnboardingDialog } from "@/components/life-planning/onboarding-dialog";
import { FutureVisionCard } from "@/components/life-planning/future-vision";
import { FinancialProjections } from "@/components/life-planning/financial-projections";
import { FinanceDNAStrand } from "@/components/life-planning/finance-dna-strand";
// import { LifeHeatmap } from "@/components/life-planning/life-heatmap";
import { AddPersonalMilestoneDialog } from "@/components/life-planning/AddPersonalMilestoneDialog";
import { AddFinancialGoalDialog } from "@/components/life-planning/AddFinancialGoalDialog";
import { GoalsList } from "@/components/life-planning/GoalsList";
import useLifePlanningStore from "@/hooks/use-life-planning-store";
import { AppLoader } from "@/components/ui/app-loader";
import { cn } from "@/lib/utils";

export function LifeGoalsPage() {
  const { t } = useTranslation("life-goals");
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "calendar" | "goals" | "dna" | "heatmap" | "analytics"
  >("overview");
  const { initialized, settings, futureVision, getProgressStats } =
    useLifePlanningStore();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!initialized) {
      setShowOnboarding(true);
    }
  }, [initialized]);

  if (!isClient) {
    return <AppLoader text={t("loading")} />;
  }

  // Calculate progress metrics using store method
  const progressStats = getProgressStats();
  const currentYear = new Date().getFullYear();
  const totalYears = settings ? settings.targetAge - settings.currentAge : 0;
  const yearsPassed = currentYear - (new Date().getFullYear() - totalYears);
  const progressPercentage =
    totalYears > 0 ? Math.min((yearsPassed / totalYears) * 100, 100) : 0;

  type TabId =
    | "overview"
    | "calendar"
    | "goals"
    | "dna"
    | "heatmap"
    | "analytics";

  const tabs = [
    { id: "overview", label: t("tabs.overview"), icon: Target },
    { id: "calendar", label: t("tabs.calendar"), icon: CalendarClock },
    { id: "goals", label: t("tabs.goals"), icon: Goal },
    { id: "dna", label: t("tabs.dna"), icon: BarChart3 },
    { id: "heatmap", label: t("tabs.heatmap"), icon: CalendarClock },
    { id: "analytics", label: t("tabs.analytics"), icon: BarChart3 },
  ];

  return (
    <div className="container-fluid space-responsive animate-fade-in">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {t("title")}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              {t("settings")}
            </Button>
            <AddPersonalMilestoneDialog year={currentYear} />
            <AddFinancialGoalDialog year={currentYear} />
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("progress.lifeProgress")}
                  </p>
                  <p className="text-2xl font-bold">
                    {Math.round(progressPercentage)}%
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </div>
              <Progress value={progressPercentage} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("progress.milestones")}
                  </p>
                  <p className="text-2xl font-bold">
                    {progressStats.completedMilestones}/
                    {progressStats.totalMilestones}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Star className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <Progress
                value={
                  progressStats.totalMilestones > 0
                    ? (progressStats.completedMilestones /
                        progressStats.totalMilestones) *
                      100
                    : 0
                }
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("progress.vision")}
                  </p>
                  <p className="text-2xl font-bold">
                    {futureVision ? "✓" : "—"}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Target className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <div className="mt-2">
                <Badge variant={futureVision ? "default" : "secondary"}>
                  {futureVision
                    ? t("progress.completed")
                    : t("progress.pending")}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab.id as TabId)}
              className={cn(
                "gap-2 transition-all duration-200",
                activeTab === tab.id && "shadow-md"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="shadow-modern hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <CalendarClock className="mr-2 h-5 w-5 text-primary" />
                    {t("sections.calendar")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LifeCalendar />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <FutureVisionCard />
              <FinancialProjections year={currentYear} />
            </div>
          </div>
        )}

        {activeTab === "calendar" && (
          <Card className="shadow-modern">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <CalendarClock className="mr-2 h-6 w-6 text-primary" />
                {t("sections.calendar")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LifeCalendar />
            </CardContent>
          </Card>
        )}

        {activeTab === "goals" && (
          <div className="space-y-6">
            <GoalsList year={currentYear} />
          </div>
        )}

        {activeTab === "dna" && (
          <Card className="shadow-modern">
            <CardContent className="p-6">
              <FinanceDNAStrand />
            </CardContent>
          </Card>
        )}

        {activeTab === "heatmap" && (
          <Card className="shadow-modern">
            <CardContent className="p-6">
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">
                  Теплова карта життя
                </h3>
                <p className="text-muted-foreground">Компонент в розробці...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FinancialProjections year={currentYear} />
            <Card className="shadow-modern">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <PieChart className="mr-2 h-5 w-5 text-primary" />
                  {t("analytics.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t("analytics.description")}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <OnboardingDialog
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </div>
  );
}
