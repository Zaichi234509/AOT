export type TitanKind = 'nine' | 'pure'

export type Titan = {
  id: string
  /** Still shown in the bestiary modal, e.g. `/images/titans/attack-titan.jpg`. */
  image: string
  name: string
  nameJP: string
  kind: TitanKind
  height: string
  heightMeters: number
  holder: string
  previousHolders: string[]
  ability: string
  weakness: string
  history: string
  accent: string
  monogram: string
}

export type PureTitanClass = {
  id: string
  name: string
  sizeRange: string
  heightMeters: number
  description: string
  threat: 'Low' | 'Moderate' | 'High' | 'Extreme'
}
