import { SCENES } from './constants'
import { clamp } from './utils'

/**
 * High-frequency scroll bus.
 *
 * The 3D stage progress is pushed here every animation frame so that both the
 * WebGL camera and the HTML overlays can react without re-rendering React 60×
 * per second. UI components that need low-frequency state read the Zustand
 * store instead.
 */

type Listener = (progress: number) => void

const listeners = new Set<Listener>()

let stageProgress = 0
let pageProgress = 0
let stageTop = 0
let stageDistance = 1

export function getStageProgress(): number {
  return stageProgress
}

export function getPageProgress(): number {
  return pageProgress
}

export function subscribeProgress(listener: Listener): () => void {
  listeners.add(listener)
  listener(stageProgress)
  return () => {
    listeners.delete(listener)
  }
}

export function setStageMetrics(top: number, distance: number) {
  stageTop = top
  stageDistance = Math.max(1, distance)
}

export function updateScrollState(scrollY: number, viewportHeight: number, scrollHeight: number) {
  stageProgress = clamp((scrollY - stageTop) / stageDistance, 0, 1)
  pageProgress = clamp(scrollY / Math.max(1, scrollHeight - viewportHeight), 0, 1)
  for (const listener of listeners) listener(stageProgress)
}

/** Scene-local 0–1 progress for a scene index. */
export function sceneLocalProgress(progress: number, index: number): number {
  const scene = SCENES[index]
  if (!scene) return 0
  return clamp((progress - scene.start) / (scene.end - scene.start), 0, 1)
}

export function activeSceneIndex(progress: number): number {
  for (let i = SCENES.length - 1; i >= 0; i -= 1) {
    if (progress >= SCENES[i].start) return i
  }
  return 0
}

/** Scroll (in px) that corresponds to the start of a scene within the stage. */
export function scrollForScene(index: number): number {
  const scene = SCENES[index]
  if (!scene) return stageTop
  return stageTop + scene.start * stageDistance
}
