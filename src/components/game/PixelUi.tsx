// @ts-nocheck -- imported game code, written for a looser TS config
// @ts-nocheck — imported game code, typed under the original looser tsconfig
import React from 'react';

export type PixelIconName =
  | 'play'
  | 'stages'
  | 'book'
  | 'sound_on'
  | 'sound_off'
  | 'pause'
  | 'close'
  | 'lock'
  | 'check'
  | 'flame'
  | 'pin'
  | 'restart'
  | 'crown'
  | 'gem'
  | 'skull'
  | 'hero'
  | 'coin'
  | 'shrine'
  | 'star'
  | 'bolt';

export const PixelIcon: React.FC<{ name: PixelIconName; className?: string }> = ({
  name,
  className = 'h-4 w-4',
}) => {
  return (
    <svg
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {name === 'play' && (
        <path fill="currentColor" d="M4 2h2v2h2v2h2v1h2v2h-2v1H8v2H6v2H4V2z" />
      )}
      {name === 'stages' && (
        <>
          <rect x="2" y="2" width="4" height="4" fill="currentColor" />
          <rect x="10" y="2" width="4" height="4" fill="currentColor" />
          <rect x="2" y="10" width="4" height="4" fill="currentColor" />
          <rect x="10" y="10" width="4" height="4" fill="currentColor" />
          <rect x="6" y="3" width="4" height="2" fill="currentColor" />
          <rect x="11" y="6" width="2" height="4" fill="currentColor" />
          <rect x="6" y="11" width="4" height="2" fill="currentColor" />
        </>
      )}
      {name === 'book' && (
        <>
          <path fill="currentColor" d="M2 2h5v1h2V2h5v11H9v1H7v-1H2V2zm2 2v7h3v1h2v-1h3V4H9v1H7V4H4z" />
        </>
      )}
      {name === 'sound_on' && (
        <>
          <path fill="currentColor" d="M2 6h3l4-3v10L5 10H2V6zm9-2h2v8h-2V4zm3-2h1v12h-1V2z" />
        </>
      )}
      {name === 'sound_off' && (
        <>
          <path fill="currentColor" d="M2 6h3l4-3v10L5 10H2V6zm9 0h2v2h-2V6zm2 2h2v2h-2V8zm-2 2h2v2h-2v-2zm2-4h2v2h-2V6z" />
        </>
      )}
      {name === 'pause' && (
        <>
          <rect x="3" y="2" width="4" height="12" fill="currentColor" />
          <rect x="9" y="2" width="4" height="12" fill="currentColor" />
        </>
      )}
      {name === 'close' && (
        <path
          fill="currentColor"
          d="M2 2h3v2h2v2h2V4h2V2h3v3h-2v2h-2v2h2v2h2v3h-3v-2h-2v-2H7v2H5v2H2v-3h2V9h2V7H4V5H2V2z"
        />
      )}
      {name === 'lock' && (
        <>
          <path fill="currentColor" d="M5 2h6v4h2v8H3V6h2V2zm2 2v2h2V4H7zm0 5v3h2V9H7z" />
        </>
      )}
      {name === 'check' && (
        <path fill="currentColor" d="M13 3h2v3h-2v2h-2v2H9v2H7v2H5v-2H3v-2H1V8h2v2h2v2h2v-2h2V8h2V6h2V3z" />
      )}
      {name === 'flame' && (
        <>
          <path fill="#ff7722" d="M7 1h2v3h2v3h2v4h-2v3H5v-3H3V7h2V4h2V1z" />
          <path fill="#ffe066" d="M7 6h2v2h2v3H9v2H7v-2H5V8h2V6z" />
        </>
      )}
      {name === 'pin' && (
        <path fill="#ffd27d" d="M5 1h6v2h2v5h-2v3H9v4H7v-4H5V8H3V3h2V1zm2 3v3h2V4H7z" />
      )}
      {name === 'restart' && (
        <path fill="currentColor" d="M4 3h8v2h2v6h-2v2H5v-2h7V5H5v2l-3-2 2-2z" />
      )}
      {name === 'crown' && (
        <path fill="#ffd27d" d="M1 4h2v3h2V5h2V3h2v2h2v2h2V4h2v8H1V4zm2 9h10v2H3v-2z" />
      )}
      {name === 'gem' && (
        <>
          <path fill="#52e5ff" d="M6 1h4v2h2v2h2v4h-2v2h-2v2H6v-2H4v-2H2V5h2V3h2V1z" />
          <rect x="6" y="4" width="3" height="3" fill="#ffffff" />
        </>
      )}
      {name === 'skull' && (
        <>
          <path fill="currentColor" d="M4 2h8v2h2v6h-2v4H4v-4H2V4h2V2zm2 4v2h2V6H6zm4 0v2h2V6h-2zm-3 5v2h2v-2H7z" />
        </>
      )}
      {name === 'hero' && (
        <>
          <path fill="currentColor" d="M5 1h6v2h2v5h-2v2H5V8H3V3h2V1zm-1 10h8v3H4v-3z" />
          <rect x="6" y="4" width="1" height="2" fill="#ffd27d" />
          <rect x="9" y="4" width="1" height="2" fill="#ffd27d" />
        </>
      )}
      {name === 'coin' && (
        <>
          <path fill="#e09a1e" d="M5 1h6v1h2v2h1v8h-1v2h-2v1H5v-1H3v-2H2V4h1V2h2V1z" />
          <path fill="#ffe47a" d="M5 2h6v2h2v8h-2v2H5v-2H3V4h2V2z" />
          <rect x="7" y="4" width="2" height="8" fill="#ffffff" />
        </>
      )}
      {name === 'shrine' && (
        <>
          <path fill="#7c7399" d="M5 3h6v8H5V3zm-2 8h10v3H3v-3z" />
          <rect x="7" y="1" width="2" height="2" fill="#ffd27d" />
          <rect x="7" y="5" width="2" height="4" fill="#52e5ff" />
        </>
      )}
      {name === 'bolt' && (
        <path fill="currentColor" d="M8 1h4L9 6h4L6 15l1-6H3l5-8z" />
      )}
      {name === 'star' && (
        <>
          <path
            fill="currentColor"
            d="M7 1h2v3h2v2h4v2h-3v2h1v4h-3v-2H6v2H3v-4h1V8H1V6h4V4h2V1z"
          />
          <rect x="7" y="5" width="2" height="3" fill="#ffffff" />
        </>
      )}
    </svg>
  );
};

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'cyan' | 'slate' | 'emerald' | 'danger';
}

