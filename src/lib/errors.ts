export class BaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends BaseError {
  constructor(message: string, public errors: unknown[]) {
    super(message, "VALIDATION_ERROR");
    this.errors = errors;
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string) {
    super(message, "NOT_FOUND");
  }
}

export class AuthError extends BaseError {
  constructor(message: string) {
    super(message, "AUTH_ERROR");
  }
}

export class EmailError extends BaseError {
  constructor(
    message: string,
    code:
      | "SERVICE_UNAVAILABLE"
      | "CLIENT_ERROR"
      | "SERVER_ERROR"
      | "AUTH_ERROR"
      | "RATE_LIMIT_EXCEEDED"
      | "UNKNOWN_ERROR",
    originalError?: unknown
  ) {
    super(message, code, originalError);
  }
}

export const handleError = (
  error: unknown
): { error: string; status: number } => {
  if (error instanceof ValidationError) {
    return { error: error.message, status: 400 };
  }
  if (error instanceof NotFoundError) {
    return { error: error.message, status: 404 };
  }
  if (error instanceof AuthError) {
    return { error: error.message, status: 401 };
  }
  if (error instanceof EmailError) {
    switch (error.code) {
      case "SERVICE_UNAVAILABLE":
        return { error: error.message, status: 503 };
      case "CLIENT_ERROR":
        return { error: error.message, status: 400 };
      case "SERVER_ERROR":
        return { error: error.message, status: 500 };
      case "AUTH_ERROR":
        return { error: error.message, status: 401 };
      case "RATE_LIMIT_EXCEEDED":
        return { error: error.message, status: 429 };
      default:
        return { error: error.message, status: 500 };
    }
  }
  if (error instanceof Error) {
    return { error: error.message, status: 500 };
  }
  return { error: "An unknown error occurred", status: 500 };
};
