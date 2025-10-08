import { create } from "zustand";
import type {
  Wallet,
  Transaction,
  TransactionType,
  TransactionCategory,
  CryptoHolding,
  FinancialGoal,
  Debt,
  NewDebtData,
  DebtPaymentData,
  BudgetEntry,
  NewBudgetEntryData,
  InvestmentCase,
  InvestmentAsset,
  NewInvestmentCaseData,
  NewInvestmentAssetData,
  InvestmentAssetType,
  InvestmentAssetRegion,
  TransactionUpdatePayload,
  // Language, // Тепер використовуємо LanguageCode з i18next
  CryptoAsset,
  UserProfile,
  WalletIconName,
  CalendarNote,
  NewCalendarNoteData,
  SubscriptionStatus,
} from "@/lib/types";
import type { LanguageCode } from "@/lib/i18n-new";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  addMonths,
  subMonths,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subYears,
  eachMonthOfInterval,
  lastDayOfMonth,
  isPast,
  isSameMonth,
} from "date-fns";
import { ru } from "date-fns/locale";
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_CATEGORY_LABELS,
  INVESTMENT_ASSET_TYPE_LABELS,
  INVESTMENT_ASSET_REGION_LABELS,
} from "@/lib/types";
import { toast } from "@/hooks/use-toast";

export type FilterPeriodType =
  | "currentMonth"
  | "lastMonth"
  | "currentQuarter"
  | "lastQuarter"
  | "currentYear"
  | "lastYear";

// FILTER_PERIOD_LABELS will be replaced with dynamic translations
export const FILTER_PERIOD_LABELS: Record<FilterPeriodType, string> = {
  currentMonth: "This Month", // Will be replaced with t() calls
  lastMonth: "Last Month",
  currentQuarter: "This Quarter",
  lastQuarter: "Last Quarter",
  currentYear: "This Year",
  lastYear: "Last Year",
};

interface BudgetState {
  wallets: Wallet[];
  transactions: Transaction[];
  cryptoHoldings: CryptoHolding[];
  financialGoals: FinancialGoal[];
  debts: Debt[];
  budgetEntries: BudgetEntry[];
  investmentCases: InvestmentCase[];
  customTransactionCategories: string[];
  calendarNotes: CalendarNote[];
  primaryDisplayCurrency: string;
  filterPeriod: FilterPeriodType;
  MOCK_RATES: { [key: string]: number };
  language: LanguageCode;
  userProfile: UserProfile;
  isAppUnlocked: boolean;
  subscriptionStatus: SubscriptionStatus;
  subscriptionRenewalDate?: string;
  setPrimaryDisplayCurrency: (currency: string) => void;
  setFilterPeriod: (period: FilterPeriodType) => void;
  setLanguage: (language: LanguageCode) => void;
  updateUserProfile: (profileUpdates: Partial<UserProfile>) => void;
  setAppPin: (pin: string) => void;
  unlockApp: (pin: string) => boolean;
  lockApp: () => void;
  upgradeToPro: (plan: "monthly" | "yearly") => void;
  cancelSubscription: () => void;
  addWallet: (
    id: string,
    name: string,
    currency: string,
    initialBalance: number,
    icon?: WalletIconName,
    color?: string
  ) => void;
  addTransaction: (
    walletId: string,
    description: string,
    originalAmount: number,
    originalCurrency: string,
    type: TransactionType,
    category: TransactionCategory,
    date: string
  ) => void;
  updateTransaction: (
    transactionId: string,
    updates: TransactionUpdatePayload
  ) => void;
  deleteTransaction: (transactionId: string) => void;
  addCustomTransactionCategory: (categoryName: string) => void;
  getWalletById: (id: string) => Wallet | undefined;
  getTransactionsByWallet: (walletId: string) => Transaction[];
  getTransactionsByWalletName: (walletName: string) => Transaction[];
  getTransactionsByCategoryName: (categoryLabel: string) => Transaction[];
  getTransactionsByDate: (date: string) => Transaction[];

  getOverviewData: () => {
    totalBalance: number;
    incomeForPeriod: number;
    expensesForPeriod: number;
    transactionsForPeriod: number;
  };
  getPeriodTransactionSummary: () => Array<{
    date: string;
    dateLabel: string;
    income: number;
    expenses: number;
    balance: number;
  }>;
  getPeriodCategoryExpenseBreakdown: () => Array<{
    name: string;
    value: number;
    fill: string;
    originalName: TransactionCategory;
  }>;
  getDateRangeForPeriod: (
    period: FilterPeriodType,
    referenceDate?: Date
  ) => { start: Date; end: Date };

  getWalletBalanceDistribution: () => Array<{
    name: string;
    value: number;
    fill: string;
  }>;

  // Crypto specific
  buyCrypto: (
    fiatWalletId: string,
    asset: CryptoAsset,
    name: string,
    amountToBuy: number,
    pricePerUnit: number,
    fiatCurrency: string
  ) => boolean;
  sellCrypto: (
    fiatWalletId: string,
    holdingId: string,
    amountToSell: number,
    pricePerUnit: number,
    fiatCurrency: string
  ) => boolean;
  getTotalCryptoValue: () => number;
  getPeriodCryptoPurchases: () => number;
  getPeriodCryptoSales: () => number;
  getPeriodCryptoFlowSummary: () => Array<{
    date: string;
    dateLabel: string;
    buys: number;
    sells: number;
  }>;

  convertCurrency: (
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ) => number;
  addFinancialGoal: (
    goalData: Omit<
      FinancialGoal,
      "id" | "startDate" | "status" | "projectedCompletionDate"
    > & { monthlyContribution: number }
  ) => void;
  updateFinancialGoal: (
    goalId: string,
    updates: Partial<
      Omit<
        FinancialGoal,
        "id" | "startDate" | "status" | "projectedCompletionDate" | "imageUrl"
      > & {
        name: string;
        targetAmount: number;
        targetCurrency: string;
        monthlyContribution: number;
        description?: string;
        imageUrl?: string;
      }
    >
  ) => void;
  deleteFinancialGoal: (goalId: string) => void;

  addDebt: (debtData: NewDebtData) => boolean;
  recordDebtPayment: (paymentData: DebtPaymentData) => void;
  deleteDebt: (debtId: string) => void;
  getDebtsIOwe: () => Debt[];
  getDebtsOwedToMe: () => Debt[];

  addBudgetEntry: (entryData: NewBudgetEntryData) => void;
  updateBudgetEntry: (
    entryId: string,
    updates: Partial<NewBudgetEntryData>
  ) => void;
  deleteBudgetEntry: (entryId: string) => void;
  calculateNextDueDate: (
    entry: Pick<BudgetEntry, "startDate" | "frequency" | "dayOfMonth">,
    referenceDate?: Date
  ) => string;
  getActualSpendingForBudget: (budgetEntry: BudgetEntry) => number;
  calculateCashflowForecast: (months: 1 | 3 | 6) => Array<{
    period: string;
    projectedBalance: number;
    incomeTransactions: number;
    expenseTransactions: number;
    budgetIncome: number;
    budgetExpense: number;
    netChange: number;
  }>;

  addInvestmentCase: (caseData: NewInvestmentCaseData) => void;
  updateInvestmentCase: (
    caseId: string,
    updates: Partial<NewInvestmentCaseData>
  ) => void;
  deleteInvestmentCase: (caseId: string) => void;
  addAssetToCase: (caseId: string, assetData: NewInvestmentAssetData) => void;
  updateAssetInCase: (
    caseId: string,
    assetId: string,
    updates: Partial<NewInvestmentAssetData>
  ) => void;
  removeAssetFromCase: (caseId: string, assetId: string) => void;
  getInvestmentAssetTypeDistribution: () => Array<{
    name: string;
    value: number;
    fill: string;
    originalName: InvestmentAssetType;
  }>;
  getInvestmentRegionDistribution: () => Array<{
    name: string;
    value: number;
    fill: string;
    originalName: InvestmentAssetRegion | undefined;
  }>;

  // Calendar Notes
  addCalendarNote: (noteData: NewCalendarNoteData) => void;
  updateCalendarNote: (
    noteId: string,
    updates: Partial<NewCalendarNoteData> & { isCompleted?: boolean }
  ) => void;
  deleteCalendarNote: (noteId: string) => void;

  updateWallet: (
    walletId: string,
    updates: Partial<
      Pick<Wallet, "name" | "currency" | "balance" | "icon" | "color">
    >
  ) => void;
  deleteWallet: (walletId: string) => void;
  reorderWallets: (newOrder: string[]) => void;
}

const initialWallets: Wallet[] = [
  {
    id: "1",
    name: "Основной банковский счет",
    currency: "RUB",
    balance: 75000.75,
    icon: "Landmark",
    isDefault: true,
  },
  {
    id: "2",
    name: "Наличные",
    currency: "RUB",
    balance: 12500.0,
    icon: "Banknote",
    isDefault: false,
  },
  {
    id: "3",
    name: "Криптокошелек (старый)",
    currency: "ETH",
    balance: 0,
    icon: "Bitcoin",
    isDefault: false,
  },
  {
    id: "4",
    name: "Долларовый счет",
    currency: "USD",
    balance: 500,
    icon: "CreditCard",
    isDefault: false,
  },
  {
    id: "5",
    name: "Гривневый счет",
    currency: "UAH",
    balance: 10000,
    icon: "Wallet",
    isDefault: false,
  },
];

