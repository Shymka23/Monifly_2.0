"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AnimatedAvatarProps {
  isTyping?: boolean;
  isListening?: boolean;
  isThinking?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function AnimatedAvatar({
  isTyping = false,
  isListening = false,
  isThinking = false,
  className,
  size = "md",
}: AnimatedAvatarProps) {
  const [eyeBlink, setEyeBlink] = useState(false);
  const [headTilt, setHeadTilt] = useState(0);

  // Анімація миготіння очей
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setEyeBlink(true);
      setTimeout(() => setEyeBlink(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Анімація нахилу голови при думці
  useEffect(() => {
    if (isThinking) {
      const tiltInterval = setInterval(() => {
        setHeadTilt(Math.sin(Date.now() / 1000) * 5);
      }, 100);
      return () => clearInterval(tiltInterval);
    } else {
      setHeadTilt(0);
    }
  }, [isThinking]);

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
    xl: "w-24 h-24",
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        sizeClasses[size],
        className
      )}
    >
      {/* Основний контейнер аватара */}
      <div
        className={cn(
          "relative w-full h-full rounded-full overflow-hidden",
          "bg-gradient-to-br from-gray-900 to-black",
          "shadow-2xl border-2 border-gray-700",
          "transition-all duration-300 ease-in-out",
          isTyping && "animate-pulse",
          isListening && "animate-bounce",
          isThinking && "animate-spin-slow"
        )}
        style={{
          transform: `rotate(${headTilt}deg)`,
          transition: "transform 0.3s ease-in-out",
        }}
      >
        {/* Капюшон */}
        <div className="absolute top-0 left-0 w-full h-3/4 bg-gray-800 rounded-t-full">
          {/* Червона підкладка капюшона */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-red-600 rounded-t-full opacity-80" />
        </div>

        {/* Голова */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3/4 h-3/4 bg-black rounded-full">
          {/* Очі */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex space-x-2">
            <div
              className={cn(
                "w-2 h-2 bg-red-500 rounded-full transition-all duration-150",
                eyeBlink && "h-0.5",
                isListening && "animate-pulse",
                isThinking && "animate-ping"
              )}
            />
            <div
              className={cn(
                "w-2 h-2 bg-red-500 rounded-full transition-all duration-150",
                eyeBlink && "h-0.5",
                isListening && "animate-pulse",
                isThinking && "animate-ping"
              )}
            />
          </div>
        </div>

        {/* Навушники */}
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-4/5 h-1/3">
          <div className="absolute top-0 left-0 w-full h-2 bg-yellow-400 rounded-full" />
          <div className="absolute top-1 left-1 w-3 h-3 bg-black rounded-full" />
          <div className="absolute top-1 right-1 w-3 h-3 bg-black rounded-full" />
        </div>

        {/* Золотий ланцюг */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-yellow-400 rounded-full" />

        {/* Ефекти */}
        {isTyping && (
          <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
        )}

        {isListening && (
          <div className="absolute -inset-2 bg-red-500/30 rounded-full animate-pulse" />
        )}

        {isThinking && (
          <div className="absolute -inset-1 bg-purple-500/20 rounded-full animate-spin" />
        )}
      </div>

      {/* Плаваючі частинки при думці */}
      {isThinking && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400 rounded-full animate-float"
              style={{
                left: `${20 + i * 30}%`,
                top: `${30 + i * 20}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${2 + i * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Додаткові CSS класи для анімацій
const additionalStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
    50% { transform: translateY(-10px) rotate(180deg); opacity: 1; }
  }
  
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .animate-float {
    animation: float 2s ease-in-out infinite;
  }
  
  .animate-spin-slow {
    animation: spin-slow 3s linear infinite;
  }
`;

// Додаємо стилі до глобальних CSS
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = additionalStyles;
  document.head.appendChild(styleSheet);
}
