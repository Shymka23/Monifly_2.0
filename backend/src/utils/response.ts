import { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export class ResponseUtil {
  static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode = 200
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message: message || "Success",
      data,
    };
    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message?: string): Response {
    return this.success(
      res,
      data,
      message || "Resource created successfully",
      201
    );
  }

  static error(
    res: Response,
    message: string,
    statusCode = 500,
    error?: any
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      error: process.env.NODE_ENV === "development" ? error : undefined,
    };
    return res.status(statusCode).json(response);
  }

  static badRequest(res: Response, message: string, error?: any): Response {
    return this.error(res, message, 400, error);
  }

  static unauthorized(res: Response, message = "Unauthorized"): Response {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message = "Forbidden"): Response {
    return this.error(res, message, 403);
  }

  static notFound(res: Response, message = "Resource not found"): Response {
    return this.error(res, message, 404);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
  ): Response {
    const totalPages = Math.ceil(total / limit);
    const response: ApiResponse<T[]> = {
      success: true,
      message: message || "Success",
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
    return res.status(200).json(response);
  }
}
