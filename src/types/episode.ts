export type EpisodeTag = 'Key Moment' | 'Titan Reveal' | 'Battle' | 'Lore' | 'Emotional'

export type Episode = {
  season: 1 | 2 | 3 | 4
  episode: number
  title: string
  titleJP: string
  airDate: string
  rating: number
  synopsis: string
  tags: EpisodeTag[]
}

export type Season = {
  season: 1 | 2 | 3 | 4
  label: string
  year: string
  episodeCount: number
  studioNote: string
}
