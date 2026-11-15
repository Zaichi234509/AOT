'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/store/useStore'
import { useAssetLoader } from '@/hooks/useAssetLoader'
import { WingsLogo } from '@/components/ui/WingsLogo'

export function LoadingScreen() {
  const isLoading = useStore((s) => s.isLoading)
  const progress = useStore((s) => s.loadProgress)
  const [removed, setRemoved] = useState(false)
  useAssetLoader()

  useEffect(() => {
    if (isLoading) {
      setRemoved(false)
      return
    }
    const id = window.setTimeout(() => setRemoved(true), 850)
    return () => window.clearTimeout(id)
  }, [isLoading])

  if (removed) return null

  return (
    <div
      aria-live="polite"
      aria-busy={isLoading}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-ink-950 transition-opacity duration-700 ease-out"
      style={{ opacity: isLoading ? 1 : 0, pointerEvents: isLoading ? 'auto' : 'none' }}
    >
      <div className="noise-overlay" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(45,90,39,0.14),transparent_65%)]" />

      <div className="relative flex flex-col items-center px-8">
        <WingsLogo size={92} className="animate-pulse-glow text-parchment/90" title="Wings of Freedom" />
        <p className="mt-8 font-display text-sm uppercase tracking-[0.35em] text-ash">AoT Archive</p>
        <p className="mt-6 font-body text-sm text-ash/80">Dedicating your hearts…</p>

        <div className="mt-8 h-px w-[220px] overflow-hidden bg-white/10 sm:w-[280px]">
          <div
            className="h-full bg-primary-light transition-[width] duration-300 ease-out"
            style={{ width: `${Math.round(progress)}%`, boxShadow: '0 0 12px rgba(74,124,63,0.9)' }}
          />
        </div>

        <p className="mt-4 font-mono text-[11px] tracking-[0.18em] text-smoke">
          Loading assets — {String(Math.round(progress)).padStart(3, ' ')}%
        </p>
        <p className="font-jp mt-2 text-[10px] tracking-[0.3em] text-smoke/60">心臓を捧げよ</p>
      </div>
    </div>
  )
}
