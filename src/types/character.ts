export type Affiliation =
  | 'Survey Corps'
  | 'Military Police'
  | 'Garrison'
  | 'Marley'
  | 'Titan'
  | 'Civilian'

export type CharacterStats = {
  combat: number
  initiative: number
  intellect: number
  teamwork: number
  titan: number
}

export type Character = {
  id: string
  /** Portrait still shown in the profile modal, e.g. `/images/characters/eren-yeager.jpg`. */
  image: string
  name: string
  nameJP: string
  affiliation: Affiliation
  rank: string
  status: string
  height: string
  weight: string
  age: string
  stats: CharacterStats
  bio: string
  quotes: string[]
  relationships: { name: string; relation: string }[]
  firstAppearance: string
  lastAppearance: string
  titanForm?: string
  accent: string
  monogram: string
}
