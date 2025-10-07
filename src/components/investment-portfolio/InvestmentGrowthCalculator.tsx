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
import { Label } from "@/components/ui/label";
import {
  DollarSign,
  BarChart3,
  Zap,
  LineChart as LineChartIcon,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Send,
  Coins,
  Banknote,
  Globe,
} from "lucide-react";
import {
  useBudgetStore,
  type FilterPeriodType,
  FILTER_PERIOD_LABELS,
} from "@/hooks/use-budget-store";
import { formatCurrency, cn } from "@/lib/utils";
import { getCurrentLanguage } from "@/lib/i18n-new";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegendContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { format as formatDate, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { BitcoinIcon } from "lucide-react";
import { AppLoader } from "@/components/ui/app-loader";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line as RechartsLine,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  CartesianGrid as RechartsCartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";

const cryptoFlowChartConfig = {
  sells: {
    label: "Продажи",
    color: "hsl(var(--chart-2))",
  },
  buys: {
    label: "Покупки",
    color: "hsl(var(--destructive))",
  },
} satisfies React.ComponentProps<typeof ChartContainer>["config"];

function InvestmentGrowthCalculator() {
  const {
    cryptoHoldings,
    getTotalCryptoValue,
    primaryDisplayCurrency,
    setPrimaryDisplayCurrency,
    convertCurrency,
    MOCK_RATES,
    getPeriodCryptoPurchases,
    getPeriodCryptoSales,
    getPeriodCryptoFlowSummary,
    filterPeriod,
    setFilterPeriod,
  } = useBudgetStore(state => ({
    cryptoHoldings: state.cryptoHoldings,
    getTotalCryptoValue: state.getTotalCryptoValue,
    primaryDisplayCurrency: state.primaryDisplayCurrency,
    setPrimaryDisplayCurrency: state.setPrimaryDisplayCurrency,
    convertCurrency: state.convertCurrency,
    MOCK_RATES: state.MOCK_RATES,
    getPeriodCryptoPurchases: state.getPeriodCryptoPurchases,
    getPeriodCryptoSales: state.getPeriodCryptoSales,
    getPeriodCryptoFlowSummary: state.getPeriodCryptoFlowSummary,
    filterPeriod: state.filterPeriod,
    setFilterPeriod: state.setFilterPeriod,
  }));

  const [isClient, setIsClient] = useState(false);

  // Локалізація
  const t = {
    ru: {
      title: "Калькулятор роста инвестиций",
      desc: "Спрогнозируйте будущую стоимость ваших вложений, указав параметры и выбрав тип процента.",
      initial: "Начальный капитал",
      monthly: "Ежемесячный взнос",
      rate: "Годовая ставка, %",
      years: "Срок инвестирования (лет):",
      percentType: "Тип процента",
      compound: "Сложный",
      simple: "Простой",
      calc: "Рассчитать",
      result: "Прогнозируемая стоимость через",
      invested: "Всего инвестировано",
      total: "Общая стоимость",
      year: "Год",
      tooltipInvested: "Всего инвестировано",
      tooltipTotal: "Общая стоимость",
    },
    en: {
      title: "Investment Growth Calculator",
      desc: "Forecast the future value of your investments by specifying parameters and interest type.",
      initial: "Initial capital",
      monthly: "Monthly contribution",
      rate: "Annual rate, %",
      years: "Investment period (years):",
      percentType: "Interest type",
      compound: "Compound",
      simple: "Simple",
      calc: "Calculate",
      result: "Projected value after",
      invested: "Total invested",
      total: "Total value",
      year: "Year",
      tooltipInvested: "Total invested",
      tooltipTotal: "Total value",
    },
  }[getCurrentLanguage() === "en" ? "en" : "ru"];

  // --- Калькулятор росту інвестицій ---
  const [initialAmount, setInitialAmount] = useState(100000);
  const [monthlyContribution, setMonthlyContribution] = useState(10000);
  const [annualRate, setAnnualRate] = useState(10); // %
  const [years, setYears] = useState(9);
  const [percentType, setPercentType] = useState("compound");
  const [futureValue, setFutureValue] = useState<number | null>(null);
  const [growthData, setGrowthData] = useState<
    { year: number; invested: number; value: number }[]
  >([]);

  const handleCalculateGrowth = () => {
    let fv = initialAmount;
    let invested = initialAmount;
    const data: { year: number; invested: number; value: number }[] = [];
    for (let y = 1; y <= years; y++) {
      const yearInvested = invested + monthlyContribution * 12;
      let yearValue = 0;
      if (percentType === "compound") {
        // Сложный процент
        yearValue = fv * Math.pow(1 + annualRate / 100, 1);
        for (let m = 1; m <= 12; m++) {
          yearValue +=
            monthlyContribution *
            Math.pow(1 + annualRate / 100 / 12, 12 - m + 1);
        }
      } else {
        // Простой процент
        yearValue =
          fv +
          monthlyContribution * 12 +
          (fv + monthlyContribution * 12) * (annualRate / 100);
      }
      data.push({ year: y, invested: yearInvested, value: yearValue });
      fv = yearValue;
      invested = yearInvested;
    }
    setFutureValue(data[data.length - 1]?.value || null);
    setGrowthData(data);
  };

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

  if (!isClient) {
    return <AppLoader text="Загрузка криптопортфеля..." />;
  }

  // Доступні валюти для вибору
  const AVAILABLE_CURRENCIES = [
    "RUB",
    "USD",
    "EUR",
    "UAH",
    "GBP",
    "JPY",
    "CAD",
    "AUD",
    "CHF",
    "CNY",
    "INR",
    "PLN",
    "TRY",
    "KZT",
    "BYN",
  ];

  return (
    <TooltipProvider>
      <div className="container mx-auto space-y-8 p-4 md:p-6">
        {/* Калькулятор росту інвестицій */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg md:text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" /> {t.title}
            </CardTitle>
            <CardDescription className="text-sm">{t.desc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6 items-stretch">
              <div className="flex-1 space-y-4">
                <div>
                  <Label htmlFor="initialAmount">
                    {t.initial} ({primaryDisplayCurrency})
                  </Label>
                  <input
                    id="initialAmount"
                    type="number"
                    className="border rounded px-3 py-2 w-full bg-background text-foreground text-lg mb-2"
                    value={initialAmount}
                    min={0}
                    onChange={e => setInitialAmount(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="monthlyContribution">
                    {t.monthly} ({primaryDisplayCurrency})
                  </Label>
                  <input
                    id="monthlyContribution"
                    type="number"
                    className="border rounded px-3 py-2 w-full bg-background text-foreground text-lg mb-2"
                    value={monthlyContribution}
                    min={0}
                    onChange={e =>
                      setMonthlyContribution(Number(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="annualRate">{t.rate}</Label>
                  <input
                    id="annualRate"
                    type="number"
                    className="border rounded px-3 py-2 w-full bg-background text-foreground text-lg mb-2"
                    value={annualRate}
                    min={0}
                    step={0.1}
                    onChange={e => setAnnualRate(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="years">
                    {t.years}{" "}
                    <span className="font-bold text-primary">{years}</span>
                  </Label>
                  <Slider
                    id="years"
                    min={1}
                    max={40}
                    step={1}
                    value={[years]}
                    onValueChange={([v]) => setYears(v)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>{t.percentType}</Label>
                  <RadioGroup
                    value={percentType}
                    onValueChange={setPercentType}
                    className="flex flex-row gap-6 mt-2"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="compound" id="compound" />
                      <Label htmlFor="compound">{t.compound}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="simple" id="simple" />
                      <Label htmlFor="simple">{t.simple}</Label>
                    </div>
                  </RadioGroup>
                </div>
                <Button
                  onClick={handleCalculateGrowth}
                  className="w-full md:w-auto mt-4 text-base font-semibold py-2 px-6"
                >
                  {t.calc}
                </Button>
              </div>
              <div className="flex-1 flex flex-col justify-center items-center">
                {futureValue !== null && (
                  <div className="w-full bg-secondary/60 rounded-lg p-4 mb-4 text-center">
                    <div className="text-muted-foreground text-sm mb-1">
                      {t.result}{" "}
                      <span className="font-bold text-primary">{years}</span>{" "}
                      {t.year}
                      {years > 1
                        ? getCurrentLanguage() === "en"
                          ? "s"
                          : ""
                        : ""}
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-cyan-400 tracking-tight">
                      {formatCurrency(futureValue, primaryDisplayCurrency)}
                    </div>
                  </div>
                )}
                {growthData.length > 0 && (
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart
                        data={growthData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <RechartsCartesianGrid strokeDasharray="3 3" />
                        <RechartsXAxis
                          dataKey="year"
                          tick={{ fontSize: 12 }}
                          label={{
                            value: t.year,
                            position: "insideBottomRight",
                            offset: 0,
                            fontSize: 14,
                          }}
                        />
                        <RechartsYAxis
                          tickFormatter={v =>
                            formatCurrency(v, primaryDisplayCurrency, true)
                          }
                          tick={{ fontSize: 12 }}
                        />
                        <RechartsTooltip
                          formatter={(v: number, name: string) => [
                            formatCurrency(v, primaryDisplayCurrency),
                            name === "invested"
                              ? t.tooltipInvested
                              : t.tooltipTotal,
                          ]}
                          labelFormatter={l => `${t.year} ${l}`}
                        />
                        <RechartsLine
                          type="monotone"
                          dataKey="invested"
                          stroke="#22d3ee"
                          strokeWidth={2}
                          dot={true}
                          name={t.invested}
                        />
                        <RechartsLine
                          type="monotone"
                          dataKey="value"
                          stroke="#10b981"
                          strokeWidth={3}
                          dot={true}
                          name={t.total}
                        />
                        <Legend verticalAlign="top" height={36} />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Додано перемикач валюти */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <Label htmlFor="currency-switcher" className="text-sm font-medium">
              Валюта відображення:
            </Label>
            <Select
              value={primaryDisplayCurrency}
              onValueChange={setPrimaryDisplayCurrency}
            >
              <SelectTrigger
                id="currency-switcher"
                className="w-[110px] h-8 ml-2"
              >
                <SelectValue placeholder="Валюта" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_CURRENCIES.map(currency => (
                  <SelectItem
                    key={currency}
                    value={currency}
                    className="text-sm"
                  >
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center justify-center md:justify-start">
              <BitcoinIcon className="mr-2 sm:mr-3 h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              Крипто
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              Обзор и анализ ваших криптовалютных активов.
            </p>
          </div>
          <div className="w-full md:w-auto flex flex-col md:flex-row gap-2 items-center">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Label htmlFor="period-filter" className="text-sm shrink-0">
                Период:
              </Label>
              <Select
                value={filterPeriod}
                onValueChange={(value: string) =>
                  setFilterPeriod(value as FilterPeriodType)
                }
              >
                <SelectTrigger
                  id="period-filter"
                  className="w-full md:w-[180px] h-9"
                >
                  <SelectValue placeholder="Выберите период" />
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
              variant="outline"
              size="sm"
              className="h-9 w-full md:w-auto"
            >
              <ShoppingCart className="mr-2 h-4 w-4" /> Купить крипто
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-lg border-l-4 border-primary transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.03]">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center">
                <DollarSign className="mr-2 h-5 w-5 text-primary" />
                Баланс Крипто
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl md:text-3xl font-bold text-foreground">
                {formatCurrency(totalPortfolioValue, primaryDisplayCurrency)}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Текущая оценка портфеля.
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-l-4 border-green-500 transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.03]">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center">
                <Coins className="mr-2 h-5 w-5 text-green-500" />
                Куплено ({selectedPeriodLabel})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl md:text-3xl font-bold text-foreground">
                {formatCurrency(totalPurchasesValue, primaryDisplayCurrency)}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Затраты на покупку за период.
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-l-4 border-blue-500 transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.03]">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center">
                <Banknote className="mr-2 h-5 w-5 text-blue-500" />
                Продано ({selectedPeriodLabel})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl md:text-3xl font-bold text-foreground">
                {formatCurrency(totalSalesValue, primaryDisplayCurrency)}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Доход от продаж за период.
              </p>
            </CardContent>
          </Card>
        </div>

        {cryptoFlowChartData.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg md:text-2xl font-bold">
                <LineChartIcon className="mr-2 h-5 w-5 md:h-6 md:w-6 text-primary" />
                Движение средств ({selectedPeriodLabel})
              </CardTitle>
              <CardDescription className="text-sm">
                Динамика покупок и продаж криптоактивов за выбранный период в{" "}
                {primaryDisplayCurrency}.
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
                    name="Продажи"
                    type="monotone"
                    stroke="var(--color-sells)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    dataKey="buys"
                    name="Покупки"
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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-2xl flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 md:h-6 md:w-6 text-primary" />
              Ваши криптоактивы
            </CardTitle>
            <CardDescription className="text-sm">
              Детализация ваших криптовалютных вложений.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                          Кол-во:{" "}
                          {holding.amount.toLocaleString(undefined, {
                            maximumFractionDigits: 8,
                          })}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm flex-grow">
                        <p>
                          Цена покупки (сред.):{" "}
                          <span className="font-medium">
                            {formatCurrency(
                              holding.purchasePrice,
                              holding.purchaseCurrency
                            )}
                          </span>{" "}
                          /ед.
                        </p>
                        <p>
                          Стоимость покупки:{" "}
                          <span className="font-medium">
                            {formatCurrency(
                              purchaseValueInPrimary,
                              primaryDisplayCurrency
                            )}
                          </span>
                        </p>
                        <p>
                          Тек. стоимость:{" "}
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
                          ({profitLossPercent.toFixed(1)}% от USD покупки)
                        </div>
                      </CardContent>
                      <CardFooter className="pt-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          disabled={holding.amount <= 0}
                        >
                          <Send className="mr-2 h-4 w-4" /> Продать
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <BitcoinIcon className="h-12 w-12 mx-auto mb-3 opacity-60" />
                <p className="text-lg font-semibold">
                  Криптоактивы не добавлены
                </p>
                <p className="text-sm">
                  Нажмите "Купить крипто", чтобы добавить свой первый актив.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}

export default InvestmentGrowthCalculator;
export { InvestmentGrowthCalculator };
