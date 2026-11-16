import { clamp, smoothstep } from './utils'
import type { CameraKey, SceneFX, Vec3 } from '@/types/scene'

/**
 * Camera choreography per scene.
 *
 * 1 unit = 1 metre and the figures stand with their feet on y = 0, so these
 * shots are framed in real-world terms: a 1.7 m soldier fills the frame from
 * ~4 m, a 15 m titan from ~18 m, the 50 m Wall from ~80 m.
 */
export const CAMERA_KEYS: CameraKey[][] = [
  // 0 — Shiganshina: wide over the rooftops, push to the gate, tilt up to the Colossal
  [
    { at: 0, pos: [0, 10, 80], look: [0, 15, -24], fov: 58 },
    { at: 0.3, pos: [0, 12, 52], look: [0, 22, -34], fov: 56 },
    { at: 0.5, pos: [0, 14, 34], look: [0, 30, -38], fov: 58 },
    { at: 0.7, pos: [0, 12, 14], look: [0, 34, -38], fov: 62 },
    { at: 1, pos: [0, 10, -2], look: [0, 30, -60], fov: 64 },
  ],
  // 1 — The Walls: rise from the outer wall to a map-like aerial
  [
    { at: 0, pos: [0, 20, 60], look: [0, 0, 0], fov: 60 },
    { at: 0.2, pos: [0, 200, 200], look: [0, 0, 0], fov: 50 },
    { at: 0.4, pos: [100, 150, 100], look: [0, 0, 0], fov: 45 },
    { at: 0.6, pos: [60, 100, 60], look: [0, 0, 0], fov: 45 },
    { at: 0.8, pos: [30, 60, 30], look: [0, 0, 0], fov: 40 },
    // nudged off the polar axis so the up-vector never degenerates
    { at: 1, pos: [34, 236, 34], look: [0, 0, 0], fov: 55 },
  ],
  // 2 — Survey Corps: the trio at human scale, then pull back to reveal the titan
  [
    { at: 0, pos: [0, 1.9, 7.2], look: [0, 1.35, -0.6], fov: 44 },
    { at: 0.15, pos: [-2.3, 1.7, 5.2], look: [0, 1.15, -0.8], fov: 42 },
    { at: 0.4, pos: [2.3, 1.7, 5.0], look: [0, 1.15, -0.8], fov: 42 },
    { at: 0.6, pos: [0, 1.8, 4.0], look: [0, 1.25, -1.6], fov: 38 },
    { at: 0.85, pos: [0, 3.6, 12], look: [0, 2.2, -8], fov: 50 },
    { at: 1, pos: [0, 6.5, 19], look: [0, 3.5, -12], fov: 54 },
  ],
  // 3 — The Titans: eye level with the pure titans, then up to the 60 m silhouette
  [
    { at: 0, pos: [0, 1.7, 20], look: [0, 5, 0], fov: 60 },
    { at: 0.25, pos: [0, 1.7, 10], look: [0, 4, 0], fov: 65 },
    { at: 0.4, pos: [5, 1.2, 5], look: [-3, 2.4, 0], fov: 70 },
    { at: 0.6, pos: [0, 9, 30], look: [0, 10, 0], fov: 50 },
    { at: 0.9, pos: [0, 5, 15], look: [0, 40, 0], fov: 80 },
    { at: 1, pos: [0, 4, 12], look: [0, 45, 0], fov: 80 },
  ],
  // 4 — Trost: down the street, through the wreckage, then over the roofs
  [
    { at: 0, pos: [5, 15, 5], look: [0, 10, -20], fov: 60 },
    { at: 0.3, pos: [0, 12, -30], look: [0, 8, -60], fov: 75 },
    { at: 0.5, pos: [-2, 8, -50], look: [3, 10, -55], fov: 80 },
    { at: 0.7, pos: [0, 40, -30], look: [0, 0, -50], fov: 50 },
    { at: 1, pos: [0, 18, -34], look: [0, 26, -98], fov: 58 },
  ],
  // 5 — Basement: down the stairs, across the desk, in to the door
  [
    { at: 0, pos: [0, 2.7, 4.4], look: [0, 1.4, -6], fov: 46 },
    { at: 0.25, pos: [0, 1.8, 1.6], look: [0.4, 1.35, -7], fov: 44 },
    { at: 0.45, pos: [0.5, 1.6, -1.4], look: [2.1, 1.15, -8.6], fov: 46 },
    { at: 0.65, pos: [0.6, 1.5, -6.4], look: [0, 1.45, -12.4], fov: 42 },
    { at: 1, pos: [0, 1.5, -8.8], look: [0, 1.45, -12.7], fov: 34 },
  ],
  // 6 — The Rumbling: the horde, the scale of it, then the ground
  [
    { at: 0, pos: [0, 20, 50], look: [0, 30, 0], fov: 60 },
    { at: 0.25, pos: [0, 50, 100], look: [0, 20, -100], fov: 70 },
    { at: 0.5, pos: [0, 14, 26], look: [0, 32, -60], fov: 78 },
    { at: 0.75, pos: [30, 110, 30], look: [0, 10, -200], fov: 90 },
    { at: 1, pos: [0, 5, 0], look: [0, 5, -10], fov: 60 },
  ],
]

/**
 * Per-scene grade. `exposure` feeds ACES, the rest is post.
 * AO is only switched on for the two shots where geometry meets the floor at
 * human scale and the screen-space radius is small enough to read.
 */
export const SCENE_FX: SceneFX[] = [
  {
    exposure: 1.04,
    bloom: 0.5,
    bloomThreshold: 0.68,
    vignetteOffset: 0.34,
    vignetteDarkness: 0.62,
    noise: 0.035,
    shake: 0.3,
    saturation: 1.04,
    contrast: 1.06,
    brightness: 0.01,
  },
  {
    exposure: 1.0,
    bloom: 0.28,
    bloomThreshold: 0.78,
    vignetteOffset: 0.3,
    vignetteDarkness: 0.5,
    noise: 0.022,
    shake: 0,
    saturation: 1.1,
    contrast: 1.05,
    brightness: 0.02,
  },
  {
    exposure: 1.18,
    bloom: 0.24,
    bloomThreshold: 0.74,
    vignetteOffset: 0.36,
    vignetteDarkness: 0.78,
    noise: 0.045,
    shake: 0,
    saturation: 0.96,
    contrast: 1.1,
    brightness: 0.0,
  },
  {
    exposure: 1.45,
    bloom: 0.42,
    bloomThreshold: 0.66,
    vignetteOffset: 0.62,
    vignetteDarkness: 0.7,
    noise: 0.075,
    shake: 0.18,
    saturation: 0.9,
    contrast: 1.12,
    brightness: -0.01,
  },
  {
    exposure: 1.06,
    bloom: 0.55,
    bloomThreshold: 0.62,
    vignetteOffset: 0.4,
    vignetteDarkness: 0.78,
    noise: 0.06,
    shake: 0.5,
    saturation: 1.06,
    contrast: 1.08,
    brightness: 0.01,
  },
  {
    exposure: 1.36,
    bloom: 0.7,
    bloomThreshold: 0.42,
    vignetteOffset: 0.66,
    vignetteDarkness: 1.05,
    noise: 0.12,
    shake: 0,
    saturation: 1.04,
    contrast: 1.12,
    brightness: 0.0,
  },
  {
    exposure: 1.22,
    bloom: 1.05,
    bloomThreshold: 0.4,
    vignetteOffset: 0.5,
    vignetteDarkness: 0.92,
    noise: 0.1,
    shake: 1,
    saturation: 1.04,
    contrast: 1.1,
    brightness: 0,
  },
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
