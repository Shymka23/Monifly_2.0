"use server";
/**
 * @fileOverview Generates an AI-powered reminder message for a financial goal.
 *
 * - generateGoalReminder - Function that generates the reminder.
 * - GenerateGoalReminderInput - The input type for the function.
 * - GenerateGoalReminderOutput - The return type for the function.
 */

import { ai } from "@/ai/genkit";
// @ts-ignore - Ігноруємо помилку типів для genkit
import { z } from "genkit";
import { toast } from '@/hooks/use-toast';

// Define Zod schemas for input and output INSIDE this file. Do not export them.
const GenerateGoalReminderInputSchema = z.object({
  goalName: z.string().describe("Название финансовой цели."),
  daysRemaining: z
    .number()
    .int()
    .min(0)
    .describe(
      "Количество дней, оставшихся до прогнозируемой даты достижения цели."
    ),
  targetAmount: z.number().describe("Целевая сумма для накопления."),
  targetCurrency: z
    .string()
    .min(3)
    .max(3)
    .describe("Трехбуквенный код валюты цели (например, USD, EUR, RUB)."),
  monthlyContribution: z
    .number()
    .describe("Ежемесячный планируемый взнос в валюте цели."),
});
export type GenerateGoalReminderInput = z.infer<
  typeof GenerateGoalReminderInputSchema
>;

const GenerateGoalReminderOutputSchema = z.object({
  reminderMessage: z
    .string()
    .describe("Сгенерированное ИИ сообщение-напоминание."),
});
export type GenerateGoalReminderOutput = z.infer<
  typeof GenerateGoalReminderOutputSchema
>;

// Exported async wrapper function that calls the flow
export async function generateGoalReminder(
  input: GenerateGoalReminderInput
): Promise<GenerateGoalReminderOutput> {
  try {
    return await generateGoalReminderFlow(input);
  } catch (error) {
    toast({
      title: 'Помилка AI-помічника',
      description: 'Не вдалося обробити запит. Спробуйте ще раз пізніше.',
      variant: 'destructive',
    });
    throw error;
  }
}

const reminderPrompt = ai.definePrompt({
  name: "goalReminderPrompt",
  model: "googleai/gemini-1.5-flash-latest",
  input: { schema: GenerateGoalReminderInputSchema },
  output: { schema: GenerateGoalReminderOutputSchema },
  prompt: `Ты — дружелюбный и мотивирующий финансовый помощник. Твоя задача — создать краткое, ободряющее напоминание для пользователя о его финансовой цели. Отвечай на русском языке.

Информация о цели:
- Название цели: {{{goalName}}}
- Осталось дней до планового достижения: {{{daysRemaining}}}
- Целевая сумма: {{{targetAmount}}} {{{targetCurrency}}}
- Планируемый ежемесячный взнос: {{{monthlyContribution}}} {{{targetCurrency}}}

Сгенерируй напоминание (1-2 предложения).
- Если дней осталось мало (0-3), подчеркни, что цель уже очень близко.
- Если дней больше, напомни о важности регулярных взносов или просто поддержи.
- Будь позитивным и избегай строгого или требовательного тона.

Примеры:
- Для цели "Новый ноутбук", 2 дня: "Ура! До вашего нового ноутбука осталось всего 2 дня! Вы почти у цели!"
- Для цели "Отпуск в горах", 7 дней: "Не забывайте о своей мечте – отпуск в горах уже через неделю! Продолжайте в том же духе с накоплениями."
- Для цели "Подушка безопасности", 30 дней: "Отлично! До формирования подушки безопасности остался всего месяц. Регулярные взносы помогут вам достичь этого!"

Твой ответ должен быть только текстом напоминания.
`,
});

const generateGoalReminderFlow = ai.defineFlow(
  {
    name: "generateGoalReminderFlow",
    inputSchema: GenerateGoalReminderInputSchema,
    outputSchema: GenerateGoalReminderOutputSchema,
  },
  async (input) => {
    const { output } = await reminderPrompt(input);
    if (!output) {
      throw new Error("Не удалось сгенерировать напоминание.");
    }
    return output;
  }
);
