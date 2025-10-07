import { Response, NextFunction } from "express";
import { getPrismaClient } from "../database/connection";
import { ResponseUtil } from "../utils/response";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  subMonths,
  format,
} from "date-fns";

const prisma = getPrismaClient();

export class AnalyticsController {
  // Get overview analytics
  static async getOverview(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      // Get transactions for current month
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: req.userId!,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      // Calculate totals
      const income = transactions
        .filter((t: any) => t.type === "income")
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      const expenses = transactions
        .filter((t: any) => t.type === "expense")
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      const balance = income - expenses;
      const savingsRate = income > 0 ? (balance / income) * 100 : 0;

      // Get wallets balance
      const wallets = await prisma.wallet.findMany({
        where: {
          userId: req.userId!,
          isActive: true,
        },
      });

      const totalWalletBalance = wallets.reduce(
        (sum: number, w: any) => sum + w.balance,
        0
      );

      // Get active goals
      const goals = await prisma.financialGoal.findMany({
        where: {
          userId: req.userId!,
          status: "active",
        },
      });

      const totalGoalsProgress =
        goals.length > 0
          ? goals.reduce(
              (sum: number, g: any) =>
                sum + (g.currentAmount / g.targetAmount) * 100,
              0
            ) / goals.length
          : 0;

      // Get active debts
      const debts = await prisma.debt.findMany({
        where: {
          userId: req.userId!,
          isActive: true,
        },
      });

      const totalDebt = debts.reduce(
        (sum: number, d: any) => sum + (d.initialAmount - d.paidAmount),
        0
      );

      return ResponseUtil.success(res, {
        currentMonth: {
          income,
          expenses,
          balance,
          savingsRate,
          transactionsCount: transactions.length,
        },
        wealth: {
          totalWalletBalance,
          totalDebt,
          netWorth: totalWalletBalance - totalDebt,
        },
        goals: {
          active: goals.length,
          averageProgress: totalGoalsProgress,
        },
        debts: {
          active: debts.length,
          totalRemaining: totalDebt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get income/expense analytics
  static async getIncomeExpense(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { period = "year", months = 12 } = req.query;

      const now = new Date();
      const startDate =
        period === "year"
          ? startOfYear(now)
          : subMonths(now, Number(months) - 1);

      const transactions = await prisma.transaction.findMany({
        where: {
          userId: req.userId!,
          date: {
            gte: startDate,
          },
        },
        orderBy: { date: "asc" },
      });

      // Group by month
      const monthlyData: Record<
        string,
        { income: number; expense: number; balance: number }
      > = {};

      transactions.forEach((transaction: any) => {
        const monthKey = format(new Date(transaction.date), "yyyy-MM");

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { income: 0, expense: 0, balance: 0 };
        }

        if (transaction.type === "income") {
          monthlyData[monthKey].income += transaction.amount;
        } else if (transaction.type === "expense") {
          monthlyData[monthKey].expense += transaction.amount;
        }
      });

      // Calculate balance for each month
      Object.keys(monthlyData).forEach((month: string) => {
        monthlyData[month].balance =
          monthlyData[month].income - monthlyData[month].expense;
      });

      // Group by category
      const incomeByCategory: Record<string, number> = {};
      const expenseByCategory: Record<string, number> = {};

      transactions.forEach((t: any) => {
        if (t.type === "income") {
          incomeByCategory[t.category] =
            (incomeByCategory[t.category] || 0) + t.amount;
        } else if (t.type === "expense") {
          expenseByCategory[t.category] =
            (expenseByCategory[t.category] || 0) + t.amount;
        }
      });

      return ResponseUtil.success(res, {
        monthlyData,
        incomeByCategory,
        expenseByCategory,
        period: {
          start: format(startDate, "yyyy-MM-dd"),
          end: format(now, "yyyy-MM-dd"),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get net worth over time
  static async getNetWorth(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { months = 12 } = req.query;

      const now = new Date();
      const startDate = subMonths(now, Number(months) - 1);

      // Get all transactions since start date
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: req.userId!,
          date: {
            gte: startDate,
          },
        },
        orderBy: { date: "asc" },
      });

      // Get current balances
      const wallets = await prisma.wallet.findMany({
        where: {
          userId: req.userId!,
          isActive: true,
        },
      });

      const currentBalance = wallets.reduce(
        (sum: number, w: any) => sum + w.balance,
        0
      );

      // Calculate net worth for each month
      const monthlyNetWorth: Record<string, number> = {};
      let runningBalance = currentBalance;

      // Work backwards from current month
      for (let i = 0; i < Number(months); i++) {
        const monthDate = subMonths(now, i);
        const monthKey = format(monthDate, "yyyy-MM");
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);

        if (i === 0) {
          // Current month - use actual balance
          monthlyNetWorth[monthKey] = currentBalance;
        } else {
          // Previous months - calculate from transactions
          const monthTransactions = transactions.filter((t: any) => {
            const tDate = new Date(t.date);
            return tDate >= monthStart && tDate <= monthEnd;
          });

          const monthIncome = monthTransactions
            .filter((t: any) => t.type === "income")
            .reduce((sum: number, t: any) => sum + t.amount, 0);

          const monthExpense = monthTransactions
            .filter((t: any) => t.type === "expense")
            .reduce((sum: number, t: any) => sum + t.amount, 0);

          runningBalance = runningBalance - (monthIncome - monthExpense);
          monthlyNetWorth[monthKey] = runningBalance;
        }
      }

      // Sort by date
      const sortedData = Object.keys(monthlyNetWorth)
        .sort()
        .map((month: any) => ({
          month,
          netWorth: monthlyNetWorth[month],
        }));

      return ResponseUtil.success(res, {
        data: sortedData,
        currentNetWorth: currentBalance,
        period: {
          start: format(startDate, "yyyy-MM-dd"),
          end: format(now, "yyyy-MM-dd"),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get spending by category
  static async getSpendingByCategory(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { period = "month" } = req.query;

      let startDate: Date;
      const endDate = new Date();

      if (period === "month") {
        startDate = startOfMonth(endDate);
      } else if (period === "year") {
        startDate = startOfYear(endDate);
      } else {
        startDate = subMonths(endDate, 6); // Default 6 months
      }

      const transactions = await prisma.transaction.findMany({
        where: {
          userId: req.userId!,
          type: "expense",
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const byCategory: Record<
        string,
        { amount: number; count: number; percentage: number }
      > = {};
      let total = 0;

      transactions.forEach((t: any) => {
        if (!byCategory[t.category]) {
          byCategory[t.category] = { amount: 0, count: 0, percentage: 0 };
        }
        byCategory[t.category].amount += t.amount;
        byCategory[t.category].count += 1;
        total += t.amount;
      });

      // Calculate percentages
      Object.keys(byCategory).forEach((category: any) => {
        byCategory[category].percentage =
          (byCategory[category].amount / total) * 100;
      });

      // Sort by amount
      const sorted = Object.entries(byCategory)
        .map(([category, data]) => ({ category, ...data }))
        .sort((a, b) => b.amount - a.amount);

      return ResponseUtil.success(res, {
        categories: sorted,
        total,
        period: {
          start: format(startDate, "yyyy-MM-dd"),
          end: format(endDate, "yyyy-MM-dd"),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get budget vs actual
  static async getBudgetVsActual(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      // Get budget categories
      const budgets = await prisma.budgetCategory.findMany({
        where: {
          userId: req.userId!,
          isActive: true,
        },
      });

      // Get actual spending for current month
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: req.userId!,
          type: "expense",
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      const actualByCategory: Record<string, number> = {};
      transactions.forEach((t: any) => {
        actualByCategory[t.category] =
          (actualByCategory[t.category] || 0) + t.amount;
      });

      const comparison = budgets.map((budget: any) => {
        const actual = actualByCategory[budget.category] || 0;
        const difference = (budget.limit || 0) - actual;
        const percentage = budget.limit ? (actual / budget.limit) * 100 : 0;

        return {
          category: budget.category,
          budgeted: budget.limit || 0,
          actual,
          difference,
          percentage,
          status:
            percentage > 100 ? "over" : percentage > 80 ? "warning" : "good",
        };
      });

      return ResponseUtil.success(res, {
        comparison,
        month: format(now, "yyyy-MM"),
      });
    } catch (error) {
      next(error);
    }
  }
}
