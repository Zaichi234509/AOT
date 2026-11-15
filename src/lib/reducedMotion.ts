/**
 * `prefers-reduced-motion` helper for the 3D stage.
 *
 * Scroll-driven camera motion is user-controlled and stays; this flag turns off
 * the autonomous motion (camera shake, idle bobbing, particle drift, flicker)
 * that a reduced-motion visitor did not ask for.
 */

let cached: boolean | null = null

export function prefersReducedMotionCached(): boolean {
  if (cached !== null) return cached
  if (typeof window === 'undefined' || !window.matchMedia) {
    cached = false
    return cached
  }
  cached = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return cached
}

/** True when autonomous animation is allowed. */
export function motionAllowed(): boolean {
  return !prefersReducedMotionCached()
}
