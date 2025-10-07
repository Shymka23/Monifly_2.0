"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Briefcase,
  PlusCircle,
  Sparkles,
  BarChartHorizontalBig,
  PieChart as PieChartIcon,
  MapPin,
  Loader2,
  BarChart as BarChartIcon,
} from "lucide-react";
import { useBudgetStore } from "@/hooks/use-budget-store";
import { AddInvestmentCaseDialog } from "@/components/investment-portfolio/AddInvestmentCaseDialog";
import { InvestmentCaseCard } from "@/components/investment-portfolio/InvestmentCaseCard";
import { AddEditInvestmentAssetDialog } from "@/components/investment-portfolio/AddEditInvestmentAssetDialog";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  PieChart,
  Pie,
  Cell,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";
import {
  getInvestmentPortfolioAdvice,
  type InvestmentPortfolioAdviceInput,
  type InvestmentPortfolioAdviceOutput,
} from "@/ai/flows/investment-portfolio-advice-flow";
import { InvestmentGrowthCalculator } from "@/components/investment-portfolio/InvestmentGrowthCalculator";
import { AppLoader } from "@/components/ui/app-loader";
import type { InvestmentAsset } from "@/lib/types";
import { useTranslation } from "@/hooks/use-translation";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary)/0.7)",
  "hsl(var(--secondary))",
];

