export function BudgetWiseLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      width="180"
      height="50"
      viewBox="0 0 180 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`logo-svg ${className}`}
    >
      <defs>
        {/* Градієнт для літаючого ефекту */}
        <linearGradient
          id="flying-gradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8">
            <animate
              attributeName="stop-opacity"
              values="0.8;0.4;0.8"
              dur="2s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.4">
            <animate
              attributeName="stop-opacity"
              values="0.4;0.8;0.4"
              dur="2s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>

        {/* Тінь для ефекту світіння */}
        <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          <feColorMatrix
            type="matrix"
            values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 15 -7
            "
          />
          <feBlend in="SourceGraphic" mode="normal" />
        </filter>

        {/* Тінь для ефекту підняття */}
        <filter id="logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="4"
            floodColor="hsl(var(--primary))"
            floodOpacity="0.25"
          >
            <animate
              attributeName="dy"
              values="4;3;4"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="stdDeviation"
              values="4;3;4"
              dur="2s"
              repeatCount="indefinite"
            />
          </feDropShadow>
        </filter>

        {/* Маска для тексту */}
        <mask id="text-mask">
          <rect width="100%" height="100%" fill="white" />
          <text
            x="40"
            y="27"
            fontFamily="Geist, sans-serif"
            fontSize="24"
            fontWeight="bold"
            fill="black"
          >
            Monifly
          </text>
        </mask>
      </defs>

      {/* Основна група з анімаціями */}
      <g className="transform-gpu transition-all duration-500 ease-out group-hover:scale-105 group-active:scale-95">
        {/* Літак з анімацією */}
        <g className="plane-group transition-transform duration-500 ease-out group-hover:translate-x-1 group-hover:-translate-y-1">
          <path
            d="M2 25L32 10L22 25L32 40L2 25Z"
            fill="url(#flying-gradient)"
            className="transition-all duration-500"
            filter="url(#logo-glow)"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 0,-1; 0,0"
              dur="2s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M22 25L32 10L17 21Z"
            fill="hsl(var(--primary-foreground))"
            fillOpacity="0.5"
            className="transition-all duration-500"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 0,-1; 0,0"
              dur="2s"
              repeatCount="indefinite"
            />
          </path>
        </g>

        {/* Текст з градієнтною анімацією */}
        <g filter="url(#logo-shadow)">
          <text
            x="40"
            y="27"
            fontFamily="Geist, sans-serif"
            fontSize="24"
            fontWeight="bold"
            fill="hsl(var(--foreground))"
            className="logo-title transition-all duration-500 group-hover:fill-primary"
          >
            Monifly
          </text>
          <text
            x="40"
            y="45"
            fontFamily="Geist, sans-serif"
            fontSize="10"
            fill="hsl(var(--muted-foreground))"
            className="logo-tagline transition-all duration-500 group-hover:fill-primary/80"
          >
            Master Your Money
          </text>
        </g>

        {/* Декоративний елемент для підсвічування при ховері */}
        <rect
          x="40"
          y="30"
          width="80"
          height="2"
          fill="hsl(var(--primary))"
          fillOpacity="0"
          className="transition-all duration-500 group-hover:fill-opacity-20"
          rx="1"
        >
          <animate
            attributeName="width"
            values="0;80;0"
            dur="2s"
            repeatCount="indefinite"
          />
        </rect>
      </g>
    </svg>
  );
}
