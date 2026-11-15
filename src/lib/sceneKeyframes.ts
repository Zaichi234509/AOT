import { clamp, smoothstep } from './utils'
import type { CameraKey, SceneFX, Vec3 } from '@/types/scene'

/** Camera choreography per scene, exactly as specified in the master prompt. */
export const CAMERA_KEYS: CameraKey[][] = [
  // 0 — Shiganshina
  [
    { at: 0, pos: [0, 10, 80], look: [0, 20, 0], fov: 60 },
    { at: 0.3, pos: [0, 15, 40], look: [0, 30, 0], fov: 55 },
    { at: 0.5, pos: [0, 25, 30], look: [0, 55, -10], fov: 70 },
    { at: 0.7, pos: [0, 15, 10], look: [0, 20, -20], fov: 65 },
    { at: 1, pos: [0, 10, -5], look: [0, 10, -50], fov: 65 },
  ],
  // 1 — The Walls
  [
    { at: 0, pos: [0, 20, 60], look: [0, 0, 0], fov: 60 },
    { at: 0.2, pos: [0, 200, 200], look: [0, 0, 0], fov: 50 },
    { at: 0.4, pos: [100, 150, 100], look: [0, 0, 0], fov: 45 },
    { at: 0.6, pos: [60, 100, 60], look: [0, 0, 0], fov: 45 },
    { at: 0.8, pos: [30, 60, 30], look: [0, 0, 0], fov: 40 },
    // nudged off the polar axis so the up-vector never degenerates
    { at: 1, pos: [34, 236, 34], look: [0, 0, 0], fov: 55 },
  ],
  // 2 — Survey Corps
  [
    { at: 0, pos: [0, 2, 5], look: [0, 1.5, 0], fov: 50 },
    { at: 0.15, pos: [-3, 1.5, 4], look: [0, 1, 0], fov: 45 },
    { at: 0.4, pos: [3, 1.5, 4], look: [0, 1, 0], fov: 45 },
    { at: 0.6, pos: [0, 2, 3], look: [0, 1.2, 0], fov: 40 },
    { at: 0.85, pos: [0, 5, 12], look: [0, 1, 0], fov: 55 },
    { at: 1, pos: [0, 7, 17], look: [0, 2, 0], fov: 55 },
  ],
  // 3 — The Titans
  [
    { at: 0, pos: [0, 1.7, 20], look: [0, 5, 0], fov: 60 },
    { at: 0.25, pos: [0, 1.7, 10], look: [0, 4, 0], fov: 65 },
    { at: 0.4, pos: [5, 1, 5], look: [-3, 2, 0], fov: 70 },
    { at: 0.6, pos: [0, 10, 30], look: [0, 10, 0], fov: 50 },
    { at: 0.9, pos: [0, 5, 15], look: [0, 40, 0], fov: 80 },
    { at: 1, pos: [0, 4, 12], look: [0, 45, 0], fov: 80 },
  ],
  // 4 — Trost
  [
    { at: 0, pos: [5, 15, 5], look: [0, 10, -20], fov: 60 },
    { at: 0.3, pos: [0, 12, -30], look: [0, 8, -60], fov: 75 },
    { at: 0.5, pos: [-2, 8, -50], look: [3, 10, -55], fov: 80 },
    { at: 0.7, pos: [0, 40, -30], look: [0, 0, -50], fov: 50 },
    { at: 1, pos: [0, 5, -70], look: [0, 8, -80], fov: 55 },
  ],
  // 5 — Basement
  [
    { at: 0, pos: [0, 3, 5], look: [0, 1, 0], fov: 50 },
    { at: 0.25, pos: [0, 1, 2], look: [0, 0, -3], fov: 45 },
    { at: 0.45, pos: [0, 1.5, 0.5], look: [0, 1.5, -1], fov: 40 },
    { at: 0.65, pos: [0, 1.5, -2], look: [0, 1.5, -5], fov: 50 },
    { at: 1, pos: [0, 1.6, -4], look: [0, 1.6, -5], fov: 35 },
  ],
  // 6 — The Rumbling
  [
    { at: 0, pos: [0, 20, 50], look: [0, 30, 0], fov: 60 },
    { at: 0.25, pos: [0, 50, 100], look: [0, 20, -100], fov: 70 },
    { at: 0.5, pos: [0, 10, 20], look: [0, 30, -50], fov: 80 },
    { at: 0.75, pos: [30, 110, 30], look: [0, 10, -200], fov: 90 },
    { at: 1, pos: [0, 5, 0], look: [0, 5, -10], fov: 60 },
  ],
]

export const SCENE_FX: SceneFX[] = [
  { bloom: 0.55, vignetteOffset: 0.32, vignetteDarkness: 0.65, noise: 0.035, shake: 0.3 },
  { bloom: 0.35, vignetteOffset: 0.3, vignetteDarkness: 0.55, noise: 0.025, shake: 0 },
  { bloom: 0.45, vignetteOffset: 0.35, vignetteDarkness: 0.8, noise: 0.045, shake: 0 },
  { bloom: 0.85, vignetteOffset: 0.45, vignetteDarkness: 0.95, noise: 0.08, shake: 0.2 },
  { bloom: 0.7, vignetteOffset: 0.4, vignetteDarkness: 0.8, noise: 0.07, shake: 0.5 },
  { bloom: 0.6, vignetteOffset: 0.72, vignetteDarkness: 1.15, noise: 0.14, shake: 0 },
  { bloom: 1.4, vignetteOffset: 0.5, vignetteDarkness: 0.95, noise: 0.1, shake: 1 },
]

export type CameraSample = { pos: Vec3; look: Vec3; fov: number }

function lerpVec(a: Vec3, b: Vec3, t: number): Vec3 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

/** Sample the camera path for a scene at local progress 0–1. */
export function sampleCamera(scene: number, local: number): CameraSample {
  const keys = CAMERA_KEYS[clamp(scene, 0, CAMERA_KEYS.length - 1)]
  const t = clamp(local, 0, 1)
  let a = keys[0]
  let b = keys[keys.length - 1]
  for (let i = 0; i < keys.length - 1; i += 1) {
    if (t >= keys[i].at && t <= keys[i + 1].at) {
      a = keys[i]
      b = keys[i + 1]
      break
    }
  }
  const span = b.at - a.at || 1
  const raw = clamp((t - a.at) / span, 0, 1)
  // smooth in/out inside each segment keeps handheld-drone motion cinematic
  const ease = smoothstep(0, 1, raw)
  return {
    pos: lerpVec(a.pos, b.pos, ease),
    look: lerpVec(a.look, b.look, ease),
    fov: a.fov + (b.fov - a.fov) * ease,
  }
}
