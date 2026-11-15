'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import {
  activeSceneIndex,
  getPageProgress,
  getStageProgress,
  setStageMetrics,
  updateScrollState,
} from '@/lib/scroll'
import { setLenisInstance } from '@/lib/smooth-scroll'
import { prefersReducedMotion } from '@/lib/utils'
import { useStore } from '@/store/useStore'

/**
 * Owns the scroll lifecycle: Lenis smoothing, stage metrics, and the
 * high-frequency progress bus. Only coarse values are mirrored into Zustand.
 */
export function ScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let lenis: Lenis | null = null
    let raf = 0
    let lastScene = -1
    let lastStage = -1
    let lastPage = -1

    const measure = () => {
      const el = document.getElementById('stage-track')
      if (el) setStageMetrics(el.offsetTop, el.offsetHeight - window.innerHeight)
      else setStageMetrics(0, 1)
    }

    if (!prefersReducedMotion()) {
      lenis = new Lenis({
        duration: 1.15,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.6,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      })
      setLenisInstance(lenis)
    }

    const tick = () => {
      if (lenis) lenis.raf(performance.now())

      const y = window.scrollY
      const vh = window.innerHeight
      updateScrollState(y, vh, document.documentElement.scrollHeight)

      const roundedStage = Math.round(getStageProgress() * 200) / 200
      const roundedPage = Math.round(getPageProgress() * 400) / 400
      const store = useStore.getState()

      if (roundedStage !== lastStage) {
        lastStage = roundedStage
        store.setStageProgressRounded(roundedStage)
      }
      if (roundedPage !== lastPage) {
        lastPage = roundedPage
        store.setPageProgressRounded(roundedPage)
      }
      const scene = activeSceneIndex(getStageProgress())
      if (scene !== lastScene) {
        lastScene = scene
        store.setActiveScene(scene)
      }

      raf = requestAnimationFrame(tick)
    }

    measure()
    tick()

    const onResize = () => measure()
    window.addEventListener('resize', onResize)
    window.addEventListener('load', onResize)

    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => measure()) : null
    if (observer && document.body) observer.observe(document.body)

    // Delegate in-page anchors to Lenis for consistent easing.
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      const anchor = target?.closest('a[href^="#"]') as HTMLAnchorElement | null
      if (!anchor) return
      const hash = anchor.getAttribute('href')
      if (!hash || hash === '#') return
      const el = document.querySelector(hash) as HTMLElement | null
      if (!el) return
      event.preventDefault()
      if (lenis) {
        lenis.scrollTo(el, { offset: -68, duration: 1.4 })
      } else {
        const top = el.getBoundingClientRect().top + window.scrollY - 68
        window.scrollTo({ top, behavior: 'smooth' })
      }
      window.history.replaceState(null, '', hash)
    }
    document.addEventListener('click', onClick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('load', onResize)
      document.removeEventListener('click', onClick)
      observer?.disconnect()
      lenis?.destroy()
      setLenisInstance(null)
    }
  }, [])

  return <>{children}</>
}
