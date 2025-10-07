// Milestone types
export const MILESTONE_CATEGORIES = [
  "career",
  "family",
  "health",
  "education",
  "travel",
  "other",
] as const;

export type MilestoneCategory = (typeof MILESTONE_CATEGORIES)[number];

export type ReminderFrequency =
  | "once"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly";

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  targetDate: string;
  isDismissed: boolean;
  frequency?: ReminderFrequency;
  type?: string;
  milestoneId?: string; // Замість linkedEntryId
  priority?: "low" | "medium" | "high";
}

export interface PersonalMilestone {
  id: string;
  title: string;
  category: MilestoneCategory;
  isCompleted: boolean;
  reminders: Reminder[];
  imageUrl?: string;
  description?: string;
  targetDate?: string;
  month?: number;
  day?: number;
}

// Financial Goals types
export interface FinancialGoal {
  id: string;
  type: "income" | "expense" | "investment" | "saving";
  amount: number;
  currency: string;
  title: string;
  description?: string;
  monthlyContribution?: number;
  targetDate?: string;
  projectedCompletionDate?: string;
  isRecurring: boolean;
  monthlyExpenses?: number;
  monthlyIncome?: number;
  imageUrl?: string;
  targetAmount?: number;
  status?: string; // Додаємо відсутню властивість
  targetCurrency?: string; // Додаємо відсутню властивість
  name?: string; // Додаємо відсутню властивість
  investments?: {
    type: string;
    amount: number;
    expectedReturn: number;
  }[];
}

// Smart Goal Creator Input types
export interface SmartGoalCreatorInput {
  currentIncome: number;
  currentExpenses: number;
  age: number;
  desiredGoals: string[];
  riskTolerance: "low" | "medium" | "high";
  timeHorizon: number;
  currency: string;
  userInput: string; // Робимо обов'язковим
}

// Smart Goal Creator Output types
export interface SmartGoalCreatorOutput {
  goals: FinancialGoal[];
  recommendations: string[];
  timeline: string;
  priority: "low" | "medium" | "high";
  targetAmount: number;
  totalProjectedSavings: number;
}

// Life Calendar types
export interface LifeCalendarEntry {
  year: number;
  age: number;
  status: "empty" | "in_progress" | "completed";
  personalMilestones: PersonalMilestone[];
  financialGoals: FinancialGoal[];
  notes: string;
}

export interface NotificationSettings {
  enabled: boolean;
  reviewFrequency: "daily" | "weekly" | "monthly";
  reminderTime: string;
  browser: boolean;
  email: boolean;
  emailAddress?: string;
  browserNotifications?: boolean;
}

export interface LifeCalendarSettings {
  currentAge: number;
  targetAge: number;
  notifications: NotificationSettings;
  defaultCurrency?: string;
}

// Future Vision types
export interface FutureVision {
  targetAge: number;
  occupation: string;
  expectedAssets: number;
  happinessScore: number;
  lifestyle: string;
  legacyGoals: string[];
  defaultCurrency?: string;
}

// Budget types
export type BudgetFrequency = "monthly" | "once";

export interface BudgetEntry {
  id: string;
  description: string;
  amount: number;
  currency: string;
  type: TransactionType;
  category: string;
  frequency: BudgetFrequency;
  startDate: string;
  nextDueDate?: string;
  dayOfMonth?: number;
  limit?: number;
  isActive: boolean;
  isDefault?: boolean; // Додаємо відсутню властивість
  walletId?: string; // Додаємо відсутню властивість
}

// Transaction types
export type TransactionType = "income" | "expense";

export const TRANSACTION_CATEGORIES = [
  "other",
  "salary",
  "business",
  "investment",
  "rent",
  "utilities",
  "groceries",
  "transport",
  "entertainment",
  "healthcare",
  "education",
  "shopping",
  "travel",
  "crypto",
] as const;

export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];

export const TRANSACTION_CATEGORY_LABELS: Record<TransactionCategory, string> =
  {
    other: "Інше",
    salary: "Зарплата",
    business: "Бізнес",
    investment: "Інвестиції",
    rent: "Оренда",
    utilities: "Комунальні послуги",
    groceries: "Продукти",
    transport: "Транспорт",
    entertainment: "Розваги",
    healthcare: "Охорона здоров'я",
    education: "Освіта",
    shopping: "Покупки",
    travel: "Подорожі",
    crypto: "Криптовалюта",
  };

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  type: TransactionType;
  category: TransactionCategory;
  walletId: string;
  notes?: string;
}

// Wallet types
export interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency: string;
  isDefault: boolean;
  icon?: string;
  color?: string;
}

// Investment types
export const INVESTMENT_ASSET_TYPES = [
  "stocks",
  "bonds",
  "realEstate",
  "crypto",
  "other",
] as const;

export type InvestmentAssetType = (typeof INVESTMENT_ASSET_TYPES)[number];

export const INVESTMENT_ASSET_TYPE_LABELS: Record<InvestmentAssetType, string> =
  {
    stocks: "Акції",
    bonds: "Облігації",
    realEstate: "Нерухомість",
    crypto: "Криптовалюта",
    other: "Інше",
  };

export const INVESTMENT_ASSET_REGIONS = [
  "global",
  "us",
  "europe",
  "asia",
  "other",
] as const;

