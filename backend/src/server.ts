import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import walletRoutes from "./routes/wallet.routes";
import transactionRoutes from "./routes/transaction.routes";
import budgetRoutes from "./routes/budget.routes";
import goalRoutes from "./routes/goal.routes";
import debtRoutes from "./routes/debt.routes";
import cryptoRoutes from "./routes/crypto.routes";
import investmentRoutes from "./routes/investment.routes";
import lifeCalendarRoutes from "./routes/life-calendar.routes";
import analyticsRoutes from "./routes/analytics.routes";

// Import middleware
import { errorHandler } from "./middleware/error.middleware";
import { notFound } from "./middleware/not-found.middleware";
import { rateLimiter } from "./middleware/rate-limiter.middleware";

// Import utils
import { logger } from "./utils/logger";
import { connectDatabase } from "./database/connection";

// Initialize Express app
const app: Application = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  },
});

// Make io accessible in routes
app.set("io", io);

// Middleware
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(compression()); // Compress responses
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  morgan("combined", {
    stream: {
      write: message => logger.info(message.trim()),
    },
  })
);

// Rate limiting
app.use("/api", rateLimiter);

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "success",
    message: "Monifly API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
const apiVersion = process.env.API_VERSION || "v1";
app.use(`/api/${apiVersion}/auth`, authRoutes);
app.use(`/api/${apiVersion}/users`, userRoutes);
app.use(`/api/${apiVersion}/wallets`, walletRoutes);
app.use(`/api/${apiVersion}/transactions`, transactionRoutes);
app.use(`/api/${apiVersion}/budgets`, budgetRoutes);
app.use(`/api/${apiVersion}/goals`, goalRoutes);
app.use(`/api/${apiVersion}/debts`, debtRoutes);
app.use(`/api/${apiVersion}/crypto`, cryptoRoutes);
app.use(`/api/${apiVersion}/investments`, investmentRoutes);
app.use(`/api/${apiVersion}/life-calendar`, lifeCalendarRoutes);
app.use(`/api/${apiVersion}/analytics`, analyticsRoutes);

// WebSocket events
io.on("connection", socket => {
  logger.info(`WebSocket client connected: ${socket.id}`);

  socket.on("join-room", (userId: string) => {
    socket.join(`user:${userId}`);
    logger.info(`User ${userId} joined their room`);
  });

  socket.on("disconnect", () => {
    logger.info(`WebSocket client disconnected: ${socket.id}`);
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    logger.info("✓ Database connected successfully");

    // Start HTTP server
    httpServer.listen(PORT, () => {
      logger.info(`✓ Server is running on port ${PORT}`);
      logger.info(`✓ Environment: ${process.env.NODE_ENV}`);
      logger.info(
        `✓ API available at http://localhost:${PORT}/api/${apiVersion}`
      );
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  logger.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  httpServer.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
});

startServer();

export { app, io };
