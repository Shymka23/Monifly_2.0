// "use server"; // Temporarily disabled
/**
 * @fileOverview Предоставляет текстовые "наблюдения" по криптопортфелю на основе ИИ.
 * ЭТО НЕ ФИНАНСОВЫЙ СОВЕТ.
 *
 * - getCryptoInsights - Функция, генерирующая наблюдения.
 * - CryptoPortfolioInsightsInput - Входной тип для функции getCryptoInsights.
 * - CryptoPortfolioInsightsOutput - Возвращаемый тип для функции getCryptoInsights.
 */

import type {
  CryptoPortfolioInsightsInput as InputType,
  CryptoPortfolioInsightsOutput as OutputType,
} from "@/lib/types";

export type CryptoPortfolioInsightsInput = InputType;
export type CryptoPortfolioInsightsOutput = OutputType;

export async function getCryptoInsights(
  _input: CryptoPortfolioInsightsInput
): Promise<CryptoPortfolioInsightsOutput> {
  // Temporarily disabled AI functionality
  return {
    insights: ["AI functionality temporarily disabled"],
    recommendations: ["Please check back later"],
    riskAssessment: "Unable to assess risks at this time",
  };
}
