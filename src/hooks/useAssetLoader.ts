'use client'

import { useEffect } from 'react'
import { useStore } from '@/store/useStore'

/**
 * Boot sequence for the loading screen.
 *
 * Real signals (fonts + window load) gate the final jump to 100%; the easing
 * curve in between keeps the "Dedicating your hearts…" beat on screen long
 * enough to read. A hard cap prevents a stuck loader if a font request hangs.
 */
export function useAssetLoader() {
  const setLoadProgress = useStore((s) => s.setLoadProgress)
  const finishLoading = useStore((s) => s.finishLoading)

  useEffect(() => {
    let raf = 0
    let progress = 0
    let done = false
    const start = performance.now()
    const signals = { fonts: false, load: false }

    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => {
        signals.fonts = true
      })
    } else {
      signals.fonts = true
    }

    if (document.readyState === 'complete') signals.load = true
    const onLoad = () => {
      signals.load = true
    }
    window.addEventListener('load', onLoad)

    const tick = () => {
      const elapsed = (performance.now() - start) / 1000
      const ready = signals.fonts && signals.load
      const target = ready ? 100 : Math.min(90, 26 + elapsed * 52)
      progress += (target - progress) * 0.09
      if (target === 100 && progress > 99.3) progress = 100

      setLoadProgress(progress)

      if (progress >= 99.5 || elapsed > 4.5) {
        if (!done) {
          done = true
          setLoadProgress(100)
          window.setTimeout(() => finishLoading(), 420)
        }
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('load', onLoad)
      window.clearTimeout(undefined)
    }
  }, [setLoadProgress, finishLoading])
}
