import { Response, NextFunction } from "express";
import { getPrismaClient } from "../database/connection";
import { ResponseUtil } from "../utils/response";
import { AppError } from "../middleware/error.middleware";
import { AuthRequest } from "../middleware/auth.middleware";
import { CryptoPriceService } from "../services/crypto-price.service";

const prisma = getPrismaClient();

export class CryptoController {
  // Get all crypto holdings
  static async getAll(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const holdings = await prisma.cryptoHolding.findMany({
        where: {
          userId: req.userId!,
        },
        orderBy: { purchaseDate: "desc" },
      });

      // Get current prices
      const symbols = [
        ...new Set(holdings.map((h: any) => h.symbol)),
      ] as string[];
      const prices = await CryptoPriceService.getPrices(symbols);

      // Calculate current values and profits
      const holdingsWithValues = holdings.map((holding: any) => {
        const currentPrice =
          prices[holding.symbol]?.currentPrice || holding.currentPrice;
        const currentValue = holding.amount * currentPrice;
        const purchaseValue = holding.amount * holding.purchasePrice;
        const profit = currentValue - purchaseValue;
        const profitPercentage = (profit / purchaseValue) * 100;

        return {
          ...holding,
          currentPrice,
          currentValue,
          profit,
          profitPercentage,
        };
      });

      return ResponseUtil.success(res, holdingsWithValues);
    } catch (error) {
      next(error);
    }
  }

  // Get single holding
  static async getOne(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;

      const holding = await prisma.cryptoHolding.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
      });

      if (!holding) {
        throw new AppError("Crypto holding not found", 404);
      }

      // Get current price
      const priceData = await CryptoPriceService.getPrice(holding.symbol);
      const currentPrice = priceData?.currentPrice || holding.currentPrice;
      const currentValue = holding.amount * currentPrice;
      const purchaseValue = holding.amount * holding.purchasePrice;
      const profit = currentValue - purchaseValue;
      const profitPercentage = (profit / purchaseValue) * 100;

      return ResponseUtil.success(res, {
        ...holding,
        currentPrice,
        currentValue,
        profit,
        profitPercentage,
        priceData,
      });
    } catch (error) {
      next(error);
    }
  }

  // Buy crypto
  static async buy(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { symbol, amount, purchasePrice, currency, walletAddress, notes } =
        req.body;

      // Get current price if not provided
      let price = purchasePrice;
      if (!price) {
        const priceData = await CryptoPriceService.getPrice(symbol);
        if (!priceData) {
          throw new AppError("Could not fetch current price", 400);
        }
        price = priceData.currentPrice;
      }

      const holding = await prisma.cryptoHolding.create({
        data: {
          userId: req.userId!,
          asset: symbol.toUpperCase(),
          symbol: symbol.toUpperCase(),
          amount,
          purchasePrice: price,
          currentPrice: price,
          currency: currency || "USD",
          purchaseDate: new Date(),
          walletAddress,
          notes,
        },
      });

      return ResponseUtil.created(
        res,
        holding,
        "Crypto purchased successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Sell crypto
  static async sell(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;
      const { amount, sellPrice } = req.body;

      const holding = await prisma.cryptoHolding.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
      });

      if (!holding) {
        throw new AppError("Crypto holding not found", 404);
      }

      if (amount > holding.amount) {
        throw new AppError("Insufficient crypto balance", 400);
      }

      await prisma.$transaction(async tx => {
        if (amount === holding.amount) {
          // Sell all - delete holding
          await tx.cryptoHolding.delete({
            where: { id },
          });
        } else {
          // Partial sell - update amount
          await tx.cryptoHolding.update({
            where: { id },
            data: {
              amount: holding.amount - amount,
            },
          });
        }
      });

      const profit = amount * (sellPrice - holding.purchasePrice);

      return ResponseUtil.success(
        res,
        {
          soldAmount: amount,
          sellPrice,
          profit,
          profitPercentage: (profit / (amount * holding.purchasePrice)) * 100,
        },
        "Crypto sold successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Update holding
  static async update(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;
      const { walletAddress, notes } = req.body;

      const holding = await prisma.cryptoHolding.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
      });

      if (!holding) {
        throw new AppError("Crypto holding not found", 404);
      }

      const updated = await prisma.cryptoHolding.update({
        where: { id },
        data: {
          walletAddress,
          notes,
        },
      });

      return ResponseUtil.success(res, updated, "Holding updated successfully");
    } catch (error) {
      next(error);
    }
  }

  // Delete holding
  static async delete(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;

      const holding = await prisma.cryptoHolding.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
      });

      if (!holding) {
        throw new AppError("Crypto holding not found", 404);
      }

      await prisma.cryptoHolding.delete({
        where: { id },
      });

      return ResponseUtil.success(res, null, "Holding deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  // Get current prices
  static async getPrices(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { symbols } = req.query;

      let symbolsList: string[];

      if (symbols) {
        symbolsList = (symbols as string).split(",").map((s: any) => s.trim());
      } else {
        // Get user's holdings
        const holdings = await prisma.cryptoHolding.findMany({
          where: { userId: req.userId! },
          select: { symbol: true },
        });
        symbolsList = [...new Set(holdings.map((h: any) => h.symbol))];
      }

      const prices = await CryptoPriceService.getPrices(symbolsList);

      return ResponseUtil.success(res, prices);
    } catch (error) {
      next(error);
    }
  }

  // Get top cryptos
  static async getTopCryptos(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { limit = 10 } = req.query;

      const topCryptos = await CryptoPriceService.getTopCryptos(Number(limit));

      return ResponseUtil.success(res, topCryptos);
    } catch (error) {
      next(error);
    }
  }

  // Get portfolio stats
  static async getStats(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const holdings = await prisma.cryptoHolding.findMany({
        where: { userId: req.userId! },
      });

      if (!holdings.length) {
        return ResponseUtil.success(res, {
          totalValue: 0,
          totalProfit: 0,
          totalProfitPercentage: 0,
          holdings: 0,
        });
      }

      // Get current prices
      const symbols = [...new Set(holdings.map((h: any) => h.symbol))];
      const prices = await CryptoPriceService.getPrices(symbols);

      let totalCurrentValue = 0;
      let totalPurchaseValue = 0;

      holdings.forEach((holding: any) => {
        const currentPrice =
          prices[holding.symbol]?.currentPrice || holding.currentPrice;
        totalCurrentValue += holding.amount * currentPrice;
        totalPurchaseValue += holding.amount * holding.purchasePrice;
      });

      const totalProfit = totalCurrentValue - totalPurchaseValue;
      const totalProfitPercentage = (totalProfit / totalPurchaseValue) * 100;

      return ResponseUtil.success(res, {
        totalValue: totalCurrentValue,
        totalInvested: totalPurchaseValue,
        totalProfit,
        totalProfitPercentage,
        holdings: holdings.length,
        assets: symbols.length,
      });
    } catch (error) {
      next(error);
    }
  }
}
