import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currencyCode: string = "RUB",
  short: boolean = false
) {
  let locale = "ru-RU";
  const upperCurrencyCode = currencyCode.toUpperCase();

  if (upperCurrencyCode === "USD") locale = "en-US";
  else if (upperCurrencyCode === "EUR")
    locale = "de-DE"; // German locale for Euro
  else if (upperCurrencyCode === "UAH") locale = "uk-UA";
  else if (upperCurrencyCode === "GBP") locale = "en-GB";
  else if (upperCurrencyCode === "JPY") locale = "ja-JP";
  // For other currencies, 'ru-RU' with the currency code often works or a generic 'en-US' can be a fallback if issues.

  const isCrypto = upperCurrencyCode === "BTC" || upperCurrencyCode === "ETH";

  const options: Intl.NumberFormatOptions = {
    style: "currency",
    currency: upperCurrencyCode,
    minimumFractionDigits: isCrypto ? 2 : 0,
    maximumFractionDigits: isCrypto ? 8 : 2, // Allow up to 2 for fiat, more for crypto
  };

  // Ensure fiat currencies show 2 decimal places if not whole number, or 0 if whole.
  if (!isCrypto) {
    if (Math.abs(amount) % 1 !== 0) {
      // Check if amount has decimal part
      options.minimumFractionDigits = 2;
      options.maximumFractionDigits = 2;
    } else {
      options.minimumFractionDigits = 0;
      options.maximumFractionDigits = 0;
    }
  }

  if (short) {
    if (Math.abs(amount) >= 1_000_000) {
      return new Intl.NumberFormat(locale, {
        notation: "compact",
        compactDisplay: "short",
        currency: upperCurrencyCode,
        style: "currency",
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(amount);
    } else if (Math.abs(amount) >= 1_000) {
      return new Intl.NumberFormat(locale, {
        notation: "compact",
        compactDisplay: "short",
        currency: upperCurrencyCode,
        style: "currency",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    }
    // For smaller amounts when 'short' is true, adjust decimals if it's a whole number
    if (!isCrypto && amount % 1 === 0) {
      options.minimumFractionDigits = 0;
      options.maximumFractionDigits = 0;
    }
  }

  try {
    return new Intl.NumberFormat(locale, options).format(amount);
  } catch {
    // Fallback for unsupported currency/locale combinations
    const fallbackOptions = {
      ...options,
      currencyDisplay: "code",
    } as Intl.NumberFormatOptions;
    try {
      return new Intl.NumberFormat(undefined, fallbackOptions).format(amount); // Use undefined locale for system default
    } catch {
      return `${amount.toFixed(2)} ${upperCurrencyCode}`; // Absolute fallback
    }
  }
}
