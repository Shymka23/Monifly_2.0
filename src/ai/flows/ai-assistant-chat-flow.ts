"use server";
/**
 * @fileOverview AI-ассистент для чата по финансовым вопросам.
 *
 * - aiAssistantChat - Основная функция для обработки сообщений чата.
 * - AiAssistantChatInput - Входной тип для функции.
 * - AiAssistantChatOutput - Возвращаемый тип для функции.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";
// import { toast } from '@/hooks/use-toast';
import crypto from 'crypto';

// --- Simple in-memory cache ---
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 хвилин
const aiCache = new Map<string, { value: AiAssistantChatOutput; expires: number }>();
function getCacheKey(input: AiAssistantChatInput) {
  // Створюємо хеш від JSON.stringify(input)
  return crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
}

// --- Инструменты ---

const GetSavingsSuggestionsInputSchema = z.object({
  financialContext: z
    .string()
    .optional()
    .describe(
      "Краткое описание финансовой ситуации пользователя, если предоставлено."
    ),
});
const GetSavingsSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe("Список советов по экономии."),
});
const getSavingsSuggestionsTool = ai.defineTool(
  {
    name: "getSavingsSuggestionsTool",
    description:
      "Предоставляет общие советы по экономии, возможно, адаптированные под контекст пользователя.",
    inputSchema: GetSavingsSuggestionsInputSchema,
    outputSchema: GetSavingsSuggestionsOutputSchema,
  },
  async ({ financialContext }) => {
    const baseSuggestions = [
      "Отслеживайте свои расходы, чтобы понять, куда уходят деньги.",
      "Составьте бюджет и придерживайтесь его.",
      "Ищите скидки и специальные предложения перед крупными покупками.",
      "Откажитесь от ненужных подписок.",
      "Готовьте еду дома чаще, чем питаться вне дома.",
      "Сравнивайте цены на товары и услуги.",
    ];
    if (financialContext) {
      baseSuggestions.push(
        `Учитывая ваш контекст (${financialContext}), возможно, стоит обратить внимание на... (это общая рекомендация).`
      );
    }
    return { suggestions: baseSuggestions };
  }
);

const GetInvestmentInformationInputSchema = z.object({
  topic: z
    .string()
    .optional()
    .describe(
      "Конкретная тема инвестиций, о которой спрашивает пользователь, например 'акции', 'облигации', 'недвижимость', 'криптовалюты'."
    ),
});
const GetInvestmentInformationOutputSchema = z.object({
  information: z
    .string()
    .describe("Общая информация по инвестициям. Это не финансовый совет!"),
});
const getInvestmentInformationTool = ai.defineTool(
  {
    name: "getInvestmentInformationTool",
    description:
      "Предоставляет ОБЩУЮ И ОБУЧАЮЩУЮ информацию о различных типах инвестиций. НЕ ДАЕТ ФИНАНСОВЫХ СОВЕТОВ.",
    inputSchema: GetInvestmentInformationInputSchema,
    outputSchema: GetInvestmentInformationOutputSchema,
  },
  async ({ topic }) => {
    let info = "";
    switch (topic?.toLowerCase()) {
      case "акции":
        info =
          "Акции представляют собой долю владения в компании. Инвестиции в акции могут принести доход за счет роста их стоимости и дивидендов, но сопряжены с риском потерь.";
        break;
      case "облигации":
        info =
          "Облигации — это долговые ценные бумаги. Покупая облигацию, вы даете в долг эмитенту (компании или государству) и получаете процентный доход. Считаются менее рискованными, чем акции.";
        break;
      case "недвижимость":
        info =
          "Инвестиции в недвижимость могут приносить доход от аренды или перепродажи. Требуют значительного капитала и могут быть менее ликвидными.";
        break;
      case "криптовалюты":
        info =
          "Криптовалюты — это цифровые или виртуальные валюты, использующие криптографию для безопасности. Они очень волатильны и считаются высокорискованными инвестициями.";
        break;
      default:
        info =
          "Существует множество видов инвестиций: акции, облигации, недвижимость, криптовалюты, паевые фонды и т.д. Каждый инструмент имеет свои риски и потенциальную доходность.";
    }
    return {
      information: `${info} ВАЖНО: Это общая информация, а не финансовый совет. Перед принятием инвестиционных решений проконсультируйтесь с квалифицированным финансовым советником.`,
    };
  }
);

// --- Схемы и типы ---

// Внешняя схема для Flow
const AiAssistantChatInputSchema = z.object({
  userMessage: z.string().describe("Сообщение от пользователя."),
  chatHistory: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        content: z.string(),
      })
    )
    .optional()
    .describe("История предыдущих сообщений в чате для контекста."),
  financialContext: z
    .string()
    .optional()
    .describe(
      "Сводка текущего финансового состояния пользователя, включая балансы кошельков и недавние транзакции."
    ),
});
export type AiAssistantChatInput = z.infer<typeof AiAssistantChatInputSchema>;

const AiAssistantChatOutputSchema = z.object({
  aiResponse: z.string().describe("Ответ AI-ассистента."),
});
export type AiAssistantChatOutput = z.infer<typeof AiAssistantChatOutputSchema>;

// Внутренняя схема для промпта, с добавленным полем isUser
const PromptInputSchema = z.object({
  userMessage: z.string().describe("Сообщение от пользователя."),
  chatHistory: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        content: z.string(),
        isUser: z.boolean(),
      })
    )
    .optional()
    .describe("История предыдущих сообщений в чате для контекста."),
  financialContext: z
    .string()
    .optional()
    .describe(
      "Сводка текущего финансового состояния пользователя, включая балансы кошельков и недавние транзакции."
    ),
});

// --- Основной Flow ---
export async function aiAssistantChat(
  input: AiAssistantChatInput
): Promise<AiAssistantChatOutput> {
  return aiAssistantChatFlow(input);
}

const chatPrompt = ai.definePrompt({
  name: "aiAssistantChatPrompt",
  model: "googleai/gemini-1.5-flash-latest",
  input: { schema: PromptInputSchema }, // Используем расширенную схему
  output: { schema: AiAssistantChatOutputSchema },
  tools: [getSavingsSuggestionsTool, getInvestmentInformationTool],
  prompt: `Ты — высокоинтеллектуальный AI-финансовый ассистент в приложении 'Monifly'. Твоя задача — предоставлять пользователям профессиональные, точные и полезные ответы на их финансовые вопросы, используя предоставленный финансовый контекст и доступные инструменты. Отвечай всегда на русском языке. Поддерживай дружелюбный, но авторитетный тон.

Используй предоставленный ниже "Финансовый контекст", чтобы отвечать на вопросы о балансах, транзакциях и тратах. Анализируй эти данные, чтобы давать сводки и отвечать на вопросы вроде "Сколько я потратил на еду?" или "Какой у меня баланс на основном счете?".

{{#if financialContext}}
---
Финансовый контекст:
{{{financialContext}}}
---
{{/if}}

Доступные инструменты:
- getSavingsSuggestionsTool: Используй, если пользователь спрашивает совета по экономии. Представь советы как релевантные и полезные.
- getInvestmentInformationTool: Используй, если пользователь спрашивает об инвестициях. Всегда обеспечивай наличие предупреждения о том, что это ОБЩАЯ ИНФОРМАЦИЯ, А НЕ ФИНАНСОВЫЙ СОВЕТ, и что для принятия решений нужно консультироваться с квалифицированным финансовым советником. После предоставления информации об инвестициях, всегда добавляй фразу: "Помните, что любая инвестиционная деятельность связана с рисками. Эта информация не является индивидуальной инвестиционной рекомендацией."

Контекст диалога (если есть):
{{#if chatHistory}}
{{#each chatHistory}}
{{#if this.isUser}}Пользователь: {{else}}AI: {{/if}}{{{this.content}}}
{{/each}}
{{/if}}

Текущий запрос пользователя: {{{userMessage}}}

Твой ответ должен быть только текстом, который увидит пользователь.
`,
});

const aiAssistantChatFlow = ai.defineFlow(
  {
    name: "aiAssistantChatFlow",
    inputSchema: AiAssistantChatInputSchema,
    outputSchema: AiAssistantChatOutputSchema,
  },
  async (input) => {
    // Кешування
    const cacheKey = getCacheKey(input);
    const cached = aiCache.get(cacheKey);
    const now = Date.now();
    if (cached && cached.expires > now) {
      return cached.value;
    }

    // Преобразуем историю чата, добавляя поле isUser
    const processedHistory = input.chatHistory?.map((msg) => ({
      ...msg,
      isUser: msg.role === "user",
    }));

    const promptInput = {
      ...input,
      chatHistory: processedHistory,
    };

    const { output } = await chatPrompt(promptInput);

    const result = output || {
        aiResponse:
          "Извините, я не смог обработать ваш запрос в данный момент.",
      };

    aiCache.set(cacheKey, { value: result, expires: now + CACHE_TTL_MS });
    return result;
  }
);
