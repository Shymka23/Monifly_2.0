"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Sparkles,
  Bitcoin as BitcoinIcon,
  DollarSign,
  BarChart3,
  Zap,
  LineChart as LineChartIcon,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ShoppingCart,
  Send,
  AlertTriangle,
  Coins,
  Banknote,
} from "lucide-react";
import {
  useBudgetStore,
  type FilterPeriodType,
  FILTER_PERIOD_LABELS,
} from "@/hooks/use-budget-store";
import { formatCurrency, cn } from "@/lib/utils";
import type { CryptoHolding } from "@/lib/types";
import {
  getCryptoInsights,
  type CryptoPortfolioInsightsInput,
  type CryptoPortfolioInsightsOutput,
} from "@/ai/flows/crypto-portfolio-insights";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegendContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BuyCryptoDialog } from "@/components/crypto/BuyCryptoDialog";
import { SellCryptoDialog } from "@/components/crypto/SellCryptoDialog";
import { format as formatDate, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { AppLoader } from "@/components/ui/app-loader";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTranslation } from "@/hooks/use-translation";

// Chart config will be created inside the component to support translations

export default function CryptoPortfolioPage() {
  const { t } = useTranslation("crypto");
  const {
    cryptoHoldings,
    getTotalCryptoValue,
    primaryDisplayCurrency,
    convertCurrency,
    MOCK_RATES,
    wallets,
    getPeriodCryptoPurchases,
    getPeriodCryptoSales,
    getPeriodCryptoFlowSummary,
    filterPeriod,
    setFilterPeriod,
  } = useBudgetStore(state => ({
    cryptoHoldings: state.cryptoHoldings,
    getTotalCryptoValue: state.getTotalCryptoValue,
    primaryDisplayCurrency: state.primaryDisplayCurrency,
    convertCurrency: state.convertCurrency,
    MOCK_RATES: state.MOCK_RATES,
    wallets: state.wallets,
    getPeriodCryptoPurchases: state.getPeriodCryptoPurchases,
    getPeriodCryptoSales: state.getPeriodCryptoSales,
    getPeriodCryptoFlowSummary: state.getPeriodCryptoFlowSummary,
    filterPeriod: state.filterPeriod,
    setFilterPeriod: state.setFilterPeriod,
  }));

  const [isClient, setIsClient] = useState(false);
  const [marketSentiment, setMarketSentiment] = useState("");
  const [aiInsights, setAiInsights] = useState<string[] | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [errorInsights, setErrorInsights] = useState<string | null>(null);
  const { toast } = useToast();

  const [isBuyCryptoDialogOpen, setIsBuyCryptoDialogOpen] = useState(false);
  const [isSellCryptoDialogOpen, setIsSellCryptoDialogOpen] = useState(false);
  const [selectedHoldingToSell, setSelectedHoldingToSell] =
    useState<CryptoHolding | null>(null);

  const cryptoFlowChartConfig = useMemo(
    () => ({
      sells: {
        label: t("charts.sold"),
        color: "hsl(var(--chart-2))",
      },
      buys: {
        label: t("charts.bought"),
        color: "hsl(var(--destructive))",
      },
    }),
    [t]
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  const totalPortfolioValue = useMemo(() => {
    if (!isClient) return 0;
    return getTotalCryptoValue();
  }, [isClient, getTotalCryptoValue]);

  const totalPurchasesValue = useMemo(() => {
    if (!isClient) return 0;
    return getPeriodCryptoPurchases();
  }, [isClient, getPeriodCryptoPurchases]);

  const totalSalesValue = useMemo(() => {
    if (!isClient) return 0;
    return getPeriodCryptoSales();
  }, [isClient, getPeriodCryptoSales]);

  const cryptoFlowChartData = useMemo(() => {
    if (!isClient) return [];
    return getPeriodCryptoFlowSummary();
  }, [isClient, getPeriodCryptoFlowSummary]);

  const selectedPeriodLabel = FILTER_PERIOD_LABELS[filterPeriod].toLowerCase();

  const portfolioDescriptionForAI = useMemo(() => {
    if (!isClient || cryptoHoldings.length === 0) return t("empty.portfolio");
    const descriptions = cryptoHoldings.map(h => {
      const currentPriceUSD = MOCK_RATES[`${h.asset.toUpperCase()}_USD`] || 0;
      const currentValueUSD = h.amount * currentPriceUSD;

      const purchaseValueOriginalCurrency = h.amount * h.purchasePrice;
      const purchaseValueUSD = convertCurrency(
        purchaseValueOriginalCurrency,
        h.purchaseCurrency,
        "USD"
      );

      const profitLossUSD = currentValueUSD - purchaseValueUSD;
      const profitLossPercent =
        purchaseValueUSD !== 0 ? (profitLossUSD / purchaseValueUSD) * 100 : 0;

      const currentValueInPrimary = convertCurrency(
        currentValueUSD,
        "USD",
        primaryDisplayCurrency
      );

      return `${h.amount} ${h.asset} (${t("summary.currentValue", {
        ns: "crypto",
        defaultValue: "current value",
      })} ${formatCurrency(
        currentValueInPrimary,
        primaryDisplayCurrency
      )}, P/L: ${profitLossPercent.toFixed(1)}% ${t("summary.inUSD", {
        ns: "crypto",
        defaultValue: "in USD",
      })})`;
    });
    return t("summary.currentPortfolio", {
      portfolio: descriptions.join(", "),
      totalValue: formatCurrency(totalPortfolioValue, primaryDisplayCurrency),
    });
  }, [
    isClient,
    cryptoHoldings,
    totalPortfolioValue,
    primaryDisplayCurrency,
    MOCK_RATES,
    convertCurrency,
  ]);

  const handleGetInsights = async () => {
    if (!marketSentiment.trim()) {
      toast({
        title: t("toasts.noInfoTitle"),
        description: t("toasts.noInfoDescription"),
        variant: "destructive",
      });
      return;
    }

    setIsLoadingInsights(true);
    setErrorInsights(null);
    setAiInsights(null);

    try {
      const input: CryptoPortfolioInsightsInput = {
        holdings: cryptoHoldings,
        timeRange: "1Y",
        currency: "USD",
        portfolioDescription: portfolioDescriptionForAI,
        marketSentiment,
      };
      const output: CryptoPortfolioInsightsOutput = await getCryptoInsights(
        input
      );
      setAiInsights(output.insights);
    } catch {
      toast({
        title: t("toasts.errorTitle"),
        description: t("toasts.dataError"),
        variant: "destructive",
      });
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const handleOpenSellDialog = (holding: CryptoHolding) => {
    setSelectedHoldingToSell(holding);
    setIsSellCryptoDialogOpen(true);
  };

  if (!isClient) {
    return <AppLoader text={t("loading", { ns: "common" })} />;
  }

  const fiatWallets = wallets.filter(
    w =>
      !["BTC", "ETH", "SOL", "ADA", "USDT", "USDC"].includes(
        w.currency.toUpperCase()
      )
  );

  return (
    <TooltipProvider>
      <div className="w-full px-0 sm:container sm:mx-auto sm:px-4 space-y-4 py-4 md:py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center justify-center md:justify-start">
              <BitcoinIcon className="mr-2 sm:mr-3 h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              {t("title")}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>
          <div className="w-full md:w-auto flex flex-col md:flex-row gap-2 items-center">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Label htmlFor="period-filter" className="text-sm shrink-0">
                {t("period")}
              </Label>
              <Select
                value={filterPeriod}
                onValueChange={value =>
                  setFilterPeriod(value as FilterPeriodType)
                }
              >
                <SelectTrigger
                  id="period-filter"
                  className="w-full md:w-[180px] h-9"
                >
                  <SelectValue placeholder={t("selectPeriodPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.keys(FILTER_PERIOD_LABELS) as FilterPeriodType[]
                  ).map(periodKey => (
                    <SelectItem
                      key={periodKey}
                      value={periodKey}
                      className="text-sm"
                    >
                      {FILTER_PERIOD_LABELS[periodKey]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => setIsBuyCryptoDialogOpen(true)}
              variant="outline"
              size="sm"
              className="h-9 w-full md:w-auto"
            >
              <ShoppingCart className="mr-2 h-4 w-4" /> {t("buttons.buy")}
            </Button>
          </div>
        </div>

        <div className="grid-responsive gap-4">
          <Card className="shadow-modern border-l-4 border-primary hover-lift">
            <CardHeader>
              <CardTitle className="text-sm sm:text-lg flex items-center">
                <DollarSign className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <span className="hidden sm:inline">{t("cards.balance")}</span>
                <span className="sm:hidden">{t("cards.balanceShort")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                {formatCurrency(totalPortfolioValue, primaryDisplayCurrency)}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t("cards.balanceDescription")}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-modern border-l-4 border-green-500 hover-lift">
            <CardHeader>
              <CardTitle className="text-sm sm:text-lg flex items-center">
                <Coins className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                <span className="hidden sm:inline">
                  {t("cards.bought", { period: selectedPeriodLabel })}
                </span>
                <span className="sm:hidden">{t("cards.boughtShort")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                {formatCurrency(totalPurchasesValue, primaryDisplayCurrency)}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t("cards.boughtDescription")}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-modern border-l-4 border-blue-500 hover-lift">
            <CardHeader>
              <CardTitle className="text-sm sm:text-lg flex items-center">
                <Banknote className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                <span className="hidden sm:inline">
                  {t("cards.sold", { period: selectedPeriodLabel })}
                </span>
                <span className="sm:hidden">{t("cards.soldShort")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                {formatCurrency(totalSalesValue, primaryDisplayCurrency)}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t("cards.soldDescription")}
              </p>
            </CardContent>
          </Card>
        </div>

        {cryptoFlowChartData.length > 0 && (
          <Card className="w-full px-0 sm:px-4 shadow-lg">
            <CardHeader className="px-0 sm:px-4">
              <CardTitle className="flex items-center text-lg md:text-2xl font-bold">
                <LineChartIcon className="mr-2 h-5 w-5 md:h-6 md:w-6 text-primary" />
                {t("charts.fundsFlow", { period: selectedPeriodLabel })}
              </CardTitle>
              <CardDescription className="text-sm">
                {t("charts.fundsFlowDescription", {
                  currency: primaryDisplayCurrency,
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] sm:h-[300px] w-full pt-4">
              <ChartContainer
                config={cryptoFlowChartConfig}
                className="w-full h-full"
              >
                <LineChart
                  data={cryptoFlowChartData}
                  margin={{ left: 10, right: 20, top: 5, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="dateLabel"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={10}
                    interval={
                      cryptoFlowChartData.length > 15
                        ? Math.floor(cryptoFlowChartData.length / 7)
                        : cryptoFlowChartData.length > 7
                        ? 1
                        : 0
                    }
                  />
                  <YAxis
                    tickFormatter={value =>
                      formatCurrency(value, primaryDisplayCurrency, true)
                    }
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={10}
                    width={55}
                  />
                  <ChartTooltip
                    cursor={true}
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => (
                          <div>
                            <span
                              style={{
                                color:
                                  cryptoFlowChartConfig[
                                    name as keyof typeof cryptoFlowChartConfig
                                  ]?.color,
                              }}
                            >
                              {
                                cryptoFlowChartConfig[
                                  name as keyof typeof cryptoFlowChartConfig
                                ]?.label
                              }
                              :
                            </span>
                            <span className="ml-1 font-semibold">
                              {formatCurrency(
                                value as number,
                                primaryDisplayCurrency
                              )}
                            </span>
                          </div>
                        )}
                        labelFormatter={(label, payload) => {
                          if (
                            payload &&
                            payload.length > 0 &&
                            payload[0].payload.date
                          ) {
                            return formatDate(
                              parseISO(payload[0].payload.date),
                              filterPeriod === "currentYear" ||
                                filterPeriod === "lastYear"
                                ? "LLLL yyyy"
                                : "PPP",
                              { locale: ru }
                            );
                          }
                          return label;
                        }}
                      />
                    }
                  />
                  <Legend content={<ChartLegendContent />} />
                  <Line
                    dataKey="sells"
                    name={t("charts.sold")}
                    type="monotone"
                    stroke="var(--color-sells)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    dataKey="buys"
                    name={t("charts.bought")}
                    type="monotone"
                    stroke="var(--color-buys)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        <Card className="w-full px-0 sm:px-4">
          <CardHeader className="px-0 sm:px-4">
            <CardTitle className="text-lg md:text-2xl flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 md:h-6 md:w-6 text-primary" />
              {t("assets.title")}
            </CardTitle>
            <CardDescription className="text-sm">
              {t("assets.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-4">
            {cryptoHoldings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {cryptoHoldings.map(holding => {
                  const currentPriceUSD =
                    MOCK_RATES[`${holding.asset.toUpperCase()}_USD`] || 0;
                  const currentValueUSD = holding.amount * currentPriceUSD;

                  const purchaseValueInOriginalCurrency =
                    holding.amount * holding.purchasePrice;
                  const purchaseValueUSD = convertCurrency(
                    purchaseValueInOriginalCurrency,
                    holding.purchaseCurrency,
                    "USD"
                  );

                  const profitLossUSD = currentValueUSD - purchaseValueUSD;
                  const profitLossPercent =
                    purchaseValueUSD !== 0
                      ? (profitLossUSD / purchaseValueUSD) * 100
                      : 0;

                  const currentValueInPrimary = convertCurrency(
                    currentValueUSD,
                    "USD",
                    primaryDisplayCurrency
                  );
                  const purchaseValueInPrimary = convertCurrency(
                    purchaseValueUSD,
                    "USD",
                    primaryDisplayCurrency
                  );
                  const profitLossInPrimary =
                    currentValueInPrimary - purchaseValueInPrimary;

                  return (
                    <Card
                      key={holding.id}
                      className="shadow-md hover:shadow-lg transition-shadow flex flex-col"
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base md:text-xl flex items-center">
                          {holding.asset.toUpperCase() === "BTC" && (
                            <BitcoinIcon className="mr-2 h-5 w-5 text-orange-400" />
                          )}
                          {holding.asset.toUpperCase() === "ETH" && (
                            <Zap className="mr-2 h-5 w-5 text-blue-400" />
                          )}
                          {holding.asset.toUpperCase() !== "BTC" &&
                            holding.asset.toUpperCase() !== "ETH" && (
                              <BarChart3 className="mr-2 h-5 w-5 text-gray-400" />
                            )}
                          {holding.name} ({holding.asset})
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {t("asset.quantity")}:{" "}
                          {holding.amount.toLocaleString(undefined, {
                            maximumFractionDigits: 8,
                          })}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm flex-grow">
                        <p>
                          {t("asset.avgPurchasePrice")}:{" "}
                          <span className="font-medium">
                            {formatCurrency(
                              holding.purchasePrice,
                              holding.purchaseCurrency
                            )}
                          </span>{" "}
                          {t("asset.perUnit", { defaultValue: "/unit" })}
                        </p>
                        <p>
                          {t("asset.purchaseValue")}:{" "}
                          <span className="font-medium">
                            {formatCurrency(
                              purchaseValueInPrimary,
                              primaryDisplayCurrency
                            )}
                          </span>
                        </p>
                        <p>
                          {t("asset.currentValue")}:{" "}
                          <span className="font-medium">
                            {formatCurrency(
                              currentValueInPrimary,
                              primaryDisplayCurrency
                            )}
                          </span>
                        </p>
                        <div
                          className={cn(
                            "font-semibold",
                            profitLossInPrimary >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          )}
                        >
                          {profitLossInPrimary >= 0 ? (
                            <TrendingUp className="inline h-4 w-4 mr-1" />
                          ) : (
                            <TrendingDown className="inline h-4 w-4 mr-1" />
                          )}
                          {formatCurrency(
                            profitLossInPrimary,
                            primaryDisplayCurrency
                          )}{" "}
                          ({profitLossPercent.toFixed(1)}%{" "}
                          {t("asset.fromUSDPurchase")})
                        </div>
                      </CardContent>
                      <CardFooter className="pt-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenSellDialog(holding)}
                          className="w-full"
                          disabled={holding.amount <= 0}
                        >
                          <Send className="mr-2 h-4 w-4" /> {t("buttons.sell")}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <BitcoinIcon className="h-12 w-12 mx-auto mb-3 opacity-60" />
                <p className="text-lg font-semibold">{t("empty.notAdded")}</p>
                <p className="text-sm">{t("empty.clickBuy")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full px-0 sm:px-4 shadow-lg">
          <CardHeader className="px-0 sm:px-4">
            <CardTitle className="flex items-center text-lg md:text-2xl font-bold">
              <Sparkles className="mr-2 h-5 w-5 md:h-6 md:w-6 text-primary" />
              {t("ai.title")}
            </CardTitle>
            <CardDescription className="text-sm">
              {t("ai.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label
                htmlFor="portfolio-summary"
                className="text-sm font-medium"
              >
                {t("ai.portfolioSummaryLabel")}
              </Label>
              <Textarea
                id="portfolio-summary"
                value={portfolioDescriptionForAI}
                readOnly
                rows={3}
                className="text-sm bg-muted/50 cursor-not-allowed"
              />
            </div>
            <div>
              <Label htmlFor="market-sentiment" className="text-sm font-medium">
                {t("ai.marketSentimentLabel")}
              </Label>
              <Textarea
                id="market-sentiment"
                value={marketSentiment}
                onChange={e => setMarketSentiment(e.target.value)}
                placeholder={t("ai.marketSentimentPlaceholder")}
                rows={3}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {t("ai.marketSentimentDescription")}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-4">
            <Button
              onClick={handleGetInsights}
              disabled={isLoadingInsights || !marketSentiment.trim()}
              size="lg"
              className="text-sm md:text-base"
            >
              {isLoadingInsights ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("buttons.generating")}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t("buttons.getInsights")}
                </>
              )}
            </Button>

            {errorInsights && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t("toasts.errorTitle")}</AlertTitle>
                <AlertDescription>{errorInsights}</AlertDescription>
              </Alert>
            )}

            {aiInsights && !isLoadingInsights && (
              <Card className="mt-4 sm:mt-6 bg-secondary/50">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">
                    {t("ai.aiObservationsTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                    {aiInsights.map((insight, index) => (
                      <p key={index}>{insight}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardFooter>
        </Card>
      </div>
      {fiatWallets.length > 0 ? (
        <BuyCryptoDialog
          isOpen={isBuyCryptoDialogOpen}
          onClose={() => setIsBuyCryptoDialogOpen(false)}
          fiatWallets={fiatWallets}
        />
      ) : (
        isBuyCryptoDialogOpen && (
          <Alert
            variant="destructive"
            className="fixed bottom-5 right-5 w-auto max-w-sm z-50"
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t("alerts.noFiatWalletsTitle")}</AlertTitle>
            <AlertDescription>
              {t("alerts.noFiatWalletsDescriptionBuy")}
              <Button
                variant="link"
                className="p-0 h-auto ml-1 text-destructive-foreground"
                onClick={() => setIsBuyCryptoDialogOpen(false)}
              >
                {t("buttons.close", { ns: "common" })}
              </Button>
            </AlertDescription>
          </Alert>
        )
      )}
      {selectedHoldingToSell && fiatWallets.length > 0 && (
        <SellCryptoDialog
          isOpen={isSellCryptoDialogOpen}
          onClose={() => {
            setIsSellCryptoDialogOpen(false);
            setSelectedHoldingToSell(null);
          }}
          holdingToSell={selectedHoldingToSell}
          fiatWallets={fiatWallets}
        />
      )}
      {isSellCryptoDialogOpen && fiatWallets.length === 0 && (
        <Alert
          variant="destructive"
          className="fixed bottom-5 right-5 w-auto max-w-sm z-50"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t("alerts.noFiatWalletsTitle")}</AlertTitle>
          <AlertDescription>
            {t("alerts.noFiatWalletsDescriptionSell")}
            <Button
              variant="link"
              className="p-0 h-auto ml-1 text-destructive-foreground"
              onClick={() => setIsSellCryptoDialogOpen(false)}
            >
              {t("buttons.close", { ns: "common" })}
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </TooltipProvider>
  );
}
