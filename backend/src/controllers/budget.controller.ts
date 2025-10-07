import { Response, NextFunction } from "express";
import { getPrismaClient } from "../database/connection";
import { ResponseUtil } from "../utils/response";
import { AppError } from "../middleware/error.middleware";
import { AuthRequest } from "../middleware/auth.middleware";

const prisma = getPrismaClient();

export class BudgetController {
  // Get all budget categories for user
  static async getAll(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { period } = req.query;

      const budgets = await prisma.budgetCategory.findMany({
        where: {
          userId: req.userId!,
          isActive: true,
          ...(period && { period: period as string }),
        },
        orderBy: [{ createdAt: "desc" }],
      });

      return ResponseUtil.success(res, budgets);
    } catch (error) {
      next(error);
    }
  }

  // Get single budget category
  static async getOne(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;

      const budget = await prisma.budgetCategory.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
      });

      if (!budget) {
        throw new AppError("Budget category not found", 404);
      }

      return ResponseUtil.success(res, budget);
    } catch (error) {
      next(error);
    }
  }

  // Create budget category
  static async create(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { name, type, category, limit, period, color, icon } = req.body;

      const budget = await prisma.budgetCategory.create({
        data: {
          userId: req.userId!,
          name,
          type,
          category,
          limit: limit || null,
          period: period || "monthly",
          color,
          icon,
        },
      });

      return ResponseUtil.created(
        res,
        budget,
        "Budget category created successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Update budget category
  static async update(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;
      const { name, type, category, limit, period, color, icon, spent } =
        req.body;

      const existingBudget = await prisma.budgetCategory.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
      });

      if (!existingBudget) {
        throw new AppError("Budget category not found", 404);
      }

      const updatedBudget = await prisma.budgetCategory.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(type !== undefined && { type }),
          ...(category !== undefined && { category }),
          ...(limit !== undefined && { limit }),
          ...(period !== undefined && { period }),
          ...(color !== undefined && { color }),
          ...(icon !== undefined && { icon }),
          ...(spent !== undefined && { spent }),
        },
      });

      return ResponseUtil.success(
        res,
        updatedBudget,
        "Budget category updated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Delete budget category
  static async delete(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;

      const existingBudget = await prisma.budgetCategory.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
      });

      if (!existingBudget) {
        throw new AppError("Budget category not found", 404);
      }

      // Soft delete
      await prisma.budgetCategory.update({
        where: { id },
        data: { isActive: false },
      });

      return ResponseUtil.success(
        res,
        null,
        "Budget category deleted successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Get budget overview for current period
  static async getOverview(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { period = "monthly" } = req.query;

      const budgets = await prisma.budgetCategory.findMany({
        where: {
          userId: req.userId!,
          isActive: true,
          period: period as string,
        },
      });

      const totalBudget = budgets.reduce((sum, b) => sum + (b.limit || 0), 0);
      const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
      const remaining = totalBudget - totalSpent;

      const overview = {
        period,
        totalBudget,
        totalSpent,
        remaining,
        percentageUsed: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
        budgets: budgets.map(budget => ({
          ...budget,
          percentageUsed:
            budget.limit && budget.limit > 0
              ? (budget.spent / budget.limit) * 100
              : 0,
          remaining: (budget.limit || 0) - budget.spent,
        })),
      };

      return ResponseUtil.success(res, overview);
    } catch (error) {
      next(error);
    }
  }

  // Update spent amount for budget category
  static async updateSpent(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;
      const { amount } = req.body;

      const existingBudget = await prisma.budgetCategory.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
      });

      if (!existingBudget) {
        throw new AppError("Budget category not found", 404);
      }

      const updatedBudget = await prisma.budgetCategory.update({
        where: { id },
        data: {
          spent: amount,
        },
      });

      return ResponseUtil.success(
        res,
        updatedBudget,
        "Budget spent amount updated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Reset budget spent amounts for new period
  static async resetPeriod(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { period = "monthly" } = req.body;

      await prisma.budgetCategory.updateMany({
        where: {
          userId: req.userId!,
          period: period as string,
          isActive: true,
        },
        data: {
          spent: 0,
        },
      });

      return ResponseUtil.success(
        res,
        null,
        "Budget period reset successfully"
      );
    } catch (error) {
      next(error);
    }
  }
}
