/**
 * Authored-model registry.
 *
 * `.glb` files are deliberately git-ignored in this repository, so the site
 * ships with none and every slot renders its procedural fallback. When you host
 * a model, point this registry at it and the slot upgrades in place — per slot,
 * not behind one global flag, and always with the procedural component as the
 * loading/error fallback.
 *
 * Configure with environment variables (see `.env.example`):
 *
 *   NEXT_PUBLIC_MODELS_BASE_URL   e.g. https://cdn.example.com/aot-models
 *   NEXT_PUBLIC_MODEL_<SLOT>_URL  optional per-slot override (absolute URL)
 *   NEXT_PUBLIC_DRACO_DECODER_PATH  optional, only if you ship Draco meshes
 *
 * Contract for a drop-in (also documented in public/models/README.md):
 *   1 unit = 1 m, feet/base at the origin, +Y up, facing +Z,
 *   15k–30k triangles for hero meshes, Draco or meshopt compressed.
 */

export type ModelSlotId =
  | 'wall-maria-gate'
  | 'colossal-titan-head'
  | 'eren-yeager'
  | 'mikasa-ackerman'
  | 'levi-ackerman'
  | 'attack-titan'
  | 'odm-gear'
  | 'pure-titan'
  | 'colossal-titan-full'
  | 'trost-building'
  | 'boulder'
  | 'basement-room'

export type ModelSlotDefinition = {
  id: ModelSlotId
  /** file name inside the model bucket */
  file: string
  /** which procedural component this slot replaces */
  replaces: string
  /** nominal height in metres, for checking a drop-in is correctly scaled */
  height?: number
  /** clip names to drive from scroll progress, first match wins */
  clips?: string[]
  /** scenes that would use it (0-based) */
  scenes: number[]
}

export const MODEL_SLOTS: Record<ModelSlotId, ModelSlotDefinition> = {
  'wall-maria-gate': {
    id: 'wall-maria-gate',
    file: 'wall-maria-gate.glb',
    replaces: 'WallGate',
    height: 50,
    scenes: [0, 4],
  },
  'colossal-titan-head': {
    id: 'colossal-titan-head',
    file: 'colossal-titan-head.glb',
    replaces: 'TitanBody (variant="colossal", head/torso shot)',
    height: 60,
    clips: ['idle', 'steam', 'Idle'],
    scenes: [0],
  },
  'eren-yeager': {
    id: 'eren-yeager',
    file: 'eren-yeager.glb',
    replaces: 'CorpsFigure',
    height: 1.7,
    clips: ['idle', 'Idle', 'stand'],
    scenes: [2],
  },
  'mikasa-ackerman': {
    id: 'mikasa-ackerman',
    file: 'mikasa-ackerman.glb',
    replaces: 'CorpsFigure',
    height: 1.7,
    clips: ['idle', 'Idle', 'stand'],
    scenes: [2],
  },
  'levi-ackerman': {
    id: 'levi-ackerman',
    file: 'levi-ackerman.glb',
    replaces: 'CorpsFigure',
    height: 1.6,
    clips: ['idle', 'Idle', 'stand'],
    scenes: [2],
  },
  'attack-titan': {
    id: 'attack-titan',
    file: 'attack-titan.glb',
    replaces: 'TitanBody (variant="attack")',
    height: 15,
    clips: ['idle', 'Idle', 'walk'],
    scenes: [2, 3, 4],
  },
  'odm-gear': {
    id: 'odm-gear',
    file: 'odm-gear.glb',
    replaces: 'CorpsFigure ODM hardware',
    height: 0.4,
    scenes: [2],
  },
  'pure-titan': {
    id: 'pure-titan',
    file: 'pure-titan.glb',
    replaces: 'TitanBody (variant="pure")',
    height: 7,
    clips: ['walk', 'idle', 'Walk'],
    scenes: [3, 4],
  },
  'colossal-titan-full': {
    id: 'colossal-titan-full',
    file: 'colossal-titan-full.glb',
    replaces: 'TitanBody (variant="colossal")',
    height: 60,
    clips: ['walk', 'march', 'Walk'],
    scenes: [6],
  },
  'trost-building': {
    id: 'trost-building',
    file: 'trost-building.glb',
    replaces: 'Building',
    height: 12,
    scenes: [4],
  },
  boulder: {
    id: 'boulder',
    file: 'boulder.glb',
    replaces: 'Boulder',
    height: 18,
    scenes: [4],
  },
  'basement-room': {
    id: 'basement-room',
    file: 'basement-room.glb',
    replaces: 'basement set (stairs, walls, desk, door)',
    height: 3.6,
    scenes: [5],
  },
}

const BASE = (process.env.NEXT_PUBLIC_MODELS_BASE_URL ?? '').replace(/\/$/, '')

/** Explicit per-slot overrides; Next only inlines statically referenced env vars. */
const OVERRIDES: Partial<Record<ModelSlotId, string | undefined>> = {
  'wall-maria-gate': process.env.NEXT_PUBLIC_MODEL_WALL_GATE_URL,
  'colossal-titan-head': process.env.NEXT_PUBLIC_MODEL_COLOSSAL_HEAD_URL,
  'eren-yeager': process.env.NEXT_PUBLIC_MODEL_EREN_URL,
  'mikasa-ackerman': process.env.NEXT_PUBLIC_MODEL_MIKASA_URL,
  'levi-ackerman': process.env.NEXT_PUBLIC_MODEL_LEVI_URL,
  'attack-titan': process.env.NEXT_PUBLIC_MODEL_ATTACK_TITAN_URL,
  'odm-gear': process.env.NEXT_PUBLIC_MODEL_ODM_GEAR_URL,
  'pure-titan': process.env.NEXT_PUBLIC_MODEL_PURE_TITAN_URL,
  'colossal-titan-full': process.env.NEXT_PUBLIC_MODEL_COLOSSAL_FULL_URL,
  'trost-building': process.env.NEXT_PUBLIC_MODEL_TROST_BUILDING_URL,
  boulder: process.env.NEXT_PUBLIC_MODEL_BOULDER_URL,
  'basement-room': process.env.NEXT_PUBLIC_MODEL_BASEMENT_ROOM_URL,
}

/** Draco decoder path; empty means "meshopt only", which needs no downloads. */
export const DRACO_DECODER_PATH = process.env.NEXT_PUBLIC_DRACO_DECODER_PATH ?? ''

/** Absolute (or root-relative) URL for a slot, or null when it is not configured. */
export function modelUrl(id: ModelSlotId): string | null {
  const override = OVERRIDES[id]
  if (override) return override
  if (!BASE) return null
  return `${BASE}/${MODEL_SLOTS[id].file}`
}

export function isSlotConfigured(id: ModelSlotId): boolean {
  return modelUrl(id) !== null
}

export function configuredSlots(): ModelSlotId[] {
  return (Object.keys(MODEL_SLOTS) as ModelSlotId[]).filter(isSlotConfigured)
}

/** Slots a scene would like; used to preload only what is coming up next. */
export function slotsForScene(scene: number): ModelSlotId[] {
  return (Object.keys(MODEL_SLOTS) as ModelSlotId[]).filter((id) =>
    MODEL_SLOTS[id].scenes.includes(scene)
  )
}
