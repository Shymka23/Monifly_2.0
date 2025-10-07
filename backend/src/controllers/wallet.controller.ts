import { Response, NextFunction } from "express";
import { getPrismaClient } from "../database/connection";
import { ResponseUtil } from "../utils/response";
import { AppError } from "../middleware/error.middleware";
import { AuthRequest } from "../middleware/auth.middleware";

const prisma = getPrismaClient();

export class WalletController {
  // Get all wallets for user
  static async getAll(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const wallets = await prisma.wallet.findMany({
        where: {
          userId: req.userId!,
          isActive: true,
        },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      });

      return ResponseUtil.success(res, wallets);
    } catch (error) {
      next(error);
    }
  }

  // Get single wallet
  static async getOne(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;

      const wallet = await prisma.wallet.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
        include: {
          transactions: {
            take: 10,
            orderBy: { date: "desc" },
          },
        },
      });

      if (!wallet) {
        throw new AppError("Wallet not found", 404);
      }

      return ResponseUtil.success(res, wallet);
    } catch (error) {
      next(error);
    }
  }

  // Create new wallet
  static async create(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { name, type, balance, currency, color, icon } = req.body;

      // Check if user already has a default wallet
      const defaultWallet = await prisma.wallet.findFirst({
        where: {
          userId: req.userId!,
          isDefault: true,
        },
      });

      const wallet = await prisma.wallet.create({
        data: {
          userId: req.userId!,
          name,
          type,
          balance: balance || 0,
          currency: currency || "USD",
          color,
          icon,
          isDefault: !defaultWallet, // First wallet is default
        },
      });

      return ResponseUtil.created(res, wallet, "Wallet created successfully");
    } catch (error) {
      next(error);
    }
  }

  // Update wallet
  static async update(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;
      const { name, type, color, icon, isDefault } = req.body;

      // Check if wallet exists and belongs to user
      const existingWallet = await prisma.wallet.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
      });

      if (!existingWallet) {
        throw new AppError("Wallet not found", 404);
      }

      // If setting as default, unset other defaults
      if (isDefault) {
        await prisma.wallet.updateMany({
          where: {
            userId: req.userId!,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      const wallet = await prisma.wallet.update({
        where: { id },
        data: {
          name,
          type,
          color,
          icon,
          isDefault,
        },
      });

      return ResponseUtil.success(res, wallet, "Wallet updated successfully");
    } catch (error) {
      next(error);
    }
  }

  // Delete wallet (soft delete)
  static async delete(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;

      const wallet = await prisma.wallet.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
      });

      if (!wallet) {
        throw new AppError("Wallet not found", 404);
      }

      // Don't allow deleting default wallet if there are others
      if (wallet.isDefault) {
        const otherWallets = await prisma.wallet.count({
          where: {
            userId: req.userId!,
            isActive: true,
            id: { not: id },
          },
        });

        if (otherWallets > 0) {
          throw new AppError(
            "Cannot delete default wallet. Set another wallet as default first.",
            400
          );
        }
      }

      // Soft delete
      await prisma.wallet.update({
        where: { id },
        data: { isActive: false },
      });

      return ResponseUtil.success(res, null, "Wallet deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  // Get wallet balance
  static async getBalance(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;

      const wallet = await prisma.wallet.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
      });

      if (!wallet) {
        throw new AppError("Wallet not found", 404);
      }

      return ResponseUtil.success(res, {
        balance: wallet.balance,
        currency: wallet.currency,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get total balance across all wallets
  static async getTotalBalance(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const wallets = await prisma.wallet.findMany({
        where: {
          userId: req.userId!,
          isActive: true,
        },
      });

      // Group by currency
      const balanceByCurrency = wallets.reduce(
        (acc: Record<string, number>, wallet: any) => {
          if (!acc[wallet.currency]) {
            acc[wallet.currency] = 0;
          }
          acc[wallet.currency] += wallet.balance;
          return acc;
        },
        {} as Record<string, number>
      );

      return ResponseUtil.success(res, {
        total: balanceByCurrency,
        wallets: wallets.length,
      });
    } catch (error) {
      next(error);
    }
  }
}
