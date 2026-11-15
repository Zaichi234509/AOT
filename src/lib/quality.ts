/**
 * Rendering quality tiers.
 *
 * The stage targets 60 fps on a mid-range laptop. Rather than shipping one
 * pipeline and hoping, we detect the GPU once (at module load, before anything
 * renders) and pick a budget: shadow-map size, SSAO, multisampling, environment
 * resolution, particle density and DPR all scale with it.
 *
 * The tier can be forced for QA with `?q=high|medium|low` in the URL, or at
 * build time with `NEXT_PUBLIC_FORCE_QUALITY`.
 */

import * as THREE from 'three'

export type QualityTier = 'high' | 'medium' | 'low'

export type QualitySettings = {
  tier: QualityTier
  /** SwiftShader / llvmpipe / Microsoft Basic Render — no real GPU behind it. */
  softwareRenderer: boolean
  renderer: string
  dpr: [number, number]
  shadows: boolean
  shadowMapSize: number
  shadowMapType: THREE.ShadowMapType
  /** screen-space ambient occlusion in the post stack */
  ao: boolean
  /** drei ContactShadows under hero objects */
  contactShadows: boolean
  multisampling: number
  environmentResolution: number
  /** multiplier on particle / ember counts */
  particleScale: number
  /** radial segments used when sculpting procedural geometry */
  radialSegments: number
  anisotropy: number
}

const SETTINGS: Record<QualityTier, Omit<QualitySettings, 'tier' | 'softwareRenderer' | 'renderer'>> = {
  high: {
    dpr: [1, 1.75],
    shadows: true,
    shadowMapSize: 2048,
    shadowMapType: THREE.PCFSoftShadowMap,
    ao: true,
    contactShadows: true,
    multisampling: 2,
    environmentResolution: 256,
    particleScale: 1,
    radialSegments: 20,
    anisotropy: 8,
  },
  medium: {
    dpr: [0.85, 1.35],
    shadows: true,
    shadowMapSize: 1024,
    shadowMapType: THREE.PCFShadowMap,
    ao: false,
    contactShadows: false,
    multisampling: 0,
    environmentResolution: 128,
    particleScale: 0.6,
    radialSegments: 14,
    anisotropy: 4,
  },
  low: {
    dpr: [0.75, 1],
    shadows: false,
    shadowMapSize: 512,
    shadowMapType: THREE.BasicShadowMap,
    ao: false,
    contactShadows: false,
    multisampling: 0,
    environmentResolution: 64,
    particleScale: 0.35,
    radialSegments: 10,
    anisotropy: 1,
  },
}

function forcedTier(): QualityTier | null {
  if (typeof window !== 'undefined') {
    const q = new URLSearchParams(window.location.search).get('q')
    if (q === 'high' || q === 'medium' || q === 'low') return q
  }
  const env = process.env.NEXT_PUBLIC_FORCE_QUALITY
  if (env === 'high' || env === 'medium' || env === 'low') return env
  return null
}

const SOFTWARE = /swiftshader|llvmpipe|software|basic render|mesa offscreen|angle \(google, vulkan 1\.\d+\.\d+ \(swiftshader/i

let cached: QualitySettings | null = null

export function detectQuality(): QualitySettings {
  if (cached) return cached

  let renderer = 'unknown'
  let softwareRenderer = false

  if (typeof document !== 'undefined') {
    try {
      const canvas = document.createElement('canvas')
      const gl = (canvas.getContext('webgl2') ??
        canvas.getContext('webgl')) as WebGLRenderingContext | null
      if (gl) {
        const ext = gl.getExtension('WEBGL_debug_renderer_info')
        renderer = String(
          (ext && gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) || gl.getParameter(gl.RENDERER) || 'unknown'
        )
        softwareRenderer = SOFTWARE.test(renderer)
        gl.getExtension('WEBGL_lose_context')?.loseContext()
      }
    } catch {
      /* detection is best-effort */
    }
  }

  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency ?? 8 : 8
  const memory = typeof navigator !== 'undefined' ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8 : 8
  const coarse = typeof window !== 'undefined' ? window.matchMedia('(hover: none)').matches : false

  let tier: QualityTier = 'high'
  if (softwareRenderer) tier = 'low'
  else if (coarse || cores <= 4 || memory <= 4) tier = 'medium'

  const forced = forcedTier()
  if (forced) {
    tier = forced
    if (forced !== 'low') softwareRenderer = false
  }

  cached = { ...SETTINGS[tier], tier, softwareRenderer, renderer }
  return cached
}

export function getQuality(): QualitySettings {
  return cached ?? detectQuality()
}