export type InvestmentAssetRegion = (typeof INVESTMENT_ASSET_REGIONS)[number];

export const INVESTMENT_ASSET_REGION_LABELS: Record<
  InvestmentAssetRegion,
  string
> = {
  global: "Глобальний",
  us: "США",
  europe: "Європа",
  asia: "Азія",
  other: "Інше",
};

export interface InvestmentAsset {
  id: string;
  name: string;
  type: InvestmentAssetType;
  region?: InvestmentAssetRegion;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  currency: string;
  purchaseDate: string;
  notes?: string;
}

export type NewInvestmentAssetData = Omit<
  InvestmentAsset,
  "id" | "currentPrice"
>;

// Calendar Note types
export interface CalendarNote {
  id: string;
  year: number;
  title: string;
  description?: string;
  date: string;
  type: "reminder" | "milestone" | "goal" | "note";
  isCompleted?: boolean;
}

// Додаємо типи для боргів
export type DebtType =
  | "personal"
  | "credit_card"
  | "loan"
  | "mortgage"
  | "other"
  | "iOwe"
  | "owedToMe";

export interface Debt {
  id: string;
  title: string;
  amount: number;
  currency: string;
  type: DebtType;
  interestRate: number;
  startDate: string;
  dueDate: string;
  description?: string;
  isActive: boolean;
  status?: "pending" | "partiallyPaid" | "paid" | "cancelled";
  initialAmount?: number;
  paidAmount?: number;
  personName?: string;
  initialWalletId?: string;
  createdAt?: string; // Додаємо відсутню властивість
}

// NewDebtData використовується для створення нового боргу без id,
// забезпечуючи типобезпеку при створенні боргу
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NewDebtData extends Omit<Debt, "id"> {
  // Використовуємо Omit для створення типу без id
}

export interface DebtPaymentData {
  id: string;
  debtId: string;
  amount: number;
  currency: string;
  date: string;
  description?: string;
  note?: string;
  paymentAmount?: number;
  paymentDate?: string;
  walletId?: string;
}

// Додаємо тип для оновлення транзакції
export interface TransactionUpdatePayload {
  id: string;
  description?: string;
  amount?: number;
  category?: TransactionCategory;
  date?: string;
  type?: TransactionType;
  walletId?: string;
  currency?: string;
  notes?: string;
}

// Додаємо тип для локалізації
export type Locale = "en" | "uk" | "ru" | "de" | "es" | "fr";

// Додаємо відсутні типи

export interface CryptoHolding {
  id: string;
  name: string;
  symbol: string;
  amount: number;
  currentPrice: number;
  currency: string;
  purchaseDate: string;
  asset: string; // Додаємо відсутню властивість
  purchasePrice: number; // Додаємо відсутню властивість
  purchaseCurrency: string; // Додаємо відсутню властивість
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NewBudgetEntryData extends Omit<BudgetEntry, "id"> {
  // Використовуємо Omit для створення типу без id
}

export interface InvestmentCase {
  id: string;
  title: string;
  description?: string;
  assets: InvestmentAsset[];
  totalInvestment: number;
  currency: string;
  startDate: string;
  name?: string; // Додаємо відсутню властивість
  createdAt?: string; // Додаємо відсутню властивість
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NewInvestmentCaseData extends Omit<InvestmentCase, "id"> {
  // Використовуємо Omit для створення типу без id
}

export interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  amount: number;
  currentPrice: number;
  purchasePrice: number;
  currency: string;
  purchaseDate: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  currency: string;
  language: Locale;
  firstName?: string; // Додаємо відсутню властивість
  appPin?: string; // Додаємо відсутню властивість
  isTwoFactorEnabled?: boolean; // Додаємо відсутню властивість
  avatarDataUrl?: string; // Додаємо відсутню властивість
  lastName?: string; // Додаємо відсутню властивість
}

export type WalletIconName =
  | "Landmark"
  | "Banknote"
  | "Bitcoin"
  | "CreditCard"
  | "Wallet"
  | "PiggyBank"
  | "Coins"
  | "Gem"
  | "Briefcase"; // Додаємо відсутні іконки

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NewCalendarNoteData extends Omit<CalendarNote, "id"> {
  // Використовуємо Omit для створення типу без id
}

export type SubscriptionStatus =
  | "active"
  | "trial"
  | "expired"
  | "cancelled"
  | "free"
  | "pro_monthly"
  | "pro_yearly";

// AI Flow types
export interface CryptoPortfolioInsightsInput {
  holdings: CryptoHolding[];
  timeRange: string;
  currency: string;
  portfolioDescription: string; // Робимо обов'язковим
  marketSentiment: string; // Робимо обов'язковим
}

export interface CryptoPortfolioInsightsOutput {
  insights: string[];
  recommendations: string[];
  riskAssessment: string;
}

export interface InvestmentPortfolioAdviceInput {
  assets: InvestmentAsset[];
  riskTolerance: string;
  timeHorizon: number;
  currency: string;
  portfolioSummary: string; // Робимо обов'язковим
}

export interface InvestmentPortfolioAdviceOutput {
  advice: string[];
  recommendations: string[];
  riskAssessment: string;
}
