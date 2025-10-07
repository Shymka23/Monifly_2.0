"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GitBranch,
  TrendingDown,
  Target,
  Star,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Edit,
  BarChart3,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import useLifePlanningStore from "@/hooks/use-life-planning-store";
import { cn } from "@/lib/utils";

interface TimelinePoint {
  year: number;
  value: number;
  event: string;
  type: "milestone" | "crisis" | "opportunity" | "achievement";
  probability: number;
  color: string;
}

interface Reality {
  id: string;
  name: string;
  description: string;
  color: string;
  probability: number;
  points: TimelinePoint[];
  isActive: boolean;
  createdAt: Date;
}

export function AlternateRealitiesTimeline() {
  const { t } = useTranslation("life-goals");
  const {} = useLifePlanningStore();
  const [selectedReality, setSelectedReality] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Generate alternate realities
  const realities = useMemo(() => {
    const baseReality: Reality = {
      id: "base",
      name: t("timeline.baseReality"),
      description: t("timeline.baseRealityDesc"),
      color: "from-blue-500 to-cyan-500",
      probability: 1.0,
      points: [],
      isActive: true,
      createdAt: new Date(),
    };

    const alternateRealities: Reality[] = [
      {
        id: "optimistic",
        name: t("timeline.optimisticReality"),
        description: t("timeline.optimisticRealityDesc"),
        color: "from-green-500 to-emerald-500",
        probability: 0.3,
        points: [
          {
            year: 2025,
            value: 100000,
            event: t("timeline.events.promotion"),
            type: "achievement",
            probability: 0.8,
            color: "text-green-600",
          },
          {
            year: 2027,
            value: 150000,
            event: t("timeline.events.investment"),
            type: "opportunity",
            probability: 0.6,
            color: "text-blue-600",
          },
          {
            year: 2030,
            value: 250000,
            event: t("timeline.events.entrepreneur"),
            type: "milestone",
            probability: 0.4,
            color: "text-purple-600",
          },
        ],
        isActive: false,
        createdAt: new Date(),
      },
      {
        id: "pessimistic",
        name: t("timeline.pessimisticReality"),
        description: t("timeline.pessimisticRealityDesc"),
        color: "from-red-500 to-pink-500",
        probability: 0.2,
        points: [
          {
            year: 2025,
            value: 40000,
            event: t("timeline.events.jobLoss"),
            type: "crisis",
            probability: 0.3,
            color: "text-red-600",
          },
          {
            year: 2027,
            value: 35000,
            event: t("timeline.events.economicCrisis"),
            type: "crisis",
            probability: 0.2,
            color: "text-red-600",
          },
          {
            year: 2030,
            value: 45000,
            event: t("timeline.events.recovery"),
            type: "milestone",
            probability: 0.5,
            color: "text-orange-600",
          },
        ],
        isActive: false,
        createdAt: new Date(),
      },
      {
        id: "balanced",
        name: t("timeline.balancedReality"),
        description: t("timeline.balancedRealityDesc"),
        color: "from-yellow-500 to-orange-500",
        probability: 0.5,
        points: [
          {
            year: 2025,
            value: 75000,
            event: t("timeline.events.stableGrowth"),
            type: "milestone",
            probability: 0.7,
            color: "text-yellow-600",
          },
          {
            year: 2027,
            value: 90000,
            event: t("timeline.events.sideBusiness"),
            type: "opportunity",
            probability: 0.5,
            color: "text-blue-600",
          },
          {
            year: 2030,
            value: 120000,
            event: t("timeline.events.workLifeBalance"),
            type: "achievement",
            probability: 0.6,
            color: "text-green-600",
          },
        ],
        isActive: false,
        createdAt: new Date(),
      },
    ];

    return [baseReality, ...alternateRealities];
  }, [t]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "milestone":
        return Target;
      case "crisis":
        return TrendingDown;
      case "opportunity":
        return Star;
      case "achievement":
        return Zap;
      default:
        return Target;
    }
  };

  // const getEventColor = (type: string) => {
  //   switch (type) {
  //     case "milestone":
  //       return "text-blue-600";
  //     case "crisis":
  //       return "text-red-600";
  //     case "opportunity":
  //       return "text-green-600";
  //     case "achievement":
  //       return "text-purple-600";
  //     default:
  //       return "text-gray-600";
  //   }
  // };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 0.7) return "text-green-600";
    if (probability >= 0.4) return "text-yellow-600";
    return "text-red-600";
  };

  const createFork = (realityId: string) => {
    const baseReality = realities.find(r => r.id === realityId);
    if (!baseReality) return;

    const newReality: Reality = {
      id: `fork-${Date.now()}`,
      name: `${baseReality.name} (Fork)`,
      description: t("timeline.forkDescription"),
      color: baseReality.color,
      probability: baseReality.probability * 0.5,
      points: [...baseReality.points],
      isActive: false,
      createdAt: new Date(),
    };

    // Add new reality to the list
    // This would typically update state in a real implementation
    console.log("Creating fork:", newReality);
  };

  // const compareRealities = (reality1: Reality, reality2: Reality) => {
  //   const maxYear = Math.max(
  //     ...reality1.points.map(p => p.year),
  //     ...reality2.points.map(p => p.year)
  //   );

  //   const comparison = [];
  //   for (let year = currentYear; year <= maxYear; year++) {
  //     const point1 = reality1.points.find(p => p.year === year);
  //     const point2 = reality2.points.find(p => p.year === year);

  //     comparison.push({
  //       year,
  //       reality1: point1?.value || 0,
  //       reality2: point2?.value || 0,
  //       difference: (point1?.value || 0) - (point2?.value || 0),
  //     });
  //   }

  //   return comparison;
  // };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-primary" />
            {t("timeline.title")}
          </h3>
          <p className="text-muted-foreground text-sm">
            {t("timeline.description")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAnimating(!isAnimating)}
            className="gap-2"
          >
            {isAnimating ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isAnimating ? t("timeline.pause") : t("timeline.play")}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              /* Reset year */
            }}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {t("timeline.reset")}
          </Button>
        </div>
      </div>

      {/* Reality Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {realities.map(reality => {
          const isSelected = selectedReality === reality.id;
          const isActive = reality.isActive;

          return (
            <Card
              key={reality.id}
              className={cn(
                "cursor-pointer transition-all duration-300 hover:shadow-lg",
                `bg-gradient-to-br ${reality.color}`,
                isSelected && "ring-2 ring-primary shadow-xl",
                isActive && "ring-2 ring-green-500"
              )}
              onClick={() => setSelectedReality(isSelected ? null : reality.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5" />
                    <span className="font-bold text-sm">{reality.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isActive && (
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {Math.round(reality.probability * 100)}%
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {reality.description}
                  </div>

                  <div className="flex justify-between text-xs">
                    <span>{t("timeline.points")}</span>
                    <span className="font-bold">{reality.points.length}</span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span>{t("timeline.probability")}</span>
                    <span
                      className={cn(
                        "font-bold",
                        getProbabilityColor(reality.probability)
                      )}
                    >
                      {Math.round(reality.probability * 100)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Timeline Visualization */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {t("timeline.visualization")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-64 overflow-x-auto">
            <div className="flex space-x-8 min-w-max">
              {realities.map(reality => (
                <div key={reality.id} className="flex-shrink-0">
                  <div
                    className={cn(
                      "w-64 h-48 rounded-lg p-4 border-2 transition-all duration-300",
                      `bg-gradient-to-br ${reality.color}`,
                      selectedReality === reality.id &&
                        "ring-2 ring-primary shadow-xl"
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-sm text-white">
                        {reality.name}
                      </h4>
                      <Badge
                        variant="outline"
                        className="text-xs bg-white/20 text-white"
                      >
                        {Math.round(reality.probability * 100)}%
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {reality.points.slice(0, 3).map((point, index) => {
                        const EventIcon = getEventIcon(point.type);
                        return (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-xs text-white"
                          >
                            <EventIcon className="h-3 w-3" />
                            <span className="flex-1">{point.event}</span>
                            <span className="font-bold">
                              ${point.value.toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Reality Details */}
      {selectedReality && (
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                {t("timeline.realityDetails")}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => createFork(selectedReality)}
                  className="gap-2"
                >
                  <GitBranch className="h-4 w-4" />
                  {t("timeline.createFork")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedReality(null)}
                >
                  ×
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const reality = realities.find(r => r.id === selectedReality);
              if (!reality) return null;

              return (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center",
                        `bg-gradient-to-r ${reality.color}`
                      )}
                    >
                      <GitBranch className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{reality.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {reality.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">
                          {Math.round(reality.probability * 100)}%{" "}
                          {t("timeline.probability")}
                        </Badge>
                        {reality.isActive && (
                          <Badge variant="default">Active</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-sm font-medium">
                      {t("timeline.timelinePoints")}
                    </div>
                    <div className="space-y-3">
                      {reality.points.map((point, index) => {
                        const EventIcon = getEventIcon(point.type);
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center",
                                  `bg-gradient-to-r ${reality.color}`
                                )}
                              >
                                <EventIcon className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <div className="font-medium">{point.event}</div>
                                <div className="text-sm text-muted-foreground">
                                  {point.year}
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="font-bold text-green-600">
                                ${point.value.toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {Math.round(point.probability * 100)}% chance
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button className="gap-2">
                      <Edit className="h-4 w-4" />
                      {t("timeline.editReality")}
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      {t("timeline.addPoint")}
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <BarChart3 className="h-4 w-4" />
                      {t("timeline.compare")}
                    </Button>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("timeline.stats.totalRealities")}
                </p>
                <p className="text-2xl font-bold">{realities.length}</p>
              </div>
              <div className="p-2 rounded-lg bg-primary/10">
                <GitBranch className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("timeline.stats.activeRealities")}
                </p>
                <p className="text-2xl font-bold">
                  {realities.filter(r => r.isActive).length}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-green-500/10">
                <Play className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("timeline.stats.totalPoints")}
                </p>
                <p className="text-2xl font-bold">
                  {realities.reduce((acc, r) => acc + r.points.length, 0)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Target className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
