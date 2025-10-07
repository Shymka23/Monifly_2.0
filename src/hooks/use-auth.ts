import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { logger } from "@/lib/logger";
import { ApiError } from "@/types/api";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const login = async (email: string, password: string) => {
    try {
      // Спочатку робимо запит до API
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { data } = response.data;
      const { accessToken } = data;

      // Зберігаємо токен
      localStorage.setItem("accessToken", accessToken);

      // Тепер робимо вхід через NextAuth
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Помилка входу",
          description: result.error,
          variant: "destructive",
        });
        return false;
      }

      router.push("/dashboard");
      return true;
    } catch (error) {
      logger.error("Login error:", error);

      const apiError = error as { response?: { data?: ApiError } };
      const errorMessage =
        apiError.response?.data?.message ||
        "Не вдалося увійти. Спробуйте пізніше.";

      toast({
        title: "Помилка входу",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    name: string;
  }) => {
    try {
      await api.post("/auth/register", data);

      // Auto login after registration
      return login(data.email, data.password);
    } catch (error) {
      logger.error("Registration error:", error);

      const apiError = error as { response?: { data?: ApiError } };
      const errorMessage =
        apiError.response?.data?.message || "Не вдалося зареєструватися";

      toast({
        title: "Помилка реєстрації",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut({ redirect: false });
      localStorage.removeItem("accessToken");
      router.push("/login");
    } catch (error) {
      logger.error("Logout error:", error);
      toast({
        title: "Помилка",
        description: "Не вдалося вийти. Спробуйте пізніше.",
        variant: "destructive",
      });
    }
  };

  return {
    user: session?.user,
    isAuthenticated: !!session?.user,
    isLoading: status === "loading",
    login,
    register,
    logout,
  };
}
