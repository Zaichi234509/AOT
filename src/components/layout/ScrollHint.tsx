'use client'

import { ArrowDown } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

export function ScrollHint() {
  const stageProgress = useStore((s) => s.stageProgressRounded)
  const visible = stageProgress < 0.02

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none fixed bottom-8 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-2 transition-opacity duration-700',
        visible ? 'opacity-100' : 'opacity-0'
      )}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-ash/80">
        Scroll to begin
      </span>
      <ArrowDown size={14} className="animate-scroll-bounce text-ash/70" />
    </div>
  )
}
