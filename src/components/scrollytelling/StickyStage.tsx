'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { SCENES, STAGE_VH } from '@/lib/constants'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useStore } from '@/store/useStore'
import { MobileStage } from './MobileStage'
import { CanvasBoundary, supportsWebGL } from './CanvasBoundary'
import { OverlayLayer } from './overlays/OverlayLayer'
import { SceneCaption, SceneMeter } from './overlays/fx'
import { SpeedLines } from './overlays/SpeedLines'

const SceneCanvas = dynamic(() => import('./SceneCanvas'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0" style={{ background: SCENES[0].gradient }} aria-hidden />
  ),
})

export function StickyStage() {
  const isMobile = useIsMobile()
  const [mounted, setMounted] = useState(false)
  const [webgl, setWebgl] = useState(true)
  const activeScene = useStore((s) => s.activeScene)
  const [flash, setFlash] = useState(0)
  const previous = useRef(activeScene)

  useEffect(() => {
    setMounted(true)
    setWebgl(supportsWebGL())
  }, [])

  useEffect(() => {
    if (previous.current === activeScene) return
    previous.current = activeScene
    setFlash(1)
    const id = window.setTimeout(() => setFlash(0), 60)
    return () => window.clearTimeout(id)
  }, [activeScene])

  const use2D = mounted && (isMobile || !webgl)

  return (
    <section id="hero" aria-label="Cinematic 3D retelling of Attack on Titan">
      <div id="stage-track" className="relative w-full" style={{ height: `${STAGE_VH}vh` }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-ink-950">
          {/* ── stage ── */}
          {!mounted ? (
            <div className="absolute inset-0" style={{ background: SCENES[0].gradient }} />
          ) : use2D ? (
            <CanvasBoundary fallback={<MobileStage />}>
              <MobileStage />
            </CanvasBoundary>
          ) : (
            <CanvasBoundary fallback={<MobileStage />}>
              <SceneCanvas />
            </CanvasBoundary>
          )}

          {/* ── atmosphere chrome ── */}
          <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_50%_45%,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0.1)_45%,transparent_70%)]" />
          <div className="pointer-events-none absolute inset-0 z-10 vignette-frame" />
          <div className="pointer-events-none absolute inset-0 z-10 noise-overlay" />
          <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(to_bottom,rgba(10,10,10,0.55),transparent_22%,transparent_74%,rgba(10,10,10,0.75))]" />
          <div className="pointer-events-none absolute inset-0 z-10 hidden scanlines opacity-20 md:block" />

          {/* ── narrative overlays ── */}
          <SpeedLines />
          <OverlayLayer />
          <SceneCaption />
          <SceneMeter />

          {/* scene cut flash */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-40 bg-black transition-opacity duration-500"
            style={{ opacity: flash * 0.55 }}
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-t from-ink-950 to-transparent" />
        </div>
      </div>
    </section>
  )
}
