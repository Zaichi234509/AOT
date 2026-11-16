'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { getQuality } from '@/lib/quality'

/* ──────────────────────────────────────────────────────────────────────────
 * Procedural PBR surfaces.
 *
 * Every texture here is generated on the fly (no asset downloads): an albedo, a
 * roughness map and a normal map derived from a height field, so stone, cloth,
 * metal and flesh each pick up light differently instead of sharing one flat
 * look. Textures are neutral in tone — the material colour tints them — so one
 * set can serve many objects.
 *
 *   albedo    sRGB   luminance + subtle hue variation
 *   normal    linear derived from the height field (sobel)
 *   roughness linear varied per surface type
 * ────────────────────────────────────────────────────────────────────────── */

export type SurfaceKind =
  | 'stone'
  | 'granite'
  | 'brick'
  | 'plaster'
  | 'wood'
  | 'roof'
  | 'dirt'
  | 'cloth'
  | 'leather'
  | 'skin'
  | 'steel'
  | 'iron'
  | 'rock'
  | 'paper'

/* ───────────────────────────── noise helpers ───────────────────────────── */

function makeRng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

const PERM = (() => {
  const rng = makeRng(1337)
  const p = new Uint8Array(256)
  for (let i = 0; i < 256; i += 1) p[i] = i
  for (let i = 255; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    const t = p[i]
    p[i] = p[j]
    p[j] = t
  }
  const perm = new Uint8Array(512)
  for (let i = 0; i < 512; i += 1) perm[i] = p[i & 255]
  return perm
})()

function hash2(x: number, y: number): number {
  return PERM[(PERM[x & 255] + (y & 255)) & 255] / 255
}

/** Tileable value noise; `period` is the lattice size in cells. */
function noise2(x: number, y: number, period: number): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const p = Math.max(1, Math.round(period))
  const wx = ((xi % p) + p) % p
  const wy = ((yi % p) + p) % p
  const wx1 = (wx + 1) % p
  const wy1 = (wy + 1) % p
  const a = hash2(wx, wy)
  const b = hash2(wx1, wy)
  const c = hash2(wx, wy1)
  const d = hash2(wx1, wy1)
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v
}

function fbm(x: number, y: number, period: number, octaves = 4): number {
  let sum = 0
  let amp = 0.5
  let norm = 0
  let freq = 1
  let p = period
  for (let i = 0; i < octaves; i += 1) {
    sum += noise2(x * freq, y * freq, p) * amp
    norm += amp
    amp *= 0.5
    freq *= 2
    p *= 2
  }
  return sum / norm
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0 || 1e-6)))
  return t * t * (3 - 2 * t)
}

/* ─────────────────────────────── painters ──────────────────────────────── */

type Texel = { r: number; g: number; b: number; h: number; rough: number }

type Recipe = {
  size: number
  normalStrength: number
  paint: (u: number, v: number) => Texel
}

