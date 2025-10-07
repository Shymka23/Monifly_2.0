import { Response, NextFunction } from "express";
import { getPrismaClient } from "../database/connection";
import { ResponseUtil } from "../utils/response";
import { AppError } from "../middleware/error.middleware";
import { AuthRequest } from "../middleware/auth.middleware";

const prisma = getPrismaClient();

export class GoalController {
  // Get all goals
  static async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { status } = req.query;

      const where: any = {
        userId: req.userId!,
      };

      if (status) {
        where.status = status;
      }

      const goals = await prisma.financialGoal.findMany({
        where,
        orderBy: [{ priority: "desc" }, { targetDate: "asc" }],
      });

      // Calculate progress for each goal
      const goalsWithProgress = goals.map((goal: any) => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        const daysLeft = Math.ceil(
          (new Date(goal.targetDate).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        );

        return {
          ...goal,
          progress: Math.min(progress, 100),
          daysLeft,
        };
      });

      return ResponseUtil.success(res, goalsWithProgress);
    } catch (error) {
      next(error);
    }
  }

  // Get single goal
  static async getOne(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;

      const goal = await prisma.financialGoal.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
      });

      if (!goal) {
        throw new AppError("Goal not found", 404);
      }

      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      const daysLeft = Math.ceil(
        (new Date(goal.targetDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      );

      return ResponseUtil.success(res, {
        ...goal,
        progress: Math.min(progress, 100),
        daysLeft,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create goal
  static async create(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const {
        title,
        description,
        type,
        targetAmount,
        currentAmount,
        currency,
        targetDate,
        monthlyContribution,
        priority,
        category,
        imageUrl,
        isRecurring,
        reminderEnabled,
      } = req.body;

      const goal = await prisma.financialGoal.create({
        data: {
          userId: req.userId!,
          title,
          description,
          type,
          targetAmount,
          currentAmount: currentAmount || 0,
          currency: currency || "USD",
          targetDate: new Date(targetDate),
          monthlyContribution,
          priority: priority || 0,
          category,
          imageUrl,
          isRecurring: isRecurring || false,
          reminderEnabled: reminderEnabled !== false,
        },
      });

      return ResponseUtil.created(res, goal, "Goal created successfully");
    } catch (error) {
      next(error);
    }
  }

  // Update goal
  static async update(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        type,
        targetAmount,
        currentAmount,
        targetDate,
        monthlyContribution,
        priority,
        status,
        category,
        imageUrl,
        isRecurring,
        reminderEnabled,
      } = req.body;

      const existingGoal = await prisma.financialGoal.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
      });

      if (!existingGoal) {
        throw new AppError("Goal not found", 404);
      }

      const goal = await prisma.financialGoal.update({
        where: { id },
        data: {
          title,
          description,
          type,
          targetAmount,
          currentAmount,
          targetDate: targetDate ? new Date(targetDate) : undefined,
          monthlyContribution,
          priority,
          status,
          category,
          imageUrl,
          isRecurring,
          reminderEnabled,
        },
      });

      // Check if goal is completed
      if (goal.currentAmount >= goal.targetAmount && goal.status === "active") {
        await prisma.financialGoal.update({
          where: { id },
          data: { status: "completed" },
        });
      }

      return ResponseUtil.success(res, goal, "Goal updated successfully");
    } catch (error) {
      next(error);
    }
  }

  // Delete goal
  static async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;

      const goal = await prisma.financialGoal.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
      });

      if (!goal) {
        throw new AppError("Goal not found", 404);
      }

      await prisma.financialGoal.delete({
        where: { id },
      });

      return ResponseUtil.success(res, null, "Goal deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  // Add contribution to goal
  static async addContribution(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;
      const { amount } = req.body;

      const goal = await prisma.financialGoal.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
      });

      if (!goal) {
        throw new AppError("Goal not found", 404);
      }

      const updatedGoal = await prisma.financialGoal.update({
        where: { id },
        data: {
          currentAmount: {
            increment: amount,
          },
        },
      });

      // Check if goal is completed
      if (
        updatedGoal.currentAmount >= updatedGoal.targetAmount &&
        updatedGoal.status === "active"
      ) {
        await prisma.financialGoal.update({
          where: { id },
          data: { status: "completed" },
        });
      }

      return ResponseUtil.success(
        res,
        updatedGoal,
        "Contribution added successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Get goal statistics
  static async getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const goals = await prisma.financialGoal.findMany({
        where: {
          userId: req.userId!,
        },
      });

      const stats = {
        total: goals.length,
        active: goals.filter((g: any) => g.status === "active").length,
        completed: goals.filter((g: any) => g.status === "completed").length,
        paused: goals.filter((g: any) => g.status === "paused").length,
        totalTarget: goals.reduce((sum: any, g: any) => sum + g.targetAmount, 0),
        totalCurrent: goals.reduce((sum: any, g: any) => sum + g.currentAmount, 0),
        averageProgress:
          goals.length > 0
            ? goals.reduce(
                (sum, g) => sum + (g.currentAmount / g.targetAmount) * 100,
                0
              ) / goals.length
            : 0,
      };

      return ResponseUtil.success(res, stats);
    } catch (error) {
      next(error);
    }
  }
}
