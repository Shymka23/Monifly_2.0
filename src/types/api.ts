export interface ApiError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}