const RECIPES: Record<SurfaceKind, Recipe> = {
  /** Weathered ashlar blocks — the Walls. */
  stone: {
    size: 512,
    normalStrength: 3.2,
    paint: (u, v) => {
      const n = fbm(u * 10, v * 10, 10, 5)
      const coarse = fbm(u * 3, v * 3, 3, 4)
      const strata = 0.5 + 0.5 * Math.sin((v * 7 + n * 1.2) * Math.PI * 2)
      const ridge = 1 - Math.abs(fbm(u * 7 + 4, v * 7 + 2, 7, 4) - 0.5) * 2
      const crack = Math.pow(ridge, 12)
      const speckle = noise2(u * 96, v * 96, 96) > 0.86 ? 0.12 : 0
      const shade = 0.74 + n * 0.2 + strata * 0.06 + speckle - crack * 0.35
      const stain = smoothstep(0.55, 0.9, coarse)
      return {
        r: shade * 1.0,
        g: shade * 0.965 - stain * 0.04,
        b: shade * 0.9 - stain * 0.08,
        h: n * 0.55 + strata * 0.25 - crack * 0.55 + speckle,
        rough: 0.78 + n * 0.16 + stain * 0.06,
      }
    },
  },

  /** The mortar between cut stones — close-up of the gate and walls. */
  granite: {
    size: 256,
    normalStrength: 2.2,
    paint: (u, v) => {
      const n = fbm(u * 22, v * 22, 22, 4)
      const grain = noise2(u * 120, v * 120, 120)
      const shade = 0.8 + n * 0.22 + (grain > 0.7 ? -0.18 : 0.06)
      return {
        r: shade,
        g: shade * 0.97,
        b: shade * 0.93,
        h: n * 0.8 + grain * 0.2,
        rough: 0.72 + n * 0.2,
      }
    },
  },

  /** Coursed brick with recessed mortar. */
  brick: {
    size: 512,
    normalStrength: 4.2,
    paint: (u, v) => {
      const rows = 10
      const cols = 5
      const row = Math.floor(v * rows)
      const rowV = v * rows - row
      const offset = row % 2 ? 0.5 / cols : 0
      const shifted = (u * cols + row) % 1
      const shiftedNoOffset = (u * cols + offset * cols) % 1
      const bx = row % 2 ? shifted : shiftedNoOffset
      const inBrick = bx > 0.045 && bx < 0.955 && rowV > 0.09 && rowV < 0.91
      const id = hash2(row * 3 + 1, Math.floor(u * cols + offset * cols) + 5)
      const grain = fbm(u * 48, v * 48, 48, 3)
      if (!inBrick) {
        const mortar = 0.62 + grain * 0.12
        return { r: mortar, g: mortar * 0.99, b: mortar * 0.95, h: 0.06, rough: 0.97 }
      }
      const tone = 0.62 + id * 0.26 + grain * 0.14
      const burnt = id > 0.82 ? 0.72 : 1
      return {
        r: tone * 0.86 * burnt,
        g: tone * 0.7 * burnt,
        b: tone * 0.58 * burnt,
        h: 0.7 + grain * 0.3,
        rough: 0.9 + grain * 0.08,
      }
    },
  },

  /** Lime plaster / render, stained and patchy. */
  plaster: {
    size: 256,
    normalStrength: 1.4,
    paint: (u, v) => {
      const n = fbm(u * 14, v * 14, 14, 4)
      const patch = smoothstep(0.45, 0.75, fbm(u * 4 + 9, v * 4 + 3, 4, 3))
      const shade = 0.86 + n * 0.12 - patch * 0.18
      return {
        r: shade * 1.0,
        g: shade * 0.97,
        b: shade * 0.9,
        h: n * 0.45 - patch * 0.2,
        rough: 0.88 + n * 0.1,
      }
    },
  },

  /** Vertical grain, knots and split boards. */
  wood: {
    size: 256,
    normalStrength: 2.6,
    paint: (u, v) => {
      const warp = fbm(u * 6, v * 2, 6, 3)
      const grain = 0.5 + 0.5 * Math.sin((u * 34 + warp * 9) * Math.PI)
      const fibre = noise2(u * 90, v * 14, 90)
      const knot = smoothstep(0.62, 0.72, fbm(u * 5 + 2, v * 5 + 7, 5, 3))
      const shade = 0.68 + grain * 0.24 + fibre * 0.08 - knot * 0.22
      return {
        r: shade * 0.72,
        g: shade * 0.56,
        b: shade * 0.4,
        h: grain * 0.7 + fibre * 0.3 - knot * 0.6,
        rough: 0.72 + grain * 0.16,
      }
    },
  },

  /** Clay roof tiles, scalloped rows. */
  roof: {
    size: 256,
    normalStrength: 3.4,
    paint: (u, v) => {
      const rows = 8
      const cols = 12
      const ry = v * rows - Math.floor(v * rows)
      const rx = u * cols - Math.floor(u * cols)
      const barrel = Math.sin(Math.PI * rx)
      const seam = ry < 0.12 ? 0.25 : 1
      const grain = fbm(u * 40, v * 40, 40, 3)
      const tone = (0.55 + barrel * 0.3 + grain * 0.16) * seam
      const moss = smoothstep(0.66, 0.9, fbm(u * 7 + 5, v * 7 + 1, 7, 3))
      return {
        r: tone * (0.8 - moss * 0.2),
        g: tone * (0.62 + moss * 0.12),
        b: tone * (0.5 + moss * 0.05),
        h: barrel * 0.8 * seam + grain * 0.2,
        rough: 0.88 + grain * 0.1,
      }
    },
  },

  /** Packed earth with pebbles and scuffs. */
  dirt: {
    size: 512,
    normalStrength: 3.0,
    paint: (u, v) => {
      const n = fbm(u * 12, v * 12, 12, 5)
      const patches = fbm(u * 3 + 7, v * 3 + 2, 3, 4)
      const pebble =
        noise2(u * 70, v * 70, 70) > 0.8 ? 0.25 : noise2(u * 140 + 3, v * 140 + 9, 140) > 0.86 ? 0.14 : 0
      const shade = 0.6 + n * 0.3 + patches * 0.12 + pebble
      return {
        r: shade * 0.78,
        g: shade * 0.71,
        b: shade * 0.6,
        h: n * 0.6 + pebble * 2 + patches * 0.2,
        rough: 0.94 + n * 0.05,
      }
    },
  },

  /** Wool: woven weft/warp plus soft folds. */
  cloth: {
    size: 256,
    normalStrength: 2.0,
    paint: (u, v) => {
      const weave =
        Math.sin(u * Math.PI * 96) * Math.sin(v * Math.PI * 96) * 0.5 + 0.5
      const folds = fbm(u * 6, v * 6, 6, 4)
      const fuzz = noise2(u * 130, v * 130, 130)
      const shade = 0.82 + weave * 0.06 + folds * 0.14 - fuzz * 0.06
      return {
        r: shade,
        g: shade * 0.985,
        b: shade * 0.95,
        h: weave * 0.55 + folds * 0.45,
        rough: 0.9 + folds * 0.08,
      }
    },
  },

  /** Worn leather for harnesses and boots. */
  leather: {
    size: 256,
    normalStrength: 2.4,
    paint: (u, v) => {
      const n = fbm(u * 16, v * 16, 16, 4)
      const creases = Math.pow(1 - Math.abs(fbm(u * 9 + 1, v * 9 + 5, 9, 3) - 0.5) * 2, 6)
      const pores = noise2(u * 110, v * 110, 110)
      const shade = 0.7 + n * 0.22 - creases * 0.25 + pores * 0.06
      return {
        r: shade * 0.66,
        g: shade * 0.5,
        b: shade * 0.38,
        h: n * 0.6 - creases * 0.5 + pores * 0.2,
        rough: 0.66 + n * 0.2,
      }
    },
  },

  /**
   * Titan flesh: long striated muscle bundles, fine pores, a faint vein web.
   * Colour is left near-neutral so each titan can be tinted.
   */
  skin: {
    size: 512,
    normalStrength: 3.6,
    paint: (u, v) => {
      const warp = fbm(u * 5, v * 3, 5, 3)
      const fibres = Math.pow(
        0.5 + 0.5 * Math.sin((u * 26 + warp * 7) * Math.PI * 2 + Math.sin(v * 8) * 0.6),
        2.2
      )
      const bundles = smoothstep(0.35, 0.75, fbm(u * 8 + 3, v * 8 + 6, 8, 4))
      const pores = noise2(u * 150, v * 150, 150)
      const vein = Math.pow(1 - Math.abs(fbm(u * 12 + 8, v * 12 + 2, 12, 3) - 0.5) * 2, 18)
      const shade = 0.82 + fibres * 0.12 + bundles * 0.08 - vein * 0.16 - pores * 0.05
      const flush = 0.5 + 0.5 * Math.sin(v * 13 + warp * 5)
      return {
        r: shade * 1.0,
        g: shade * (0.86 + flush * 0.06),
        b: shade * (0.8 + flush * 0.05),
        h: fibres * 0.55 + bundles * 0.35 + pores * 0.1 - vein * 0.25,
        rough: 0.62 + bundles * 0.16 + pores * 0.06,
      }
    },
  },

  /** Brushed steel: blades, ODM canisters, gate ironwork. */
  steel: {
    size: 256,
    normalStrength: 0.9,
    paint: (u, v) => {
      const brush = noise2(u * 160, v * 6, 160)
      const scratchSeed = noise2(u * 3 + 11, v * 220 + 4, 220)
      const scratch = scratchSeed > 0.9 ? 0.35 : 0
      const shade = 0.86 + brush * 0.1 - scratch * 0.25
      return {
        r: shade,
        g: shade * 0.99,
        b: shade * 0.98,
        h: brush * 0.25 - scratch * 0.6,
        rough: 0.22 + brush * 0.14 + scratch * 0.3,
      }
    },
  },

  /** Cast/pitted iron. */
  iron: {
    size: 256,
    normalStrength: 2.0,
    paint: (u, v) => {
      const n = fbm(u * 24, v * 24, 24, 4)
      const pit = noise2(u * 80, v * 80, 80) > 0.84 ? 0.3 : 0
      const rust = smoothstep(0.55, 0.85, fbm(u * 6 + 2, v * 6 + 9, 6, 3))
      const shade = 0.5 + n * 0.24 - pit
      return {
        r: shade * (0.9 + rust * 0.5),
        g: shade * (0.9 + rust * 0.16),
        b: shade * (0.92 - rust * 0.12),
        h: n * 0.6 - pit * 1.4,
        rough: 0.5 + n * 0.2 + rust * 0.25,
      }
    },
  },

  /** Weathered boulder rock. */
  rock: {
    size: 512,
    normalStrength: 4.5,
    paint: (u, v) => {
      const n = fbm(u * 9, v * 9, 9, 5)
      const fissure = Math.pow(1 - Math.abs(fbm(u * 5 + 6, v * 5 + 3, 5, 4) - 0.5) * 2, 10)
      const grain = noise2(u * 110, v * 110, 110)
      const lichen = smoothstep(0.6, 0.85, fbm(u * 4 + 1, v * 4 + 8, 4, 3))
      const shade = 0.7 + n * 0.28 - fissure * 0.4 + grain * 0.06
      return {
        r: shade * (0.9 + lichen * 0.06),
        g: shade * (0.9 + lichen * 0.12),
        b: shade * (0.88 + lichen * 0.02),
        h: n * 0.6 - fissure * 0.8 + grain * 0.2,
        rough: 0.88 + n * 0.1,
      }
    },
  },

  /** Paper / parchment for books and journals. */
  paper: {
    size: 256,
    normalStrength: 1.0,
    paint: (u, v) => {
      const fibre = fbm(u * 40, v * 40, 40, 3)
      const stain = smoothstep(0.6, 0.9, fbm(u * 6 + 4, v * 6 + 2, 6, 3))
      const shade = 0.9 + fibre * 0.08 - stain * 0.14
      return {
        r: shade,
        g: shade * 0.96,
        b: shade * 0.87,
        h: fibre * 0.6 - stain * 0.2,
        rough: 0.9 + fibre * 0.06,
      }
    },
  },
}