const initialTransactions: Transaction[] = [
  {
    id: "t1",
    walletId: "1",
    description: "Зачисление зарплаты",
    amount: 100000,
    type: "income",
    category: "salary",
    currency: "RUB",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "t2",
    walletId: "1",
    description: "Продукты",
    amount: 3500.5,
    type: "expense",
    category: "groceries",
    currency: "RUB",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "t3",
    walletId: "2",
    description: "Обед",
    amount: 750.0,
    type: "expense",
    category: "groceries",
    currency: "RUB",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "t4",
    walletId: "1",
    description: "Онлайн-курс",
    amount: 2500.99,
    type: "expense",
    category: "education",
    currency: "RUB",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "t6",
    walletId: "4",
    description: "Покупка ПО",
    amount: 50,
    type: "expense",
    category: "other",
    currency: "USD",
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "t7",
    walletId: "5",
    description: "Перевод другу",
    amount: 1000,
    type: "expense",
    category: "other",
    currency: "UAH",
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Транзакції для бюджету - продукти
  {
    id: "t8",
    walletId: "5",
    description: "Сільпо",
    amount: 1200,
    type: "expense",
    category: "groceries",
    currency: "UAH",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "t9",
    walletId: "5",
    description: "АТБ",
    amount: 850,
    type: "expense",
    category: "groceries",
    currency: "UAH",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "t10",
    walletId: "5",
    description: "Ринок",
    amount: 600,
    type: "expense",
    category: "groceries",
    currency: "UAH",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Транзакції для бюджету - транспорт
  {
    id: "t11",
    walletId: "5",
    description: "Таксі",
    amount: 350,
    type: "expense",
    category: "transport",
    currency: "UAH",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "t12",
    walletId: "5",
    description: "Паливо",
    amount: 1500,
    type: "expense",
    category: "transport",
    currency: "UAH",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Транзакції для бюджету - розваги
  {
    id: "t13",
    walletId: "5",
    description: "Кіно",
    amount: 450,
    type: "expense",
    category: "entertainment",
    currency: "UAH",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "t14",
    walletId: "5",
    description: "Ресторан",
    amount: 1200,
    type: "expense",
    category: "entertainment",
    currency: "UAH",
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "t15",
    walletId: "5",
    description: "Концерт",
    amount: 2500,
    type: "expense",
    category: "entertainment",
    currency: "UAH",
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const initialCryptoHoldings: CryptoHolding[] = [
  {
    id: "ch1",
    asset: "BTC",
    name: "Bitcoin",
    amount: 0.05,
    purchasePrice: 40000,
    purchaseCurrency: "USD",
    symbol: "BTC",
    currentPrice: 45000,
    currency: "USD",
    purchaseDate: new Date().toISOString(),
  },
  {
    id: "ch2",
    asset: "ETH",
    name: "Ethereum",
    amount: 2.5,
    purchasePrice: 2500,
    purchaseCurrency: "USD",
    symbol: "ETH",
    currentPrice: 3000,
    currency: "USD",
    purchaseDate: new Date().toISOString(),
  },
  {
    id: "ch3",
    asset: "SOL",
    name: "Solana",
    amount: 10,
    purchasePrice: 100,
    purchaseCurrency: "USD",
    symbol: "SOL",
    currentPrice: 120,
    currency: "USD",
    purchaseDate: new Date().toISOString(),
  },
  {
    id: "ch4",
    asset: "ADA",
    name: "Cardano",
    amount: 500,
    purchasePrice: 0.45,
    purchaseCurrency: "USD",
    symbol: "ADA",
    currentPrice: 0.5,
    currency: "USD",
    purchaseDate: new Date().toISOString(),
  },
];

const initialFinancialGoals: FinancialGoal[] = [];
const initialDebts: Debt[] = [];
const initialBudgetEntries: BudgetEntry[] = [
  {
    id: "budget_1",
    description: "Продукти харчування",
    amount: 5000,
    currency: "UAH",
    type: "expense",
    category: "groceries",
    frequency: "monthly",
    startDate: new Date().toISOString(),
    dayOfMonth: 1,
    isActive: true,
    limit: 5000,
    nextDueDate: new Date().toISOString(),
  },
  {
    id: "budget_2",
    description: "Транспорт",
    amount: 2000,
    currency: "UAH",
    type: "expense",
    category: "transport",
    frequency: "monthly",
    startDate: new Date().toISOString(),
    dayOfMonth: 1,
    isActive: true,
    limit: 2000,
    nextDueDate: new Date().toISOString(),
  },
  {
    id: "budget_3",
    description: "Розваги",
    amount: 3000,
    currency: "UAH",
    type: "expense",
    category: "entertainment",
    frequency: "monthly",
    startDate: new Date().toISOString(),
    dayOfMonth: 1,
    isActive: true,
    limit: 3000,
    nextDueDate: new Date().toISOString(),
  },
];
const initialInvestmentCases: InvestmentCase[] = [
  {
    id: "invcase_1",
    name: "Технологические акции США",
    description: "Долгосрочные инвестиции в крупные технологические компании.",
    createdAt: new Date().toISOString(),
    title: "Технологические акции США",
    currency: "USD",
    startDate: new Date().toISOString(),
    totalInvestment: 0,
    assets: [
      {
        id: "asset_1_1",
        name: "Apple Inc. (AAPL)",
        type: "stocks",
        region: "us",
        quantity: 10,
        purchasePrice: 150,
        currency: "USD",
        currentPrice: 170,
        purchaseDate: new Date().toISOString(),
      },
      {
        id: "asset_1_2",
        name: "Microsoft Corp. (MSFT)",
        type: "stocks",
        region: "us",
        quantity: 5,
        purchasePrice: 300,
        currency: "USD",
        currentPrice: 330,
        purchaseDate: new Date().toISOString(),
      },
    ],
  },
  {
    id: "invcase_2",
    name: "Европейские ETF",
    description: "Диверсифицированные ETF на европейские рынки.",
    createdAt: new Date().toISOString(),
    title: "Европейские ETF",
    currency: "EUR",
    startDate: new Date().toISOString(),
    totalInvestment: 0,
    assets: [
      {
        id: "asset_2_1",
        name: "iShares MSCI Europe UCITS ETF",
        type: "stocks",
        region: "europe",
        quantity: 20,
        purchasePrice: 50,
        currency: "EUR",
        currentPrice: 55,
        purchaseDate: new Date().toISOString(),
      },
    ],
  },
];

const MOCK_RATES_DATA: { [key: string]: number } = {
  RUB_USD: 1 / 90,
  UAH_USD: 1 / 40.5,
  EUR_USD: 1.08,
  GBP_USD: 1.27,
  JPY_USD: 1 / 150,
  CAD_USD: 0.73,
  AUD_USD: 0.66,
  CHF_USD: 1.1,
  CNY_USD: 0.14,
  INR_USD: 0.012,
  PLN_USD: 0.25,
  TRY_USD: 0.031,
  KZT_USD: 0.0022,
  BYN_USD: 0.31,
  BTC_USD: 68000,
  ETH_USD: 3800,
  SOL_USD: 150,
  ADA_USD: 0.45,
  USD_USD: 1,
};

const currenciesForRates = [
  "RUB",
  "UAH",
  "EUR",
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
  "BTC",
  "ETH",
  "USD",
];
currenciesForRates.forEach(from => {
  if (from !== "USD" && MOCK_RATES_DATA[`${from}_USD`]) {
    MOCK_RATES_DATA[`USD_${from}`] = 1 / MOCK_RATES_DATA[`${from}_USD`];
  }
});
currenciesForRates.forEach(from => {
  currenciesForRates.forEach(to => {
    if (from === to) {
      MOCK_RATES_DATA[`${from}_${to}`] = 1;
    } else if (!MOCK_RATES_DATA[`${from}_${to}`]) {
      const fromToUsd = MOCK_RATES_DATA[`${from}_USD`];
      const usdToTo = MOCK_RATES_DATA[`USD_${to}`];
      if (fromToUsd !== undefined && usdToTo !== undefined) {
        MOCK_RATES_DATA[`${from}_${to}`] = fromToUsd * usdToTo;
      }
    }
  });
});

const convertCurrencyGlobal = (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number => {
  if (fromCurrency === toCurrency) return amount;
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();
  let rate = MOCK_RATES_DATA[`${from}_${to}`];
  if (rate !== undefined) return amount * rate;
  rate = MOCK_RATES_DATA[`${to}_${from}`];
  if (rate !== undefined && rate !== 0) return amount / rate;
  const fromToUSD = MOCK_RATES_DATA[`${from}_USD`];
  const usdToTo = MOCK_RATES_DATA[`USD_${to}`];
  if (fromToUSD !== undefined && usdToTo !== undefined) {
    const amountInUSD = amount * fromToUSD;
    return amountInUSD * usdToTo;
  }
  // No conversion rate found for ${from} to ${to}. Using 1:1 as fallback.
  return amount;
};

const calculateProjectedCompletionDate = (
  startDate: Date,
  targetAmount: number,
  targetCurrency: string,
  monthlyContributionInPrimary: number,
  primaryCurrency: string,
  convertFn: (amount: number, from: string, to: string) => number
): string | undefined => {
  const monthlyContributionInTargetCurrency = convertFn(
    monthlyContributionInPrimary,
    primaryCurrency,
    targetCurrency
  );
  if (monthlyContributionInTargetCurrency > 0 && targetAmount > 0) {
    const monthsToAchieve = Math.ceil(
      targetAmount / monthlyContributionInTargetCurrency
    );
    const completionDate = addMonths(startDate, monthsToAchieve);
    return completionDate.toISOString();
  }
  return undefined;
};

// Simple pseudo-hash for demonstration. NOT for production.
const pseudoHashPin = (pin: string) => {
  return `h_${pin.split("").reverse().join("")}_${pin.length}`;
};

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      wallets: initialWallets,
      transactions: initialTransactions,
      cryptoHoldings: initialCryptoHoldings,
      financialGoals: initialFinancialGoals,
      debts: initialDebts,
      budgetEntries: initialBudgetEntries,
      investmentCases: initialInvestmentCases,
      customTransactionCategories: [],
      calendarNotes: [],
      primaryDisplayCurrency: "RUB",
      filterPeriod: "currentMonth",
      MOCK_RATES: MOCK_RATES_DATA,
      language: "ru",
      isAppUnlocked: false,
      subscriptionStatus: "free",
      subscriptionRenewalDate: undefined,
      userProfile: {
        id: "user_1",
        name: "User Monifly",
        email: "user@example.com",
        currency: "RUB",
        language: "ru",
        firstName: "User",
        lastName: "Monifly",
        avatarDataUrl: undefined,
        isTwoFactorEnabled: false,
        appPin: undefined,
      },
      setPrimaryDisplayCurrency: currency =>
        set({ primaryDisplayCurrency: currency }),
      setFilterPeriod: period => set({ filterPeriod: period }),
      setLanguage: language => set({ language }),
      updateUserProfile: profileUpdates =>
        set(state => ({
          userProfile: { ...state.userProfile, ...profileUpdates },
        })),
      setAppPin: pin => {
        const hashedPin = pseudoHashPin(pin);
        set(state => ({
          userProfile: { ...state.userProfile, appPin: hashedPin },
          isAppUnlocked: true,
        }));
      },
      unlockApp: pin => {
        const hashedPin = pseudoHashPin(pin);
        const storedPin = get().userProfile.appPin;
        if (hashedPin === storedPin) {
          set({ isAppUnlocked: true });
          return true;
        }
        return false;
      },
      lockApp: () => {
        set({ isAppUnlocked: false });
      },
      upgradeToPro: plan => {
        const renewalDate = new Date();
        if (plan === "monthly") {
          renewalDate.setMonth(renewalDate.getMonth() + 1);
          set({
            subscriptionStatus: "pro_monthly",
            subscriptionRenewalDate: renewalDate.toISOString(),
          });
          toast({
            title: "Подписка Pro (ежемесячно) активирована!",
            description: "Спасибо за поддержку!",
          });
        } else {
          renewalDate.setFullYear(renewalDate.getFullYear() + 1);
          set({
            subscriptionStatus: "pro_yearly",
            subscriptionRenewalDate: renewalDate.toISOString(),
          });
          toast({
            title: "Подписка Pro (ежегодно) активирована!",
            description:
              "Спасибо за поддержку! Вы сэкономили, выбрав годовой план.",
          });
        }
      },
      cancelSubscription: () => {
        set({
          subscriptionStatus: "free",
          subscriptionRenewalDate: undefined,
        });
        toast({
          title: "Подписка отменена",
          description:
            "Ваша Pro подписка будет активна до конца оплаченного периода. После этого ваш план изменится на Базовый.",
        });
      },
      convertCurrency: (amount, from, to) =>
        convertCurrencyGlobal(amount, from, to),
      calculateNextDueDate: (entry, referenceDate = new Date()) => {
        const startDate = parseISO(entry.startDate);
        if (entry.frequency === "once") {
          return entry.startDate;
        }
        let nextDate = new Date(startDate);
        nextDate.setDate(entry.dayOfMonth || 1);
        if (isPast(nextDate) && !isSameDay(nextDate, referenceDate)) {
          const initialCalcDate = (() => {
            const d = new Date(startDate);
            d.setDate(entry.dayOfMonth || 1);
            return d;
          })();
          if (
            isPast(initialCalcDate) ||
            isSameDay(initialCalcDate, referenceDate)
          ) {
            nextDate = addMonths(initialCalcDate, 1);
          } else {
            nextDate = initialCalcDate;
          }
        } else if (
          isSameDay(nextDate, referenceDate) &&
          entry.dayOfMonth &&
          entry.dayOfMonth <= new Date().getDate()
        ) {
          nextDate = addMonths(nextDate, 1);
        }
        if (nextDate < startDate) {
          nextDate = new Date(startDate);
          nextDate.setDate(entry.dayOfMonth || 1);
          if (nextDate < startDate) {
            nextDate = addMonths(nextDate, 1);
          }
        }
        return nextDate.toISOString();
      },
      getDateRangeForPeriod: (
        period: FilterPeriodType,
        referenceDate: Date = new Date()
      ): { start: Date; end: Date } => {
        switch (period) {
          case "currentMonth":
            return {
              start: startOfMonth(referenceDate),
              end: endOfMonth(referenceDate),
            };
          case "lastMonth": {
            const lastMonthRef = subMonths(referenceDate, 1);
            return {
              start: startOfMonth(lastMonthRef),
              end: endOfMonth(lastMonthRef),
            };
          }
          case "currentQuarter":
            return {
              start: startOfQuarter(referenceDate),
              end: endOfQuarter(referenceDate),
            };
          case "lastQuarter": {
            const lastQuarterRef = subMonths(referenceDate, 3);
            return {
              start: startOfQuarter(lastQuarterRef),
              end: endOfQuarter(lastQuarterRef),
            };
          }
          case "currentYear":
            return {
              start: startOfYear(referenceDate),
              end: endOfYear(referenceDate),
            };
          case "lastYear": {
            const lastYearRef = subYears(referenceDate, 1);
            return {
              start: startOfYear(lastYearRef),
              end: endOfYear(lastYearRef),
            };
          }
          default:
            return {
              start: startOfMonth(referenceDate),
              end: endOfMonth(referenceDate),
            };
        }
      },
      addWallet: (id, name, currency, initialBalance, icon, color) =>
        set(state => {
          const newWallet: Wallet = {
            id,
            name,
            currency,
            balance: initialBalance,
            icon: icon,
            color: color,
            isDefault: false,
          };
          return { wallets: [...state.wallets, newWallet] };
        }),
      addCustomTransactionCategory: categoryName => {
        if (
          !categoryName ||
          typeof categoryName !== "string" ||
          categoryName.trim().length === 0
        ) {
          return;
        }
        const trimmedCategory = categoryName.trim();
        set(state => {
          const lowerCaseCategory = trimmedCategory.toLowerCase();
          const allDefaultCategories = (
            TRANSACTION_CATEGORIES as readonly string[]
          ).map(c => c.toLowerCase());
          const allCustomCategories = state.customTransactionCategories.map(c =>
            c.toLowerCase()
          );

          if (
            allDefaultCategories.includes(lowerCaseCategory) ||
            allCustomCategories.includes(lowerCaseCategory)
          ) {
            return state; // Already exists, do nothing
          }

          return {
            customTransactionCategories: [
              ...state.customTransactionCategories,
              trimmedCategory,
            ].sort(),
          };
        });
      },
      addTransaction: (
        walletId,
        description,
        originalAmount,
        originalCurrency,
        type,
        category,
        date
      ) => {
        get().addCustomTransactionCategory(category);
        set(state => {
          const wallet = state.wallets.find(w => w.id === walletId);
          if (!wallet) {
            // Wallet not found for transaction
            return state;
          }
          let amountInWalletCurrency = originalAmount;
          if (
            originalCurrency.toUpperCase() !== wallet.currency.toUpperCase()
          ) {
            amountInWalletCurrency = state.convertCurrency(
              originalAmount,
              originalCurrency,
              wallet.currency
            );
          }
          const newTransaction: Transaction = {
            id: Date.now().toString(),
            walletId,
            description,
            amount: amountInWalletCurrency,
            type,
            category,
            currency: wallet.currency,
            date,
          };
          const updatedWallets = state.wallets.map(w => {
            if (w.id === walletId) {
              return {
                ...w,
                balance:
                  type === "income"
                    ? w.balance + amountInWalletCurrency
                    : w.balance - amountInWalletCurrency,
              };
            }
            return w;
          });
          return {
            transactions: [...state.transactions, newTransaction].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            ),
            wallets: updatedWallets,
          };
        });
      },
      updateTransaction: (transactionId, updates) => {
        if (updates.category) {
          get().addCustomTransactionCategory(updates.category);
        }
        set(state => {
          const originalTransaction = state.transactions.find(
            t => t.id === transactionId
          );
          if (!originalTransaction) {
            // Original transaction not found for update
            return state;
          }
          const originalWallet = state.wallets.find(
            w => w.id === originalTransaction.walletId
          );
          if (!originalWallet) {
            // Original wallet not found for transaction update
            return state;
          }
          const newWalletId = updates.walletId || originalTransaction.walletId;
          const newWallet = state.wallets.find(w => w.id === newWalletId);
          if (!newWallet) {
            // New wallet not found for transaction update
            return state;
          }
          const transactionAmountForUpdate =
            updates.amount !== undefined
              ? updates.amount
              : originalTransaction.amount;
          const transactionCurrencyForUpdate =
            updates.currency !== undefined
              ? updates.currency
              : updates.walletId &&
                newWallet.currency !== originalWallet.currency
              ? newWallet.currency
              : originalWallet.currency;
          const updatedTransactionDetails: Transaction = {
            ...originalTransaction,
            description:
              updates.description !== undefined
                ? updates.description
                : originalTransaction.description,
            amount: transactionAmountForUpdate,
            type:
              updates.type !== undefined
                ? updates.type
                : originalTransaction.type,
            category:
              updates.category !== undefined
                ? updates.category
                : originalTransaction.category,
            date:
              updates.date !== undefined
                ? updates.date
                : originalTransaction.date,
            walletId: newWalletId,
          };
          let amountInNewWalletCurrency = transactionAmountForUpdate;
          if (
            transactionCurrencyForUpdate.toUpperCase() !==
            newWallet.currency.toUpperCase()
          ) {
            amountInNewWalletCurrency = state.convertCurrency(
              transactionAmountForUpdate,
              transactionCurrencyForUpdate,
              newWallet.currency
            );
          }
          updatedTransactionDetails.amount = amountInNewWalletCurrency;
          let newWallets = [...state.wallets];
          const oldEffect =
            originalTransaction.type === "income"
              ? originalTransaction.amount
              : -originalTransaction.amount;
          newWallets = newWallets.map(w =>
            w.id === originalTransaction.walletId
              ? { ...w, balance: w.balance - oldEffect }
              : w
          );
          const newEffect =
            updatedTransactionDetails.type === "income"
              ? updatedTransactionDetails.amount
              : -updatedTransactionDetails.amount;
          newWallets = newWallets.map(w =>
            w.id === newWalletId ? { ...w, balance: w.balance + newEffect } : w
          );
          const newTransactions = state.transactions
            .map(t => (t.id === transactionId ? updatedTransactionDetails : t))
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
          return {
            transactions: newTransactions,
            wallets: newWallets,
          };
        });
      },
      deleteTransaction: (transactionId: string) => {
        set(state => {
          const transactionToDelete = state.transactions.find(
            t => t.id === transactionId
          );
          if (!transactionToDelete) {
            // Transaction not found for deletion
            return state;
          }
          const wallet = state.wallets.find(
            w => w.id === transactionToDelete.walletId
          );
          if (!wallet) {
            // Wallet not found for transaction deletion
            return state;
          }
          const effect =
            transactionToDelete.type === "income"
              ? -transactionToDelete.amount
              : +transactionToDelete.amount;
          const updatedWallets = state.wallets.map(w =>
            w.id === transactionToDelete.walletId
              ? { ...w, balance: w.balance + effect }
              : w
          );
          const updatedTransactions = state.transactions.filter(
            t => t.id !== transactionId
          );
          return {
            transactions: updatedTransactions,
            wallets: updatedWallets,
          };
        });
      },
      getWalletById: id => get().wallets.find(wallet => wallet.id === id),
      getTransactionsByWallet: walletId =>
        get().transactions.filter(t => t.walletId === walletId),
      getTransactionsByWalletName: (walletName: string) => {
        const wallet = get().wallets.find(w => w.name === walletName);
        if (!wallet) return [];
        return get().transactions.filter(t => t.walletId === wallet.id);
      },
      getTransactionsByCategoryName: (categoryLabel: string) => {
        const allCategories = [
          ...Object.entries(TRANSACTION_CATEGORY_LABELS),
          ...get().customTransactionCategories.map(c => [c, c]),
        ];
        const categoryKey = allCategories.find(
          ([_key, label]) => label === categoryLabel
        )?.[0];

        if (!categoryKey) return [];
        const { start, end } = get().getDateRangeForPeriod(get().filterPeriod);
        return get().transactions.filter(t => {
          const tDate = parseISO(t.date);
          return (
            t.category === categoryKey &&
            tDate >= start &&
            tDate <= end &&
            t.type === "expense"
          );
        });
      },
      getTransactionsByDate: (dateISO: string) => {
        const targetDate = parseISO(dateISO);
        return get().transactions.filter(t =>
          isSameDay(parseISO(t.date), targetDate)
        );
      },
      getOverviewData: () => {
        const {
          primaryDisplayCurrency,
          transactions,
          wallets,
          filterPeriod,
          convertCurrency,
          getDateRangeForPeriod,
        } = get();
        const { start, end } = getDateRangeForPeriod(filterPeriod);
        const totalBalance = wallets.reduce((total, wallet) => {
          return (
            total +
            convertCurrency(
              wallet.balance,
              wallet.currency,
              primaryDisplayCurrency
            )
          );
        }, 0);
        let incomeForPeriod = 0;
        let expensesForPeriod = 0;
        let transactionsForPeriod = 0;
        transactions.forEach(t => {
          const tDate = parseISO(t.date);
          if (tDate >= start && tDate <= end) {
            transactionsForPeriod++;
            const wallet = wallets.find(w => w.id === t.walletId);
            if (wallet) {
              const amountInPrimary = convertCurrency(
                t.amount,
                wallet.currency,
                primaryDisplayCurrency
              );
              if (t.type === "income") {
                incomeForPeriod += amountInPrimary;
              } else {
                expensesForPeriod += amountInPrimary;
              }
            }
          }
        });
        return {
          totalBalance,
          incomeForPeriod,
          expensesForPeriod,
          transactionsForPeriod,
        };
      },
      getPeriodTransactionSummary: () => {
        const {
          primaryDisplayCurrency,
          transactions,
          wallets,
          filterPeriod,
          convertCurrency,
          getDateRangeForPeriod,
        } = get();
        const { start, end } = getDateRangeForPeriod(filterPeriod);
        const transactionsInPeriod = transactions.filter(t => {
          const tDate = parseISO(t.date);
          return tDate >= start && tDate <= end;
        });
        const balanceAtPeriodStart = wallets.reduce((acc, wallet) => {
          const currentBalanceInPrimary = convertCurrency(
            wallet.balance,
            wallet.currency,
            primaryDisplayCurrency
          );
          const netChangeForWalletDuringPeriod = get()
            .transactions.filter(
              tx =>
                tx.walletId === wallet.id &&
                parseISO(tx.date) >= start &&
                parseISO(tx.date) <= end
            )
            .reduce((sum, tr) => {
              const amountInPrimary = convertCurrency(
                tr.amount,
                wallet.currency,
                primaryDisplayCurrency
              );
              return (
                sum +
                (tr.type === "income" ? amountInPrimary : -amountInPrimary)
              );
            }, 0);
          return (
            acc + (currentBalanceInPrimary - netChangeForWalletDuringPeriod)
          );
        }, 0);
        let runningBalance = balanceAtPeriodStart;
        if (filterPeriod === "currentYear" || filterPeriod === "lastYear") {
          const monthsInPeriod = eachMonthOfInterval({ start, end });
          return monthsInPeriod.map(monthStartDay => {
            const monthEndDay = lastDayOfMonth(monthStartDay);
            const monthlyIncome = transactionsInPeriod
              .filter(t => {
                const tDate = parseISO(t.date);
                return (
                  tDate >= monthStartDay &&
                  tDate <= monthEndDay &&
                  t.type === "income"
                );
              })
              .reduce((sum, t) => {
                const wallet = wallets.find(w => w.id === t.walletId);
                return (
                  sum +
                  (wallet
                    ? convertCurrency(
                        t.amount,
                        wallet.currency,
                        primaryDisplayCurrency
                      )
                    : 0)
                );
              }, 0);
            const monthlyExpenses = transactionsInPeriod
              .filter(t => {
                const tDate = parseISO(t.date);
                return (
                  tDate >= monthStartDay &&
                  tDate <= monthEndDay &&
                  t.type === "expense"
                );
              })
              .reduce((sum, t) => {
                const wallet = wallets.find(w => w.id === t.walletId);
                return (
                  sum +
                  (wallet
                    ? convertCurrency(
                        t.amount,
                        wallet.currency,
                        primaryDisplayCurrency
                      )
                    : 0)
                );
              }, 0);
            runningBalance += monthlyIncome - monthlyExpenses;
            return {
              date: format(monthStartDay, "yyyy-MM-dd"),
              dateLabel: format(monthStartDay, "MMM yy", { locale: ru }),
              income: monthlyIncome,
              expenses: monthlyExpenses,
              balance: runningBalance,
            };
          });
        } else {
          const daysInPeriod = eachDayOfInterval({ start, end });
          return daysInPeriod.map(day => {
            const dailyIncome = transactionsInPeriod
              .filter(
                t => isSameDay(parseISO(t.date), day) && t.type === "income"
              )
              .reduce((sum, t) => {
                const wallet = wallets.find(w => w.id === t.walletId);
                return (
                  sum +
                  (wallet
                    ? convertCurrency(
                        t.amount,
                        wallet.currency,
                        primaryDisplayCurrency
                      )
                    : 0)
                );
              }, 0);
            const dailyExpenses = transactionsInPeriod
              .filter(
                t => isSameDay(parseISO(t.date), day) && t.type === "expense"
              )
              .reduce((sum, t) => {
                const wallet = wallets.find(w => w.id === t.walletId);
                return (
                  sum +
                  (wallet
                    ? convertCurrency(
                        t.amount,
                        wallet.currency,
                        primaryDisplayCurrency
                      )
                    : 0)
                );
              }, 0);
            runningBalance += dailyIncome - dailyExpenses;
            return {
              date: format(day, "yyyy-MM-dd"),
              dateLabel: format(day, "dd MMM", { locale: ru }),
              income: dailyIncome,
              expenses: dailyExpenses,
              balance: runningBalance,
            };
          });
        }
      },
      getPeriodCategoryExpenseBreakdown: () => {
        const {
          primaryDisplayCurrency,
          transactions,
          wallets,
          filterPeriod,
          convertCurrency,
          getDateRangeForPeriod,
        } = get();
        const { start, end } = getDateRangeForPeriod(filterPeriod);
        const expensesInPeriod = transactions.filter(t => {
          const tDate = parseISO(t.date);
          return tDate >= start && tDate <= end && t.type === "expense";
        });
        const categoryTotals: { [key in TransactionCategory]?: number } = {};
        expensesInPeriod.forEach(t => {
          const wallet = wallets.find(w => w.id === t.walletId);
          const amountInPrimary = wallet
            ? convertCurrency(t.amount, wallet.currency, primaryDisplayCurrency)
            : 0;
          categoryTotals[t.category as TransactionCategory] =
            (categoryTotals[t.category as TransactionCategory] || 0) +
            amountInPrimary;
        });
        const chartColors = [
          "hsl(var(--chart-1))",
          "hsl(var(--chart-2))",
          "hsl(var(--chart-3))",
          "hsl(var(--chart-4))",
          "hsl(var(--chart-5))",
        ];
        return Object.entries(categoryTotals)
          .map(([categoryKey, total], index) => ({
            originalName: categoryKey as TransactionCategory,
            name:
              TRANSACTION_CATEGORY_LABELS[
                categoryKey as keyof typeof TRANSACTION_CATEGORY_LABELS
              ] || categoryKey,
            value: parseFloat(total!.toFixed(2)),
            fill: chartColors[index % chartColors.length],
          }))
          .sort((a, b) => b.value - a.value);
      },
      getWalletBalanceDistribution: () => {
        const primaryCurrency = get().primaryDisplayCurrency;
        const convertCurrency = get().convertCurrency;
        const chartColors = [
          "hsl(var(--chart-1))",
          "hsl(var(--chart-2))",
          "hsl(var(--chart-3))",
          "hsl(var(--chart-4))",
          "hsl(var(--chart-5))",
        ];
        return get()
          .wallets.filter(w => w.balance > 0 || w.balance < 0)
          .map((wallet, index) => ({
            name: wallet.name,
            value: parseFloat(
              convertCurrency(
                wallet.balance,
                wallet.currency,
                primaryCurrency
              ).toFixed(2)
            ),
            fill: chartColors[index % chartColors.length],
          }))
          .sort((a, b) => b.value - a.value);
      },
      getTotalCryptoValue: () => {
        const primaryCurrency = get().primaryDisplayCurrency;
        const convertCurrency = get().convertCurrency;
        const MOCK_RATES = get().MOCK_RATES;
        return get().cryptoHoldings.reduce((total, holding) => {
          const currentPriceUSD = MOCK_RATES[`${holding.asset}_USD`] || 0;
          const valueInUSD = holding.amount * currentPriceUSD;
          return total + convertCurrency(valueInUSD, "USD", primaryCurrency);
        }, 0);
      },
      getPeriodCryptoPurchases: () => {
        const {
          transactions,
          wallets,
          primaryDisplayCurrency,
          convertCurrency,
          filterPeriod,
          getDateRangeForPeriod,
        } = get();
        const { start, end } = getDateRangeForPeriod(filterPeriod);
        return transactions
          .filter(t => {
            const tDate = parseISO(t.date);
            return (
              t.type === "expense" &&
              t.category === "crypto" &&
              tDate >= start &&
              tDate <= end
            );
          })
          .reduce((total, transaction) => {
            const wallet = wallets.find(w => w.id === transaction.walletId);
            if (wallet) {
              return (
                total +
                convertCurrency(
                  transaction.amount,
                  wallet.currency,
                  primaryDisplayCurrency
                )
              );
            }
            return total;
          }, 0);
      },
      getPeriodCryptoSales: () => {
        const {
          transactions,
          wallets,
          primaryDisplayCurrency,
          convertCurrency,
          filterPeriod,
          getDateRangeForPeriod,
        } = get();
        const { start, end } = getDateRangeForPeriod(filterPeriod);
        return transactions
          .filter(t => {
            const tDate = parseISO(t.date);
            return (
              t.type === "income" &&
              t.category === "crypto" &&
              tDate >= start &&
              tDate <= end
            );
          })
          .reduce((total, transaction) => {
            const wallet = wallets.find(w => w.id === transaction.walletId);
            if (wallet) {
              return (
                total +
                convertCurrency(
                  transaction.amount,
                  wallet.currency,
                  primaryDisplayCurrency
                )
              );
            }
            return total;
          }, 0);
      },
      getPeriodCryptoFlowSummary: () => {
        const {
          primaryDisplayCurrency,
          transactions,
          wallets,
          filterPeriod,
          convertCurrency,
          getDateRangeForPeriod,
        } = get();
        const { start, end } = getDateRangeForPeriod(filterPeriod);
        const cryptoTransactionsInPeriod = transactions.filter(t => {
          const tDate = parseISO(t.date);
          return t.category === "crypto" && tDate >= start && tDate <= end;
        });

        const isLongPeriod =
          filterPeriod === "currentYear" || filterPeriod === "lastYear";

        if (isLongPeriod) {
          const monthsInPeriod = eachMonthOfInterval({ start, end });
          return monthsInPeriod.map(monthStartDay => {
            const monthEndDay = lastDayOfMonth(monthStartDay);
            const monthlyBuys = cryptoTransactionsInPeriod
              .filter(t => {
                const tDate = parseISO(t.date);
                return (
                  tDate >= monthStartDay &&
                  tDate <= monthEndDay &&
                  t.type === "expense"
                );
              })
              .reduce((sum, t) => {
                const wallet = wallets.find(w => w.id === t.walletId);
                return (
                  sum +
                  (wallet
                    ? convertCurrency(
                        t.amount,
                        wallet.currency,
                        primaryDisplayCurrency
                      )
                    : 0)
                );
              }, 0);
            const monthlySells = cryptoTransactionsInPeriod
              .filter(t => {
                const tDate = parseISO(t.date);
                return (
                  tDate >= monthStartDay &&
                  tDate <= monthEndDay &&
                  t.type === "income"
                );
              })
              .reduce((sum, t) => {
                const wallet = wallets.find(w => w.id === t.walletId);
                return (
                  sum +
                  (wallet
                    ? convertCurrency(
                        t.amount,
                        wallet.currency,
                        primaryDisplayCurrency
                      )
                    : 0)
                );
              }, 0);

            return {
              dateLabel: format(monthStartDay, "MMM yy", { locale: ru }),
              date: format(monthStartDay, "yyyy-MM-dd"),
              buys: monthlyBuys,
              sells: monthlySells,
            };
          });
        } else {
          const daysInPeriod = eachDayOfInterval({ start, end });
          return daysInPeriod
            .map(day => {
              const dailyBuys = cryptoTransactionsInPeriod
                .filter(
                  t => isSameDay(parseISO(t.date), day) && t.type === "expense"
                )
                .reduce((sum, t) => {
                  const wallet = wallets.find(w => w.id === t.walletId);
                  return (
                    sum +
                    (wallet
                      ? convertCurrency(
                          t.amount,
                          wallet.currency,
                          primaryDisplayCurrency
                        )
                      : 0)
                  );
                }, 0);
              const dailySells = cryptoTransactionsInPeriod
                .filter(
                  t => isSameDay(parseISO(t.date), day) && t.type === "income"
                )
                .reduce((sum, t) => {
                  const wallet = wallets.find(w => w.id === t.walletId);
                  return (
                    sum +
                    (wallet
                      ? convertCurrency(
                          t.amount,
                          wallet.currency,
                          primaryDisplayCurrency
                        )
                      : 0)
                  );
                }, 0);

              return {
                dateLabel: format(day, "dd MMM", { locale: ru }),
                date: format(day, "yyyy-MM-dd"),
                buys: dailyBuys,
                sells: dailySells,
              };
            })
            .filter(d => d.buys > 0 || d.sells > 0);
        }
      },
      buyCrypto: (
        fiatWalletId,
        asset,
        name,
        amountToBuy,
        pricePerUnit,
        fiatCurrency
      ) => {
        const { wallets, cryptoHoldings, addTransaction, convertCurrency } =
          get();
        const fiatWallet = wallets.find(w => w.id === fiatWalletId);
        if (!fiatWallet) {
          toast({
            title: "Ошибка",
            description: "Фиатный кошелек не найден.",
            variant: "destructive",
          });
          return false;
        }

        const totalCostInFiat = amountToBuy * pricePerUnit;
        const totalCostInWalletCurrency = convertCurrency(
          totalCostInFiat,
          fiatCurrency,
          fiatWallet.currency
        );

        if (fiatWallet.balance < totalCostInWalletCurrency) {
          toast({
            title: "Недостаточно средств",
            description: `На кошельке "${fiatWallet.name}" недостаточно средств.`,
            variant: "destructive",
          });
          return false;
        }

        addTransaction(
          fiatWalletId,
          `Покупка ${amountToBuy} ${asset.symbol}`,
          totalCostInFiat,
          fiatCurrency,
          "expense",
          "crypto",
          new Date().toISOString()
        );

        const updatedHoldings = [...cryptoHoldings];
        const existingHoldingIndex = updatedHoldings.findIndex(
          h => h.asset === asset.symbol
        );

        if (existingHoldingIndex > -1) {
          const existingHolding = updatedHoldings[existingHoldingIndex];
          const currentTotalValue =
            existingHolding.amount * existingHolding.purchasePrice;
          const newPurchaseValue = amountToBuy * pricePerUnit;

          const newPurchaseValueInExistingCurrency = convertCurrency(
            newPurchaseValue,
            fiatCurrency,
            existingHolding.purchaseCurrency
          );

          const totalAmount = existingHolding.amount + amountToBuy;
          const totalWeightedValue =
            currentTotalValue + newPurchaseValueInExistingCurrency;

          updatedHoldings[existingHoldingIndex] = {
            ...existingHolding,
            amount: totalAmount,
            purchasePrice: totalWeightedValue / totalAmount,
          };
        } else {
          updatedHoldings.push({
            id: `ch_${Date.now()}`,
            asset: asset.symbol,
            name,
            amount: amountToBuy,
            purchasePrice: pricePerUnit,
            purchaseCurrency: fiatCurrency,
            symbol: asset.symbol,
            currentPrice: asset.currentPrice,
            currency: fiatCurrency,
            purchaseDate: new Date().toISOString(),
          });
        }
        set({ cryptoHoldings: updatedHoldings });
        toast({
          title: "Криптовалюта куплена",
          description: `${amountToBuy} ${asset} успешно добавлено в портфель.`,
        });
        return true;
      },
      sellCrypto: (
        fiatWalletId,
        holdingId,
        amountToSell,
        pricePerUnit,
        fiatCurrency
      ) => {
        const { wallets, cryptoHoldings, addTransaction } = get();
        const fiatWallet = wallets.find(w => w.id === fiatWalletId);
        if (!fiatWallet) {
          toast({
            title: "Ошибка",
            description: "Фиатный кошелек не найден.",
            variant: "destructive",
          });
          return false;
        }

        const holdingIndex = cryptoHoldings.findIndex(h => h.id === holdingId);
        if (holdingIndex === -1) {
          toast({
            title: "Ошибка",
            description: "Продаваемый криптоактив не найден.",
            variant: "destructive",
          });
          return false;
        }

        const holdingToSell = cryptoHoldings[holdingIndex];
        if (holdingToSell.amount < amountToSell) {
          toast({
            title: "Недостаточно актива",
            description: `Недостаточно ${holdingToSell.asset} для продажи.`,
            variant: "destructive",
          });
          return false;
        }

        const totalProceedsInFiat = amountToSell * pricePerUnit;
        addTransaction(
          fiatWalletId,
          `Продажа ${amountToSell} ${holdingToSell.asset}`,
          totalProceedsInFiat,
          fiatCurrency,
          "income",
          "crypto",
          new Date().toISOString()
        );

        const updatedHoldings = [...cryptoHoldings];
        if (holdingToSell.amount - amountToSell < 0.00000001) {
          updatedHoldings.splice(holdingIndex, 1);
        } else {
          updatedHoldings[holdingIndex] = {
            ...holdingToSell,
            amount: holdingToSell.amount - amountToSell,
          };
        }
        set({ cryptoHoldings: updatedHoldings });
        toast({
          title: "Криптовалюта продана",
          description: `${amountToSell} ${holdingToSell.asset} успешно продано.`,
        });
        return true;
      },
      addFinancialGoal: goalData => {
        set(state => {
          const { targetAmount, targetCurrency, monthlyContribution } =
            goalData;
          const primaryCurrency = state.primaryDisplayCurrency;
          const startDate = new Date();
          const projectedDate = calculateProjectedCompletionDate(
            startDate,
            targetAmount || 0,
            targetCurrency || primaryCurrency,
            monthlyContribution || 0,
            primaryCurrency,
            state.convertCurrency
          );
          const newGoal: FinancialGoal = {
            ...goalData,
            id: Date.now().toString(),
            targetDate: startDate.toISOString(),
            projectedCompletionDate: projectedDate,
            status: "active",
          };
          return {
            financialGoals: [...state.financialGoals, newGoal].sort((a, b) =>
              a.projectedCompletionDate && b.projectedCompletionDate
                ? new Date(a.projectedCompletionDate).getTime() -
                  new Date(b.projectedCompletionDate).getTime()
                : a.projectedCompletionDate
                ? -1
                : 1
            ),
          };
        });
      },
      updateFinancialGoal: (goalId, updates) => {
        set(state => {
          const financialGoals = state.financialGoals.map(goal => {
            if (goal.id === goalId) {
              const updatedGoalBase = { ...goal, ...updates };
              const projectedDate = calculateProjectedCompletionDate(
                parseISO(
                  updatedGoalBase.targetDate || new Date().toISOString()
                ),
                updatedGoalBase.targetAmount || 0,
                updatedGoalBase.targetCurrency || state.primaryDisplayCurrency,
                updatedGoalBase.monthlyContribution || 0,
                state.primaryDisplayCurrency,
                state.convertCurrency
              );
              return {
                ...updatedGoalBase,
                projectedCompletionDate: projectedDate,
              };
            }
            return goal;
          });
          return {
            financialGoals: financialGoals.sort((a, b) =>
              a.projectedCompletionDate && b.projectedCompletionDate
                ? new Date(a.projectedCompletionDate).getTime() -
                  new Date(b.projectedCompletionDate).getTime()
                : a.projectedCompletionDate
                ? -1
                : 1
            ),
          };
        });
      },
      deleteFinancialGoal: goalId => {
        set(state => ({
          financialGoals: state.financialGoals.filter(
            goal => goal.id !== goalId
          ),
        }));
      },
      addDebt: (debtData: NewDebtData): boolean => {
        let success = true;
        set(state => {
          const initialWallet = state.wallets.find(
            w => w.id === debtData.initialWalletId
          );
          if (!initialWallet) {
            // Initial wallet not found for debt creation
            toast({
              title: "Ошибка",
              description: "Выбранный кошелек не найден.",
              variant: "destructive",
            });
            success = false;
            return state;
          }
          let amountInWalletCurrency = debtData.amount;
          if (
            debtData.currency.toUpperCase() !==
            initialWallet.currency.toUpperCase()
          ) {
            amountInWalletCurrency = state.convertCurrency(
              debtData.amount,
              debtData.currency,
              initialWallet.currency
            );
          }
          let updatedWallets = [...state.wallets];
          let newTransaction: Transaction | null = null;
          if (debtData.type === "iOwe") {
            updatedWallets = state.wallets.map(w =>
              w.id === debtData.initialWalletId
                ? { ...w, balance: w.balance + amountInWalletCurrency }
                : w
            );
            newTransaction = {
              id: `tx_debt_in_${Date.now()}`,
              walletId: debtData.initialWalletId || "",
              description: `Получение займа от: ${
                debtData.personName || "Неизвестно"
              } (${debtData.description || "Долг"})`,
              amount: amountInWalletCurrency,
              type: "income",
              category: "other",
              date: new Date().toISOString(),
              currency: debtData.currency || "RUB",
            };
          } else {
            if (initialWallet.balance < amountInWalletCurrency) {
              toast({
                title: "Недостаточно средств",
                description: `На кошельке "${initialWallet.name}" недостаточно средств для выдачи этого займа.`,
                variant: "destructive",
              });
              success = false;
              return state;
            }
            updatedWallets = state.wallets.map(w =>
              w.id === debtData.initialWalletId
                ? { ...w, balance: w.balance - amountInWalletCurrency }
                : w
            );
            newTransaction = {
              id: `tx_debt_out_${Date.now()}`,
              walletId: debtData.initialWalletId || "",
              description: `Выдача займа: ${
                debtData.personName || "Неизвестно"
              } (${debtData.description || "Долг"})`,
              amount: amountInWalletCurrency,
              type: "expense",
              category: "other",
              date: new Date().toISOString(),
              currency: debtData.currency || "RUB",
            };
          }
          if (!success) return state;
          const newDebtEntry: Debt = {
            id: `debt_${Date.now().toString()}`,
            title: debtData.description || "Долг",
            amount: debtData.amount,
            currency: debtData.currency,
            type: debtData.type,
            interestRate: 0,
            startDate: new Date().toISOString(),
            dueDate: debtData.dueDate,
            description: debtData.description,
            isActive: true,
            personName: debtData.personName,
            initialAmount: debtData.amount,
            paidAmount: 0,
            status: "pending",
            createdAt: new Date().toISOString(),
            initialWalletId: debtData.initialWalletId,
          };
          const updatedTransactions = newTransaction
            ? [...state.transactions, newTransaction]
            : state.transactions;
          return {
            debts: [...state.debts, newDebtEntry].sort((a, b) =>
              a.dueDate && b.dueDate
                ? parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime()
                : a.dueDate
                ? -1
                : 1
            ),
            wallets: updatedWallets,
            transactions: updatedTransactions.sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            ),
          };
        });
        return success;
      },
      recordDebtPayment: (paymentData: DebtPaymentData) => {
        set(state => {
          let debtToUpdate = state.debts.find(d => d.id === paymentData.debtId);
          if (!debtToUpdate) return state;
          const remainingAmount =
            (debtToUpdate.initialAmount || 0) - (debtToUpdate.paidAmount || 0);
          const actualPayment = Math.min(
            paymentData.paymentAmount || 0,
            remainingAmount
          );
          debtToUpdate = {
            ...debtToUpdate,
            paidAmount: (debtToUpdate.paidAmount || 0) + actualPayment,
          };
          if (
            (debtToUpdate.paidAmount || 0) >=
            (debtToUpdate.initialAmount || 0) - 0.001
          ) {
            debtToUpdate.status = "paid";
          } else if ((debtToUpdate.paidAmount || 0) > 0) {
            debtToUpdate.status = "partiallyPaid";
          } else {
            debtToUpdate.status = "pending";
          }
          const updatedDebts = state.debts.map(d =>
            d.id === paymentData.debtId ? debtToUpdate! : d
          );
          const transactionType: TransactionType =
            debtToUpdate.type === "iOwe" ? "expense" : "income";
          let transactionDescription: string;
          if (debtToUpdate.type === "iOwe") {
            transactionDescription = `Платеж по долгу: ${
              debtToUpdate.personName || "Неизвестно"
            } (${debtToUpdate.description || "Долг"})`;
          } else {
            transactionDescription = `Получение по долгу от: ${
              debtToUpdate.personName || "Неизвестно"
            } (${debtToUpdate.description || "Долг"})`;
          }
          if (paymentData.note) {
            transactionDescription += ` - ${paymentData.note}`;
          }
          const wallet = state.wallets.find(w => w.id === paymentData.walletId);
          if (!wallet) {
            // Wallet not found for debt payment transaction
            return {
              ...state,
              debts: updatedDebts.sort((a, b) =>
                a.dueDate && b.dueDate
                  ? parseISO(a.dueDate).getTime() -
                    parseISO(b.dueDate).getTime()
                  : a.dueDate
                  ? -1
                  : 1
              ),
            };
          }
          const amountInWalletCurrency = state.convertCurrency(
            actualPayment,
            debtToUpdate.currency,
            wallet.currency
          );
          const newTransaction: Transaction = {
            id: `tx_debt_pmt_${Date.now().toString()}`,
            walletId: paymentData.walletId || "",
            description: transactionDescription.trim(),
            amount: amountInWalletCurrency,
            type: transactionType,
            category: "other",
            date: paymentData.paymentDate || new Date().toISOString(),
            currency: debtToUpdate.currency || "RUB",
          };
          const updatedWallets = state.wallets.map(w => {
            if (w.id === paymentData.walletId) {
              return {
                ...w,
                balance:
                  transactionType === "income"
                    ? w.balance + amountInWalletCurrency
                    : w.balance - amountInWalletCurrency,
              };
            }
            return w;
          });
          return {
            debts: updatedDebts.sort((a, b) =>
              a.dueDate && b.dueDate
                ? parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime()
                : a.dueDate
                ? -1
                : 1
            ),
            transactions: [...state.transactions, newTransaction].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            ),
            wallets: updatedWallets,
          };
        });
      },
      deleteDebt: (debtId: string) => {
        set(state => ({
          debts: state.debts.filter(d => d.id !== debtId),
        }));
      },
      getDebtsIOwe: () =>
        get()
          .debts.filter(
            d =>
              d.type === "iOwe" &&
              d.status !== "paid" &&
              d.status !== "cancelled"
          )
          .sort((a, b) =>
            a.dueDate && b.dueDate
              ? parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime()
              : a.dueDate
              ? -1
              : 1
          ),
      getDebtsOwedToMe: () =>
        get()
          .debts.filter(
            d =>
              d.type === "owedToMe" &&
              d.status !== "paid" &&
              d.status !== "cancelled"
          )
          .sort((a, b) =>
            a.dueDate && b.dueDate
              ? parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime()
              : a.dueDate
              ? -1
              : 1
          ),
      addBudgetEntry: entryData => {
        get().addCustomTransactionCategory(entryData.category);
        set(state => {
          const nextDueDate = state.calculateNextDueDate(entryData);
          const newEntry: BudgetEntry = {
            ...entryData,
            id: `budget_${Date.now().toString()}`,
            nextDueDate,
            isActive: true,
            limit: entryData.limit,
          };
          return {
            budgetEntries: [...state.budgetEntries, newEntry].sort(
              (a, b) =>
                parseISO(a.nextDueDate || new Date().toISOString()).getTime() -
                parseISO(b.nextDueDate || new Date().toISOString()).getTime()
            ),
          };
        });
      },
      updateBudgetEntry: (entryId, updates) => {
        if (updates.category) {
          get().addCustomTransactionCategory(updates.category);
        }
        set(state => {
          const budgetEntries = state.budgetEntries.map(entry => {
            if (entry.id === entryId) {
              const updatedEntryBase = { ...entry, ...updates };
              const nextDueDate = state.calculateNextDueDate(updatedEntryBase);
              return { ...updatedEntryBase, nextDueDate, limit: updates.limit };
            }
            return entry;
          });
          return {
            budgetEntries: budgetEntries.sort(
              (a, b) =>
                parseISO(a.nextDueDate || new Date().toISOString()).getTime() -
                parseISO(b.nextDueDate || new Date().toISOString()).getTime()
            ),
          };
        });
      },
      deleteBudgetEntry: (entryId: string) => {
        set(state => ({
          budgetEntries: state.budgetEntries.filter(
            entry => entry.id !== entryId
          ),
        }));
      },
      getActualSpendingForBudget: (budgetEntry: BudgetEntry): number => {
        const { transactions, wallets, convertCurrency } = get();
        const today = new Date();
        const budgetMonthStart = startOfMonth(today);
        const spending = transactions
          .filter(
            tx =>
              tx.type === "expense" &&
              tx.category === budgetEntry.category &&
              isSameMonth(parseISO(tx.date), budgetMonthStart)
          )
          .reduce((sum, tx) => {
            const wallet = wallets.find(w => w.id === tx.walletId);
            if (wallet) {
              return (
                sum +
                convertCurrency(
                  tx.amount,
                  wallet.currency,
                  budgetEntry.currency
                )
              );
            }
            return sum;
          }, 0);
        return spending;
      },
      calculateCashflowForecast: (
        months: 1 | 3 | 6
      ): Array<{
        period: string;
        projectedBalance: number;
        incomeTransactions: number;
        expenseTransactions: number;
        budgetIncome: number;
        budgetExpense: number;
        netChange: number;
      }> => {
        const { wallets, transactions, budgetEntries, convertCurrency } = get();
        const today = new Date();
        let currentTotalBalance = wallets.reduce(
          (sum, w) => sum + convertCurrency(w.balance, w.currency, "RUB"), // або потрібна валюта
          0
        );
        const forecastPeriods = [];
        let totalNetLast3Months = 0;
        for (let i = 1; i <= 3; i++) {
          const monthToAnalyze = subMonths(today, i);
          const startOfAnalyzedMonth = startOfMonth(monthToAnalyze);
          const endOfAnalyzedMonth = endOfMonth(monthToAnalyze);
          const incomeThisMonth = transactions
            .filter(
              t =>
                t.type === "income" &&
                parseISO(t.date) >= startOfAnalyzedMonth &&
                parseISO(t.date) <= endOfAnalyzedMonth
            )
            .reduce((sum, t) => {
              const wallet = wallets.find(w => w.id === t.walletId);
              return (
                sum +
                (wallet ? convertCurrency(t.amount, wallet.currency, "RUB") : 0)
              );
            }, 0);
          const expensesThisMonth = transactions
            .filter(
              t =>
                t.type === "expense" &&
                parseISO(t.date) >= startOfAnalyzedMonth &&
                parseISO(t.date) <= endOfAnalyzedMonth
            )
            .reduce((sum, t) => {
              const wallet = wallets.find(w => w.id === t.walletId);
              return (
                sum +
                (wallet ? convertCurrency(t.amount, wallet.currency, "RUB") : 0)
              );
            }, 0);
          totalNetLast3Months += incomeThisMonth - expensesThisMonth;
        }
        const averageMonthlyNetFromTransactions = totalNetLast3Months / 3;
        for (let i = 1; i <= months; i++) {
          const forecastMonthStart = startOfMonth(addMonths(today, i - 1));
          if (i > 1 || !isSameMonth(today, forecastMonthStart)) {
            currentTotalBalance += averageMonthlyNetFromTransactions;
          }
          let upcomingBudgetIncome = 0;
          let upcomingBudgetExpenses = 0;
          budgetEntries.forEach(entry => {
            if (entry.isActive && entry.frequency === "monthly") {
              const nextDueDate = parseISO(
                entry.nextDueDate || new Date().toISOString()
              );
              let tempNextDueDate = nextDueDate;
              while (tempNextDueDate < forecastMonthStart) {
                tempNextDueDate = addMonths(tempNextDueDate, 1);
              }
              if (isSameMonth(tempNextDueDate, forecastMonthStart)) {
                const amountInPrimary = convertCurrency(
                  entry.amount,
                  entry.currency,
                  "RUB"
                );
                if (entry.type === "income") {
                  upcomingBudgetIncome += amountInPrimary;
                } else {
                  upcomingBudgetExpenses += amountInPrimary;
                }
              }
            } else if (
              entry.isActive &&
              entry.frequency === "once" &&
              isSameMonth(
                parseISO(entry.nextDueDate || new Date().toISOString()),
                forecastMonthStart
              )
            ) {
              const amountInPrimary = convertCurrency(
                entry.amount,
                entry.currency,
                "RUB"
              );
              if (entry.type === "income") {
                upcomingBudgetIncome += amountInPrimary;
              } else {
                upcomingBudgetExpenses += amountInPrimary;
              }
            }
          });
          currentTotalBalance += upcomingBudgetIncome;
          currentTotalBalance -= upcomingBudgetExpenses;
          const netChangeForPeriod =
            (i === 1 && isSameMonth(today, forecastMonthStart)
              ? 0
              : averageMonthlyNetFromTransactions) +
            upcomingBudgetIncome -
            upcomingBudgetExpenses;
          forecastPeriods.push({
            period: format(forecastMonthStart, "LLLL yyyy", { locale: ru }),
            projectedBalance: currentTotalBalance,
            incomeTransactions:
              i === 1 && isSameMonth(today, forecastMonthStart)
                ? 0
                : averageMonthlyNetFromTransactions > 0
                ? averageMonthlyNetFromTransactions
                : 0,
            expenseTransactions:
              i === 1 && isSameMonth(today, forecastMonthStart)
                ? 0
                : averageMonthlyNetFromTransactions < 0
                ? Math.abs(averageMonthlyNetFromTransactions)
                : 0,
            budgetIncome: upcomingBudgetIncome,
            budgetExpense: upcomingBudgetExpenses,
            netChange: netChangeForPeriod,
          });
        }
        return forecastPeriods;
      },
      addInvestmentCase: caseData => {
        set(state => {
          const newCase: InvestmentCase = {
            ...caseData,
            id: `invcase_${Date.now().toString()}`,
            createdAt: new Date().toISOString(),
            assets: [],
          };
          return { investmentCases: [...state.investmentCases, newCase] };
        });
      },
      updateInvestmentCase: (caseId, updates) => {
        set(state => ({
          investmentCases: state.investmentCases.map(c =>
            c.id === caseId ? { ...c, ...updates } : c
          ),
        }));
      },
      deleteInvestmentCase: caseId => {
        set(state => ({
          investmentCases: state.investmentCases.filter(c => c.id !== caseId),
        }));
      },
      addAssetToCase: (caseId, assetData) => {
        set(state => ({
          investmentCases: state.investmentCases.map(c => {
            if (c.id === caseId) {
              const newAsset: InvestmentAsset = {
                ...assetData,
                id: `invasset_${Date.now().toString()}`,
                currentPrice: assetData.purchasePrice || 0,
              };
              return { ...c, assets: [...c.assets, newAsset] };
            }
            return c;
          }),
        }));
      },
      updateAssetInCase: (caseId, assetId, updates) => {
        set(state => ({
          investmentCases: state.investmentCases.map(c => {
            if (c.id === caseId) {
              return {
                ...c,
                assets: c.assets.map(a =>
                  a.id === assetId ? { ...a, ...updates } : a
                ),
              };
            }
            return c;
          }),
        }));
      },
      removeAssetFromCase: (caseId, assetId) => {
        set(state => ({
          investmentCases: state.investmentCases.map(c => {
            if (c.id === caseId) {
              return { ...c, assets: c.assets.filter(a => a.id !== assetId) };
            }
            return c;
          }),
        }));
      },
      getInvestmentAssetTypeDistribution: () => {
        const { investmentCases, primaryDisplayCurrency, convertCurrency } =
          get();
        const typeTotals: { [key in InvestmentAssetType]?: number } = {};
        investmentCases.forEach(c => {
          c.assets.forEach(asset => {
            const valueInPrimary = convertCurrency(
              asset.currentPrice * asset.quantity,
              asset.currency,
              primaryDisplayCurrency
            );
            typeTotals[asset.type] =
              (typeTotals[asset.type] || 0) + valueInPrimary;
          });
        });
        const chartColors = [
          "hsl(var(--chart-1))",
          "hsl(var(--chart-2))",
          "hsl(var(--chart-3))",
          "hsl(var(--chart-4))",
          "hsl(var(--chart-5))",
          "hsl(var(--primary)/0.7)",
        ];
        return Object.entries(typeTotals)
          .map(([typeKey, total], index) => ({
            originalName: typeKey as InvestmentAssetType,
            name:
              INVESTMENT_ASSET_TYPE_LABELS[typeKey as InvestmentAssetType] ||
              typeKey,
            value: parseFloat(total!.toFixed(2)),
            fill: chartColors[index % chartColors.length],
          }))
          .filter(item => item.value > 0)
          .sort((a, b) => b.value - a.value);
      },
      getInvestmentRegionDistribution: () => {
        const { investmentCases, primaryDisplayCurrency, convertCurrency } =
          get();
        const regionTotals: { [key in InvestmentAssetRegion]?: number } = {};
        let unassignedTotal = 0;
        investmentCases.forEach(c => {
          c.assets.forEach(asset => {
            const valueInPrimary = convertCurrency(
              asset.currentPrice * asset.quantity,
              asset.currency,
              primaryDisplayCurrency
            );
            if (asset.region) {
              regionTotals[asset.region] =
                (regionTotals[asset.region] || 0) + valueInPrimary;
            } else {
              unassignedTotal += valueInPrimary;
            }
          });
        });
        const chartColors = [
          "hsl(var(--chart-1))",
          "hsl(var(--chart-2))",
          "hsl(var(--chart-3))",
          "hsl(var(--chart-4))",
          "hsl(var(--chart-5))",
          "hsl(var(--primary)/0.7)",
          "hsl(var(--secondary))",
        ];
        const regionData = Object.entries(regionTotals)
          .map(([regionKey, total], index) => ({
            originalName: regionKey as InvestmentAssetRegion,
            name:
              INVESTMENT_ASSET_REGION_LABELS[
                regionKey as InvestmentAssetRegion
              ] || regionKey,
            value: parseFloat(total!.toFixed(2)),
            fill: chartColors[index % chartColors.length],
          }))
          .filter(item => item.value > 0)
          .sort((a, b) => b.value - a.value);
        if (unassignedTotal > 0) {
          regionData.push({
            originalName: "Other" as InvestmentAssetRegion,
            name: "Не указан",
            value: parseFloat(unassignedTotal.toFixed(2)),
            fill: chartColors[regionData.length % chartColors.length],
          });
        }
        return regionData;
      },
      // Calendar Notes Implementation
      addCalendarNote: noteData =>
        set(state => {
          const newNote: CalendarNote = {
            ...noteData,
            id: `note_${Date.now().toString()}`,
            isCompleted: false,
          };
          return {
            calendarNotes: [...state.calendarNotes, newNote].sort(
              (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
            ),
          };
        }),
      updateCalendarNote: (noteId, updates) =>
        set(state => ({
          calendarNotes: state.calendarNotes
            .map(note => (note.id === noteId ? { ...note, ...updates } : note))
            .sort(
              (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
            ),
        })),
      deleteCalendarNote: noteId =>
        set(state => ({
          calendarNotes: state.calendarNotes.filter(note => note.id !== noteId),
        })),
      updateWallet: (walletId, updates) => {
        set(state => ({
          wallets: state.wallets.map(w =>
            w.id === walletId ? { ...w, ...updates } : w
          ),
        }));
      },
      deleteWallet: walletId => {
        set(state => ({
          wallets: state.wallets.filter(w => w.id !== walletId),
          // Також можна видалити всі транзакції, пов'язані з цим гаманцем, якщо потрібно:
          transactions: state.transactions.filter(t => t.walletId !== walletId),
        }));
      },
      reorderWallets: newOrder => {
        set(state => ({
          wallets: newOrder
            .map(id => state.wallets.find(w => w.id === id)!)
            .filter(Boolean),
        }));
      },
    }),
    {
      name: "monifly-storage-v22",
      storage: createJSONStorage(() => localStorage),
      version: 22,
      partialize: state =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !["isAppUnlocked"].includes(key)
          )
        ),
      migrate: (persistedState: unknown, version) => {
        const state = persistedState as Partial<BudgetState> &
          Record<string, unknown>;
        if (version < 22) {
          state.subscriptionStatus = "free";
          state.subscriptionRenewalDate = undefined;
        }
        if (version < 21 && state.userProfile) {
          state.userProfile.appPin = undefined;
        }
        if (version < 20 && state) {
          state.calendarNotes = [];
        }
        if (version < 19 && state) {
          state.customTransactionCategories = [];
        }
        if (version < 18 && state && state.wallets) {
          state.wallets.forEach((wallet: Wallet) => {
            if (!wallet.icon) {
              wallet.icon = "Landmark"; // Assign a default icon
            }
          });
        }
        if (version < 3 && state && !state.financialGoals) {
          state.financialGoals = [];
        }
        if (version < 5) {
          if (!state.primaryDisplayCurrency) {
            state.primaryDisplayCurrency = "RUB";
          }
          if (!state.filterPeriod) {
            state.filterPeriod = "currentMonth";
          }
          if (
            state.financialGoals &&
            state.financialGoals.length > 0 &&
            !state.financialGoals[0].monthlyContribution
          ) {
            state.financialGoals = state.financialGoals.map(
              (goal: FinancialGoal) => ({
                ...goal,
                monthlyContribution: goal.monthlyContribution || 0,
              })
            );
          }
        }
        if (version < 6 && state) {
          state.debts = state.debts || [];
        }
        if (version < 7 && state) {
          state.budgetEntries = state.budgetEntries || [];
          if (
            state.budgetEntries.length > 0 &&
            typeof state.calculateNextDueDate === "function"
          ) {
            state.budgetEntries = state.budgetEntries
              .map((entry: BudgetEntry) => ({
                ...entry,
                isActive: entry.isActive === undefined ? true : entry.isActive,
                nextDueDate:
                  state.calculateNextDueDate!(entry) ||
                  new Date().toISOString(),
              }))
              .sort(
                (a: BudgetEntry, b: BudgetEntry) =>
                  parseISO(
                    a.nextDueDate || new Date().toISOString()
                  ).getTime() -
                  parseISO(b.nextDueDate || new Date().toISOString()).getTime()
              );
          }
        }
        if (version < 8 && state) {
          state.investmentCases = state.investmentCases || [];
        }
        if (version < 9 && state && state.investmentCases) {
          state.investmentCases = state.investmentCases.map(
            (icase: InvestmentCase) => ({
              ...icase,
              assets: icase.assets.map((asset: InvestmentAsset) => ({
                ...asset,
                region: asset.region || undefined,
              })),
            })
          );
        }
        if (version < 10 && state && state.budgetEntries) {
          state.budgetEntries = state.budgetEntries.map(
            (entry: BudgetEntry) => ({
              ...entry,
              limit: entry.limit === undefined ? undefined : entry.limit,
            })
          );
        }
        if (version < 12 && state && state.debts) {
          state.debts = state.debts.map((debt: Debt) => ({
            ...debt,
            initialWalletId: debt.initialWalletId || undefined,
          }));
        }
        if (version < 13 && state && !state.MOCK_RATES) {
          state.MOCK_RATES = MOCK_RATES_DATA;
        }
        if (version < 14 && state && !state.language) {
          state.language = "ru";
        }
        if (version < 15 && state && state.cryptoHoldings) {
          state.cryptoHoldings = state.cryptoHoldings.map(
            (ch: CryptoHolding) => ({
              ...ch,
              purchaseCurrency: ch.purchaseCurrency || "USD",
            })
          );
        }
        if (version < 16 && state) {
          if (state.userAvatar !== undefined) {
            state.userProfile = {
              id: "user_1",
              name: "User Monifly",
              firstName: "User",
              lastName: "Monifly",
              email: "user@example.com",
              avatarDataUrl:
                typeof state.userAvatar === "string" && state.userAvatar !== ""
                  ? state.userAvatar
                  : undefined,
              isTwoFactorEnabled: false,
              currency: "RUB",
              language: "ru",
            };
            delete state.userAvatar;
          } else if (!state.userProfile) {
            state.userProfile = {
              id: "user_1",
              name: "User Monifly",
              firstName: "User",
              lastName: "Monifly",
              email: "user@example.com",
              avatarDataUrl: undefined,
              isTwoFactorEnabled: false,
              currency: "RUB",
              language: "ru",
            };
          } else if (
            state.userProfile &&
            state.userProfile.isTwoFactorEnabled === undefined
          ) {
            state.userProfile.isTwoFactorEnabled = false;
          }
        }
        if (
          version < 17 &&
          state.userProfile &&
          state.userProfile.isTwoFactorEnabled === undefined
        ) {
          state.userProfile.isTwoFactorEnabled = false;
        }
        return state as BudgetState;
      },
      onRehydrateStorage: state => {
        if (state) {
          state.isAppUnlocked = false; // Always start in a locked state
          state.MOCK_RATES = MOCK_RATES_DATA;
          if (!state.language) {
            state.language = "ru";
          }
          if (!state.userProfile) {
            state.userProfile = {
              id: "user_1",
              name: "User Monifly",
              firstName: "User",
              lastName: "Monifly",
              email: "user@example.com",
              avatarDataUrl: undefined,
              isTwoFactorEnabled: false,
              appPin: undefined,
              currency: "RUB",
              language: "ru",
            };
          } else {
            if (state.userProfile.isTwoFactorEnabled === undefined) {
              state.userProfile.isTwoFactorEnabled = false;
            }
            if (state.userProfile.appPin === undefined) {
              state.userProfile.appPin = undefined;
            }
          }
          if (!state.calendarNotes) {
            state.calendarNotes = [];
          }
          if (!state.subscriptionStatus) {
            state.subscriptionStatus = "free";
          }
          if (!state.subscriptionRenewalDate) {
            state.subscriptionRenewalDate = undefined;
          }
        }
      },
    }
  )
);
