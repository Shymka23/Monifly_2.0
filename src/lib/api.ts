import axios, { AxiosError } from "axios";
import { config } from "./env";
import { toast } from "@/components/ui/use-toast";

export interface ApiError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

const api = axios.create({
  baseURL: config.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(config => {
  // Only add token in browser environment
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  response => response,
  async (error: AxiosError<ApiError>) => {
    // Handle network errors
    if (!error.response) {
      toast({
        title: "Помилка мережі",
        description: "Перевірте підключення до інтернету",
        variant: "destructive",
      });
      return Promise.reject(error);
    }

    // Handle API errors
    const { status } = error.response;
    const data = error.response.data;

    switch (status) {
      case 401:
        // Clear token and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
        }
        break;

      case 403:
        toast({
          title: "Доступ заборонено",
          description: data.message || "У вас немає прав для цієї дії",
          variant: "destructive",
        });
        break;

      case 422:
        // Validation errors
        if (data.errors) {
          Object.values(data.errors).forEach(messages => {
            messages.forEach(message => {
              toast({
                title: "Помилка валідації",
                description: message,
                variant: "destructive",
              });
            });
          });
        }
        break;

      default:
        toast({
          title: "Помилка",
          description: data.message || "Щось пішло не так",
          variant: "destructive",
        });
    }

    return Promise.reject(error);
  }
);

export default api;

// Type-safe API endpoints
export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
  },
  user: {
    profile: "/user/profile",
    settings: "/user/settings",
    stats: "/user/stats",
  },
  wallets: {
    list: "/wallets",
    create: "/wallets",
    update: (id: string) => `/wallets/${id}`,
    delete: (id: string) => `/wallets/${id}`,
  },
  transactions: {
    list: "/transactions",
    create: "/transactions",
    update: (id: string) => `/transactions/${id}`,
    delete: (id: string) => `/transactions/${id}`,
  },
  budgets: {
    list: "/budgets",
    create: "/budgets",
    update: (id: string) => `/budgets/${id}`,
    delete: (id: string) => `/budgets/${id}`,
    stats: "/budgets/stats",
  },
  goals: {
    list: "/goals",
    create: "/goals",
    update: (id: string) => `/goals/${id}`,
    delete: (id: string) => `/goals/${id}`,
  },
} as const;
