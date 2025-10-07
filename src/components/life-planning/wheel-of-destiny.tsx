"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  RotateCcw,
  Play,
  Target,
  Star,
  Heart,
  DollarSign,
  GraduationCap,
  Home,
  Zap,
  Sparkles,
  Trophy,
  Gift,
  LucideIcon,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
// import useLifePlanningStore from "@/hooks/use-life-planning-store";
import { cn } from "@/lib/utils";

interface WheelSegment {
  id: string;
  name: string;
  description: string;
  weight: number;
  color: string;
  icon: LucideIcon;
  category:
    | "financial"
    | "health"
    | "career"
    | "personal"
    | "family"
    | "education";
  probability: number;
}

export function WheelOfDestiny() {
  const { t } = useTranslation("life-goals");
  // const lifePlanningStore = useLifePlanningStore(); // TODO: Implement store integration
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [spinHistory, setSpinHistory] = useState<string[]>([]);

  // Generate wheel segments from calendar data
  const wheelSegments = useMemo(() => {
    const segments: WheelSegment[] = [
      {
        id: "financial_stability",
        name: t("wheel.segments.financialStability"),
        description: t("wheel.segments.financialStabilityDesc"),
        weight: 0.25,
        color: "from-green-500 to-emerald-500",
        icon: DollarSign,
        category: "financial",
        probability: 0,
      },
      {
        id: "career_success",
        name: t("wheel.segments.careerSuccess"),
        description: t("wheel.segments.careerSuccessDesc"),
        weight: 0.2,
        color: "from-blue-500 to-cyan-500",
        icon: Target,
        category: "career",
        probability: 0,
      },
      {
        id: "health_wellness",
        name: t("wheel.segments.healthWellness"),
        description: t("wheel.segments.healthWellnessDesc"),
        weight: 0.2,
        color: "from-red-500 to-pink-500",
        icon: Heart,
        category: "health",
        probability: 0,
      },
      {
        id: "family_happiness",
        name: t("wheel.segments.familyHappiness"),
        description: t("wheel.segments.familyHappinessDesc"),
        weight: 0.15,
        color: "from-purple-500 to-violet-500",
        icon: Home,
        category: "family",
        probability: 0,
      },
      {
        id: "education_growth",
        name: t("wheel.segments.educationGrowth"),
        description: t("wheel.segments.educationGrowthDesc"),
        weight: 0.1,
        color: "from-yellow-500 to-orange-500",
        icon: GraduationCap,
        category: "education",
        probability: 0,
      },
      {
        id: "personal_development",
        name: t("wheel.segments.personalDevelopment"),
        description: t("wheel.segments.personalDevelopmentDesc"),
        weight: 0.1,
        color: "from-indigo-500 to-blue-500",
        icon: Star,
        category: "personal",
        probability: 0,
      },
    ];

    // Calculate probabilities based on weights
    const totalWeight = segments.reduce(
      (sum, segment) => sum + segment.weight,
      0
    );
    return segments.map(segment => ({
      ...segment,
      probability: (segment.weight / totalWeight) * 100,
    }));
  }, [t]);

  const getSegmentAngle = (index: number) => {
    return (360 / wheelSegments.length) * index;
  };

  const getSegmentColor = (index: number) => {
    const colors = [
      "from-green-500 to-emerald-500",
      "from-blue-500 to-cyan-500",
      "from-red-500 to-pink-500",
      "from-purple-500 to-violet-500",
      "from-yellow-500 to-orange-500",
      "from-indigo-500 to-blue-500",
    ];
    return colors[index % colors.length];
  };

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setLastResult(null);

    // Calculate random result based on probabilities
    const random = Math.random() * 100;
    let cumulativeProbability = 0;
    let selectedSegmentId = wheelSegments[0].id;

    for (const segment of wheelSegments) {
      cumulativeProbability += segment.probability;
      if (random <= cumulativeProbability) {
        selectedSegmentId = segment.id;
        break;
      }
    }

    // Add to history
    setSpinHistory(prev => [selectedSegmentId, ...prev.slice(0, 9)]);

    // Calculate final rotation
    const segmentIndex = wheelSegments.findIndex(
      s => s.id === selectedSegmentId
    );
    const segmentAngle = getSegmentAngle(segmentIndex);
    const finalRotation = 360 * 5 + (360 - segmentAngle); // 5 full rotations + segment position

    setRotation(prev => prev + finalRotation);
    setLastResult(selectedSegmentId);

    // Stop spinning after animation
    setTimeout(() => {
      setIsSpinning(false);
      setSelectedSegment(selectedSegmentId);
    }, 3000);
  };

  const resetWheel = () => {
    setRotation(0);
    setSelectedSegment(null);
    setLastResult(null);
    setSpinHistory([]);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "financial":
        return DollarSign;
      case "career":
        return Target;
      case "health":
        return Heart;
      case "family":
        return Home;
      case "education":
        return GraduationCap;
      case "personal":
        return Star;
      default:
        return Star;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "financial":
        return "text-green-600";
      case "career":
        return "text-blue-600";
      case "health":
        return "text-red-600";
      case "family":
        return "text-purple-600";
      case "education":
        return "text-yellow-600";
      case "personal":
        return "text-indigo-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <RotateCcw className="h-6 w-6 text-primary" />
            {t("wheel.title")}
          </h3>
          <p className="text-muted-foreground text-sm">
            {t("wheel.description")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetWheel}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {t("wheel.reset")}
          </Button>
        </div>
      </div>

      {/* Wheel Visualization */}
      <div className="flex justify-center">
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 w-fit">
          <CardContent className="p-8">
            <div className="relative w-80 h-80">
              {/* Wheel */}
              <div
                className={cn(
                  "w-full h-full rounded-full border-4 border-white shadow-2xl transition-transform duration-3000 ease-out",
                  isSpinning && "animate-spin"
                )}
                style={{
                  transform: `rotate(${rotation}deg)`,
                  background:
                    "conic-gradient(from 0deg, #10B981, #3B82F6, #EF4444, #8B5CF6, #F59E0B, #6366F1)",
                }}
              >
                {/* Segments */}
                {wheelSegments.map((segment, index) => {
                  const angle = getSegmentAngle(index);
                  const segmentSize = 360 / wheelSegments.length;
                  const Icon = segment.icon;

                  return (
                    <div
                      key={segment.id}
                      className="absolute inset-0"
                      style={{
                        transform: `rotate(${angle}deg)`,
                        clipPath: `polygon(50% 50%, 50% 0%, ${
                          50 + 50 * Math.cos((segmentSize * Math.PI) / 180)
                        }% ${
                          50 - 50 * Math.sin((segmentSize * Math.PI) / 180)
                        }%)`,
                      }}
                    >
                      <div
                        className={cn(
                          "w-full h-full flex items-center justify-center text-white font-bold text-sm",
                          `bg-gradient-to-r ${getSegmentColor(index)}`
                        )}
                      >
                        <div className="transform -rotate-45 text-center">
                          <Icon className="h-6 w-6 mx-auto mb-1" />
                          <div className="text-xs">{segment.name}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Center circle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full border-4 border-primary shadow-lg flex items-center justify-center">
                <Target className="h-8 w-8 text-primary" />
              </div>

              {/* Pointer */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spin Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={spinWheel}
          disabled={isSpinning}
          className={cn(
            "gap-3 px-8 py-4 text-lg font-bold transition-all duration-300",
            isSpinning && "animate-pulse"
          )}
        >
          {isSpinning ? (
            <>
              <Zap className="h-6 w-6 animate-spin" />
              {t("wheel.spinning")}
            </>
          ) : (
            <>
              <Play className="h-6 w-6" />
              {t("wheel.spin")}
            </>
          )}
        </Button>
      </div>

      {/* Result */}
      {lastResult && (
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              {t("wheel.result")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const segment = wheelSegments.find(s => s.id === lastResult);
              if (!segment) return null;

              const Icon = segment.icon;
              const CategoryIcon = getCategoryIcon(segment.category);

              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center",
                        `bg-gradient-to-r ${segment.color}`
                      )}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xl">{segment.name}</h4>
                      <p className="text-muted-foreground">
                        {segment.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <CategoryIcon
                          className={cn(
                            "h-4 w-4",
                            getCategoryColor(segment.category)
                          )}
                        />
                        <Badge
                          variant="outline"
                          className={getCategoryColor(segment.category)}
                        >
                          {segment.category.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        {t("wheel.probability")}
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {segment.probability.toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        {t("wheel.weight")}
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {(segment.weight * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t("wheel.chance")}</span>
                      <span>{segment.probability.toFixed(1)}%</span>
                    </div>
                    <Progress value={segment.probability} className="h-2" />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button className="gap-2">
                      <Star className="h-4 w-4" />
                      {t("wheel.setGoal")}
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Gift className="h-4 w-4" />
                      {t("wheel.getReward")}
                    </Button>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Spin History */}
      {spinHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {t("wheel.history")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {spinHistory.map((segmentId, index) => {
                const segment = wheelSegments.find(s => s.id === segmentId);
                if (!segment) return null;

                const Icon = segment.icon;
                const CategoryIcon = getCategoryIcon(segment.category);

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          `bg-gradient-to-r ${segment.color}`
                        )}
                      >
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium">{segment.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {segment.category.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CategoryIcon
                        className={cn(
                          "h-4 w-4",
                          getCategoryColor(segment.category)
                        )}
                      />
                      <span className="text-sm text-muted-foreground">
                        #{index + 1}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Segments Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wheelSegments.map(segment => {
          const Icon = segment.icon;
          const CategoryIcon = getCategoryIcon(segment.category);
          const isSelected = selectedSegment === segment.id;

          return (
            <Card
              key={segment.id}
              className={cn(
                "cursor-pointer transition-all duration-300 hover:shadow-lg",
                isSelected && "ring-2 ring-primary shadow-xl"
              )}
              onClick={() => setSelectedSegment(isSelected ? null : segment.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      `bg-gradient-to-r ${segment.color}`
                    )}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{segment.name}</h4>
                    <div className="flex items-center gap-1">
                      <CategoryIcon
                        className={cn(
                          "h-3 w-3",
                          getCategoryColor(segment.category)
                        )}
                      />
                      <span className="text-xs text-muted-foreground">
                        {segment.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {segment.description}
                  </div>

                  <div className="flex justify-between text-xs">
                    <span>{t("wheel.probability")}</span>
                    <span className="font-bold">
                      {segment.probability.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={segment.probability} className="h-1" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("wheel.stats.totalSpins")}
                </p>
                <p className="text-2xl font-bold">{spinHistory.length}</p>
              </div>
              <div className="p-2 rounded-lg bg-primary/10">
                <RotateCcw className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("wheel.stats.mostLanded")}
                </p>
                <p className="text-2xl font-bold">
                  {(() => {
                    const counts = spinHistory.reduce((acc, id) => {
                      acc[id] = (acc[id] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);
                    const mostFrequent = Object.entries(counts).reduce(
                      (a, b) => (counts[a[0]] > counts[b[0]] ? a : b),
                      ["", 0]
                    );
                    return mostFrequent[1] || 0;
                  })()}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-green-500/10">
                <Trophy className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
          <CardContent className="p4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("wheel.stats.averageProbability")}
                </p>
                <p className="text-2xl font-bold">
                  {(
                    wheelSegments.reduce((acc, s) => acc + s.probability, 0) /
                    wheelSegments.length
                  ).toFixed(1)}
                  %
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
