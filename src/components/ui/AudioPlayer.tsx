'use client'

import { Pause, Play, RotateCcw, Volume2 } from 'lucide-react'
import type { Track } from '@/types'
import { cn } from '@/lib/utils'

type Props = {
  track: Track | null
  playing: boolean
  progress: number
  onToggle: () => void
  onSeek: (ratio: number) => void
  onReset: () => void
  className?: string
}

function formatTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function AudioPlayer({ track, playing, progress, onToggle, onSeek, onReset, className }: Props) {
  const elapsed = track ? track.seconds * progress : 0

  return (
    <div className={cn('glass-card flex flex-col gap-4 p-4 md:flex-row md:items-center md:gap-6 md:p-5', className)}>
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <button
          type="button"
          onClick={onToggle}
          disabled={!track}
          aria-label={playing ? 'Pause preview' : 'Play preview'}
          className="focus-ring grid h-12 w-12 shrink-0 place-items-center rounded-full border border-primary-light/60 bg-primary/30 text-parchment transition hover:bg-primary/50 hover:shadow-glowGreen disabled:opacity-40"
        >
          {playing ? <Pause size={18} /> : <Play size={18} className="translate-x-[1px]" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="truncate font-display text-sm text-parchment">
              {track ? track.title : 'Select a track'}
            </p>
            <span className="shrink-0 font-mono text-[10px] text-smoke">
              {formatTime(elapsed)} / {track?.duration ?? '0:00'}
            </span>
          </div>
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-smoke">
            {track ? `${track.artist} · ${track.type}` : 'AoT Archive · soundtrack'}
          </p>

          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              aria-label="Restart preview"
              onClick={onReset}
              disabled={!track}
              className="text-smoke transition hover:text-parchment disabled:opacity-40"
            >
              <RotateCcw size={12} />
            </button>
            <input
              type="range"
              className="aot-range w-full"
              min={0}
              max={1000}
              value={Math.round(progress * 1000)}
              onChange={(e) => onSeek(Number(e.target.value) / 1000)}
              aria-label="Seek within preview"
              disabled={!track}
            />
            <Volume2 size={13} className="shrink-0 text-smoke" />
          </div>
        </div>
      </div>

      <div className="hidden items-end gap-[3px] md:flex" aria-hidden>
        {Array.from({ length: 22 }).map((_, i) => (
          <span
            key={i}
            className="w-[3px] rounded-sm"
            style={{
              height: playing ? `${6 + ((i * 7) % 22)}px` : '5px',
              backgroundColor: playing ? '#4A7C3F' : 'rgba(255,255,255,0.14)',
              animation: playing ? `bar-dance ${620 + (i % 5) * 90}ms ease-in-out infinite` : undefined,
              animationDelay: `${(i % 6) * 60}ms`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
