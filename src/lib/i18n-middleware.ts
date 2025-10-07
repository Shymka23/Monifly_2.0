import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Підтримувані мови (синхронізовано з i18n конфігурацією)
const SUPPORTED_LANGUAGES = ["en", "uk", "ru", "de", "es", "fr"];
const DEFAULT_LANGUAGE = "en";

// Функція для визначення мови з заголовків браузера
function getPreferredLanguage(acceptLanguage: string | null): string {
  if (!acceptLanguage) return DEFAULT_LANGUAGE;

  // Парсимо Accept-Language заголовок
  const languages = acceptLanguage
    .split(",")
    .map(lang => {
      const [code, priority] = lang.trim().split(";q=");
      return {
        code: code.toLowerCase().split("-")[0], // Беремо тільки основну частину (en замість en-US)
        priority: priority ? parseFloat(priority) : 1.0,
      };
    })
    .sort((a, b) => b.priority - a.priority);

  // Знаходимо першу підтримувану мову
  for (const lang of languages) {
    if (SUPPORTED_LANGUAGES.includes(lang.code)) {
      return lang.code;
    }
  }

  return DEFAULT_LANGUAGE;
}

export function i18nMiddleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Пропускаємо статичні файли та API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/locales") ||
    pathname.includes(".") // файли з розширеннями
  ) {
    return NextResponse.next();
  }

  // Отримуємо мову з cookies або заголовків браузера
  const cookieLanguage = request.cookies.get("i18next")?.value;
  const headerLanguage = getPreferredLanguage(
    request.headers.get("accept-language")
  );

  let preferredLanguage = DEFAULT_LANGUAGE;

  if (cookieLanguage && SUPPORTED_LANGUAGES.includes(cookieLanguage)) {
    preferredLanguage = cookieLanguage;
  } else if (headerLanguage) {
    preferredLanguage = headerLanguage;
  }

  // Створюємо відповідь
  const response = NextResponse.next();

  // Встановлюємо мову в заголовки відповіді
  response.headers.set("x-detected-language", preferredLanguage);

  // Встановлюємо cookie якщо його немає
  if (!cookieLanguage) {
    response.cookies.set("i18next", preferredLanguage, {
      maxAge: 365 * 24 * 60 * 60, // 1 рік
      httpOnly: false, // Дозволяємо читання з JavaScript
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  return response;
}

// Експорт для використання в головному middleware
export { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE };
