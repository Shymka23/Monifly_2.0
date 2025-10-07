"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  Star,
  Target,
  Zap,
  Play,
  Pause,
  Edit,
  BarChart3,
  Orbit,
  Rocket,
  Sun,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import useLifePlanningStore from "@/hooks/use-life-planning-store";
import { cn } from "@/lib/utils";
import type { LifeCalendarEntry, FinancialGoal } from "@/lib/types";

interface DreamPlanet {
  id: string;
  name: string;
  description: string;
  category:
    | "financial"
    | "career"
    | "health"
    | "family"
    | "education"
    | "personal";
  size: number;
  distance: number;
  color: string;
  progress: number;
  status: "dormant" | "active" | "achieved" | "supernova";
  orbitSpeed: number;
  x: number;
  y: number;
  targetYear: number;
  currentValue: number;
  targetValue: number;
}

export function DreamGalaxyExplorer() {
  const { t } = useTranslation("life-goals");
  const { calendar, getProgressStats } = useLifePlanningStore();
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [isOrbiting, setIsOrbiting] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState<"galaxy" | "constellation">(
    "galaxy"
  );

  // Generate dream planets from calendar data
  const dreamPlanets = useMemo(() => {
    if (!calendar) return [];

    const planets: DreamPlanet[] = [];
    const centerX = 300;
    const centerY = 300;
    const baseRadius = 200;

    Object.values(calendar).forEach((entry: LifeCalendarEntry, index) => {
      if (entry.financialGoals) {
        entry.financialGoals.forEach(
          (goal: FinancialGoal, milestoneIndex: number) => {
            if (goal.targetAmount && goal.targetDate) {
              const angle = (index * 60 + milestoneIndex * 30) % 360;
              const distance = baseRadius + milestoneIndex * 50;
              const x = centerX + Math.cos((angle * Math.PI) / 180) * distance;
              const y = centerY + Math.sin((angle * Math.PI) / 180) * distance;

              const progress = Math.min(
                (goal.amount || 0) / goal.targetAmount,
                1
              );
              const size = Math.max(20, Math.min(80, progress * 60 + 20));

              planets.push({
                id: goal.id,
                name: goal.title,
                description: goal.description || "",
                category: mapGoalTypeToCategory(goal.type),
                size,
                distance,
                color: getCategoryColor(mapGoalTypeToCategory(goal.type)),
                progress: progress * 100,
                status:
                  progress >= 1
                    ? "achieved"
                    : progress > 0
                    ? "active"
                    : "dormant",
                orbitSpeed: 0.5 + Math.random() * 1.5,
                x,
                y,
                targetYear: new Date(goal.targetDate).getFullYear(),
                currentValue: goal.amount || 0,
                targetValue: goal.targetAmount,
              });
            }
          }
        );
      }
    });

    return planets;
  }, [calendar]);

  const mapGoalTypeToCategory = (
    goalType: string
  ):
    | "financial"
    | "career"
    | "health"
    | "family"
    | "education"
    | "personal" => {
    const mapping: Record<
      string,
      "financial" | "career" | "health" | "family" | "education" | "personal"
    > = {
      income: "financial",
      expense: "financial",
      investment: "financial",
      saving: "financial",
    };
    return mapping[goalType] || "financial";
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      financial: "from-green-500 to-emerald-500",
      career: "from-blue-500 to-cyan-500",
      health: "from-red-500 to-pink-500",
      family: "from-purple-500 to-violet-500",
      education: "from-yellow-500 to-orange-500",
      personal: "from-indigo-500 to-blue-500",
    };
    return colors[category as keyof typeof colors] || colors.personal;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "financial":
        return Target;
      case "career":
        return BarChart3;
      case "health":
        return Zap;
      case "family":
        return Star;
      case "education":
        return Star;
      case "personal":
        return Sparkles;
      default:
        return Star;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "dormant":
        return "text-gray-500";
      case "active":
        return "text-blue-500";
      case "achieved":
        return "text-green-500";
      case "supernova":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "dormant":
        return Star;
      case "active":
        return Zap;
      case "achieved":
        return Target;
      case "supernova":
        return Sun;
      default:
        return Star;
    }
  };

  const getOrbitPath = (distance: number, centerX: number, centerY: number) => {
    const radius = distance;
    const circumference = 2 * Math.PI * radius;
    const dashArray = circumference / 20;
    return {
      cx: centerX,
      cy: centerY,
      r: radius,
      strokeDasharray: `${dashArray} ${dashArray}`,
      strokeDashoffset: 0,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            {t("galaxy.title")}
          </h3>
          <p className="text-muted-foreground text-sm">
            {t("galaxy.description")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "galaxy" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("galaxy")}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {t("galaxy.galaxy")}
          </Button>
          <Button
            variant={viewMode === "constellation" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("constellation")}
            className="gap-2"
          >
            <Star className="h-4 w-4" />
            {t("galaxy.constellation")}
          </Button>
        </div>
      </div>

      {/* Galaxy Visualization */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Orbit className="h-5 w-5 text-primary" />
            {t("galaxy.visualization")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-[600px] overflow-hidden bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 rounded-lg">
            {/* Stars background */}
            <div className="absolute inset-0">
              {Array.from({ length: 100 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 3}s`,
                  }}
                />
              ))}
            </div>

            {/* Central sun */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
              <Sun className="h-8 w-8 text-white" />
            </div>

            {/* Orbit paths */}
            {Array.from({ length: 5 }).map((_, i) => {
              const orbit = getOrbitPath(150 + i * 80, 300, 300);
              return (
                <circle
                  key={i}
                  cx={orbit.cx}
                  cy={orbit.cy}
                  r={orbit.r}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="1"
                  strokeDasharray={orbit.strokeDasharray}
                  className={isOrbiting ? "animate-spin" : ""}
                  style={{ animationDuration: `${3 + i}s` }}
                />
              );
            })}

            {/* Dream planets */}
            {dreamPlanets.map(planet => {
              const CategoryIcon = getCategoryIcon(planet.category);
              const StatusIcon = getStatusIcon(planet.status);
              const isSelected = selectedPlanet === planet.id;

              return (
                <div
                  key={planet.id}
                  className={cn(
                    "absolute cursor-pointer transition-all duration-300 hover:scale-110",
                    isSelected && "ring-2 ring-primary ring-offset-2"
                  )}
                  style={{
                    left: planet.x - planet.size / 2,
                    top: planet.y - planet.size / 2,
                    width: planet.size,
                    height: planet.size,
                    transform: isOrbiting
                      ? `rotate(${(Date.now() * planet.orbitSpeed) / 1000}deg)`
                      : "none",
                  }}
                  onClick={() =>
                    setSelectedPlanet(isSelected ? null : planet.id)
                  }
                >
                  <div
                    className={cn(
                      "w-full h-full rounded-full flex items-center justify-center relative",
                      `bg-gradient-to-r ${planet.color}`,
                      planet.status === "supernova" && "animate-pulse"
                    )}
                  >
                    <CategoryIcon className="h-6 w-6 text-white" />

                    {/* Progress ring */}
                    <div
                      className="absolute inset-0 rounded-full border-4 border-transparent border-t-white/30"
                      style={{
                        transform: `rotate(${planet.progress * 3.6}deg)`,
                        borderTopColor:
                          planet.progress > 50
                            ? "white"
                            : "rgba(255,255,255,0.3)",
                      }}
                    />

                    {/* Status indicator */}
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <StatusIcon className="h-2 w-2 text-green-500" />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Constellation lines */}
            {viewMode === "constellation" && (
              <svg className="absolute inset-0 w-full h-full">
                {dreamPlanets.map((planet, index) => {
                  const nextPlanet =
                    dreamPlanets[(index + 1) % dreamPlanets.length];
                  return (
                    <line
                      key={`line-${index}`}
                      x1={planet.x}
                      y1={planet.y}
                      x2={nextPlanet.x}
                      y2={nextPlanet.y}
                      stroke="rgba(255, 255, 255, 0.2)"
                      strokeWidth="1"
                      className="animate-pulse"
                    />
                  );
                })}
              </svg>
            )}

            {/* Controls */}
            <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 border">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOrbiting(!isOrbiting)}
                  className="gap-2"
                >
                  {isOrbiting ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {isOrbiting ? t("galaxy.pause") : t("galaxy.orbit")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                >
                  -
                </Button>
                <span className="text-sm w-8 text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
                >
                  +
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Planet Details */}
      {selectedPlanet && (
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                {t("galaxy.planetDetails")}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPlanet(null)}
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const planet = dreamPlanets.find(p => p.id === selectedPlanet);
              if (!planet) return null;

              const CategoryIcon = getCategoryIcon(planet.category);
              const StatusIcon = getStatusIcon(planet.status);

              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center",
                        `bg-gradient-to-r ${planet.color}`
                      )}
                    >
                      <CategoryIcon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{planet.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {planet.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <StatusIcon
                          className={cn(
                            "h-4 w-4",
                            getStatusColor(planet.status)
                          )}
                        />
                        <Badge variant="outline" className="text-xs">
                          {planet.category.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {planet.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        {t("galaxy.progress")}
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {Math.round(planet.progress)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        {t("galaxy.currentValue")}
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        ${planet.currentValue.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        {t("galaxy.targetValue")}
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        ${planet.targetValue.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        {t("galaxy.targetYear")}
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        {planet.targetYear}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t("galaxy.progress")}</span>
                      <span>{Math.round(planet.progress)}%</span>
                    </div>
                    <Progress value={planet.progress} className="h-2" />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button className="gap-2">
                      <Edit className="h-4 w-4" />
                      {t("galaxy.editPlanet")}
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Rocket className="h-4 w-4" />
                      {t("galaxy.launchMission")}
                    </Button>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Planet List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            {t("galaxy.allPlanets")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dreamPlanets.map(planet => {
              const CategoryIcon = getCategoryIcon(planet.category);
              const StatusIcon = getStatusIcon(planet.status);
              const isSelected = selectedPlanet === planet.id;

              return (
                <div
                  key={planet.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer",
                    isSelected && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedPlanet(planet.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        `bg-gradient-to-r ${planet.color}`
                      )}
                    >
                      <CategoryIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">{planet.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {planet.category.toUpperCase()} • {planet.targetYear}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        ${planet.currentValue.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        / ${planet.targetValue.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">
                        {Math.round(planet.progress)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {planet.status}
                      </div>
                    </div>
                    <StatusIcon
                      className={cn("h-5 w-5", getStatusColor(planet.status))}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("galaxy.stats.totalPlanets")}
                </p>
                <p className="text-2xl font-bold">{dreamPlanets.length}</p>
              </div>
              <div className="p-2 rounded-lg bg-primary/10">
                <Star className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("galaxy.stats.activePlanets")}
                </p>
                <p className="text-2xl font-bold">
                  {dreamPlanets.filter(p => p.status === "active").length}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-green-500/10">
                <Zap className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("galaxy.stats.achievedPlanets")}
                </p>
                <p className="text-2xl font-bold">
                  {dreamPlanets.filter(p => p.status === "achieved").length}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Target className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("galaxy.stats.averageProgress")}
                </p>
                <p className="text-2xl font-bold">
                  {Math.round(
                    dreamPlanets.reduce((acc, p) => acc + p.progress, 0) /
                      dreamPlanets.length
                  )}
                  %
                </p>
              </div>
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Star className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
