import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { ResponseUtil } from "../utils/response";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log error
  logger.error("Error:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Check if it's an operational error
  if (err instanceof AppError) {
    ResponseUtil.error(
      res,
      err.message,
      err.statusCode,
      process.env.NODE_ENV === "development" ? err.stack : undefined
    );
    return;
  }

  // Handle Prisma errors
  if (err.name === "PrismaClientKnownRequestError") {
    ResponseUtil.error(res, "Database error occurred", 400);
    return;
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    ResponseUtil.badRequest(res, err.message);
    return;
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    ResponseUtil.unauthorized(res, "Invalid token");
    return;
  }

  if (err.name === "TokenExpiredError") {
    ResponseUtil.unauthorized(res, "Token expired");
    return;
  }

  // Default error response
  ResponseUtil.error(
    res,
    "Internal server error",
    500,
    process.env.NODE_ENV === "development" ? err.stack : undefined
  );
};
