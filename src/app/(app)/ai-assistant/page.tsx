"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/use-translation";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Loader2,
  MessageCircle,
  Send,
  User,
  Bot,
  Sparkles,
  Brain,
  Zap,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { VoiceChat } from "@/components/ai-assistant/VoiceChat";
import {
  aiAssistantChat,
  type AiAssistantChatInput,
  type AiAssistantChatOutput,
} from "@/ai/flows/ai-assistant-chat-flow";
import { useToast } from "@/hooks/use-toast";
import { cn, formatCurrency } from "@/lib/utils";
import { useBudgetStore } from "@/hooks/use-budget-store";
import { subDays, parseISO } from "date-fns";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function AiAssistantPage() {
  const { t } = useTranslation("ai-assistant");
  const [userInput, setUserInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<"text" | "voice">("text");
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { wallets, transactions, primaryDisplayCurrency } = useBudgetStore(
    state => ({
      wallets: state.wallets,
      transactions: state.transactions,
      primaryDisplayCurrency: state.primaryDisplayCurrency,
    })
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Initial welcome message from AI
  useEffect(() => {
    setChatMessages([
      {
        id: "initial-ai-msg",
        role: "assistant",
        content: t("messages.welcome"),
      },
    ]);
  }, []);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userInput,
    };
    setChatMessages(prevMessages => [...prevMessages, newUserMessage]);
    const currentInput = userInput;
    setUserInput("");
    setIsLoading(true);

    try {
      const generateFinancialContext = () => {
        let context = t("context.currentBalances") + ":\n";
        wallets.forEach(wallet => {
          context += `- ${wallet.name}: ${formatCurrency(
            wallet.balance,
            wallet.currency
          )}\n`;
        });

        context += "\n" + t("context.recentTransactions") + ":\n";
        const thirtyDaysAgo = subDays(new Date(), 30);
        const recentTransactions = transactions
          .filter(tx => parseISO(tx.date) >= thirtyDaysAgo)
          .slice(0, 20); // Limit context size

        if (recentTransactions.length > 0) {
          recentTransactions.forEach(tx => {
            const wallet = wallets.find(w => w.id === tx.walletId);
            const prefix = tx.type === "income" ? "+" : "-";
            context += `- ${tx.description} (${t("context.category")}: ${
              tx.category
            }): ${prefix}${formatCurrency(
              tx.amount,
              wallet?.currency || primaryDisplayCurrency
            )}\n`;
          });
        } else {
          context += t("context.noTransactions") + "\n";
        }

        return context;
      };

      // Prepare chat history for the flow
      const flowChatHistory = chatMessages
        .filter(msg => msg.id !== "initial-ai-msg") // Exclude initial static message from history sent to AI
        .map(msg => ({
          role: msg.role === "user" ? "user" : ("model" as "user" | "model"),
          content: msg.content,
        }));

      const input: AiAssistantChatInput = {
        userMessage: currentInput,
        // Take last 5 messages to keep context reasonable for demo
        chatHistory: flowChatHistory.slice(-5),
        financialContext: generateFinancialContext(),
      };

      const output: AiAssistantChatOutput = await aiAssistantChat(input);

      const newAiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: output.aiResponse,
      };
      setChatMessages(prevMessages => [...prevMessages, newAiMessage]);
    } catch {
      toast({
        title: t("messages.errorTitle"),
        description: t("messages.errorDescription"),
        variant: "destructive",
      });
      // Add a generic error message to chat
      const errorAiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: t("messages.error"),
      };
      setChatMessages(prevMessages => [...prevMessages, errorAiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid flex flex-col flex-grow min-h-0 py-4 sm:py-6 animate-fade-in">
      {/* Заголовок з перемикачем режимів */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
              {t("title")}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground hidden sm:block">
              {t("subtitle")}
            </p>
          </div>

          {/* Перемикач режимів */}
          <div className="flex items-center space-x-2">
            <Button
              variant={chatMode === "text" ? "default" : "outline"}
              size="sm"
              onClick={() => setChatMode("text")}
              className="flex items-center space-x-1"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">{t("modes.text")}</span>
            </Button>
            <Button
              variant={chatMode === "voice" ? "default" : "outline"}
              size="sm"
              onClick={() => setChatMode("voice")}
              className="flex items-center space-x-1"
            >
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">{t("modes.voice")}</span>
            </Button>
          </div>
        </div>

        {/* Картки можливостей */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  {t("features.smartAnalysis")}
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {t("features.smartAnalysisDescription")}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  {t("features.personalization")}
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {t("features.personalizationDescription")}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                  {t("features.voiceChat")}
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {t("features.voiceChatDescription")}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Основний чат */}
      {chatMode === "text" ? (
        <Card className="flex-grow flex flex-col shadow-modern hover-lift mb-4 sm:mb-0">
          <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-accent/5">
            <CardTitle className="flex items-center text-lg sm:text-xl md:text-2xl font-bold">
              <MessageCircle className="mr-2 sm:mr-3 h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              <span className="hidden sm:inline">{t("titleFull")}</span>
              <span className="sm:hidden">{t("titleShort")}</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              <span className="hidden sm:inline">{t("subtitleFull")}</span>
              <span className="sm:hidden">{t("subtitleShort")}</span>
            </CardDescription>
          </CardHeader>

          <ScrollArea className="flex-grow p-3 sm:p-4" ref={scrollAreaRef}>
            <div className="space-y-4 sm:space-y-6">
              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex items-end gap-2",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <Avatar className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8">
                      <AvatarFallback>
                        <Bot className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[75%] sm:max-w-[70%] rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 shadow-md text-sm",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {/* Safely render content, splitting by newlines for basic formatting */}
                    {msg.content.split("\n").map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                  {msg.role === "user" && (
                    <Avatar className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8">
                      <AvatarFallback>
                        <User className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-end gap-2 justify-start">
                  <Avatar className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8">
                    <AvatarFallback>
                      <Bot className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="max-w-[70%] rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 shadow-md bg-secondary text-secondary-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <CardFooter className="border-t p-3 sm:p-4">
            <div className="flex w-full items-center space-x-2">
              <Input
                type="text"
                placeholder={t("messages.placeholder")}
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyPress={e =>
                  e.key === "Enter" && !isLoading && handleSendMessage()
                }
                disabled={isLoading}
                className="flex-grow text-xs sm:text-sm"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !userInput.trim()}
                size="default"
                className="text-xs sm:text-sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
                <span className="sr-only">{t("messages.send")}</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      ) : (
        <div className="flex-grow flex flex-col">
          <VoiceChat className="flex-grow" />
        </div>
      )}
    </div>
  );
}
