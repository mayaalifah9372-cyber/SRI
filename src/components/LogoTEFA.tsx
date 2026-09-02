import React from 'react';

interface LogoTEFAProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  withTagline?: boolean;
}

export const LogoTEFA: React.FC<LogoTEFAProps> = ({
  className = '',
  size = 'md',
  showText = true,
  withTagline = true,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* 3D Circular Chrome Badge with Graphic Arts & Wayang Gunungan Motif */}
      <div className={`relative ${sizeMap[size]} shrink-0 rounded-full p-[2px] bg-gradient-to-tr from-slate-300 via-white to-slate-400 shadow-md ring-1 ring-slate-900/10`}>
        <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center relative p-1">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
            <defs>
              <linearGradient id="gununganGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffd700" />
                <stop offset="50%" stopColor="#00d2ff" />
                <stop offset="100%" stopColor="#ff007f" />
              </linearGradient>
              <linearGradient id="cmyk-c" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00e5ff" />
                <stop offset="100%" stopColor="#0099cc" />
              </linearGradient>
              <linearGradient id="cmyk-m" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ff1493" />
                <stop offset="100%" stopColor="#c71585" />
              </linearGradient>
              <linearGradient id="cmyk-y" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fff200" />
                <stop offset="100%" stopColor="#ffaa00" />
              </linearGradient>
              <linearGradient id="cmyk-k" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#434343" />
                <stop offset="100%" stopColor="#000000" />
              </linearGradient>
            </defs>

            {/* Background circular sheen */}
            <circle cx="50" cy="50" r="46" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />

            {/* Wayang Gunungan Silhouette / Arrowhead */}
            <path
              d="M32 18 L48 42 C48 42 42 46 36 50 C28 56 24 64 26 74 L18 68 C15 58 20 40 32 18 Z"
              fill="url(#gununganGrad)"
              opacity="0.95"
            />
            {/* Base Wayang Stem */}
            <rect x="31" y="68" width="3" height="18" rx="1.5" fill="#e11d48" />

            {/* Big Stylized Letter 'G' for Grafika */}
            <path
              d="M48 28 C34 28 24 38 24 52 C24 66 35 76 50 76 C63 76 72 68 74 56 L52 56 L52 46 L82 46 C84 62 76 84 49 84 C28 84 15 69 15 52 C15 33 30 20 50 20 C60 20 68 24 74 30 L66 38 C62 33 56 28 48 28 Z"
              fill="#0f172a"
            />
            <path
              d="M46 32 C37 32 30 39 30 50 C30 61 38 68 49 68 C58 68 64 63 66 56 L48 56 L48 50 L70 50 C68 62 60 74 48 74 C34 74 24 63 24 50 C24 36 35 26 48 26 C55 26 62 29 66 34 L60 40 C57 36 52 32 46 32 Z"
              fill="url(#cmyk-c)"
            />

            {/* CMYK Calibration Bars */}
            <rect x="68" y="58" width="4" height="24" rx="1.5" fill="url(#cmyk-m)" />
            <rect x="74" y="50" width="4" height="32" rx="1.5" fill="url(#cmyk-c)" />
            <rect x="80" y="44" width="4" height="38" rx="1.5" fill="url(#cmyk-y)" />
            <rect x="86" y="52" width="4" height="30" rx="1.5" fill="url(#cmyk-k)" />
          </svg>
        </div>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-slate-900 tracking-tight text-lg md:text-xl font-sans">
              SRI
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 border border-amber-500/20">
              TEFA
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-700 leading-none truncate">
            Seni Rancang Inspirasi
          </span>
          {withTagline && (
            <span className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5 hidden sm:inline-block">
              Teknik Grafika SMKN 1 Kaligondang
            </span>
          )}
        </div>
      )}
    </div>
  );
};