/* ─────────────────────────── map generation ─────────────────────────────── */

type SurfaceMaps = { map: THREE.Texture; normalMap: THREE.Texture; roughnessMap: THREE.Texture }

const mapCache = new Map<SurfaceKind, SurfaceMaps>()
const repeatCache = new Map<string, SurfaceMaps>()

function buildMaps(kind: SurfaceKind): SurfaceMaps {
  const recipe = RECIPES[kind]
  const size = recipe.size
  const albedo = new Uint8Array(size * size * 4)
  const heights = new Float32Array(size * size)
  const rough = new Uint8Array(size * size * 4)

  for (let y = 0; y < size; y += 1) {
    const v = (y + 0.5) / size
    for (let x = 0; x < size; x += 1) {
      const u = (x + 0.5) / size
      const texel = recipe.paint(u, v)
      const i = (y * size + x) * 4
      albedo[i] = Math.max(0, Math.min(255, texel.r * 255))
      albedo[i + 1] = Math.max(0, Math.min(255, texel.g * 255))
      albedo[i + 2] = Math.max(0, Math.min(255, texel.b * 255))
      albedo[i + 3] = 255
      const r = Math.max(0, Math.min(255, texel.rough * 255))
      rough[i] = r
      rough[i + 1] = r
      rough[i + 2] = r
      rough[i + 3] = 255
      heights[y * size + x] = texel.h
    }
  }

  const normalData = new Uint8Array(size * size * 4)
  const at = (x: number, y: number) => heights[((y + size) % size) * size + ((x + size) % size)]
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * recipe.normalStrength
      const dy = (at(x, y + 1) - at(x, y - 1)) * recipe.normalStrength
      const len = Math.hypot(dx, dy, 1)
      const i = (y * size + x) * 4
      normalData[i] = ((-dx / len) * 0.5 + 0.5) * 255
      normalData[i + 1] = ((-dy / len) * 0.5 + 0.5) * 255
      normalData[i + 2] = (1 / len) * 0.5 * 255 + 127
      normalData[i + 3] = 255
    }
  }

  const quality = getQuality()
  const makeTexture = (data: Uint8Array, srgb: boolean) => {
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.generateMipmaps = true
    texture.anisotropy = quality.anisotropy
    texture.needsUpdate = true
    return texture
  }

  return {
    map: makeTexture(albedo, true),
    normalMap: makeTexture(normalData, false),
    roughnessMap: makeTexture(rough, false),
  }
}

