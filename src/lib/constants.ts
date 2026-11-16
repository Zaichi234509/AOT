export type SceneMeta = {
  id: string
  index: number
  title: string
  titleJP: string
  label: string
  subtitle: string
  /** normalized global progress range within the 3D stage */
  start: number
  end: number
  accent: string
  glow: string
  /** css gradient used by the mobile parallax fallback + scene chrome */
  gradient: string
  fog: string
}

/** Total scroll length of the 3D stage, in viewport heights. */
export const STAGE_VH = 3200

export const SCENES: SceneMeta[] = [
  {
    id: 'shiganshina',
    index: 0,
    title: 'The Fall of Shiganshina',
    titleJP: 'シガンシナ陥落',
    label: 'Shiganshina',
    subtitle: 'Peace → Dread → Catastrophe',
    start: 0,
    end: 0.125,
    accent: '#D4A574',
    glow: 'rgba(212,165,116,0.45)',
    gradient: 'linear-gradient(180deg,#2b1d13 0%,#7a4a22 38%,#d4a574 68%,#4a2418 100%)',
    fog: '#6b4a2c',
  },
  {
    id: 'walls',
    index: 1,
    title: 'The Three Walls',
    titleJP: '三重の壁',
    label: 'Walls',
    subtitle: 'Awe · Scale · Mystery',
    start: 0.125,
    end: 0.281,
    accent: '#87CEEB',
    glow: 'rgba(135,206,235,0.40)',
    gradient: 'linear-gradient(180deg,#0d1a2b 0%,#3f6b8c 40%,#87ceeb 62%,#4a4a3a 100%)',
    fog: '#9fc7dc',
  },
  {
    id: 'corps',
    index: 2,
    title: 'The Survey Corps',
    titleJP: '調査兵団',
    label: 'Corps',
    subtitle: 'Wings of Freedom',
    start: 0.281,
    end: 0.469,
    accent: '#4A7C3F',
    glow: 'rgba(74,124,63,0.45)',
    gradient: 'linear-gradient(180deg,#080d18 0%,#1a2744 45%,#2d4a3a 75%,#0a0f0c 100%)',
    fog: '#1a2744',
  },
  {
    id: 'titans',
    index: 3,
    title: 'The Titans',
    titleJP: '巨人',
    label: 'Titans',
    subtitle: 'Horror · Unease',
    start: 0.469,
    end: 0.625,
    accent: '#FF4400',
    glow: 'rgba(255,68,0,0.40)',
    gradient: 'linear-gradient(180deg,#0a0c07 0%,#3a4a2a 50%,#5c4a33 78%,#0a0a0a 100%)',
    fog: '#3a4a2a',
  },
  {
    id: 'trost',
    index: 4,
    title: 'The Battle of Trost',
    titleJP: 'トロスト区攻防戦',
    label: 'Trost',
    subtitle: 'Adrenaline · Chaos',
    start: 0.625,
    end: 0.75,
    accent: '#D4874A',
    glow: 'rgba(212,135,74,0.42)',
    gradient: 'linear-gradient(180deg,#1c1208 0%,#6b3f22 40%,#d4874a 65%,#2a1a10 100%)',
    fog: '#7a5a3a',
  },
  {
    id: 'basement',
    index: 5,
    title: 'The Basement',
    titleJP: '地下室',
    label: 'Basement',
    subtitle: 'Tension · Revelation',
    start: 0.75,
    end: 0.875,
    accent: '#FF9944',
    glow: 'rgba(255,153,68,0.40)',
    gradient: 'linear-gradient(180deg,#000000 0%,#0d0906 45%,#3a2413 72%,#0a0703 100%)',
    fog: '#140d07',
  },
  {
    id: 'rumbling',
    index: 6,
    title: 'The Rumbling',
    titleJP: '地鳴らし',
    label: 'Rumbling',
    subtitle: 'Apocalyptic · Final',
    start: 0.875,
    end: 1,
    accent: '#FF2200',
    glow: 'rgba(255,34,0,0.5)',
    gradient: 'linear-gradient(180deg,#000000 0%,#2a0502 35%,#7a1505 62%,#ff4400 82%,#1a0000 100%)',
    fog: '#33100a',
  },
]

export const SCENE_COUNT = SCENES.length

export const NAV_LINKS = [
  { label: 'Home', href: '#hero' },
  { label: 'Lore', href: '#lore' },
  { label: 'Characters', href: '#characters' },
  { label: 'Titans', href: '#titans' },
  { label: 'Episodes', href: '#episodes' },
  { label: 'Timeline', href: '#timeline' },
  { label: 'Music', href: '#music' },
  { label: 'Community', href: '#community' },
] as const

export const BREAKPOINTS = { mobile: 768, tablet: 1024 } as const

/*
 * Model loading is configured per slot in `src/lib/models.ts` (each slot falls
 * back to its procedural component on its own), so there is no global
 * "models loaded" flag any more.
 */

export const CHARACTER_ART_GRADIENTS = [
  'linear-gradient(150deg,#1c2a1a 0%,#2d5a27 55%,#0d120c 100%)',
  'linear-gradient(150deg,#2a1414 0%,#8b1500 55%,#120707 100%)',
  'linear-gradient(150deg,#101a2b 0%,#1a2744 55%,#070a10 100%)',
  'linear-gradient(150deg,#2b2214 0%,#8a6a34 55%,#12100a 100%)',
  'linear-gradient(150deg,#1f1a26 0%,#4a3b5c 55%,#0b0910 100%)',
]

export const TITAN_SILHOUETTE = 'linear-gradient(180deg,#1b1610 0%,#0a0806 100%)'
