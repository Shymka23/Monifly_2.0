export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, details);
    this.name = "ValidationError";
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super(message, 401);
    this.name = "AuthError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export function handleError(error: unknown) {
  if (error instanceof AppError) {
    return {
      error: error.message,
      details: error.details,
      status: error.statusCode,
    };
  }

  console.error("Unexpected error:", error);
  return {
    error: "Внутрішня помилка сервера",
    status: 500,
  };
}
