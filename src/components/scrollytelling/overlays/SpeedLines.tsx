'use client'

import { useEffect, useRef } from 'react'
import { getStageProgress, subscribeProgress } from '@/lib/scroll'
import { clamp, smoothstep } from '@/lib/utils'

/**
 * Manga-style radial speed lines for the Trost sequence.
 * Opacity follows the scroll velocity inside scene 5 — never constant.
 */
export function SpeedLines() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let last = 0
    const apply = (progress: number) => {
      const el = ref.current
      if (!el) return
      const scene = 5 // 1-indexed scene 5 → local range below
      const start = 0.625
      const end = 0.75
      const local = clamp((progress - start) / (end - start), 0, 1)
      void scene
      const inScene = smoothstep(0, 0.06, local) * (1 - smoothstep(0.9, 1, local))
      const delta = Math.abs(progress - last)
      last = progress
      const velocity = clamp(delta * 260, 0, 1)
      el.style.opacity = (inScene * (0.06 + velocity * 0.35)).toFixed(3)
    }
    apply(getStageProgress())
    return subscribeProgress(apply)
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-20 mix-blend-screen"
      style={{
        opacity: 0,
        background:
          'repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,0.55) 0deg 0.35deg, transparent 0.35deg 2.6deg)',
        maskImage: 'radial-gradient(circle at 50% 50%, transparent 22%, black 70%)',
        WebkitMaskImage: 'radial-gradient(circle at 50% 50%, transparent 22%, black 70%)',
      }}
    />
  )
}
