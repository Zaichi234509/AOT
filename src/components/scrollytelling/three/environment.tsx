'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getQuality } from '@/lib/quality'
import { debugFlags } from '@/lib/debugFlags'

/* ──────────────────────────────────────────────────────────────────────────
 * Image-based lighting.
 *
 * No HDRI is downloaded. Each scene mood is described as a handful of numbers
 * (zenith / horizon / ground colours, sun direction and intensity) and baked
 * into a small HDR equirectangular map (half-float, sun included) which is run
 * through PMREM once. That is the same data drei's <Environment> would build
 * from Lightformers, just generated in code so it stays offline, deterministic
 * and tiny (~64–256 px).
 *
 * The same preset drives the sky dome shader, so the visible sky and the light
 * the materials receive always agree.
 * ────────────────────────────────────────────────────────────────────────── */

export type EnvPreset =
  | 'shiganshinaDusk'
  | 'wallNoon'
  | 'corpsNight'
  | 'titanMist'
  | 'trostSunset'
  | 'basementLamp'
  | 'rumblingInferno'

export type EnvDefinition = {
  /** sky colours, linear-ish hex */
  zenith: string
  horizon: string
  ground: string
  /** sun / moon */
  sunColor: string
  sunDirection: [number, number, number]
  /** HDR peak of the sun disc (values > 1 are what make metal glint) */
  sunDisc: number
  /** exponent of the disc — higher is a smaller sun */
  sunSharpness: number
  /** broad glow around the sun */
  halo: number
  /** 0 = clear sky, 1 = heavy overcast */
  cloudiness: number
  /** default environment light multiplier for this mood */
  intensity: number
}

export const ENV_PRESETS: Record<EnvPreset, EnvDefinition> = {
  /* Warm late-afternoon sun behind the Wall, smoke in the air. */
  shiganshinaDusk: {
    zenith: '#2c2438',
    horizon: '#dc9a63',
    ground: '#3f3020',
    sunColor: '#ffd7a3',
    sunDirection: [-0.72, 0.34, -0.6],
    sunDisc: 30,
    sunSharpness: 1200,
    halo: 0.6,
    cloudiness: 0.35,
    intensity: 1.0,
  },
  /* Clear noon above Wall Maria — hard sun, blue sky bounce. */
  wallNoon: {
    zenith: '#2f6fa8',
    horizon: '#cfe3ee',
    ground: '#5f6b46',
    sunColor: '#fff6e6',
    sunDirection: [0.45, 0.78, 0.44],
    sunDisc: 40,
    sunSharpness: 2600,
    halo: 0.65,
    cloudiness: 0.28,
    intensity: 1.25,
  },
  /* Cold night on the parade ground, moonlight and a warm practical light. */
  corpsNight: {
    zenith: '#060b18',
    horizon: '#1b2c46',
    ground: '#0a1108',
    sunColor: '#a8c6e8',
    sunDirection: [-0.6, 0.42, 0.55],
    sunDisc: 6,
    sunSharpness: 900,
    halo: 0.55,
    cloudiness: 0.1,
    intensity: 1.0,
  },
  /* Overcast, humid — pure soft light, no hard shadows. */
  titanMist: {
    zenith: '#4a5741',
    horizon: '#79835f',
    ground: '#2c3222',
    sunColor: '#dfe6c8',
    sunDirection: [-0.35, 0.5, -0.6],
    sunDisc: 5,
    sunSharpness: 600,
    halo: 0.7,
    cloudiness: 0.85,
    intensity: 1.15,
  },
  /* Dusty sunset in a burning district. */
  trostSunset: {
    zenith: '#33203a',
    horizon: '#e08a48',
    ground: '#3d2a1a',
    sunColor: '#ffb268',
    sunDirection: [0.6, 0.22, -0.72],
    sunDisc: 30,
    sunSharpness: 1500,
    halo: 0.75,
    cloudiness: 0.45,
    intensity: 1.1,
  },
  /* Underground room: almost no skylight, a lamp and a lit doorway. */
  basementLamp: {
    zenith: '#0a0806',
    horizon: '#1d1610',
    ground: '#120d09',
    sunColor: '#ff9944',
    sunDirection: [0.2, 0.9, 0.35],
    sunDisc: 8,
    sunSharpness: 200,
    halo: 0.9,
    cloudiness: 0,
    intensity: 0.55,
  },
  /* The Rumbling: a sky on fire. */
  rumblingInferno: {
    zenith: '#1a0302',
    horizon: '#ff5a1e',
    ground: '#2a0a04',
    sunColor: '#ff7a33',
    sunDirection: [-0.25, 0.12, -0.96],
    sunDisc: 22,
    sunSharpness: 900,
    halo: 1.6,
    cloudiness: 0.6,
    intensity: 1.2,
  },
}

export const ENV_SUN_DIRECTION: Record<EnvPreset, THREE.Vector3> = Object.fromEntries(
  Object.entries(ENV_PRESETS).map(([key, value]) => [
    key,
    new THREE.Vector3(...value.sunDirection).normalize(),
  ])
) as Record<EnvPreset, THREE.Vector3>

