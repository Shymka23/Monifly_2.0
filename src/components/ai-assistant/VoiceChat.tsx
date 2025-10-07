"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Bot,
  User,
  Loader2,
  MessageSquare,
  Phone,
  PhoneOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedAvatar } from "./AnimatedAvatar";
import { useTranslation } from "@/hooks/use-translation";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isAudio?: boolean;
}

interface VoiceChatProps {
  className?: string;
}

export function VoiceChat({ className }: VoiceChatProps) {
  const { t } = useTranslation("ai-assistant");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: t("messages.welcome"),
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Автоскрол до останнього повідомлення
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Ініціалізація Web Speech API
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Speech Recognition
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "uk-UA";

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      // Зупиняємо попереднє озвучування
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "uk-UA";
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);

      synthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);
    setIsThinking(true);

    // Симуляція відповіді AI
    setTimeout(() => {
      const aiResponse = generateAIResponse(text);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      setIsThinking(false);

      // Автоматичне озвучування відповіді в голосовому режимі
      if (isVoiceMode) {
        speakText(aiResponse);
      }
    }, 1500 + Math.random() * 1000);
  };

  const generateAIResponse = (userInput: string): string => {
    const responses = [
      "Це цікаве питання про фінанси. Дозвольте мені проаналізувати...",
      "Для кращого планування бюджету рекомендую відстежувати всі витрати.",
      "Ваші фінансові цілі можна досягти за допомогою правильного планування.",
      "Розглянемо варіанти інвестування для збільшення доходів.",
      "Важливо мати резервний фонд на випадок непередбачених витрат.",
      "Аналізую ваші фінансові дані... Ось мої рекомендації.",
      "Для успішного управління фінансами потрібно регулярно переглядати бюджет.",
      "Ваші інвестиції показують позитивну динаміку. Продовжуйте в тому ж напрямку!",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode);
    if (isSpeaking) {
      stopSpeaking();
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800",
        className
      )}
    >
      {/* Заголовок чату */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <AnimatedAvatar
            isTyping={isTyping}
            isListening={isListening}
            isThinking={isThinking}
            size="md"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              AI Помічник
            </h3>
            <div className="flex items-center space-x-2">
              <Badge
                variant={isVoiceMode ? "default" : "secondary"}
                className="text-xs"
              >
                {isVoiceMode ? t("voice.voiceMode") : t("voice.textMode")}
              </Badge>
              {isSpeaking && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  {t("messages.speaking")}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={isVoiceMode ? "default" : "outline"}
            size="sm"
            onClick={toggleVoiceMode}
            className="flex items-center space-x-1"
          >
            {isVoiceMode ? (
              <PhoneOff className="h-4 w-4" />
            ) : (
              <Phone className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isVoiceMode ? t("voice.stopSpeaking") : t("voice.startSpeaking")}
            </span>
          </Button>
        </div>
      </div>

      {/* Повідомлення */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.isUser ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "flex items-start space-x-2 max-w-xs lg:max-w-md",
                message.isUser ? "flex-row-reverse space-x-reverse" : ""
              )}
            >
              {!message.isUser && (
                <AnimatedAvatar
                  isTyping={false}
                  isListening={false}
                  isThinking={false}
                  size="sm"
                />
              )}

              <div
                className={cn(
                  "rounded-2xl px-4 py-2 shadow-sm",
                  message.isUser
                    ? "bg-blue-500 text-white"
                    : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                )}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString("uk-UA", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {message.isUser && (
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <AnimatedAvatar
                isTyping={true}
                isListening={false}
                isThinking={false}
                size="sm"
              />
              <div className="bg-white dark:bg-gray-700 rounded-2xl px-4 py-2 border border-gray-200 dark:border-gray-600">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Поле вводу */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
          <div className="flex-1">
            <Textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={
                isVoiceMode
                  ? t("messages.placeholder")
                  : t("messages.placeholder")
              }
              className="min-h-[40px] max-h-32 resize-none"
              disabled={isListening}
            />
          </div>

          <div className="flex flex-col space-y-2">
            {isVoiceMode && (
              <Button
                type="button"
                variant={isListening ? "destructive" : "outline"}
                size="sm"
                onClick={isListening ? stopListening : startListening}
                disabled={isSpeaking}
                className="w-10 h-10 p-0"
              >
                {isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            )}

            <Button
              type="submit"
              size="sm"
              disabled={!inputText.trim() || isTyping || isListening}
              className="w-10 h-10 p-0"
            >
              {isTyping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>

        {/* Кнопки швидких дій */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => sendMessage("Розкажи про бюджетування")}
              className="text-xs"
            >
              {t("quickActions.budget")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => sendMessage("Допоможи з інвестиціями")}
              className="text-xs"
            >
              {t("quickActions.investments")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => sendMessage("Аналіз витрат")}
              className="text-xs"
            >
              {t("quickActions.analysis")}
            </Button>
          </div>

          {isSpeaking && (
            <Button
              variant="outline"
              size="sm"
              onClick={stopSpeaking}
              className="text-xs"
            >
              <VolumeX className="h-3 w-3 mr-1" />
              {t("quickActions.stop")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
