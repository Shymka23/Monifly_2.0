import { Response, NextFunction } from "express";
import { getPrismaClient } from "../database/connection";
import { ResponseUtil } from "../utils/response";
import { AppError } from "../middleware/error.middleware";
import { AuthRequest } from "../middleware/auth.middleware";

const prisma = getPrismaClient();

export class DebtController {
  // Get all debts
  static async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { status, type } = req.query;

      const where: any = {
        userId: req.userId!,
        isActive: true,
      };

      if (status) where.status = status;
      if (type) where.type = type;

      const debts = await prisma.debt.findMany({
        where,
        include: {
          payments: {
            orderBy: { date: "desc" },
            take: 5,
          },
        },
        orderBy: { dueDate: "asc" },
      });

      // Calculate remaining amounts and progress
      const debtsWithProgress = debts.map((debt: any) => {
        const remaining = debt.initialAmount - debt.paidAmount;
        const progress = (debt.paidAmount / debt.initialAmount) * 100;

        return {
          ...debt,
          remainingAmount: remaining,
          progress: Math.min(progress, 100),
        };
      });

      return ResponseUtil.success(res, debtsWithProgress);
    } catch (error) {
      next(error);
    }
  }

  // Get single debt
  static async getOne(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;

      const debt = await prisma.debt.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
        include: {
          payments: {
            orderBy: { date: "desc" },
          },
        },
      });

      if (!debt) {
        throw new AppError("Debt not found", 404);
      }

      const remaining = debt.initialAmount - debt.paidAmount;
      const progress = (debt.paidAmount / debt.initialAmount) * 100;

      return ResponseUtil.success(res, {
        ...debt,
        remainingAmount: remaining,
        progress: Math.min(progress, 100),
      });
    } catch (error) {
      next(error);
    }
  }

  // Create debt
  static async create(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const {
        type,
        title,
        personName,
        initialAmount,
        currency,
        interestRate,
        startDate,
        dueDate,
        nextDueDate,
        description,
      } = req.body;

      const debt = await prisma.debt.create({
        data: {
          userId: req.userId!,
          type,
          title,
          personName,
          initialAmount,
          paidAmount: 0,
          currency: currency || "USD",
          interestRate,
          startDate: new Date(startDate),
          dueDate: dueDate ? new Date(dueDate) : null,
          nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
          description,
          status: "active",
        },
      });

      return ResponseUtil.created(res, debt, "Debt created successfully");
    } catch (error) {
      next(error);
    }
  }

  // Update debt
  static async update(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const {
        type,
        title,
        personName,
        interestRate,
        dueDate,
        nextDueDate,
        description,
        status,
      } = req.body;

      const existingDebt = await prisma.debt.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
      });

      if (!existingDebt) {
        throw new AppError("Debt not found", 404);
      }

      const debt = await prisma.debt.update({
        where: { id },
        data: {
          type,
          title,
          personName,
          interestRate,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          nextDueDate: nextDueDate ? new Date(nextDueDate) : undefined,
          description,
          status,
        },
      });

      return ResponseUtil.success(res, debt, "Debt updated successfully");
    } catch (error) {
      next(error);
    }
  }

  // Delete debt
  static async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;

      const debt = await prisma.debt.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
      });

      if (!debt) {
        throw new AppError("Debt not found", 404);
      }

      // Soft delete
      await prisma.debt.update({
        where: { id },
        data: { isActive: false },
      });

      return ResponseUtil.success(res, null, "Debt deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  // Add payment to debt
  static async addPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const { amount, currency, date, description } = req.body;

      const debt = await prisma.debt.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
      });

      if (!debt) {
        throw new AppError("Debt not found", 404);
      }

      // Check if payment exceeds remaining amount
      const remaining = debt.initialAmount - debt.paidAmount;
      if (amount > remaining) {
        throw new AppError(
          `Payment amount (${amount}) exceeds remaining debt (${remaining})`,
          400
        );
      }

      const result = await prisma.$transaction(async tx => {
        // Create payment record
        const payment = await tx.debtPayment.create({
          data: {
            debtId: id,
            amount,
            currency: currency || debt.currency,
            date: date ? new Date(date) : new Date(),
            description,
          },
        });

        // Update debt paid amount
        const updatedDebt = await tx.debt.update({
          where: { id },
          data: {
            paidAmount: {
              increment: amount,
            },
          },
        });

        // Check if debt is fully paid
        if (updatedDebt.paidAmount >= updatedDebt.initialAmount) {
          await tx.debt.update({
            where: { id },
            data: { status: "paid" },
          });
        }

        return { payment, debt: updatedDebt };
      });

      return ResponseUtil.success(res, result, "Payment recorded successfully");
    } catch (error) {
      next(error);
    }
  }

  // Get debt statistics
  static async getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const debts = await prisma.debt.findMany({
        where: {
          userId: req.userId!,
          isActive: true,
        },
      });

      const stats = {
        total: debts.length,
        active: debts.filter((d: any) => d.status === "active").length,
        paid: debts.filter((d: any) => d.status === "paid").length,
        overdue: debts.filter((d: any) => d.status === "overdue").length,
        totalInitial: debts.reduce((sum: any, d: any) => sum + d.initialAmount, 0),
        totalPaid: debts.reduce((sum: any, d: any) => sum + d.paidAmount, 0),
        totalRemaining: debts.reduce(
          (sum, d) => sum + (d.initialAmount - d.paidAmount),
          0
        ),
        averageProgress:
          debts.length > 0
            ? debts.reduce(
                (sum, d) => sum + (d.paidAmount / d.initialAmount) * 100,
                0
              ) / debts.length
            : 0,
      };

      return ResponseUtil.success(res, stats);
    } catch (error) {
      next(error);
    }
  }

  // Get payment history
  static async getPayments(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;

      const debt = await prisma.debt.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
      });

      if (!debt) {
        throw new AppError("Debt not found", 404);
      }

      const payments = await prisma.debtPayment.findMany({
        where: { debtId: id },
        orderBy: { date: "desc" },
      });

      return ResponseUtil.success(res, payments);
    } catch (error) {
      next(error);
    }
  }
}
