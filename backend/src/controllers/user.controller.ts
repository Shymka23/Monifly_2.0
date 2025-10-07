import { Response, NextFunction } from "express";
import { getPrismaClient } from "../database/connection";
import { ResponseUtil } from "../utils/response";
import { AppError } from "../middleware/error.middleware";
import { AuthRequest } from "../middleware/auth.middleware";
import { hashPassword } from "../utils/password";

const prisma = getPrismaClient();

export class UserController {
  // Get current user profile
  static async getProfile(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId! },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          currency: true,
          language: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new AppError("User not found", 404);
      }

      return ResponseUtil.success(res, user);
    } catch (error) {
      next(error);
    }
  }

  // Update user profile
  static async updateProfile(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { name, avatar, currency, language } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: req.userId! },
        data: {
          ...(name !== undefined && { name }),
          ...(avatar !== undefined && { avatar }),
          ...(currency !== undefined && { currency }),
          ...(language !== undefined && { language }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          currency: true,
          language: true,
          updatedAt: true,
        },
      });

      return ResponseUtil.success(
        res,
        updatedUser,
        "Profile updated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Get user settings
  static async getSettings(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      let settings = await prisma.userSettings.findUnique({
        where: { userId: req.userId! },
      });

      // Create default settings if they don't exist
      if (!settings) {
        settings = await prisma.userSettings.create({
          data: {
            userId: req.userId!,
          },
        });
      }

      return ResponseUtil.success(res, settings);
    } catch (error) {
      next(error);
    }
  }

  // Update user settings
  static async updateSettings(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const {
        currentAge,
        targetAge,
        retirementAge,
        browserNotifications,
        emailNotifications,
        notificationFrequency,
        theme,
        primaryCurrency,
      } = req.body;

      const settings = await prisma.userSettings.upsert({
        where: { userId: req.userId! },
        update: {
          ...(currentAge !== undefined && { currentAge }),
          ...(targetAge !== undefined && { targetAge }),
          ...(retirementAge !== undefined && { retirementAge }),
          ...(browserNotifications !== undefined && {
            browserNotifications,
          }),
          ...(emailNotifications !== undefined && { emailNotifications }),
          ...(notificationFrequency !== undefined && {
            notificationFrequency,
          }),
          ...(theme !== undefined && { theme }),
          ...(primaryCurrency !== undefined && { primaryCurrency }),
        },
        create: {
          userId: req.userId!,
          currentAge,
          targetAge,
          retirementAge,
          browserNotifications,
          emailNotifications,
          notificationFrequency,
          theme,
          primaryCurrency,
        },
      });

      return ResponseUtil.success(
        res,
        settings,
        "Settings updated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Change password
  static async changePassword(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: req.userId! },
      });

      if (!user) {
        throw new AppError("User not found", 404);
      }

      // Verify current password
      const bcrypt = require("bcryptjs");
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isValidPassword) {
        throw new AppError("Current password is incorrect", 401);
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      await prisma.user.update({
        where: { id: req.userId! },
        data: { password: hashedPassword },
      });

      return ResponseUtil.success(res, null, "Password changed successfully");
    } catch (error) {
      next(error);
    }
  }

  // Delete user account
  static async deleteAccount(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { password } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: req.userId! },
      });

      if (!user) {
        throw new AppError("User not found", 404);
      }

      // Verify password
      const bcrypt = require("bcryptjs");
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new AppError("Password is incorrect", 401);
      }

      // Delete user (cascade will delete all related data)
      await prisma.user.delete({
        where: { id: req.userId! },
      });

      return ResponseUtil.success(res, null, "Account deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  // Get user statistics
  static async getStatistics(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const [
        walletsCount,
        transactionsCount,
        goalsCount,
        debtsCount,
        lifeCalendarYears,
      ] = await Promise.all([
        prisma.wallet.count({
          where: { userId: req.userId!, isActive: true },
        }),
        prisma.transaction.count({
          where: { userId: req.userId! },
        }),
        prisma.financialGoal.count({
          where: { userId: req.userId!, status: "active" },
        }),
        prisma.debt.count({
          where: { userId: req.userId!, isActive: true },
        }),
        prisma.lifeCalendarEntry.count({
          where: { userId: req.userId! },
        }),
      ]);

      const statistics = {
        walletsCount,
        transactionsCount,
        goalsCount,
        debtsCount,
        lifeCalendarYears,
      };

      return ResponseUtil.success(res, statistics);
    } catch (error) {
      next(error);
    }
  }
}
