import { Response, NextFunction } from "express";
import { getPrismaClient } from "../database/connection";
import { ResponseUtil } from "../utils/response";
import { AppError } from "../middleware/error.middleware";
import { AuthRequest } from "../middleware/auth.middleware";

const prisma = getPrismaClient();

export class LifeCalendarController {
  // Get all calendar entries for user
  static async getAll(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { startYear, endYear } = req.query;

      const where: any = {
        userId: req.userId!,
      };

      if (startYear) {
        where.year = { gte: parseInt(startYear as string) };
      }

      if (endYear) {
        where.year = {
          ...where.year,
          lte: parseInt(endYear as string),
        };
      }

      const entries = await prisma.lifeCalendarEntry.findMany({
        where,
        include: {
          milestones: {
            orderBy: { targetDate: "asc" },
          },
        },
        orderBy: { year: "asc" },
      });

      return ResponseUtil.success(res, entries);
    } catch (error) {
      next(error);
    }
  }

  // Get single calendar entry by year
  static async getByYear(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { year } = req.params;

      const entry = await prisma.lifeCalendarEntry.findFirst({
        where: {
          userId: req.userId!,
          year: parseInt(year),
        },
        include: {
          milestones: {
            orderBy: { targetDate: "asc" },
          },
        },
      });

      if (!entry) {
        throw new AppError("Calendar entry not found", 404);
      }

      return ResponseUtil.success(res, entry);
    } catch (error) {
      next(error);
    }
  }

  // Create or update calendar entry
  static async upsert(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const {
        year,
        age,
        income,
        expenses,
        savings,
        netWorth,
        events,
        notes,
        mood,
      } = req.body;

      const entry = await prisma.lifeCalendarEntry.upsert({
        where: {
          userId_year: {
            userId: req.userId!,
            year,
          },
        },
        update: {
          age,
          income,
          expenses,
          savings,
          netWorth,
          events,
          notes,
          mood,
        },
        create: {
          userId: req.userId!,
          year,
          age,
          income,
          expenses,
          savings,
          netWorth,
          events,
          notes,
          mood,
        },
        include: {
          milestones: true,
        },
      });

      return ResponseUtil.success(
        res,
        entry,
        "Calendar entry saved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Delete calendar entry
  static async delete(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { year } = req.params;

      const existingEntry = await prisma.lifeCalendarEntry.findFirst({
        where: {
          userId: req.userId!,
          year: parseInt(year),
        },
      });

      if (!existingEntry) {
        throw new AppError("Calendar entry not found", 404);
      }

      await prisma.lifeCalendarEntry.delete({
        where: {
          id: existingEntry.id,
        },
      });

      return ResponseUtil.success(
        res,
        null,
        "Calendar entry deleted successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Get user's life overview
  static async getOverview(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const entries = await prisma.lifeCalendarEntry.findMany({
        where: {
          userId: req.userId!,
        },
        include: {
          milestones: true,
        },
        orderBy: { year: "asc" },
      });

      const currentYear = new Date().getFullYear();
      const totalYears = entries.length;
      const completedYears = entries.filter(e => e.isCompleted).length;
      const totalMilestones = entries.reduce(
        (sum, e) => sum + e.milestones.length,
        0
      );
      const completedMilestones = entries.reduce(
        (sum, e) =>
          sum + e.milestones.filter(m => m.status === "completed").length,
        0
      );

      const overview = {
        totalYears,
        completedYears,
        totalMilestones,
        completedMilestones,
        progressPercentage:
          totalMilestones > 0
            ? (completedMilestones / totalMilestones) * 100
            : 0,
        currentYear,
        entries: entries.map(entry => ({
          year: entry.year,
          age: entry.age,
          milestonesCount: entry.milestones.length,
          completedMilestonesCount: entry.milestones.filter(
            m => m.status === "completed"
          ).length,
          isCompleted: entry.isCompleted,
          netWorth: entry.netWorth,
        })),
      };

      return ResponseUtil.success(res, overview);
    } catch (error) {
      next(error);
    }
  }

  // Mark year as completed
  static async markCompleted(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { year } = req.params;

      const entry = await prisma.lifeCalendarEntry.findFirst({
        where: {
          userId: req.userId!,
          year: parseInt(year),
        },
      });

      if (!entry) {
        throw new AppError("Calendar entry not found", 404);
      }

      const updatedEntry = await prisma.lifeCalendarEntry.update({
        where: { id: entry.id },
        data: {
          isCompleted: true,
          completionDate: new Date(),
        },
      });

      return ResponseUtil.success(
        res,
        updatedEntry,
        "Year marked as completed"
      );
    } catch (error) {
      next(error);
    }
  }

  // ===== MILESTONE OPERATIONS =====

  // Add milestone to calendar entry
  static async addMilestone(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { year } = req.params;
      const {
        title,
        description,
        type,
        targetDate,
        targetAmount,
        currentAmount,
        priority,
      } = req.body;

      // Find or create calendar entry
      let calendarEntry = await prisma.lifeCalendarEntry.findFirst({
        where: {
          userId: req.userId!,
          year: parseInt(year),
        },
      });

      if (!calendarEntry) {
        // Create calendar entry if it doesn't exist
        calendarEntry = await prisma.lifeCalendarEntry.create({
          data: {
            userId: req.userId!,
            year: parseInt(year),
          },
        });
      }

      const milestone = await prisma.milestone.create({
        data: {
          calendarId: calendarEntry.id,
          title,
          description,
          type,
          targetDate: new Date(targetDate),
          targetAmount,
          currentAmount,
          priority: priority || 0,
        },
      });

      return ResponseUtil.created(
        res,
        milestone,
        "Milestone created successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Update milestone
  static async updateMilestone(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { milestoneId } = req.params;
      const {
        title,
        description,
        type,
        targetDate,
        targetAmount,
        currentAmount,
        status,
        priority,
      } = req.body;

      const milestone = await prisma.milestone.findUnique({
        where: { id: milestoneId },
        include: {
          calendar: true,
        },
      });

      if (!milestone || milestone.calendar.userId !== req.userId) {
        throw new AppError("Milestone not found", 404);
      }

      const updatedMilestone = await prisma.milestone.update({
        where: { id: milestoneId },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(type !== undefined && { type }),
          ...(targetDate !== undefined && {
            targetDate: new Date(targetDate),
          }),
          ...(targetAmount !== undefined && { targetAmount }),
          ...(currentAmount !== undefined && { currentAmount }),
          ...(status !== undefined && { status }),
          ...(priority !== undefined && { priority }),
        },
      });

      return ResponseUtil.success(
        res,
        updatedMilestone,
        "Milestone updated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Delete milestone
  static async deleteMilestone(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { milestoneId } = req.params;

      const milestone = await prisma.milestone.findUnique({
        where: { id: milestoneId },
        include: {
          calendar: true,
        },
      });

      if (!milestone || milestone.calendar.userId !== req.userId) {
        throw new AppError("Milestone not found", 404);
      }

      await prisma.milestone.delete({
        where: { id: milestoneId },
      });

      return ResponseUtil.success(res, null, "Milestone deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  // Get milestones by year
  static async getMilestones(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { year } = req.params;

      const entry = await prisma.lifeCalendarEntry.findFirst({
        where: {
          userId: req.userId!,
          year: parseInt(year),
        },
        include: {
          milestones: {
            orderBy: { targetDate: "asc" },
          },
        },
      });

      if (!entry) {
        return ResponseUtil.success(res, []);
      }

      return ResponseUtil.success(res, entry.milestones);
    } catch (error) {
      next(error);
    }
  }
}
