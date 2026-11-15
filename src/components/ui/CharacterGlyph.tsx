'use client'

import { cn } from '@/lib/utils'

type Props = {
  monogram: string
  nameJP?: string
  accent?: string
  className?: string
  variant?: 'portrait' | 'thumb' | 'hero'
  emblem?: boolean
}

/**
 * Procedural character artwork.
 *
 * The archive ships without licensed character art, so each profile gets a
 * designed monogram plate instead of a broken image. Drop real art into
 * /public/images/characters and swap this component for <Image> when available.
 */
export function CharacterGlyph({
  monogram,
  nameJP,
  accent = '#4A7C3F',
  className,
  variant = 'portrait',
  emblem = true,
}: Props) {
  return (
    <div
      className={cn('relative isolate overflow-hidden bg-ink-850', className)}
      style={{
        backgroundImage: `radial-gradient(120% 100% at 20% 0%, ${accent}44 0%, transparent 55%), linear-gradient(160deg,#14180f 0%,#0a0c08 60%,#050604 100%)`,
      }}
      aria-hidden
    >
      {/* bust silhouette */}
      <svg viewBox="0 0 200 240" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={`bust-${monogram}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.5" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <path
          d="M100 58 a34 38 0 1 0 0.1 0 Z M40 240 Q44 168 100 160 Q156 168 160 240 Z"
          fill={`url(#bust-${monogram})`}
        />
        <path d="M100 58 a34 38 0 1 0 0.1 0 Z" fill="#050604" opacity="0.4" />
      </svg>

      {/* speed lines */}
      <svg viewBox="0 0 200 240" className="absolute inset-0 h-full w-full opacity-[0.14]">
        {Array.from({ length: 14 }).map((_, i) => (
          <line
            key={i}
            x1={-40 + i * 18}
            y1={240}
            x2={60 + i * 14}
            y2={0}
            stroke="#F5F0E8"
            strokeWidth={i % 3 === 0 ? 1.1 : 0.5}
          />
        ))}
      </svg>

      <div className="absolute inset-0 noise-overlay" />

      <span
        className={cn(
          'font-display absolute inset-0 flex items-center justify-center font-black tracking-tight text-parchment/90',
          variant === 'hero' ? 'text-8xl' : variant === 'thumb' ? 'text-2xl' : 'text-5xl'
        )}
        style={{ textShadow: `0 8px 32px ${accent}66` }}
      >
        {monogram}
      </span>

      {nameJP ? (
        <span className="font-jp absolute right-2 top-2 text-[9px] tracking-[0.2em] text-parchment/35">
          {nameJP}
        </span>
      ) : null}

      {emblem ? (
        <svg
          viewBox="0 0 96 52"
          className="absolute bottom-2 left-2 h-3 w-auto opacity-30"
          fill={accent}
          aria-hidden
        >
          <path d="M44 27.5 C34.5 26 21.5 19.5 6.5 5.5 C18 10 29.5 13.5 38.5 15.5 Z" />
          <path d="M43.6 34 C33 32.8 19 26.8 5 14.5 C17 18.8 29.5 21.8 39.2 23 Z" opacity="0.75" />
          <g transform="translate(96,0) scale(-1,1)">
            <path d="M44 27.5 C34.5 26 21.5 19.5 6.5 5.5 C18 10 29.5 13.5 38.5 15.5 Z" />
            <path d="M43.6 34 C33 32.8 19 26.8 5 14.5 C17 18.8 29.5 21.8 39.2 23 Z" opacity="0.75" />
          </g>
        </svg>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/85 to-transparent" />
    </div>
  )
}
