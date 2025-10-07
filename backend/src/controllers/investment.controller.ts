import { Response, NextFunction } from "express";
import { getPrismaClient } from "../database/connection";
import { ResponseUtil } from "../utils/response";
import { AppError } from "../middleware/error.middleware";
import { AuthRequest } from "../middleware/auth.middleware";

const prisma = getPrismaClient();

export class InvestmentController {
  // Get all investment cases
  static async getAll(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const cases = await prisma.investmentCase.findMany({
        where: {
          userId: req.userId!,
          isActive: true,
        },
        include: {
          assets: true,
        },
        orderBy: { createdAt: "desc" },
      });

      // Calculate current values and returns
      const casesWithStats = cases.map((investmentCase: any) => {
        const totalCurrentValue = investmentCase.assets.reduce(
          (sum: number, asset: any) =>
            sum + asset.quantity * asset.currentPrice,
          0
        );
        const profit = totalCurrentValue - investmentCase.totalInvestment;
        const returnPercentage =
          investmentCase.totalInvestment > 0
            ? (profit / investmentCase.totalInvestment) * 100
            : 0;

        return {
          ...investmentCase,
          currentValue: totalCurrentValue,
          profit,
          returnPercentage,
          assetsCount: investmentCase.assets.length,
        };
      });

      return ResponseUtil.success(res, casesWithStats);
    } catch (error) {
      next(error);
    }
  }

  // Get single investment case
  static async getOne(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;

      const investmentCase = await prisma.investmentCase.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
        include: {
          assets: true,
        },
      });

      if (!investmentCase) {
        throw new AppError("Investment case not found", 404);
      }

      const totalCurrentValue = investmentCase.assets.reduce(
        (sum: number, asset: any) => sum + asset.quantity * asset.currentPrice,
        0
      );
      const profit = totalCurrentValue - investmentCase.totalInvestment;
      const returnPercentage =
        investmentCase.totalInvestment > 0
          ? (profit / investmentCase.totalInvestment) * 100
          : 0;

      // Group assets by type
      const assetsByType = investmentCase.assets.reduce(
        (acc: any, asset: any) => {
          if (!acc[asset.type]) {
            acc[asset.type] = [];
          }
          acc[asset.type].push(asset);
          return acc;
        },
        {} as Record<string, any[]>
      );

      return ResponseUtil.success(res, {
        ...investmentCase,
        currentValue: totalCurrentValue,
        profit,
        returnPercentage,
        assetsByType,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create investment case
  static async create(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const {
        name,
        title,
        description,
        totalInvestment,
        currency,
        strategy,
        riskLevel,
      } = req.body;

      const investmentCase = await prisma.investmentCase.create({
        data: {
          userId: req.userId!,
          name,
          title,
          description,
          totalInvestment: totalInvestment || 0,
          currentValue: totalInvestment || 0,
          currency: currency || "USD",
          startDate: new Date(),
          strategy,
          riskLevel,
        },
      });

      return ResponseUtil.created(
        res,
        investmentCase,
        "Investment case created successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Update investment case
  static async update(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;
      const { name, title, description, strategy, riskLevel } = req.body;

      const existingCase = await prisma.investmentCase.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
      });

      if (!existingCase) {
        throw new AppError("Investment case not found", 404);
      }

      const investmentCase = await prisma.investmentCase.update({
        where: { id },
        data: {
          name,
          title,
          description,
          strategy,
          riskLevel,
        },
      });

      return ResponseUtil.success(
        res,
        investmentCase,
        "Investment case updated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Delete investment case
  static async delete(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;

      const investmentCase = await prisma.investmentCase.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
      });

      if (!investmentCase) {
        throw new AppError("Investment case not found", 404);
      }

      // Soft delete
      await prisma.investmentCase.update({
        where: { id },
        data: { isActive: false },
      });

      return ResponseUtil.success(
        res,
        null,
        "Investment case deleted successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Add asset to case
  static async addAsset(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;
      const {
        name,
        type,
        quantity,
        purchasePrice,
        currency,
        ticker,
        region,
        sector,
      } = req.body;

      const investmentCase = await prisma.investmentCase.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
      });

      if (!investmentCase) {
        throw new AppError("Investment case not found", 404);
      }

      const result = await prisma.$transaction(async tx => {
        // Create asset
        const asset = await tx.investmentAsset.create({
          data: {
            caseId: id,
            name,
            type,
            quantity,
            purchasePrice,
            currentPrice: purchasePrice, // Initially same as purchase
            currency: currency || investmentCase.currency,
            purchaseDate: new Date(),
            ticker,
            region,
            sector,
          },
        });

        // Update total investment
        const investmentAmount = quantity * purchasePrice;
        await tx.investmentCase.update({
          where: { id },
          data: {
            totalInvestment: {
              increment: investmentAmount,
            },
            currentValue: {
              increment: investmentAmount,
            },
          },
        });

        return asset;
      });

      return ResponseUtil.created(res, result, "Asset added successfully");
    } catch (error) {
      next(error);
    }
  }

  // Update asset
  static async updateAsset(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id, assetId } = req.params;
      const { currentPrice, quantity } = req.body;

      // Verify case belongs to user
      const investmentCase = await prisma.investmentCase.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
      });

      if (!investmentCase) {
        throw new AppError("Investment case not found", 404);
      }

      const asset = await prisma.investmentAsset.findFirst({
        where: {
          id: assetId,
          caseId: id,
        },
      });

      if (!asset) {
        throw new AppError("Asset not found", 404);
      }

      const updated = await prisma.investmentAsset.update({
        where: { id: assetId },
        data: {
          currentPrice,
          quantity,
        },
      });

      // Recalculate case current value
      if (currentPrice !== undefined || quantity !== undefined) {
        const allAssets = await prisma.investmentAsset.findMany({
          where: { caseId: id },
        });

        const totalCurrentValue = allAssets.reduce(
          (sum, a) =>
            sum +
            (a.id === assetId
              ? (quantity || a.quantity) * (currentPrice || a.currentPrice)
              : a.quantity * a.currentPrice),
          0
        );

        await prisma.investmentCase.update({
          where: { id },
          data: { currentValue: totalCurrentValue },
        });
      }

      return ResponseUtil.success(res, updated, "Asset updated successfully");
    } catch (error) {
      next(error);
    }
  }

  // Delete asset
  static async deleteAsset(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id, assetId } = req.params;

      const investmentCase = await prisma.investmentCase.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
      });

      if (!investmentCase) {
        throw new AppError("Investment case not found", 404);
      }

      const asset = await prisma.investmentAsset.findFirst({
        where: {
          id: assetId,
          caseId: id,
        },
      });

      if (!asset) {
        throw new AppError("Asset not found", 404);
      }

      await prisma.$transaction(async tx => {
        // Delete asset
        await tx.investmentAsset.delete({
          where: { id: assetId },
        });

        // Update total investment
        const investmentAmount = asset.quantity * asset.purchasePrice;
        const currentValue = asset.quantity * asset.currentPrice;

        await tx.investmentCase.update({
          where: { id },
          data: {
            totalInvestment: {
              decrement: investmentAmount,
            },
            currentValue: {
              decrement: currentValue,
            },
          },
        });
      });

      return ResponseUtil.success(res, null, "Asset deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  // Get investment statistics
  static async getStats(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const cases = await prisma.investmentCase.findMany({
        where: {
          userId: req.userId!,
          isActive: true,
        },
        include: {
          assets: true,
        },
      });

      let totalInvestment = 0;
      let totalCurrentValue = 0;
      let assetsCount = 0;

      cases.forEach((investmentCase: any) => {
        totalInvestment += investmentCase.totalInvestment;
        const caseCurrentValue = investmentCase.assets.reduce(
          (sum: number, asset: any) =>
            sum + asset.quantity * asset.currentPrice,
          0
        );
        totalCurrentValue += caseCurrentValue;
        assetsCount += investmentCase.assets.length;
      });

      const totalProfit = totalCurrentValue - totalInvestment;
      const totalReturn =
        totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;

      return ResponseUtil.success(res, {
        cases: cases.length,
        totalInvestment,
        totalCurrentValue,
        totalProfit,
        totalReturn,
        assetsCount,
      });
    } catch (error) {
      next(error);
    }
  }
}
