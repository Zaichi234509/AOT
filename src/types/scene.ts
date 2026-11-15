export type Vec3 = [number, number, number]

export type CameraKey = {
  /** scene-local progress 0–1 */
  at: number
  pos: Vec3
  look: Vec3
  fov: number
}

export type SceneFX = {
  bloom: number
  vignetteOffset: number
  vignetteDarkness: number
  noise: number
  shake: number
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
