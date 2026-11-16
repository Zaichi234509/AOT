export type Vec3 = [number, number, number]

export type CameraKey = {
  /** scene-local progress 0–1 */
  at: number
  pos: Vec3
  look: Vec3
  fov: number
}

export type SceneFX = {
  /** tone-mapping exposure for the scene's grade */
  exposure: number
  bloom: number
  bloomThreshold: number
  vignetteOffset: number
  vignetteDarkness: number
  noise: number
  shake: number
  /** post grade */
  saturation: number
  contrast: number
  brightness: number
  /** screen-space ambient occlusion intensity (0 = off) */
  ao?: number
  /** SSAO sample radius — in metres, so it scales with the scene */
  aoRadius?: number
  /** SSAO world distance threshold, metres */
  aoDistance?: number
}

export type MapLocation = {
  id: string
  name: string
  nameJP: string
  wall: 'Maria' | 'Rose' | 'Sina' | 'Marley' | 'Beyond'
  position: { x: number; y: number }
  description: string
  keyEvents: string[]
  accent: string
}

export type TimelineEvent = {
  id: string
  year: string
  era: string
  title: string
  description: string
  color: string
}

export type Track = {
  id: string
  title: string
  artist: string
  composer: string
  type: string
  season: number
  duration: string
  seconds: number
  accent: string
  scene: string
  searchQuery: string
}
