'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  label: string
  value: number
  max?: number
  accent?: string
  delay?: number
}

export function StatBar({ label, value, max = 10, accent = '#4A7C3F', delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="w-full">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ash">{label}</span>
        <span className="font-mono text-[11px] text-parchment/80">
          {value}
          <span className="text-smoke">/{max}</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className="h-full rounded-full transition-[width] duration-1000 ease-out-expo"
          style={{
            width: visible ? `${(value / max) * 100}%` : '0%',
            backgroundColor: accent,
            boxShadow: `0 0 10px ${accent}80`,
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
    </div>
  )
}
