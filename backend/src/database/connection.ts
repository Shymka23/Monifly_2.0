import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";

// Singleton instance
let prisma: PrismaClient;

// Create Prisma client with logging
export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  }
  return prisma;
};

// Connect to database
export const connectDatabase = async (): Promise<void> => {
  try {
    const client = getPrismaClient();
    await client.$connect();
    logger.info("Database connected successfully");
  } catch (error) {
    logger.error("Database connection failed:", error);
    throw error;
  }
};

// Disconnect from database
export const disconnectDatabase = async (): Promise<void> => {
  try {
    const client = getPrismaClient();
    await client.$disconnect();
    logger.info("Database disconnected successfully");
  } catch (error) {
    logger.error("Database disconnection failed:", error);
    throw error;
  }
};

export { prisma };
