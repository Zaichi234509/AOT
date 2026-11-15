'use client'

import { useEffect, useState } from 'react'
import { getPageProgress, getStageProgress, subscribeProgress } from '@/lib/scroll'
import { useStore } from '@/store/useStore'

/** Coarse stage progress (0–1, 0.005 steps) — safe for React rendering. */
export function useScrollProgress(): number {
  return useStore((s) => s.stageProgressRounded)
}

/** Coarse whole-page progress (0–1). */
export function usePageProgress(): number {
  return useStore((s) => s.pageProgressRounded)
}

/** Index of the scene currently on screen during the 3D stage. */
export function useCurrentScene(): number {
  return useStore((s) => s.activeScene)
}

/**
 * Subscribe to the raw per-frame bus without re-rendering React.
 * The callback runs on every animation frame while the component is mounted.
 */
export function useScrollSubscription(callback: (progress: number) => void) {
  useEffect(() => {
    return subscribeProgress(callback)
  }, [callback])
}

/** Snapshot of stage progress, updated at 10fps for lightweight displays. */
export function useLiveStageProgress(refreshMs = 100): number {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const id = window.setInterval(() => setValue(getStageProgress()), refreshMs)
    setValue(getStageProgress())
    return () => window.clearInterval(id)
  }, [refreshMs])
  return value
}

export { getStageProgress, getPageProgress }