const equirectCache = new Map<EnvPreset, THREE.DataTexture>()

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0 || 1e-6)))
  return t * t * (3 - 2 * t)
}

/**
 * Bake a preset into an HDR equirectangular map.
 * Rows follow three's equirectUv convention so PMREM sampling lines up.
 */
function buildEquirect(preset: EnvPreset, width: number, height: number): THREE.DataTexture {
  const def = ENV_PRESETS[preset]
  const zenith = new THREE.Color(def.zenith)
  const horizon = new THREE.Color(def.horizon)
  const ground = new THREE.Color(def.ground)
  const sunColor = new THREE.Color(def.sunColor)
  const sunDir = new THREE.Vector3(...def.sunDirection).normalize()

  const data = new Uint16Array(width * height * 4)
  const toHalf = THREE.DataUtils.toHalfFloat
  const dir = new THREE.Vector3()

  for (let y = 0; y < height; y += 1) {
    const v = (y + 0.5) / height
    const theta = (v - 0.5) * Math.PI
    const cosTheta = Math.cos(theta)
    const sinTheta = Math.sin(theta)
    for (let x = 0; x < width; x += 1) {
      const u = (x + 0.5) / width
      const phi = (u - 0.5) * Math.PI * 2
      dir.set(cosTheta * Math.cos(phi), sinTheta, cosTheta * Math.sin(phi))

      const skyT = smoothstep(-0.04, 0.62, dir.y)
      let r = horizon.r + (zenith.r - horizon.r) * skyT
      let g = horizon.g + (zenith.g - horizon.g) * skyT
      let b = horizon.b + (zenith.b - horizon.b) * skyT

      // ground bounce below the horizon
      const below = smoothstep(0.02, -0.45, dir.y)
      r = r + (ground.r - r) * below
      g = g + (ground.g - g) * below
      b = b + (ground.b - b) * below

      // a little extra light just above the horizon (haze)
      const haze = Math.exp(-Math.max(0, dir.y) * 14) * 0.5
      r += horizon.r * haze * 0.35
      g += horizon.g * haze * 0.3
      b += horizon.b * haze * 0.25

      const d = Math.max(0, dir.dot(sunDir))
      const disc = Math.pow(d, def.sunSharpness) * def.sunDisc
      const halo = Math.pow(d, 6) * def.halo
      r += sunColor.r * (disc + halo)
      g += sunColor.g * (disc + halo)
      b += sunColor.b * (disc + halo)

      const i = (y * width + x) * 4
      data[i] = toHalf(Math.min(65000, r))
      data[i + 1] = toHalf(Math.min(65000, g))
      data[i + 2] = toHalf(Math.min(65000, b))
      data[i + 3] = toHalf(1)
    }
  }

  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.HalfFloatType)
  texture.mapping = THREE.EquirectangularReflectionMapping
  texture.colorSpace = THREE.LinearSRGBColorSpace
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true
  return texture
}

const pmremCache = new WeakMap<THREE.WebGLRenderer, THREE.PMREMGenerator>()
const envTextureCache = new WeakMap<THREE.WebGLRenderer, Map<EnvPreset, THREE.Texture>>()

function getEnvironmentTexture(gl: THREE.WebGLRenderer, preset: EnvPreset): THREE.Texture {
  let perRenderer = envTextureCache.get(gl)
  if (!perRenderer) {
    perRenderer = new Map()
    envTextureCache.set(gl, perRenderer)
  }
  const cached = perRenderer.get(preset)
  if (cached) return cached

  let pmrem = pmremCache.get(gl)
  if (!pmrem) {
    pmrem = new THREE.PMREMGenerator(gl)
    pmrem.compileEquirectangularShader()
    pmremCache.set(gl, pmrem)
  }
  const resolution = getQuality().environmentResolution
  const equirect = equirectCache.get(preset) ?? buildEquirect(preset, resolution * 2, resolution)
  equirectCache.set(preset, equirect)
  const target = pmrem.fromEquirectangular(equirect)
  target.texture.colorSpace = THREE.LinearSRGBColorSpace
  perRenderer.set(preset, target.texture)
  return target.texture
}

/**
 * Sets the scene's IBL for a mood. Restores the previous environment on unmount
 * so a scene swap never leaks light from the previous shot.
 */
export function SceneEnvironment({
  preset,
  intensity,
}: {
  preset: EnvPreset
  intensity?: number
}) {
  const { gl, scene } = useThree()

  useEffect(() => {
    if (!debugFlags().env) return
    const previous = scene.environment
    const previousIntensity = scene.environmentIntensity
    try {
      scene.environment = getEnvironmentTexture(gl, preset)
      scene.environmentIntensity = intensity ?? ENV_PRESETS[preset].intensity
    } catch {
      scene.environment = previous
    }
    return () => {
      scene.environment = previous
      scene.environmentIntensity = previousIntensity
    }
  }, [gl, scene, preset, intensity])

  return null
}

/** Convenience: the sun direction a directional light should use for a mood. */
export function sunDirection(preset: EnvPreset): [number, number, number] {
  return ENV_PRESETS[preset].sunDirection
}
