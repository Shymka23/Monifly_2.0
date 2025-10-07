"use server";
/**
 * @fileOverview Предоставляет общие советы по диверсификации инвестиционного портфеля.
 * ЭТО НЕ ФИНАНСОВЫЙ СОВЕТ.
 *
 * - getInvestmentPortfolioAdvice - Функция, генерирующая совет.
 * - InvestmentPortfolioAdviceInput - Входной тип.
 * - InvestmentPortfolioAdviceOutput - Возвращаемый тип.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";
import type {
  InvestmentPortfolioAdviceInput as InputType,
  InvestmentPortfolioAdviceOutput as OutputType,
} from "@/lib/types";
import { toast } from "@/hooks/use-toast";

// Re-define schema for Genkit
const InvestmentPortfolioAdviceInputSchema = z.object({
  portfolioSummary: z
    .string()
    .describe(
      "Текстовое описание структуры портфеля по типам активов и регионам, а также его общая стоимость."
    ),
});
export type InvestmentPortfolioAdviceInput = InputType;

const InvestmentPortfolioAdviceOutputSchema = z.object({
  advice: z
    .array(z.string())
    .describe(
      "Сгенерированный ИИ общий совет по диверсификации, НЕ ЯВЛЯЮЩИЙСЯ ФИНАНСОВЫМ СОВЕТОМ."
    ),
  recommendations: z
    .array(z.string())
    .describe("Рекомендации по улучшению портфеля."),
  riskAssessment: z.string().describe("Оценка рисков портфеля."),
});
export type InvestmentPortfolioAdviceOutput = OutputType;

export async function getInvestmentPortfolioAdvice(
  input: InvestmentPortfolioAdviceInput
): Promise<InvestmentPortfolioAdviceOutput> {
  try {
    return await getInvestmentPortfolioAdviceFlow(input);
  } catch (error) {
    toast({
      title: "Помилка AI-помічника",
      description: "Не вдалося обробити запит. Спробуйте ще раз пізніше.",
      variant: "destructive",
    });
    throw error;
  }
}

const prompt = ai.definePrompt({
  name: "investmentPortfolioAdvicePrompt",
  model: "googleai/gemini-1.5-flash-latest",
  input: { schema: InvestmentPortfolioAdviceInputSchema },
  output: { schema: InvestmentPortfolioAdviceOutputSchema },
  prompt: `Ты — AI-ассистент, который анализирует описание структуры инвестиционного портфеля и предоставляет ОЧЕНЬ ОБЩИЕ советы по диверсификации. 
Твои ответы НЕ ДОЛЖНЫ содержать конкретных финансовых советов, предсказаний или рекомендаций к покупке/продаже отдельных активов.
Твоя задача — дать общие мысли о структуре портфеля, которые могут быть интересны пользователю, основываясь на предоставленной информации. 
Всегда подчеркивай, что это не финансовый совет, а общие наблюдения. Отвечай на русском языке.

Структура портфеля:
{{{portfolioSummary}}}

Предоставь краткий (2-3 пункта) совет. Например, ты можешь упомянуть:
- О рисках высокой концентрации в одном типе активов или регионе.
- О важности диверсификации для снижения рисков.
- Общие соображения о балансе между риском и доходностью (например, "более консервативные инвесторы могут предпочитать большую долю облигаций").
- Если портфель кажется несбалансированным (например, 90% в одном активе), мягко укажи на это.

Будь осторожен, нейтрален и избегай категоричных утверждений.
Начинай ответ с фразы: "Основываясь на предоставленной структуре вашего портфеля, вот несколько общих соображений (помните, это не финансовый совет):"
Не давай советов по конкретным активам или компаниям. Только общие принципы.
`,
});

const getInvestmentPortfolioAdviceFlow = ai.defineFlow(
  {
    name: "getInvestmentPortfolioAdviceFlow",
    inputSchema: InvestmentPortfolioAdviceInputSchema,
    outputSchema: InvestmentPortfolioAdviceOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    if (!output) {
      return {
        advice: [
          "К сожалению, не удалось сгенерировать совет по вашему портфелю в данный момент.",
        ],
        recommendations: [],
        riskAssessment: "Не удалось оценить риски.",
      };
    }
    return output;
  }
);
