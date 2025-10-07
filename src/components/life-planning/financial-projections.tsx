"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Target,
  TrendingUp,
  DollarSign,
  PieChart,
  Calendar,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

interface FinancialProjectionsProps {
  year: number;
}

export function FinancialProjections({ year }: FinancialProjectionsProps) {
  const { t } = useTranslation("life-goals");

  // Mock data for projections
  const projections = {
    inflation: 2.5,
    returns: {
      stocks: 7.2,
      bonds: 3.1,
      realEstate: 4.8,
      cash: 1.2,
    },
    assetAllocation: [
      { name: "stocks", percentage: 60, color: "bg-blue-500" },
      { name: "bonds", percentage: 25, color: "bg-green-500" },
      { name: "realEstate", percentage: 10, color: "bg-purple-500" },
      { name: "cash", percentage: 5, color: "bg-gray-500" },
    ],
    milestones: [
      { age: 30, amount: 50000, achieved: true },
      { age: 40, amount: 200000, achieved: false },
      { age: 50, amount: 500000, achieved: false },
      { age: 60, amount: 1000000, achieved: false },
    ],
  };

  return (
    <Card className="shadow-modern hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center">
            <BarChart className="mr-2 h-5 w-5 text-primary" />
            {t("projections.title")}
          </div>
          <Badge variant="outline" className="gap-1">
            <Calendar className="h-3 w-3" />
            {year}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">
                {t("projections.inflation")}
              </span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {projections.inflation}%
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">
                {t("projections.expectedReturn")}
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-600">6.8%</p>
          </div>
        </div>

        {/* Asset Allocation */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            {t("projections.assetAllocation")}
          </h4>
          <div className="space-y-3">
            {projections.assetAllocation.map((asset, index) => (
              <div key={asset.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {t(`projections.assets.${asset.name}`)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {asset.percentage}%
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-500",
                      asset.color
                    )}
                    style={{
                      width: `${asset.percentage}%`,
                      animationDelay: `${index * 100}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Milestones */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            {t("projections.milestones")}
          </h4>
          <div className="space-y-3">
            {projections.milestones.map(milestone => (
              <div key={milestone.age} className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                    milestone.achieved
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {milestone.achieved ? "✓" : milestone.age}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {t("projections.age", { age: milestone.age })}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ${milestone.amount.toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    value={milestone.achieved ? 100 : Math.random() * 100}
                    className="mt-1 h-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <Button className="w-full gap-2">
          <BarChart className="h-4 w-4" />
          {t("projections.viewDetails")}
        </Button>
      </CardContent>
    </Card>
  );
}
