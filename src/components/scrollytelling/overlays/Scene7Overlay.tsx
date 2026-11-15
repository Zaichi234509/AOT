'use client'

import { Reveal } from './Reveal'
import { ScrollCounter } from './fx'
import { Button } from '@/components/ui/Button'
import { scrollToTarget } from '@/lib/smooth-scroll'
import { WingsLogo } from '@/components/ui/WingsLogo'

const SCENE = 6

export function Scene7Overlay() {
  return (
    <div className="absolute inset-0">
      <Reveal
        scene={SCENE}
        start={0}
        end={0.16}
        fadeIn={0.008}
        fadeOut={0.03}
        y={50}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      >
        <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.45em] text-secondary-light">
          The final act
        </p>
        <h2
          className="hero-title text-4xl uppercase text-parchment md:text-6xl"
          style={{ textShadow: '0 0 80px rgba(255,34,0,0.55), 0 18px 60px rgba(0,0,0,0.9)' }}
        >
          The Rumbling
        </h2>
        <p className="font-jp mt-4 text-lg tracking-[0.4em] text-parchment/60">地鳴らし</p>
      </Reveal>

      <Reveal
        scene={SCENE}
        start={0.18}
        end={0.4}
        fadeIn={0.03}
        fadeOut={0.03}
        y={18}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      >
        <ScrollCounter
          scene={SCENE}
          start={0.2}
          end={0.36}
          to={60000000}
          className="font-display text-4xl font-black text-parchment md:text-6xl"
          suffix=""
        />
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.35em] text-ash">
          Colossal Titans walking
        </p>
        <p className="mt-5 max-w-sm text-[13px] leading-relaxed text-parchment/55">
          The walls were never walls. They were an army of hardened Colossal Titans, waiting for a
          voice that would never order them to stop.
        </p>
      </Reveal>

      <Reveal
        scene={SCENE}
        start={0.42}
        end={0.64}
        fadeIn={0.03}
        fadeOut={0.03}
        y={20}
        className="absolute inset-y-0 left-0 flex w-full max-w-[520px] items-center px-6 md:px-14"
      >
        <div className="glass-card border-l-2 border-l-secondary/60 p-6">
          <p className="font-display text-lg leading-relaxed text-parchment/90 md:text-2xl">
            “I will keep moving forward. Until my enemies are destroyed.”
          </p>
          <p className="mt-3 text-[12px] leading-relaxed text-parchment/55">
            I was born into this world. I am free. — Eren Yeager, Paths
          </p>
          <div className="mt-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-white/10" />
            <span className="font-jp text-[10px] tracking-[0.3em] text-parchment/30">自由</span>
          </div>
        </div>
      </Reveal>

      <Reveal
        scene={SCENE}
        start={0.64}
        end={0.84}
        fadeIn={0.03}
        fadeOut={0.03}
        y={0}
        scale={1.06}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      >
        <WingsLogo size={52} className="mb-5 text-secondary-light/80" />
        <p
          className="font-jp text-2xl leading-relaxed tracking-[0.3em] text-parchment md:text-4xl"
          style={{ textShadow: '0 0 60px rgba(255,68,0,0.6)' }}
        >
          心臓を捧げよ
        </p>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.5em] text-ash">
          Shinzou wo Sasageyo
        </p>
      </Reveal>

      <Reveal
        scene={SCENE}
        start={0.86}
        end={0.95}
        fadeIn={0.03}
        fadeOut={0.02}
        y={0}
        className="absolute inset-0 bg-black"
      >
        <div className="h-full w-full" />
      </Reveal>

      <Reveal
        scene={SCENE}
        start={0.93}
        end={1.02}
        fadeIn={0.03}
        fadeOut={0.01}
        y={14}
        className="pointer-events-auto absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      >
        <p className="eyebrow mb-3">End of transmission</p>
        <h2 className="font-display text-2xl uppercase tracking-[0.14em] text-parchment md:text-4xl">
          The archive is open
        </h2>
        <p className="mt-3 max-w-md text-[12px] text-ash">
          Seven scenes. Eighteen characters. Nine Titans. One century of history.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button type="button" size="md" onClick={() => scrollToTarget('#lore', -68)}>
            Explore the full archive
          </Button>
          <Button
            type="button"
            size="md"
            variant="outline"
            onClick={() => scrollToTarget('#community', -68)}
          >
            Join the community
          </Button>
        </div>
      </Reveal>
    </div>
  )
}