const VARIANT_CLASSES: Record<NonNullable<PixelButtonProps['variant']>, string> = {
  gold: 'bg-[#e8a87c] text-[#09080f] hover:bg-[#f4bc94]',
  cyan: 'bg-[#2a4a6e] text-[#9ff0ff] hover:bg-[#355d8a]',
  slate: 'bg-[#241d38] text-[#efe8fa] hover:bg-[#32294d]',
  emerald: 'bg-[#1a5c49] text-[#8effdb] hover:bg-[#22755d]',
  danger: 'bg-[#732334] text-[#ffd6de] hover:bg-[#8f2c41]',
};

export const PixelButton: React.FC<PixelButtonProps> = ({
  variant = 'slate',
  className = '',
  children,
  ...rest
}) => {
  return (
    <button
      {...rest}
      className={`pixel-btn inline-flex items-center justify-center gap-2 px-4 py-2 font-pixel font-bold tracking-wide whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#ffd27d] ${VARIANT_CLASSES[variant]} ${className}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-1 top-0.5 h-[1px] bg-white/30"
      />
      {children}
    </button>
  );
};

interface PixelWindowProps {
  title: string;
  subtitle?: string;
  accentColor?: string;
  onClose?: () => void;
  closeLabel?: string;
  maxWidthClass?: string;
  children: React.ReactNode;
}

export const PixelWindow: React.FC<PixelWindowProps> = ({
  title,
  subtitle,
  accentColor = '#ffd27d',
  onClose,
  closeLabel = 'Fechar janela',
  maxWidthClass = 'max-w-4xl',
  children,
}) => {
  return (
    <div className={`pixel-panel w-full ${maxWidthClass} p-5 text-[#f5efe6]`}>
      {/* Ornate Multi-Pixel Golden Corner Brackets & Glint Ticks */}
      <span className="pointer-events-none absolute left-1 top-1 h-2 w-2 bg-[#ffd27d]" aria-hidden="true" />
      <span className="pointer-events-none absolute left-3 top-1 h-1 w-2 bg-[#e8a87c]" aria-hidden="true" />
      <span className="pointer-events-none absolute left-1 top-3 h-2 w-1 bg-[#e8a87c]" aria-hidden="true" />
      <span className="pointer-events-none absolute left-1 top-1 h-1 w-1 bg-[#fff7d6]" aria-hidden="true" />

      <span className="pointer-events-none absolute right-1 top-1 h-2 w-2 bg-[#ffd27d]" aria-hidden="true" />
      <span className="pointer-events-none absolute right-3 top-1 h-1 w-2 bg-[#e8a87c]" aria-hidden="true" />
      <span className="pointer-events-none absolute right-1 top-3 h-2 w-1 bg-[#e8a87c]" aria-hidden="true" />
      <span className="pointer-events-none absolute right-1 top-1 h-1 w-1 bg-[#fff7d6]" aria-hidden="true" />

      <span className="pointer-events-none absolute bottom-1 left-1 h-2 w-2 bg-[#ffd27d]" aria-hidden="true" />
      <span className="pointer-events-none absolute bottom-1 left-3 h-1 w-2 bg-[#e8a87c]" aria-hidden="true" />
      <span className="pointer-events-none absolute bottom-3 left-1 h-2 w-1 bg-[#e8a87c]" aria-hidden="true" />

      <span className="pointer-events-none absolute bottom-1 right-1 h-2 w-2 bg-[#ffd27d]" aria-hidden="true" />
      <span className="pointer-events-none absolute bottom-1 right-3 h-1 w-2 bg-[#e8a87c]" aria-hidden="true" />
      <span className="pointer-events-none absolute bottom-3 right-1 h-2 w-1 bg-[#e8a87c]" aria-hidden="true" />

      <div className="flex items-start justify-between gap-4 border-b-2 border-[#07050d] pb-3 shadow-[0_2px_0_0_#31274a]">
        <div>
          <h2
            style={{ color: accentColor }}
            className="font-pixel text-2xl font-bold tracking-wide text-stroke-dark"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 font-body-pixel text-xs text-[#b8afc9]">{subtitle}</p>
          )}
        </div>
        {onClose && (
          <PixelButton
            type="button"
            variant="slate"
            onClick={onClose}
            aria-label={closeLabel}
            className="h-9 w-9 !px-0 !py-0"
          >
            <PixelIcon name="close" className="h-4 w-4" />
          </PixelButton>
        )}
      </div>

      <div className="mt-4">{children}</div>
    </div>
  );
};
