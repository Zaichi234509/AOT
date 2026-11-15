'use client'

import { useId, useMemo } from 'react'
import { cn, seededRandom } from '@/lib/utils'

export type PosterMotif =
  | 'wall'
  | 'colossal'
  | 'corps'
  | 'titan'
  | 'trost'
  | 'basement'
  | 'rumbling'
  | 'map'
  | 'wings'
  | 'sky'

type Props = {
  motif: PosterMotif
  accent?: string
  className?: string
  title?: string
  subtitle?: string
  kanji?: string
  seed?: number
  showLabel?: boolean
}

const BACKDROPS: Record<PosterMotif, string> = {
  wall: 'linear-gradient(175deg,#3b2c1c 0%,#6b533a 38%,#241a10 100%)',
  colossal: 'linear-gradient(170deg,#2a1a12 0%,#8a4a24 45%,#1a0d08 100%)',
  corps: 'linear-gradient(180deg,#0b1420 0%,#1d3048 45%,#16281a 100%)',
  titan: 'linear-gradient(180deg,#14180f 0%,#3a4a2a 55%,#0c0d09 100%)',
  trost: 'linear-gradient(180deg,#1b120a 0%,#7a4a26 50%,#2a1a10 100%)',
  basement: 'linear-gradient(180deg,#050403 0%,#241708 55%,#070504 100%)',
  rumbling: 'linear-gradient(180deg,#0a0000 0%,#5c1204 50%,#270400 100%)',
  map: 'linear-gradient(165deg,#2c2418 0%,#5a4a31 45%,#211a11 100%)',
  wings: 'linear-gradient(160deg,#0c1410 0%,#1d3221 55%,#080d09 100%)',
  sky: 'linear-gradient(180deg,#0a1526 0%,#3a6b8c 55%,#8fb8cc 100%)',
}