function getMaps(kind: SurfaceKind, repeat: [number, number]): SurfaceMaps {
  let base = mapCache.get(kind)
  if (!base) {
    base = buildMaps(kind)
    mapCache.set(kind, base)
  }
  if (repeat[0] === 1 && repeat[1] === 1) return base
  const key = `${kind}:${repeat[0]}x${repeat[1]}`
  const cached = repeatCache.get(key)
  if (cached) return cached
  const clone = (texture: THREE.Texture) => {
    const t = texture.clone()
    t.needsUpdate = true
    t.repeat.set(repeat[0], repeat[1])
    return t
  }
  const scaled: SurfaceMaps = {
    map: clone(base.map),
    normalMap: clone(base.normalMap),
    roughnessMap: clone(base.roughnessMap),
  }
  repeatCache.set(key, scaled)
  return scaled
}

/* ────────────────────────────── material ────────────────────────────────── */

type Preset = {
  roughness: number
  metalness: number
  normalScale: number
  envMapIntensity: number
  physical?: boolean
  sheen?: number
  sheenRoughness?: number
  sheenColor?: string
  clearcoat?: number
  clearcoatRoughness?: number
  ior?: number
  flatShading?: boolean
}

const PRESETS: Record<SurfaceKind, Preset> = {
  stone: { roughness: 0.92, metalness: 0.02, normalScale: 1.0, envMapIntensity: 0.85 },
  granite: { roughness: 0.85, metalness: 0.02, normalScale: 0.8, envMapIntensity: 0.9 },
  brick: { roughness: 0.94, metalness: 0.0, normalScale: 1.0, envMapIntensity: 0.8 },
  plaster: { roughness: 0.93, metalness: 0.0, normalScale: 0.6, envMapIntensity: 0.8 },
  wood: { roughness: 0.82, metalness: 0.0, normalScale: 0.9, envMapIntensity: 0.75 },
  roof: { roughness: 0.9, metalness: 0.0, normalScale: 1.0, envMapIntensity: 0.8 },
  dirt: { roughness: 0.97, metalness: 0.0, normalScale: 1.0, envMapIntensity: 0.7 },
  cloth: {
    roughness: 0.92,
    metalness: 0.0,
    normalScale: 0.7,
    envMapIntensity: 0.7,
    physical: true,
    sheen: 0.9,
    sheenRoughness: 0.7,
    sheenColor: '#cfd6c4',
  },
  leather: { roughness: 0.74, metalness: 0.0, normalScale: 0.9, envMapIntensity: 0.9 },
  skin: {
    roughness: 0.72,
    metalness: 0.0,
    normalScale: 0.85,
    envMapIntensity: 0.9,
    physical: true,
    sheen: 0.35,
    sheenRoughness: 0.55,
    sheenColor: '#ff9f86',
    clearcoat: 0.18,
    clearcoatRoughness: 0.55,
    ior: 1.4,
  },
  steel: { roughness: 0.3, metalness: 1.0, normalScale: 0.5, envMapIntensity: 1.35 },
  iron: { roughness: 0.62, metalness: 0.9, normalScale: 0.8, envMapIntensity: 1.1 },
  rock: { roughness: 0.95, metalness: 0.0, normalScale: 1.15, envMapIntensity: 0.8 },
  paper: { roughness: 0.9, metalness: 0.0, normalScale: 0.4, envMapIntensity: 0.7 },
}

