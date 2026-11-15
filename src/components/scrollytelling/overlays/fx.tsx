'use client'

import { useEffect, useRef } from 'react'
import { SCENES } from '@/lib/constants'
import { getStageProgress, sceneLocalProgress, subscribeProgress } from '@/lib/scroll'
import { useStore } from '@/store/useStore'
import { clamp, smoothstep } from '@/lib/utils'

/** White→red detonation flash pinned to a scene-local moment. */
export function ScrollFlash({
  scene,
  peak = 0.42,
  spread = 0.05,
  color = '#ffffff',
  maxOpacity = 0.8,
}: {
  scene: number
  peak?: number
  spread?: number
  color?: string
  maxOpacity?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const apply = (progress: number) => {
      const el = ref.current
      if (!el) return
      const p = sceneLocalProgress(progress, scene)
      const rise = smoothstep(peak - spread, peak, p)
      const fall = 1 - smoothstep(peak, peak + spread * 1.6, p)
      const alpha = clamp(rise * fall, 0, 1) * maxOpacity
      el.style.opacity = alpha.toFixed(3)
    }
    apply(getStageProgress())
    return subscribeProgress(apply)
  }, [scene, peak, spread, maxOpacity])

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-40 mix-blend-screen"
      style={{ backgroundColor: color, opacity: 0 }}
    />
  )
}

/** Scroll-driven number counter (e.g. 60,000,000 titans). */
export function ScrollCounter({
  scene,
  start,
  end,
  from = 0,
  to,
  suffix = '',
  className,
}: {
  scene: number
  start: number
  end: number
  from?: number
  to: number
  suffix?: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const apply = (progress: number) => {
      const el = ref.current
      if (!el) return
      const p = sceneLocalProgress(progress, scene)
      const t = smoothstep(start, end, p)
      const value = Math.round(from + (to - from) * t)
      el.textContent = `${value.toLocaleString('en-US')}${suffix}`
    }
    apply(getStageProgress())
    return subscribeProgress(apply)
  }, [scene, start, end, from, to, suffix])

  return (
    <span ref={ref} className={className}>
      {from}
      {suffix}
    </span>
  )
}

/** Fixed scene chrome: chapter index, title, kanji and mood. */
export function SceneCaption() {
  const active = useStore((s) => s.activeScene)
  const stageProgress = useStore((s) => s.stageProgressRounded)
  const scene = SCENES[active] ?? SCENES[0]
  const visible = stageProgress > 0.004 && stageProgress < 0.997

  return (
    <div
      aria-live="polite"
      className="pointer-events-none absolute bottom-6 left-5 z-30 hidden items-end gap-4 transition-all duration-700 md:flex md:bottom-10 md:left-10"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)' }}
    >
      <div className="flex items-baseline gap-1 font-mono text-[10px] tracking-[0.2em] text-parchment/60">
        <span style={{ color: scene.accent }}>{String(scene.index + 1).padStart(2, '0')}</span>
        <span className="text-parchment/25">/</span>
        <span>{String(SCENES.length).padStart(2, '0')}</span>
      </div>
      <span className="mb-1 h-8 w-px" style={{ backgroundColor: `${scene.accent}80` }} />
      <div className="mb-0.5">
        <p className="font-display text-sm uppercase tracking-[0.18em] text-parchment/85">{scene.label}</p>
        <p className="font-jp text-[10px] tracking-[0.25em] text-parchment/40">{scene.titleJP}</p>
      </div>
      <span className="mb-1 h-px w-16" style={{ backgroundColor: `${scene.accent}50` }} />
      <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.25em] text-parchment/35">
        {scene.subtitle}
      </p>
    </div>
  )
}

/** Bottom-right scene progress meter (thin segmented rail). */
export function SceneMeter() {
  const active = useStore((s) => s.activeScene)
  const stageProgress = useStore((s) => s.stageProgressRounded)

  return (
    <div className="pointer-events-none absolute bottom-10 right-8 z-30 hidden items-center gap-1.5 md:flex">
      {SCENES.map((scene) => {
        const done = stageProgress > scene.end
        const current = active === scene.index
        return (
          <span
            key={scene.id}
            className="h-[2px] transition-all duration-500"
            style={{
              width: current ? 26 : 12,
              backgroundColor: current ? scene.accent : done ? 'rgba(245,240,232,0.35)' : 'rgba(245,240,232,0.12)',
              boxShadow: current ? `0 0 10px ${scene.accent}` : undefined,
            }}
          />
        )
      })}
    </div>
  )
}
