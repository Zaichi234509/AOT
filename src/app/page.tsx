import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ScrollProgress } from '@/components/layout/ScrollProgress'
import { SceneDots } from '@/components/layout/SceneDots'
import { ScrollHint } from '@/components/layout/ScrollHint'
import { AudioProvider } from '@/components/providers/AudioProvider'
import { StickyStage } from '@/components/scrollytelling/StickyStage'
import { WorldMap } from '@/components/sections/WorldMap'
import { CharacterEncyclopedia } from '@/components/sections/CharacterEncyclopedia'
import { TitanBestiary } from '@/components/sections/TitanBestiary'
import { EpisodeGuide } from '@/components/sections/EpisodeGuide'
import { Timeline } from '@/components/sections/Timeline'
import { SoundtrackPlayer } from '@/components/sections/SoundtrackPlayer'
import { Gallery } from '@/components/sections/Gallery'
import { Community } from '@/components/sections/Community'

export default function HomePage() {
  return (
    <>
      <AudioProvider />
      <Navbar />
      <ScrollProgress />
      <SceneDots />
      <ScrollHint />

      <main id="top">
        <StickyStage />
        <WorldMap />
        <CharacterEncyclopedia />
        <TitanBestiary />
        <EpisodeGuide />
        <Timeline />
        <SoundtrackPlayer />
        <Gallery />
        <Community />
      </main>

      <Footer />
    </>
  )
}