export function ScenePoster({
  motif,
  accent = '#D4A574',
  className,
  title,
  subtitle,
  kanji,
  seed = 7,
  showLabel = true,
}: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const embers = useMemo(() => {
    const rnd = seededRandom(seed * 977 + 13)
    return Array.from({ length: 18 }, () => ({
      x: rnd() * 400,
      y: 120 + rnd() * 180,
      r: 0.6 + rnd() * 1.8,
      o: 0.25 + rnd() * 0.6,
    }))
  }, [seed])

  return (
    <div className={cn('relative isolate h-full w-full overflow-hidden', className)}>
      <div className="absolute inset-0" style={{ background: BACKDROPS[motif] }} />
      <div className="absolute inset-0 opacity-40 parchment-texture mix-blend-soft-light" />

      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id={`fade-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.7" />
          </linearGradient>
          <radialGradient id={`glow-${uid}`}>
            <stop offset="0%" stopColor={accent} stopOpacity="0.65" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
        </defs>

        <Motif motif={motif} accent={accent} embers={embers} glowId={`glow-${uid}`} />
        <rect x="0" y="0" width="400" height="300" fill={`url(#fade-${uid})`} />
      </svg>

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
      <div className="noise-overlay" />

      {showLabel && (title || kanji) ? (
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 p-4">
          <div className="min-w-0">
            {title ? (
              <p className="truncate font-display text-sm tracking-wide text-parchment">{title}</p>
            ) : null}
            {subtitle ? (
              <p className="truncate font-mono text-[9px] uppercase tracking-[0.22em] text-ash/80">
                {subtitle}
              </p>
            ) : null}
          </div>
          {kanji ? <span className="font-jp shrink-0 text-[10px] text-parchment/50">{kanji}</span> : null}
        </div>
      ) : null}
    </div>
  )
}

function Motif({
  motif,
  accent,
  embers,
  glowId,
}: {
  motif: PosterMotif
  accent: string
  embers: { x: number; y: number; r: number; o: number }[]
  glowId: string
}) {
  switch (motif) {
    case 'wall':
      return (
        <g>
          <rect x="0" y="150" width="400" height="150" fill="#1c1610" />
          <rect x="20" y="40" width="360" height="180" fill="#3b3128" />
          {[0, 1, 2, 3, 4, 5].map((r) =>
            [0, 1, 2, 3, 4, 5, 6].map((c) => (
              <rect
                key={`${r}-${c}`}
                x={22 + c * 51 + (r % 2 ? 20 : 0)}
                y={44 + r * 30}
                width="46"
                height="26"
                fill="#4a3f33"
                opacity="0.5"
                stroke="#241d15"
                strokeWidth="1.5"
              />
            ))
          )}
          <path d="M150 220 L150 130 A50 50 0 0 1 250 130 L250 220 Z" fill="#120e0a" />
          <path d="M155 220 L155 132 A45 45 0 0 1 245 132 L245 220 Z" fill="#080605" />
          <circle cx="200" cy="120" r="46" fill={`url(#${glowId})`} />
        </g>
      )
    case 'colossal':
      return (
        <g>
          <rect x="0" y="200" width="400" height="100" fill="#1a1109" />
          <path d="M118 210 L118 120 Q118 40 200 40 Q282 40 282 120 L282 210 Z" fill="#6b3a22" />
          <path d="M140 210 L140 128 Q140 60 200 60 Q260 60 260 128 L260 210 Z" fill="#8a4a2c" />
          <ellipse cx="172" cy="128" rx="13" ry="9" fill="#1a0805" />
          <ellipse cx="228" cy="128" rx="13" ry="9" fill="#1a0805" />
          <circle cx="172" cy="128" r="5" fill={accent} opacity="0.9" />
          <circle cx="228" cy="128" r="5" fill={accent} opacity="0.9" />
          <path d="M176 168 Q200 156 224 168 Q200 188 176 168 Z" fill="#2a0f08" />
          {Array.from({ length: 8 }).map((_, i) => (
            <circle
              key={i}
              cx={120 + ((i * 47) % 170)}
              cy={90 + ((i * 31) % 110)}
              r={12 + (i % 4) * 6}
              fill="#c9b7a4"
              opacity="0.06"
            />
          ))}
          <rect x="0" y="210" width="400" height="90" fill="#120b06" opacity="0.8" />
        </g>
      )
    case 'corps':
      return (
        <g>
          <circle cx="200" cy="130" r="92" fill={`url(#${glowId})`} opacity="0.6" />
          <path d="M0 235 Q100 200 200 225 Q300 250 400 215 L400 300 L0 300 Z" fill="#0d1a12" />
          {[110, 200, 290].map((x, i) => (
            <g key={x}>
              <circle cx={x} cy={168 + i * 6} r="7" fill="#0a0d0a" />
              <path
                d={`M${x - 11} ${180 + i * 6} L${x + 11} ${180 + i * 6} L${x + 15} ${228 + i * 6} L${x - 15} ${228 + i * 6} Z`}
                fill="#101a12"
              />
              <path
                d={`M${x - 13} ${184 + i * 6} L${x - 26} ${218 + i * 6} L${x - 4} ${230 + i * 6} Z`}
                fill="#22422a"
                opacity="0.85"
              />
            </g>
          ))}
          <g opacity="0.28" fill={accent} transform="translate(160 54) scale(0.85)">
            <path d="M44 27.5 C34.5 26 21.5 19.5 6.5 5.5 C18 10 29.5 13.5 38.5 15.5 Z" />
            <path d="M43.6 34 C33 32.8 19 26.8 5 14.5 C17 18.8 29.5 21.8 39.2 23 Z" />
            <path d="M43.2 40.5 C31.8 40 17.5 35.8 3.5 25.5 C16 29.8 28.5 32.3 40 32.8 Z" />
            <g transform="translate(96,0) scale(-1,1)">
              <path d="M44 27.5 C34.5 26 21.5 19.5 6.5 5.5 C18 10 29.5 13.5 38.5 15.5 Z" />
              <path d="M43.6 34 C33 32.8 19 26.8 5 14.5 C17 18.8 29.5 21.8 39.2 23 Z" />
              <path d="M43.2 40.5 C31.8 40 17.5 35.8 3.5 25.5 C16 29.8 28.5 32.3 40 32.8 Z" />
            </g>
          </g>
        </g>
      )
    case 'titan':
      return (
        <g>
          <rect x="0" y="215" width="400" height="85" fill="#0d100a" />
          <path
            d="M150 230 Q140 150 178 118 Q200 100 226 120 Q262 152 250 230 Z"
            fill="#1a2113"
          />
          <circle cx="200" cy="96" r="34" fill="#1a2113" />
          <path d="M176 90 h18 v7 h-18 Z" fill="#3a1a0a" />
          <path d="M208 90 h18 v7 h-18 Z" fill="#3a1a0a" />
          <circle cx="185" cy="94" r="3.4" fill={accent} />
          <circle cx="217" cy="94" r="3.4" fill={accent} />
          <path d="M182 112 Q200 104 219 112 Q200 124 182 112 Z" fill="#0c0f09" />
          <circle cx="200" cy="96" r="70" fill={`url(#${glowId})`} opacity="0.35" />
          <path d="M0 240 Q60 225 120 240 Q180 255 240 235 Q310 215 400 240 L400 300 L0 300 Z" fill="#0a0c07" />
        </g>
      )
    case 'trost':
      return (
        <g>
          <rect x="0" y="200" width="400" height="100" fill="#241708" />
          {[
            [20, 130, 60, 90],
            [90, 150, 54, 70],
            [152, 110, 46, 110],
            [210, 145, 58, 75],
            [276, 120, 50, 100],
            [334, 155, 48, 65],
          ].map(([x, y, w, h], i) => (
            <g key={i}>
              <rect x={x} y={y} width={w} height={h} fill="#3a2a1a" />
              <path d={`M${x - 6} ${y} L${x + w / 2} ${y - 20} L${x + w + 6} ${y} Z`} fill="#20150c" />
              <rect x={x + w / 2 - 7} y={y + h - 20} width="14" height="20" fill="#0f0a06" />
            </g>
          ))}
          <circle cx="120" cy="196" r="48" fill="#4a3b2a" />
          <circle cx="112" cy="186" r="9" fill="#3a2d1f" />
          <circle cx="136" cy="204" r="12" fill="#3a2d1f" />
          <path d="M0 250 Q120 235 240 252 Q320 262 400 248 L400 300 L0 300 Z" fill="#1a1008" opacity="0.9" />
          <path d="M20 60 Q200 20 380 70" stroke="#c9a87a" strokeWidth="0.7" opacity="0.35" fill="none" />
          <path d="M40 90 Q210 45 360 100" stroke="#c9a87a" strokeWidth="0.5" opacity="0.2" fill="none" />
        </g>
      )
    case 'basement':
      return (
        <g>
          <rect x="0" y="0" width="400" height="300" fill="#080604" />
          {Array.from({ length: 7 }).map((_, i) => (
            <rect
              key={i}
              x={40 + i * 12}
              y={190 + i * 14}
              width={220 - i * 24}
              height="14"
              fill="#2a1d12"
              opacity={0.9 - i * 0.08}
            />
          ))}
          <rect x="240" y="90" width="120" height="160" fill="#1b120a" />
          <rect x="250" y="100" width="100" height="150" fill="#2d1f13" />
          <circle cx="330" cy="176" r="4" fill={accent} />
          <circle cx="330" cy="176" r="22" fill={`url(#${glowId})`} />
          <rect x="60" y="120" width="8" height="70" fill="#241708" />
          <circle cx="64" cy="112" r="7" fill="#ffb066" opacity="0.9" />
          <circle cx="64" cy="112" r="40" fill={`url(#${glowId})`} opacity="0.8" />
          <rect x="0" y="0" width="400" height="300" fill="#000" opacity="0.25" />
        </g>
      )
    case 'rumbling':
      return (
        <g>
          <rect x="0" y="0" width="400" height="300" fill="#1a0200" />
          <circle cx="200" cy="130" r="150" fill={`url(#${glowId})`} opacity="0.8" />
          {Array.from({ length: 11 }).map((_, i) => {
            const x = 10 + i * 38
            const h = 90 + ((i * 37) % 90)
            return (
              <g key={i} opacity={0.9}>
                <path
                  d={`M${x} ${280} L${x} ${280 - h} Q${x - 12} ${250 - h} ${x + 8} ${235 - h} Q${x + 26} ${252 - h} ${x + 20} ${280} Z`}
                  fill="#0b0201"
                />
                <circle cx={x + 9} cy={230 - h} r="2.2" fill="#ff7733" />
              </g>
            )
          })}
          {embers.map((e, i) => (
            <circle key={i} cx={e.x} cy={e.y} r={e.r} fill="#ff8844" opacity={e.o} />
          ))}
          <rect x="0" y="270" width="400" height="30" fill="#120200" />
        </g>
      )
    case 'map':
      return (
        <g>
          <rect x="0" y="0" width="400" height="300" fill="#2a2216" />
          <circle cx="185" cy="150" r="118" fill="none" stroke="#8a7a58" strokeWidth="2" opacity="0.5" />
          <circle cx="185" cy="150" r="86" fill="none" stroke="#8a7a58" strokeWidth="2" opacity="0.55" />
          <circle cx="185" cy="150" r="54" fill="none" stroke="#8a7a58" strokeWidth="2" opacity="0.6" />
          <circle cx="185" cy="150" r="10" fill={accent} opacity="0.8" />
          {[
            [185, 268],
            [185, 32],
            [67, 150],
            [303, 150],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="4" fill="#c9b48a" opacity="0.8" />
          ))}
          <path d="M320 40 L370 40 L370 80 L340 110 L320 80 Z" fill="#3a3122" opacity="0.7" />
          <g stroke="#c9b48a" strokeWidth="0.8" opacity="0.35">
            <path d="M20 40 h30 M20 50 h20 M20 60 h26" />
          </g>
          <circle cx="350" cy="230" r="30" fill="none" stroke="#c9b48a" strokeWidth="0.8" opacity="0.4" />
          <path d="M350 200 L356 230 L350 260 L344 230 Z" fill="#c9b48a" opacity="0.45" />
        </g>
      )
    case 'wings':
      return (
        <g>
          <circle cx="200" cy="140" r="110" fill={`url(#${glowId})`} opacity="0.55" />
          <g fill={accent} opacity="0.85" transform="translate(80 60) scale(2.5)">
            <path d="M44 27.5 C34.5 26 21.5 19.5 6.5 5.5 C18 10 29.5 13.5 38.5 15.5 Z" opacity="0.95" />
            <path d="M43.6 34 C33 32.8 19 26.8 5 14.5 C17 18.8 29.5 21.8 39.2 23 Z" opacity="0.7" />
            <path d="M43.2 40.5 C31.8 40 17.5 35.8 3.5 25.5 C16 29.8 28.5 32.3 40 32.8 Z" opacity="0.5" />
            <g transform="translate(96,0) scale(-1,1)">
              <path d="M44 27.5 C34.5 26 21.5 19.5 6.5 5.5 C18 10 29.5 13.5 38.5 15.5 Z" opacity="0.95" />
              <path d="M43.6 34 C33 32.8 19 26.8 5 14.5 C17 18.8 29.5 21.8 39.2 23 Z" opacity="0.7" />
              <path d="M43.2 40.5 C31.8 40 17.5 35.8 3.5 25.5 C16 29.8 28.5 32.3 40 32.8 Z" opacity="0.5" />
            </g>
          </g>
        </g>
      )
    case 'sky':
      return (
        <g>
          <circle cx="300" cy="80" r="90" fill={`url(#${glowId})`} opacity="0.5" />
          {[
            [70, 90, 46],
            [140, 70, 34],
            [250, 120, 40],
            [320, 60, 28],
          ].map(([x, y, r], i) => (
            <ellipse key={i} cx={x} cy={y} rx={r * 1.6} ry={r * 0.5} fill="#e8f4ff" opacity="0.12" />
          ))}
          <path d="M0 250 Q100 220 200 245 Q300 268 400 238 L400 300 L0 300 Z" fill="#1a2418" opacity="0.7" />
        </g>
      )
    default:
      return null
  }
}
