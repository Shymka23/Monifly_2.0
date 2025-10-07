import { Request, Response, NextFunction } from "express";
import { getPrismaClient } from "../database/connection";
import { ResponseUtil } from "../utils/response";
import { PasswordUtil } from "../utils/password";
import { JWTUtil } from "../utils/jwt";
import { AppError } from "../middleware/error.middleware";
import { AuthRequest } from "../middleware/auth.middleware";

const prisma = getPrismaClient();

export class AuthController {
  // Register new user
  static async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { email, password, name, currency, language } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new AppError("User with this email already exists", 400);
      }

      // Validate password
      const passwordValidation = PasswordUtil.validate(password);
      if (!passwordValidation.valid) {
        throw new AppError(passwordValidation.errors.join(", "), 400);
      }

      // Hash password
      const hashedPassword = await PasswordUtil.hash(password);

      // Create user with default wallet and settings
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          currency: currency || "USD",
          language: language || "uk",
          wallets: {
            create: {
              name: "Основний гаманець",
              type: "cash",
              balance: 0,
              currency: currency || "USD",
              isDefault: true,
            },
          },
          settings: {
            create: {
              primaryCurrency: currency || "USD",
              theme: "light",
              browserNotifications: true,
            },
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          currency: true,
          language: true,
          createdAt: true,
        },
      });

      // Generate tokens
      const tokens = JWTUtil.generateTokens({
        id: user.id,
        email: user.email,
      });

      // Save refresh token to database
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: tokens.refreshToken,
          expiresAt,
        },
      });

      return ResponseUtil.created(
        res,
        {
          user,
          ...tokens,
        },
        "User registered successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Login user
  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
          currency: true,
          language: true,
          avatar: true,
        },
      });

      if (!user) {
        throw new AppError("Invalid email or password", 401);
      }

      // Verify password
      const isPasswordValid = await PasswordUtil.compare(
        password,
        user.password
      );
      if (!isPasswordValid) {
        throw new AppError("Invalid email or password", 401);
      }

      // Generate tokens
      const tokens = JWTUtil.generateTokens({
        id: user.id,
        email: user.email,
      });

      // Save refresh token
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: tokens.refreshToken,
          expiresAt,
        },
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return ResponseUtil.success(
        res,
        {
          user: userWithoutPassword,
          ...tokens,
        },
        "Login successful"
      );
    } catch (error) {
      next(error);
    }
  }

  // Refresh access token
  static async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError("Refresh token is required", 400);
      }

      // Verify refresh token
      const decoded = JWTUtil.verifyRefreshToken(refreshToken);

      // Check if token exists in database
      const tokenInDb = await prisma.refreshToken.findFirst({
        where: {
          token: refreshToken,
          userId: decoded.id,
          expiresAt: {
            gte: new Date(),
          },
        },
      });

      if (!tokenInDb) {
        throw new AppError("Invalid or expired refresh token", 401);
      }

      // Generate new tokens
      const tokens = JWTUtil.generateTokens({
        id: decoded.id,
        email: decoded.email,
      });

      // Delete old refresh token
      await prisma.refreshToken.delete({
        where: { id: tokenInDb.id },
      });

      // Save new refresh token
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await prisma.refreshToken.create({
        data: {
          userId: decoded.id,
          token: tokens.refreshToken,
          expiresAt,
        },
      });

      return ResponseUtil.success(res, tokens, "Token refreshed successfully");
    } catch (error) {
      next(error);
    }
  }

  // Logout user
  static async logout(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        // Delete refresh token from database
        await prisma.refreshToken.deleteMany({
          where: {
            token: refreshToken,
            userId: req.userId,
          },
        });
      }

      return ResponseUtil.success(res, null, "Logout successful");
    } catch (error) {
      next(error);
    }
  }

  // Get current user
  static async me(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          currency: true,
          language: true,
          createdAt: true,
          updatedAt: true,
          settings: true,
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

  // Change password
  static async changePassword(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
      });

      if (!user) {
        throw new AppError("User not found", 404);
      }

      // Verify current password
      const isPasswordValid = await PasswordUtil.compare(
        currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        throw new AppError("Current password is incorrect", 401);
      }

      // Validate new password
      const passwordValidation = PasswordUtil.validate(newPassword);
      if (!passwordValidation.valid) {
        throw new AppError(passwordValidation.errors.join(", "), 400);
      }

      // Hash new password
      const hashedPassword = await PasswordUtil.hash(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: req.userId },
        data: { password: hashedPassword },
      });

      // Delete all refresh tokens for this user
      await prisma.refreshToken.deleteMany({
        where: { userId: req.userId },
      });

      return ResponseUtil.success(res, null, "Password changed successfully");
    } catch (error) {
      next(error);
    }
  }
}
