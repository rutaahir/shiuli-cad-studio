import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'mark-only' | 'horizontal' | 'compact';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  onClick,
}) => {
  // Dimension presets
  const sizeMap = {
    sm: { icon: 32, title: 'text-sm', subtitle: 'text-[9px]' },
    md: { icon: 44, title: 'text-lg', subtitle: 'text-[11px]' },
    lg: { icon: 60, title: 'text-2xl', subtitle: 'text-xs' },
    xl: { icon: 84, title: 'text-3xl', subtitle: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Precision 3D Metallic Ribbon Vector Logo */}
      <div
        style={{ width: currentSize.icon, height: currentSize.icon }}
        className="relative flex-shrink-0 transition-transform duration-500 hover:scale-108"
      >
        {/* Soft backdrop ambient glow */}
        <div className="absolute inset-0 rounded-full bg-amber-400/25 blur-md pointer-events-none scale-125" />

        <svg
          viewBox="0 0 200 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 w-full h-full drop-shadow-[0_0_16px_rgba(255,215,0,0.65)]"
        >
          <defs>
            {/* Ultra Bright Gold Ribbon Gradient */}
            <linearGradient id="goldRibbonTop" x1="50" y1="20" x2="140" y2="130" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="25%" stopColor="#FFF176" />
              <stop offset="60%" stopColor="#FFC107" />
              <stop offset="100%" stopColor="#FF8F00" />
            </linearGradient>

            {/* Radiant Gold Inner Highlight */}
            <linearGradient id="goldInnerGlow" x1="60" y1="120" x2="120" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#FFE082" />
              <stop offset="100%" stopColor="#FFB300" />
            </linearGradient>

            {/* Vibrant Sapphire Blue Ribbon Gradient */}
            <linearGradient id="sapphireRibbon" x1="80" y1="100" x2="160" y2="220" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E0F2FE" />
              <stop offset="30%" stopColor="#60A5FA" />
              <stop offset="70%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>

            {/* Vivid Sapphire Outer Fold */}
            <linearGradient id="sapphireFold" x1="110" y1="90" x2="170" y2="170" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#93C5FD" />
              <stop offset="60%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>

            {/* Specular lighting filter */}
            <filter id="metallicBevel" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#FFD700" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Sapphire Lower Loop (Interlocking behind gold fold) */}
          <path
            d="M 94 95 C 122 92, 150 108, 160 134 C 172 165, 154 185, 126 195 C 102 203, 85 220, 72 235 C 70 237, 72 232, 75 224 C 88 190, 110 168, 138 152 C 148 146, 150 132, 142 122 C 132 110, 114 104, 94 95 Z"
            fill="url(#sapphireRibbon)"
            filter="url(#metallicBevel)"
          />

          {/* Sapphire 3D Side Bevel */}
          <path
            d="M 126 195 C 145 186, 164 162, 158 136 C 153 118, 134 104, 112 100 L 105 106 C 124 112, 140 124, 142 138 C 146 158, 130 178, 115 186 Z"
            fill="url(#sapphireFold)"
            opacity="0.95"
          />

          {/* Upper Gold Swirl with sharp pinnacle */}
          <path
            d="M 134 22 C 126 36, 102 60, 74 72 C 48 84, 42 104, 46 128 C 50 150, 68 168, 92 170 C 114 172, 124 162, 120 152 C 114 140, 94 138, 76 132 C 60 126, 56 114, 62 98 C 70 78, 98 56, 134 22 Z"
            fill="url(#goldRibbonTop)"
            filter="url(#metallicBevel)"
          />

          {/* Gold Inner Reflection Band */}
          <path
            d="M 134 22 C 118 42, 90 66, 68 84 C 58 92, 54 104, 58 116 C 64 106, 76 96, 92 88 C 112 78, 126 54, 134 22 Z"
            fill="url(#goldInnerGlow)"
            opacity="0.95"
          />

          {/* Center Interlock Accent */}
          <path
            d="M 88 120 C 96 112, 108 110, 118 114 C 110 122, 98 126, 88 120 Z"
            fill="#1E3A8A"
            opacity="0.6"
          />

          {/* Radiant Diamond sparkles at crests */}
          <circle cx="134" cy="22" r="3.5" fill="#FFFFFF" className="animate-pulse" />
          <circle cx="134" cy="22" r="6" stroke="#FFE57F" strokeWidth="1" opacity="0.8" />
          <circle cx="72" cy="235" r="2.5" fill="#93C5FD" />
        </svg>
      </div>

      {/* Typography: Serif Name + Sans Tagline */}
      {variant !== 'mark-only' && (
        <div className={`flex flex-col ${variant === 'full' ? 'items-center text-center' : 'items-start'}`}>
          <div className="flex items-center gap-1.5">
            <span
              className={`font-serif tracking-[0.2em] font-extrabold uppercase ${currentSize.title} text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]`}
            >
              Shiuli
            </span>
            <span
              className={`font-serif tracking-[0.2em] font-extrabold uppercase ${currentSize.title} text-[#FFD700] drop-shadow-[0_0_16px_rgba(255,215,0,0.75)]`}
            >
              CAD Studio
            </span>
          </div>
          <span
            className={`font-sans tracking-[0.22em] uppercase font-bold text-slate-100 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] ${currentSize.subtitle}`}
          >
            Premium Jewellery CAD Files
          </span>
        </div>
      )}
    </div>
  );
};