export default function InvestmentPortfolioPage() {
  const { t } = useTranslation("investment");
  const {
    investmentCases,
    deleteInvestmentCase,
    removeAssetFromCase,
    primaryDisplayCurrency,
    convertCurrency,
    getInvestmentAssetTypeDistribution,
    getInvestmentRegionDistribution,
  } = useBudgetStore(state => ({
    investmentCases: state.investmentCases,
    deleteInvestmentCase: state.deleteInvestmentCase,
    removeAssetFromCase: state.removeAssetFromCase,
    primaryDisplayCurrency: state.primaryDisplayCurrency,
    convertCurrency: state.convertCurrency,
    getInvestmentAssetTypeDistribution:
      state.getInvestmentAssetTypeDistribution,
    getInvestmentRegionDistribution: state.getInvestmentRegionDistribution,
  }));

  const [isClient, setIsClient] = useState(false);
  const [isAddCaseDialogOpen, setIsAddCaseDialogOpen] = useState(false);
  const [isAddAssetDialogOpen, setIsAddAssetDialogOpen] = useState(false);
  const [isEditAssetDialogOpen, setIsEditAssetDialogOpen] = useState(false);

  const [selectedCaseIdForAsset, setSelectedCaseIdForAsset] = useState<
    string | null
  >(null);
  const [assetToEdit, setAssetToEdit] = useState<InvestmentAsset | null>(null);
  const [caseIdForAssetToEdit, setCaseIdForAssetToEdit] = useState<
    string | null
  >(null);

  const [caseToDeleteId, setCaseToDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const [aiAdvice, setAiAdvice] = useState<string[] | null>(null);
  const [isLoadingAiAdvice, setIsLoadingAiAdvice] = useState(false);
  const [errorAiAdvice, setErrorAiAdvice] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const assetTypeDistribution = useMemo(() => {
    if (!isClient) return [];
    return getInvestmentAssetTypeDistribution();
  }, [isClient, getInvestmentAssetTypeDistribution]);

  const regionDistribution = useMemo(() => {
    if (!isClient) return [];
    return getInvestmentRegionDistribution();
  }, [isClient, getInvestmentRegionDistribution]);

  const profitLossData = useMemo(() => {
    if (!isClient) return [];
    const allAssets = investmentCases.flatMap(c => c.assets);
    return allAssets
      .map(asset => {
        const purchaseValue = asset.purchasePrice * asset.quantity;
        const currentValue = asset.currentPrice * asset.quantity;
        const profitLossInOriginalCurrency = currentValue - purchaseValue;
        return {
          name: asset.name,
          profitLoss: parseFloat(
            convertCurrency(
              profitLossInOriginalCurrency,
              asset.currency,
              primaryDisplayCurrency
            ).toFixed(2)
          ),
        };
      })
      .sort((a, b) => b.profitLoss - a.profitLoss);
  }, [isClient, investmentCases, primaryDisplayCurrency, convertCurrency]);

  const chartConfigType = useMemo(
    () =>
      assetTypeDistribution.reduce((acc, item) => {
        acc[item.name] = { label: item.name, color: item.fill };
        return acc;
      }, {} as React.ComponentProps<typeof ChartContainer>["config"]),
    [assetTypeDistribution]
  );

  const chartConfigRegion = useMemo(
    () =>
      regionDistribution.reduce((acc, item) => {
        acc[item.name] = { label: item.name, color: item.fill };
        return acc;
      }, {} as React.ComponentProps<typeof ChartContainer>["config"]),
    [regionDistribution]
  );

  const chartConfigProfitLoss = useMemo(
    () => ({
      profitLoss: {
        label: t("charts.profitLossLabel", {
          currency: primaryDisplayCurrency,
        }),
      },
    }),
    [primaryDisplayCurrency, t]
  );

  const handleOpenAddAssetDialog = (caseId: string) => {
    setSelectedCaseIdForAsset(caseId);
    setAssetToEdit(null);
    setIsAddAssetDialogOpen(true);
  };

  const handleOpenEditAssetDialog = (
    caseId: string,
    asset: InvestmentAsset
  ) => {
    setCaseIdForAssetToEdit(caseId);
    setAssetToEdit(asset);
    setIsEditAssetDialogOpen(true);
  };

  const closeAddAssetDialog = () => {
    setIsAddAssetDialogOpen(false);
    setSelectedCaseIdForAsset(null);
  };

  const closeEditAssetDialog = () => {
    setIsEditAssetDialogOpen(false);
    setAssetToEdit(null);
    setCaseIdForAssetToEdit(null);
  };

  const handleDeleteCase = (caseId: string) => {
    deleteInvestmentCase(caseId);
    toast({
      title: t("toasts.caseDeletedTitle"),
      description: t("toasts.caseDeletedDescription"),
    });
    setCaseToDeleteId(null);
  };

  const handleGetAiAdvice = async () => {
    setIsLoadingAiAdvice(true);
    setErrorAiAdvice(null);
    setAiAdvice(null);

    let summary = t("summary.startsWith", {
      defaultValue: "Portfolio consists of: ",
    });
    const typeSummary = assetTypeDistribution
      .map(
        d =>
          `${d.name} (${d.value.toFixed(0)} ${primaryDisplayCurrency}, ${(
            (d.value / assetTypeDistribution.reduce((s, v) => s + v.value, 1)) *
            100
          ).toFixed(0)}%)`
      )
      .join(", ");
    const regionSummary = regionDistribution
      .map(
        d =>
          `${d.name} (${(
            (d.value / regionDistribution.reduce((s, v) => s + v.value, 1)) *
            100
          ).toFixed(0)}%)`
      )
      .join(", ");

    const totalPortfolioValue = assetTypeDistribution.reduce(
      (sum, item) => sum + item.value,
      0
    );

    summary += `${t("summary.byTypes", { defaultValue: "by types" })} - ${
      typeSummary || t("summary.noData", { defaultValue: "no data" })
    }; `;
    summary += `${t("summary.byRegions", { defaultValue: "by regions" })} - ${
      regionSummary || t("summary.noData", { defaultValue: "no data" })
    }. `;
    summary += `${t("summary.totalValue", {
      defaultValue: "Total value",
    })}: ${formatCurrency(totalPortfolioValue, primaryDisplayCurrency)}.`;

    if (assetTypeDistribution.length === 0 && regionDistribution.length === 0) {
      summary = t("summary.empty", {
        defaultValue:
          "Investment portfolio is empty or has no data for analysis.",
      });
    }

    try {
      const input: InvestmentPortfolioAdviceInput = {
        assets: investmentCases.flatMap(case_ => case_.assets),
        riskTolerance: "medium",
        timeHorizon: 5,
        currency: "USD",
        portfolioSummary: summary,
      };
      const output: InvestmentPortfolioAdviceOutput =
        await getInvestmentPortfolioAdvice(input);
      setAiAdvice(output.advice);
    } catch {
      toast({
        title: t("ai.errorTitle"),
        description: t("ai.errorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsLoadingAiAdvice(false);
    }
  };

  if (!isClient) {
    return <AppLoader text={t("loading")} />;
  }

  return (
    <>
      <div className="container-fluid space-responsive animate-fade-in">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
            {t("title")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground hidden sm:block">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div className="hidden sm:block">
              <h3 className="text-sm font-semibold text-foreground">
                {t("overview.title")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t("overview.description")}
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsAddCaseDialogOpen(true)}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            <PlusCircle className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">{t("buttons.addCase")}</span>
            <span className="xs:hidden">{t("buttons.addCaseShort")}</span>
          </Button>
        </div>

        {/* Analysis Charts Section */}
        {investmentCases.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <PieChartIcon className="mr-2 h-5 w-5 text-primary" />
                  {t("charts.assetTypeDistribution")}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {t("charts.assetTypeDistributionDesc", {
                    currency: primaryDisplayCurrency,
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assetTypeDistribution.length > 0 ? (
                  <ChartContainer
                    config={chartConfigType}
                    className="mx-auto aspect-square max-h-[220px] sm:max-h-[250px]"
                  >
                    <PieChart>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            hideLabel
                            nameKey="name"
                            formatter={value =>
                              `${formatCurrency(
                                value as number,
                                primaryDisplayCurrency
                              )}`
                            }
                          />
                        }
                      />
                      <Pie
                        data={assetTypeDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        labelLine={false}
                      >
                        {assetTypeDistribution.map((_, index) => (
                          <Cell
                            key={`cell-type-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <ChartLegend
                        content={
                          <ChartLegendContent
                            nameKey="name"
                            className="text-xs flex-wrap gap-1 sm:gap-2"
                          />
                        }
                      />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-10">
                    {t("charts.noData")}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <MapPin className="mr-2 h-5 w-5 text-primary" />
                  {t("charts.regionDistribution")}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {t("charts.regionDistributionDesc", {
                    currency: primaryDisplayCurrency,
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {regionDistribution.length > 0 ? (
                  <ChartContainer
                    config={chartConfigRegion}
                    className="mx-auto aspect-square max-h-[220px] sm:max-h-[250px]"
                  >
                    <PieChart>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            hideLabel
                            nameKey="name"
                            formatter={value =>
                              `${formatCurrency(
                                value as number,
                                primaryDisplayCurrency
                              )}`
                            }
                          />
                        }
                      />
                      <Pie
                        data={regionDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        labelLine={false}
                      >
                        {regionDistribution.map((_, index) => (
                          <Cell
                            key={`cell-region-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <ChartLegend
                        content={
                          <ChartLegendContent
                            nameKey="name"
                            className="text-xs flex-wrap gap-1 sm:gap-2"
                          />
                        }
                      />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-10">
                    {t("charts.noRegionsData")}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <BarChartIcon className="mr-2 h-5 w-5 text-primary" />
                  {t("charts.profitLossByAssets")}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {t("charts.profitLossByAssetsDesc", {
                    currency: primaryDisplayCurrency,
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profitLossData.length > 0 ? (
                  <ChartContainer
                    config={chartConfigProfitLoss}
                    className="h-[220px] sm:h-[250px] w-full"
                  >
                    <BarChart
                      layout="vertical"
                      data={profitLossData}
                      margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                      <XAxis
                        type="number"
                        tickFormatter={value =>
                          formatCurrency(
                            value as number,
                            primaryDisplayCurrency,
                            true
                          )
                        }
                        fontSize={10}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={60}
                        tick={{ fontSize: 9 }}
                      />
                      <ChartTooltip
                        cursor={{ fill: "hsl(var(--muted)/0.5)" }}
                        content={
                          <ChartTooltipContent
                            formatter={value =>
                              `${formatCurrency(
                                value as number,
                                primaryDisplayCurrency
                              )}`
                            }
                          />
                        }
                      />
                      <Bar dataKey="profitLoss" radius={[4, 4, 0, 0]}>
                        {profitLossData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.profitLoss >= 0
                                ? "hsl(var(--chart-2))"
                                : "hsl(var(--destructive))"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-10">
                    {t("charts.noData")}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* AI Advice Section */}
        {investmentCases.length > 0 && (
          <Card className="shadow-lg mt-6">
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl font-bold">
                <Sparkles className="mr-2 h-5 w-5 text-primary" />
                {t("ai.title")}
              </CardTitle>
              <CardDescription>{t("ai.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleGetAiAdvice} disabled={isLoadingAiAdvice}>
                {isLoadingAiAdvice ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {t("buttons.getAiAdvice")}
              </Button>
              {errorAiAdvice && (
                <p className="text-destructive mt-3 text-sm">{errorAiAdvice}</p>
              )}
              {aiAdvice && !isLoadingAiAdvice && (
                <div className="mt-4 p-4 bg-secondary/30 rounded-md border border-secondary">
                  <h3 className="font-semibold mb-2 text-foreground">
                    {t("ai.recommendationTitle")}
                  </h3>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {aiAdvice}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Investment Growth Calculator */}
        <InvestmentGrowthCalculator />

        {/* Investment Cases Section */}
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground pt-4">
          {t("cases.title")}
        </h2>
        {investmentCases.length === 0 && isClient ? (
          <Card className="text-center py-12 border-dashed border-muted-foreground/30 mt-2 bg-card/50">
            <CardHeader>
              <BarChartHorizontalBig className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <CardTitle className="text-2xl">
                {t("cases.emptyTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-lg text-muted-foreground mb-6">
                {t("cases.emptyDescription")}
              </CardDescription>
              <Button onClick={() => setIsAddCaseDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {t("buttons.addCase")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-2">
            {investmentCases.map(invCase => (
              <InvestmentCaseCard
                key={invCase.id}
                investmentCase={invCase}
                onDelete={() => setCaseToDeleteId(invCase.id)}
                onAddAsset={() => handleOpenAddAssetDialog(invCase.id)}
                onEditAsset={asset =>
                  handleOpenEditAssetDialog(invCase.id, asset)
                }
                onRemoveAsset={assetId =>
                  removeAssetFromCase(invCase.id, assetId)
                }
                primaryDisplayCurrency={primaryDisplayCurrency}
                convertCurrency={convertCurrency}
              />
            ))}
          </div>
        )}
      </div>

      <AddInvestmentCaseDialog
        isOpen={isAddCaseDialogOpen}
        onClose={() => setIsAddCaseDialogOpen(false)}
      />

      {selectedCaseIdForAsset && (
        <AddEditInvestmentAssetDialog
          isOpen={isAddAssetDialogOpen}
          onClose={closeAddAssetDialog}
          caseId={selectedCaseIdForAsset}
          assetToEdit={null}
        />
      )}

      {assetToEdit && caseIdForAssetToEdit && (
        <AddEditInvestmentAssetDialog
          isOpen={isEditAssetDialogOpen}
          onClose={closeEditAssetDialog}
          caseId={caseIdForAssetToEdit}
          assetToEdit={assetToEdit}
        />
      )}

      <AlertDialog
        open={!!caseToDeleteId}
        onOpenChange={open => !open && setCaseToDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCaseToDeleteId(null)}>
              {t("deleteDialog.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => caseToDeleteId && handleDeleteCase(caseToDeleteId)}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {t("deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
