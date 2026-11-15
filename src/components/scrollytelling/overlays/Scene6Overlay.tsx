'use client'

import { Reveal } from './Reveal'

const SCENE = 5

export function Scene6Overlay() {
  return (
    <div className="absolute inset-0">
      <Reveal
        scene={SCENE}
        start={0}
        end={0.18}
        fadeIn={0.02}
        fadeOut={0.03}
        y={12}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      >
        <p className="animate-flicker font-display text-2xl italic text-amber/80 md:text-4xl">The key…</p>
        <p className="mt-4 font-jp text-xs tracking-[0.35em] text-parchment/35">鍵</p>
      </Reveal>

      <Reveal
        scene={SCENE}
        start={0.22}
        end={0.4}
        fadeIn={0.03}
        fadeOut={0.03}
        y={0}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      >
        <p className="eyebrow mb-4 text-amber/80">Year 850 · Shiganshina</p>
        <h2
          className="font-display text-3xl uppercase tracking-[0.1em] text-parchment md:text-5xl"
          style={{ textShadow: '0 0 50px rgba(255,153,68,0.35)' }}
        >
          Grisha’s Basement
        </h2>
        <p className="font-jp mt-4 text-base tracking-[0.4em] text-parchment/55">グリシャの地下室</p>
      </Reveal>

      <Reveal
        scene={SCENE}
        start={0.42}
        end={0.58}
        fadeIn={0.03}
        fadeOut={0.03}
        y={16}
        className="absolute inset-x-0 top-[20%] flex justify-center px-6"
      >
        <p className="max-w-lg text-center font-body text-sm leading-relaxed text-parchment/70">
          Three keys. One door. Beneath the ruins of a house in Shiganshina, the truth that the
          Reiss family buried for a century waits in a locked drawer.
        </p>
      </Reveal>

      <Reveal
        scene={SCENE}
        start={0.6}
        end={0.79}
        fadeIn={0.03}
        fadeOut={0.03}
        y={20}
        className="absolute inset-x-0 bottom-[12%] flex justify-center px-4"
      >
        <div className="grid w-full max-w-3xl gap-3 md:grid-cols-2">
          <div className="glass-card border-l-2 border-l-secondary/60 p-4">
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-lg text-parchment">Marley</h3>
              <span className="font-jp text-[9px] tracking-[0.2em] text-parchment/40">マーレ</span>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-parchment/65">
              A nation across the sea that ghettoises Eldians, turns them into Pure Titans and
              weaponises seven of the Nine to conquer the world.
            </p>
          </div>
          <div className="glass-card border-l-2 border-l-primary/60 p-4">
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-lg text-parchment">Eldia</h3>
              <span className="font-jp text-[9px] tracking-[0.2em] text-parchment/40">エルディア</span>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-parchment/65">
              An empire born from Ymir’s pact with the source of all organic matter. Every Subject of
              Ymir carries her blood — and the potential to become a Titan.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal
        scene={SCENE}
        start={0.8}
        end={0.94}
        fadeIn={0.03}
        fadeOut={0.03}
        y={0}
        scale={0.96}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      >
        <div className="relative w-full max-w-md -rotate-2 border-[6px] border-[#d8cfbc]/80 bg-[#c9b697] p-3 shadow-[0_30px_80px_rgba(0,0,0,0.9)]">
          <div className="relative h-40 w-full overflow-hidden bg-gradient-to-b from-[#8a7452] via-[#6b5638] to-[#3a2c1c]">
            <div className="absolute inset-0 opacity-40 parchment-texture" />
            <div className="absolute inset-x-8 bottom-6 flex items-end justify-center gap-6">
              {[0.85, 1, 0.7].map((scale, i) => (
                <div key={i} className="flex flex-col items-center" style={{ transform: `scale(${scale})` }}>
                  <div className="h-6 w-6 rounded-full bg-[#2a1f14]/80" />
                  <div className="h-10 w-9 rounded-t-full bg-[#2a1f14]/80" />
                </div>
              ))}
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_20%,rgba(0,0,0,0.55)_100%)]" />
          </div>
          <p className="mt-2 text-center font-mono text-[8px] uppercase tracking-[0.22em] text-[#3a2c1c]">
            Found in the drawer · Grisha Yeager
          </p>
        </div>
        <p className="mt-6 max-w-md font-display text-lg italic text-parchment/90 md:text-xl">
          “This is not a drawing. This is a photograph.”
        </p>
      </Reveal>

      <Reveal
        scene={SCENE}
        start={0.92}
        end={1.02}
        fadeIn={0.03}
        fadeOut={0.02}
        y={10}
        className="absolute inset-x-0 bottom-[8%] flex justify-center px-6"
      >
        <p className="text-center font-mono text-[9px] uppercase tracking-[0.32em] text-amber/70">
          The world beyond the walls…
        </p>
      </Reveal>
    </div>
  )
}
