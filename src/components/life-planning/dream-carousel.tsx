"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  RotateCcw,
  Play,
  Pause,
  Star,
  Target,
  Sparkles,
  TrendingUp,
  Calendar,
  Heart,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import useLifePlanningStore from "@/hooks/use-life-planning-store";
import { cn } from "@/lib/utils";
import type { LifeCalendarEntry, FinancialGoal } from "@/lib/types";

interface DreamCard {
  id: string;
  title: string;
  category: string;
  progress: number;
  targetYear: number;
  priority: number;
  description: string;
  icon: string;
  color: string;
}

export function DreamCarousel() {
  const { t } = useTranslation("life-goals");
  const { calendar, getProgressStats } = useLifePlanningStore();
  const [isRotating, setIsRotating] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [selectedDream, setSelectedDream] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Generate dream cards from calendar data
  const dreamCards = useMemo(() => {
    if (!calendar) return [];

    const dreams: DreamCard[] = [];
    const currentYear = new Date().getFullYear();

    Object.values(calendar).forEach((entry: LifeCalendarEntry) => {
      if (entry.financialGoals) {
        entry.financialGoals.forEach((goal: FinancialGoal) => {
          if (goal.targetAmount && goal.targetDate) {
            const targetYear = new Date(goal.targetDate).getFullYear();
            const progress = Math.min(
              (goal.amount || 0) / goal.targetAmount,
              1
            );
            const yearsUntilTarget = targetYear - currentYear;
            const priority = Math.max(0, 1 - yearsUntilTarget / 10); // Higher priority for closer goals

            dreams.push({
              id: goal.id,
              title: goal.title,
              category: goal.type,
              progress: progress * 100,
              targetYear: targetYear,
              priority,
              description: goal.description || "",
              icon: "target",
              color: getCategoryColor(goal.type),
            });
          }
        });
      }
    });

    return dreams.sort((a, b) => b.priority - a.priority);
  }, [calendar]);

  const getCategoryColor = (category: string) => {
    const colors = {
      car: "from-blue-500 to-cyan-500",
      house: "from-green-500 to-emerald-500",
      travel: "from-purple-500 to-pink-500",
      education: "from-yellow-500 to-orange-500",
      business: "from-indigo-500 to-blue-500",
      family: "from-pink-500 to-rose-500",
      health: "from-red-500 to-pink-500",
      general: "from-gray-500 to-slate-500",
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      car: "🚗",
      house: "🏠",
      travel: "✈️",
      education: "🎓",
      business: "💼",
      family: "👨‍👩‍👧‍👦",
      health: "💪",
      general: "🎯",
    };
    return icons[category as keyof typeof icons] || icons.general;
  };

  const getCardSize = (progress: number, priority: number) => {
    const baseSize = 200;
    const progressMultiplier = 0.5 + (progress / 100) * 0.5; // 0.5x to 1x based on progress
    const priorityMultiplier = 0.8 + priority * 0.4; // 0.8x to 1.2x based on priority
    return Math.round(baseSize * progressMultiplier * priorityMultiplier);
  };

  const getCardPosition = (index: number, total: number) => {
    const angle = (360 / total) * index;
    const radius = 300;
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;
    return { x, y, angle };
  };

  useEffect(() => {
    if (isRotating && carouselRef.current) {
      const interval = setInterval(() => {
        if (carouselRef.current) {
          const currentTransform = carouselRef.current.style.transform;
          const currentRotation = currentTransform.includes("rotate")
            ? parseFloat(
                currentTransform.match(/rotate\(([^)]+)\)/)?.[1] || "0"
              )
            : 0;
          carouselRef.current.style.transform = `rotate(${
            currentRotation + rotationSpeed
          }deg)`;
        }
      }, 50);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [isRotating, rotationSpeed]);

  if (!dreamCards.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <RotateCcw className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {t("carousel.empty.title")}
        </h3>
        <p className="text-muted-foreground mb-4">
          {t("carousel.empty.description")}
        </p>
        <Button className="gap-2">
          <Target className="h-4 w-4" />
          {t("carousel.empty.addFirst")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <RotateCcw className="h-6 w-6 text-primary" />
            {t("carousel.title")}
          </h3>
          <p className="text-muted-foreground text-sm">
            {t("carousel.description")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isRotating ? "destructive" : "default"}
            size="sm"
            onClick={() => setIsRotating(!isRotating)}
            className="gap-2"
          >
            {isRotating ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isRotating ? t("carousel.pause") : t("carousel.play")}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (carouselRef.current) {
                carouselRef.current.style.transform = "rotate(0deg)";
              }
            }}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {t("carousel.reset")}
          </Button>
        </div>
      </div>

      {/* Speed Control */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">{t("carousel.speed")}:</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRotationSpeed(Math.max(0.5, rotationSpeed - 0.5))}
          >
            -
          </Button>
          <span className="text-sm w-8 text-center">{rotationSpeed}x</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRotationSpeed(Math.min(3, rotationSpeed + 0.5))}
          >
            +
          </Button>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative w-full h-[600px] overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border-2 border-dashed border-primary/20">
        <div
          ref={carouselRef}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-1000 ease-out"
          style={{ transform: "rotate(0deg)" }}
        >
          {dreamCards.map((dream, index) => {
            const position = getCardPosition(index, dreamCards.length);
            const cardSize = getCardSize(dream.progress, dream.priority);
            const isSelected = selectedDream === dream.id;
            const isHighlighted = dream.progress > 80;

            return (
              <div
                key={dream.id}
                className="absolute transition-all duration-500 hover:z-10"
                style={{
                  left: position.x - cardSize / 2,
                  top: position.y - cardSize / 2,
                  width: cardSize,
                  height: cardSize,
                  transform: `rotate(${-position.angle}deg)`,
                }}
                onClick={() => setSelectedDream(dream.id)}
              >
                <Card
                  className={cn(
                    "w-full h-full transition-all duration-300 cursor-pointer hover:shadow-xl",
                    `bg-gradient-to-br ${dream.color}`,
                    isSelected && "ring-2 ring-primary shadow-xl scale-105",
                    isHighlighted && "animate-pulse"
                  )}
                >
                  <CardContent className="p-4 h-full flex flex-col justify-between">
                    {/* Header */}
                    <div className="text-center">
                      <div className="text-3xl mb-2">
                        {getCategoryIcon(dream.category)}
                      </div>
                      <h4 className="font-bold text-sm line-clamp-2">
                        {dream.title}
                      </h4>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {dream.targetYear}
                      </Badge>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>{Math.round(dream.progress)}%</span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {dream.priority > 0.8
                            ? "High"
                            : dream.priority > 0.5
                            ? "Med"
                            : "Low"}
                        </span>
                      </div>
                      <Progress value={dream.progress} className="h-1" />
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-center">
                      {dream.progress >= 100 ? (
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="h-4 w-4" />
                          <span className="text-xs font-bold">DONE!</span>
                        </div>
                      ) : dream.progress > 80 ? (
                        <div className="flex items-center gap-1 text-green-500">
                          <Sparkles className="h-4 w-4" />
                          <span className="text-xs font-bold">Almost!</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-blue-500">
                          <Target className="h-4 w-4" />
                          <span className="text-xs font-bold">In Progress</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Center Info */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="bg-background/80 backdrop-blur-sm rounded-full p-4 border-2 border-primary/20">
            <div className="text-2xl font-bold text-primary">
              {dreamCards.length}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("carousel.dreams")}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Dream Details */}
      {selectedDream && (
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                {t("carousel.selectedDream")}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDream(null)}
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const dream = dreamCards.find(d => d.id === selectedDream);
              if (!dream) return null;

              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">
                      {getCategoryIcon(dream.category)}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{dream.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {dream.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{t("carousel.progress")}</span>
                        <span>{Math.round(dream.progress)}%</span>
                      </div>
                      <Progress value={dream.progress} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{t("carousel.priority")}</span>
                        <span>
                          {dream.priority > 0.8
                            ? "High"
                            : dream.priority > 0.5
                            ? "Medium"
                            : "Low"}
                        </span>
                      </div>
                      <Progress value={dream.priority * 100} className="h-2" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="h-3 w-3" />
                      {dream.targetYear}
                    </Badge>
                    <Button size="sm" className="gap-2">
                      <Target className="h-4 w-4" />
                      {t("carousel.editGoal")}
                    </Button>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      {dreamCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("carousel.stats.total")}
                  </p>
                  <p className="text-2xl font-bold">{dreamCards.length}</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("carousel.stats.completed")}
                  </p>
                  <p className="text-2xl font-bold">
                    {dreamCards.filter(d => d.progress >= 100).length}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Star className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border-yellow-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("carousel.stats.almost")}
                  </p>
                  <p className="text-2xl font-bold">
                    {
                      dreamCards.filter(
                        d => d.progress > 80 && d.progress < 100
                      ).length
                    }
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("carousel.stats.average")}
                  </p>
                  <p className="text-2xl font-bold">
                    {Math.round(
                      dreamCards.reduce((acc, d) => acc + d.progress, 0) /
                        dreamCards.length
                    )}
                    %
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty state */}
      {dreamCards.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <RotateCcw className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {t("carousel.empty.title")}
          </h3>
          <p className="text-muted-foreground mb-4">
            {t("carousel.empty.description")}
          </p>
          <Button className="gap-2">
            <Target className="h-4 w-4" />
            {t("carousel.empty.addFirst")}
          </Button>
        </div>
      )}
    </div>
  );
}
