"use server";
/**
 * @fileOverview AI flow to parse user input for a financial goal and generate an image for it.
 *
 * - createSmartFinancialGoal - Parses naturalinput to create a financial goal structure and generate an image.
 * - SmartGoalCreatorInput - The input type (imported from @/lib/types).
 * - SmartGoalCreatorOutput - The return type (imported from @/lib/types).
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";
import type {
  SmartGoalCreatorInput as InputType,
  SmartGoalCreatorOutput as OutputType,
} from "@/lib/types";
import { toast } from "@/hooks/use-toast";

const SmartGoalCreatorInputSchema = z.object({
  userInput: z
    .string()
    .describe(
      'Пользовательский ввод для финансовой цели, например, "купить машину Cupra Formentor за 40000 долларов" или "накопить на отпуск в Таиланде 3000 евро".'
    ),
});

const SmartGoalCreatorOutputSchema = z.object({
  goals: z.array(z.any()).describe("Список сгенерированных финансовых целей."),
  recommendations: z
    .array(z.string())
    .describe("Рекомендации по достижению целей."),
  timeline: z.string().describe("Временные рамки для достижения целей."),
  priority: z.enum(["low", "medium", "high"]).describe("Приоритет целей."),
  targetAmount: z.number().describe("Целевая сумма."),
  totalProjectedSavings: z
    .number()
    .describe("Общая прогнозируемая сумма накоплений."),
});

export async function createSmartFinancialGoal(
  input: InputType
): Promise<OutputType> {
  try {
    return await smartGoalCreatorFlow(input);
  } catch (error) {
    toast({
      title: "Помилка AI-помічника",
      description: "Не вдалося обробити запит. Спробуйте ще раз пізніше.",
      variant: "destructive",
    });
    throw error;
  }
}

const parsingPrompt = ai.definePrompt({
  name: "parseFinancialGoalPrompt",
  model: "googleai/gemini-1.5-flash-latest",
  input: { schema: SmartGoalCreatorInputSchema },
  output: {
    schema: z.object({
      goalName: z
        .string()
        .describe(
          'Сгенерированное название цели, которое четко описывает цель. Например, если пользователь вводит "машина за 10к", цель может быть "Покупка машины". Если "купить новую машину Тесла", то "Покупка новой машины Тесла".'
        ),
      itemNameForImage: z
        .string()
        .describe(
          'Наиболее конкретный предмет или концепция из пользовательского ввода, подходящая для генерации изображения. Например, для "купить машину Cupra Formentor за 40000 долларов" это будет "Cupra Formentor". Для "накопить на отпуск в Таиланде" это будет "Отпуск в Таиланде". Для "создать фонд на черный день 100000 рублей" это будет "Резервный фонд".'
        ),
      targetAmount: z
        .number()
        .describe(
          "Числовое значение целевой суммы. Если сумма не указана, используй 0."
        ),
      targetCurrency: z
        .string()
        .min(3)
        .max(3)
        .describe(
          'Трехбуквенный код валюты (например, USD, EUR, RUB). Если не указана, используй "RUB". Валюту определи по контексту (например, "долларов" -> USD, "евро" -> EUR, "рублей" -> RUB).'
        ),
    }),
  },
  prompt: `Ты — умный ассистент, который помогает пользователям создавать финансовые цели.
Проанализируй следующий запрос пользователя и извлеки из него информацию для создания цели.

Запрос пользователя:
{{{userInput}}}

Извлеки следующую информацию:
1.  **goalName**: Сгенерируй краткое, но информативное название для цели. Оно должно отражать суть запроса.
2.  **itemNameForImage**: Определи главный предмет или концепцию из запроса, для которого можно сгенерировать изображение. Это должно быть что-то конкретное.
3.  **targetAmount**: Определи целевую сумму. Если сумма не указана, верни 0.
4.  **targetCurrency**: Определи валюту цели (трехбуквенный код, например, USD, EUR, RUB). Если валюта не указана явно, предположи RUB. Распознавай слова "долларов", "евро", "рублей" и т.п.

Ответь СТРОГО в формате JSON согласно предоставленной схеме вывода. Не добавляй никакого другого текста до или после JSON.
Пример:
Запрос: "хочу накопить на новый ноутбук Macbook Pro примерно за 2500 долларов"
Результат JSON:
{
  "goalName": "Покупка нового Macbook Pro",
  "itemNameForImage": "Macbook Pro",
  "targetAmount": 2500,
  "targetCurrency": "USD"
}

Запрос: "создать подушку безопасности 500 тыс рублей"
Результат JSON:
{
  "goalName": "Создание подушки безопасности",
  "itemNameForImage": "Подушка безопасности",
  "targetAmount": 500000,
  "targetCurrency": "RUB"
}
`,
});

const smartGoalCreatorFlow = ai.defineFlow(
  {
    name: "smartGoalCreatorFlow",
    inputSchema: SmartGoalCreatorInputSchema,
    outputSchema: SmartGoalCreatorOutputSchema,
  },
  async input => {
    const { output: parsedDetails } = await parsingPrompt(input);

    if (!parsedDetails) {
      throw new Error("Не удалось разобрать детали цели.");
    }

    const { goalName, itemNameForImage, targetAmount, targetCurrency } =
      parsedDetails;
    let generatedImageUrl: string | undefined = undefined;

    if (itemNameForImage) {
      try {
        const imagePrompt = `Фотография: ${itemNameForImage}. Высококачественное изображение, показывающее предмет или концепцию цели.`;
        const { media } = await ai.generate({
          model: "googleai/gemini-2.0-flash-preview-image-generation",
          prompt: imagePrompt,
          config: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        });

        if (media && media.url) {
          generatedImageUrl = media.url;
        }
      } catch {
        // console.warn("Error parsing goal details:"); // Removed for production
        throw new Error("Не удалось разобрать детали цели.");
      }
    }

    return {
      goals: [
        {
          id: `goal-${Date.now()}`,
          type: "saving" as const,
          amount: targetAmount,
          currency: targetCurrency,
          title: goalName,
          description: `Цель: ${goalName}`,
          isRecurring: false,
          targetAmount: targetAmount,
          imageUrl: generatedImageUrl,
        },
      ],
      recommendations: [
        "Регулярно откладывайте средства для достижения цели",
        "Рассмотрите возможность инвестирования части средств",
        "Создайте отдельный счет для этой цели",
      ],
      timeline: "12-24 месяца",
      priority: "medium" as const,
      targetAmount: targetAmount,
      totalProjectedSavings: targetAmount,
    };
  }
);
