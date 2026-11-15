'use client'

import { useEffect, useRef } from 'react'
import { getPageProgress } from '@/lib/scroll'

/** Thin green progress rail pinned to the left edge, tracking the whole page. */
export function ScrollProgress() {
  const fillRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0
    let last = -1

    const paint = () => {
      const el = fillRef.current
      const progress = getPageProgress()
      if (el && Math.abs(progress - last) > 0.0004) {
        last = progress
        el.style.transform = `scaleY(${Math.max(0.001, progress).toFixed(4)})`
      }
      frame = requestAnimationFrame(paint)
    }
    frame = requestAnimationFrame(paint)

    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-0 left-0 top-0 z-40 hidden w-[3px] bg-white/[0.05] md:block"
    >
      <div
        ref={fillRef}
        className="h-full w-full origin-top bg-gradient-to-b from-primary-light via-primary to-primary-dark"
        style={{ transform: 'scaleY(0.001)', boxShadow: '0 0 10px rgba(74,124,63,0.6)' }}
      />
    </div>
  )
}
