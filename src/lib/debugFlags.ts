/** QA switches for the stage (?debug=nopost,nosky&exposure=0.5). */
export type DebugFlags = {
  post: boolean
  sky: boolean
  env: boolean
  shadows: boolean
  exposure: number | null
}

let cached: DebugFlags | null = null

export function debugFlags(): DebugFlags {
  if (cached) return cached
  const flags: DebugFlags = { post: true, sky: true, env: true, shadows: true, exposure: null }
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    const disabled = (params.get('debug') ?? '').split(',')
    if (disabled.includes('nopost')) flags.post = false
    if (disabled.includes('nosky')) flags.sky = false
    if (disabled.includes('noenv')) flags.env = false
    if (disabled.includes('noshadows')) flags.shadows = false
    const exposure = Number(params.get('exposure'))
    if (Number.isFinite(exposure) && params.get('exposure')) flags.exposure = exposure
  }
  cached = flags
  return flags
}