export type SurfaceProps = {
  kind: SurfaceKind
  color?: string
  repeat?: number | [number, number]
  roughness?: number
  metalness?: number
  normalScale?: number
  envMapIntensity?: number
  emissive?: string
  emissiveIntensity?: number
  transparent?: boolean
  opacity?: number
  side?: THREE.Side
  flatShading?: boolean
  physical?: boolean
  sheen?: number
  sheenColor?: string
  depthWrite?: boolean
  toneMapped?: boolean
  vertexColors?: boolean
  /** skip generated maps entirely (cheap flat material) */
  plain?: boolean
}

/**
 * A PBR material with generated albedo / normal / roughness maps.
 * Use as a child of a mesh: `<mesh><boxGeometry />{<Surface kind="stone" />}</mesh>`
 */
export function Surface({
  kind,
  color = '#ffffff',
  repeat = 1,
  roughness,
  metalness,
  normalScale,
  envMapIntensity,
  emissive,
  emissiveIntensity,
  transparent,
  opacity,
  side,
  flatShading,
  physical,
  sheen,
  sheenColor,
  depthWrite,
  toneMapped,
  vertexColors,
  plain,
}: SurfaceProps) {
  const preset = PRESETS[kind]
  const repeatTuple: [number, number] = typeof repeat === 'number' ? [repeat, repeat] : repeat
  const maps = useMemo(
    () => (plain ? null : getMaps(kind, repeatTuple)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [kind, repeatTuple[0], repeatTuple[1], plain]
  )

  const common = {
    color,
    map: maps?.map,
    normalMap: maps?.normalMap,
    roughnessMap: maps?.roughnessMap,
    normalScale: normalScale !== undefined ? new THREE.Vector2(normalScale, normalScale) : new THREE.Vector2(preset.normalScale, preset.normalScale),
    roughness: roughness ?? preset.roughness,
    metalness: metalness ?? preset.metalness,
    envMapIntensity: envMapIntensity ?? preset.envMapIntensity,
    emissive: emissive ?? '#000000',
    emissiveIntensity: emissiveIntensity ?? 0,
    transparent,
    opacity,
    side,
    flatShading: flatShading ?? preset.flatShading,
    depthWrite,
    toneMapped,
    vertexColors,
  }

  if (physical || preset.physical) {
    return (
      <meshPhysicalMaterial
        {...common}
        sheen={sheen ?? preset.sheen ?? 0}
        sheenColor={sheenColor ?? preset.sheenColor ?? '#ffffff'}
        sheenRoughness={preset.sheenRoughness ?? 0.6}
        clearcoat={preset.clearcoat ?? 0}
        clearcoatRoughness={preset.clearcoatRoughness ?? 0.5}
        ior={preset.ior ?? 1.5}
      />
    )
  }

  return <meshStandardMaterial {...common} />
}
