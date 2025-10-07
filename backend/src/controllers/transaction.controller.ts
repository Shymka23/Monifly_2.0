import { Response, NextFunction } from "express";
import { getPrismaClient } from "../database/connection";
import { ResponseUtil } from "../utils/response";
import { AppError } from "../middleware/error.middleware";
import { AuthRequest } from "../middleware/auth.middleware";
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

const prisma = getPrismaClient();

export class TransactionController {
  // Get all transactions with filters
  static async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        category,
        walletId,
        startDate,
        endDate,
        minAmount,
        maxAmount,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      // Build where clause
      const where: any = {
        userId: req.userId!,
      };

      if (type) where.type = type;
      if (category) where.category = category;
      if (walletId) where.walletId = walletId;

      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate as string);
        if (endDate) where.date.lte = new Date(endDate as string);
      }

      if (minAmount || maxAmount) {
        where.amount = {};
        if (minAmount) where.amount.gte = Number(minAmount);
        if (maxAmount) where.amount.lte = Number(maxAmount);
      }

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          include: {
            wallet: {
              select: {
                id: true,
                name: true,
                type: true,
                currency: true,
              },
            },
          },
          orderBy: { date: "desc" },
          skip,
          take: Number(limit),
        }),
        prisma.transaction.count({ where }),
      ]);

      return ResponseUtil.paginated(
        res,
        transactions,
        Number(page),
        Number(limit),
        total
      );
    } catch (error) {
      next(error);
    }
  }

  // Get single transaction
  static async getOne(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;

      const transaction = await prisma.transaction.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
        include: {
          wallet: true,
        },
      });

      if (!transaction) {
        throw new AppError("Transaction not found", 404);
      }

      return ResponseUtil.success(res, transaction);
    } catch (error) {
      next(error);
    }
  }

  // Create transaction
  static async create(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const {
        walletId,
        type,
        category,
        amount,
        currency,
        description,
        date,
        tags,
        location,
      } = req.body;

      // Verify wallet belongs to user
      const wallet = await prisma.wallet.findFirst({
        where: {
          id: walletId,
          userId: req.userId!,
        },
      });

      if (!wallet) {
        throw new AppError("Wallet not found", 404);
      }

      // Start transaction
      const result = await prisma.$transaction(async tx => {
        // Create transaction
        const transaction = await tx.transaction.create({
          data: {
            userId: req.userId!,
            walletId,
            type,
            category,
            amount,
            currency: currency || wallet.currency,
            description,
            date: date ? new Date(date) : new Date(),
            tags: tags || [],
            location,
          },
        });

        // Update wallet balance
        const balanceChange =
          type === "income" ? amount : type === "expense" ? -amount : 0;

        await tx.wallet.update({
          where: { id: walletId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });

        return transaction;
      });

      // Emit WebSocket event
      const io = req.app.get("io");
      io.to(`user:${req.userId}`).emit("transaction:created", result);

      return ResponseUtil.created(
        res,
        result,
        "Transaction created successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Update transaction
  static async update(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const { type, category, amount, description, date, tags, location } =
        req.body;

      // Get existing transaction
      const existingTransaction = await prisma.transaction.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
      });

      if (!existingTransaction) {
        throw new AppError("Transaction not found", 404);
      }

      const result = await prisma.$transaction(async tx => {
        // If amount or type changed, update wallet balance
        if (
          amount !== undefined ||
          (type && type !== existingTransaction.type)
        ) {
          const oldBalanceChange =
            existingTransaction.type === "income"
              ? existingTransaction.amount
              : existingTransaction.type === "expense"
              ? -existingTransaction.amount
              : 0;

          const newAmount =
            amount !== undefined ? amount : existingTransaction.amount;
          const newType = type || existingTransaction.type;
          const newBalanceChange =
            newType === "income"
              ? newAmount
              : newType === "expense"
              ? -newAmount
              : 0;

          const balanceDiff = newBalanceChange - oldBalanceChange;

          await tx.wallet.update({
            where: { id: existingTransaction.walletId },
            data: {
              balance: {
                increment: balanceDiff,
              },
            },
          });
        }

        // Update transaction
        const transaction = await tx.transaction.update({
          where: { id },
          data: {
            type,
            category,
            amount,
            description,
            date: date ? new Date(date) : undefined,
            tags,
            location,
          },
        });

        return transaction;
      });

      // Emit WebSocket event
      const io = req.app.get("io");
      io.to(`user:${req.userId}`).emit("transaction:updated", result);

      return ResponseUtil.success(
        res,
        result,
        "Transaction updated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Delete transaction
  static async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;

      const transaction = await prisma.transaction.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
      });

      if (!transaction) {
        throw new AppError("Transaction not found", 404);
      }

      await prisma.$transaction(async tx => {
        // Revert wallet balance
        const balanceChange =
          transaction.type === "income"
            ? -transaction.amount
            : transaction.type === "expense"
            ? transaction.amount
            : 0;

        await tx.wallet.update({
          where: { id: transaction.walletId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });

        // Delete transaction
        await tx.transaction.delete({
          where: { id },
        });
      });

      // Emit WebSocket event
      const io = req.app.get("io");
      io.to(`user:${req.userId}`).emit("transaction:deleted", { id });

      return ResponseUtil.success(
        res,
        null,
        "Transaction deleted successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Get transaction statistics
  static async getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { period = "month" } = req.query;

      let startDate: Date;
      let endDate: Date = new Date();

      switch (period) {
        case "month":
          startDate = startOfMonth(endDate);
          endDate = endOfMonth(endDate);
          break;
        case "year":
          startDate = startOfYear(endDate);
          endDate = endOfYear(endDate);
          break;
        default:
          startDate = startOfMonth(endDate);
          endDate = endOfMonth(endDate);
      }

      const transactions = await prisma.transaction.findMany({
        where: {
          userId: req.userId!,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const stats = {
        totalIncome: transactions
          .filter((t: any) => t.type === "income")
          .reduce((sum: any, t: any) => sum + t.amount, 0),
        totalExpense: transactions
          .filter((t: any) => t.type === "expense")
          .reduce((sum: any, t: any) => sum + t.amount, 0),
        transactionCount: transactions.length,
        byCategory: {} as Record<string, number>,
        byCurrency: {} as Record<string, { income: number; expense: number }>,
      };

      // Group by category
      transactions.forEach((t: any) => {
        if (!stats.byCategory[t.category]) {
          stats.byCategory[t.category] = 0;
        }
        stats.byCategory[t.category] += t.type === "expense" ? t.amount : 0;
      });

      // Group by currency
      transactions.forEach((t: any) => {
        if (!stats.byCurrency[t.currency]) {
          stats.byCurrency[t.currency] = { income: 0, expense: 0 };
        }
        if (t.type === "income") {
          stats.byCurrency[t.currency].income += t.amount;
        } else if (t.type === "expense") {
          stats.byCurrency[t.currency].expense += t.amount;
        }
      });

      return ResponseUtil.success(res, stats);
    } catch (error) {
      next(error);
    }
  }
}
