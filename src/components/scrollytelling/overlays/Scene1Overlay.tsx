'use client'

import { Reveal } from './Reveal'
import { ScrollFlash } from './fx'

const SCENE = 0

export function Scene1Overlay() {
  return (
    <div className="absolute inset-0">
      {/* Opening title */}
      <Reveal
        scene={SCENE}
        start={0}
        end={0.15}
        fadeIn={0.012}
        fadeOut={0.05}
        y={0}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      >
        <p className="eyebrow mb-6 text-[10px] md:text-xs">Interactive Archive · 進撃の巨人</p>
        <h1 className="hero-title text-gradient-warm" style={{ textShadow: '0 20px 60px rgba(0,0,0,0.75)' }}>
          Attack
          <span className="block">on Titan</span>
        </h1>
        <p className="font-jp mt-5 text-lg tracking-[0.45em] text-parchment/70 md:text-2xl">進撃の巨人</p>
        <div className="mt-8 flex items-center gap-3">
          <span className="h-px w-10 bg-parchment/30" />
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-ash">The Ultimate Archive</p>
          <span className="h-px w-10 bg-parchment/30" />
        </div>
      </Reveal>

      <ScrollFlash scene={SCENE} peak={0.43} spread={0.055} color="#ffffff" maxOpacity={0.75} />
      <ScrollFlash scene={SCENE} peak={0.46} spread={0.06} color="#cc2200" maxOpacity={0.5} />

      {/* Colossal reveal label */}
      <Reveal
        scene={SCENE}
        start={0.5}
        end={0.72}
        fadeIn={0.035}
        fadeOut={0.04}
        y={30}
        scale={0.94}
        className="absolute inset-x-0 top-[18%] flex flex-col items-center px-6 text-center"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-secondary-light">
          845 · Wall Maria
        </p>
        <h2
          className="mt-4 font-display text-4xl font-black uppercase tracking-tight text-parchment md:text-6xl"
          style={{ textShadow: '0 10px 50px rgba(0,0,0,0.9)' }}
        >
          The Colossal Titan
        </h2>
        <p className="font-jp mt-3 text-sm tracking-[0.35em] text-parchment/60">超大型巨人</p>
        <div className="mt-6 flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary-light" />
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-secondary-light/80">
            Breach detected
          </span>
        </div>
      </Reveal>

      {/* Quote */}
      <Reveal
        scene={SCENE}
        start={0.73}
        end={0.97}
        fadeIn={0.04}
        fadeOut={0.04}
        x={-40}
        y={0}
        className="absolute inset-y-0 left-0 flex w-full max-w-[560px] items-center px-6 md:px-14"
      >
        <figure className="glass-card border-l-2 border-l-secondary/70 p-6 md:p-8">
          <blockquote className="font-display text-lg leading-relaxed text-parchment/90 md:text-2xl">
            “That day, mankind received a grim reminder. We lived in fear of the Titans and were
            disgraced to live in these cages we called walls.”
          </blockquote>
          <figcaption className="mt-5 flex items-center gap-3">
            <span className="h-px w-8 bg-secondary/60" />
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-ash">
              Chapter 1 · To You, in 2000 Years
            </span>
          </figcaption>
        </figure>
      </Reveal>
    </div>
  )
}
