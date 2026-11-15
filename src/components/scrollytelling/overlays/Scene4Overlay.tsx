'use client'

import { Reveal } from './Reveal'

const SCENE = 3

const nineTitans = [
  { name: 'Founding', jp: '始祖', height: '13 m', accent: '#D8C9A8' },
  { name: 'Attack', jp: '進撃', height: '15 m', accent: '#4A7C3F' },
  { name: 'Colossal', jp: '超大型', height: '60 m', accent: '#CC2200' },
  { name: 'Armored', jp: '鎧', height: '15 m', accent: '#8A9BA8' },
  { name: 'Female', jp: '女型', height: '14 m', accent: '#9B7BB8' },
  { name: 'Beast', jp: '獣', height: '17 m', accent: '#B08A3E' },
  { name: 'Jaw', jp: '顎', height: '5 m', accent: '#D4874A' },
  { name: 'Cart', jp: '車力', height: '4 m', accent: '#7A8C6A' },
  { name: 'War Hammer', jp: '戦槌', height: '15 m', accent: '#C0B7A4' },
]

const sizes = [
  { label: 'Human', value: 1.7, accent: '#A09888' },
  { label: 'Jaw', value: 5, accent: '#D4874A' },
  { label: 'Attack', value: 15, accent: '#4A7C3F' },
  { label: 'Beast', value: 17, accent: '#B08A3E' },
  { label: 'Colossal', value: 60, accent: '#CC2200' },
]

export function Scene4Overlay() {
  return (
    <div className="absolute inset-0">
      <Reveal
        scene={SCENE}
        start={0}
        end={0.13}
        fadeIn={0.012}
        fadeOut={0.035}
        y={0}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      >
        <p className="eyebrow mb-4">They eat us because it is our nature</p>
        <h2
          className="glitch hero-title text-4xl text-parchment md:text-6xl"
          data-text="The Titans"
          style={{ textShadow: '0 18px 60px rgba(0,0,0,0.9)' }}
        >
          The Titans
        </h2>
        <p className="font-jp mt-4 text-lg tracking-[0.4em] text-parchment/55">巨人</p>
      </Reveal>

      <Reveal
        scene={SCENE}
        start={0.15}
        end={0.33}
        fadeIn={0.025}
        fadeOut={0.03}
        x={-40}
        y={0}
        className="absolute inset-y-0 left-0 flex w-full max-w-[380px] items-center px-6 md:px-12"
      >
        <div className="glass-card border-l-2 border-l-murky p-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-murky">Class I</p>
          <h3 className="mt-2 font-display text-xl text-parchment">Pure Titans</h3>
          <p className="font-jp mt-1 text-[10px] tracking-[0.22em] text-parchment/45">無垢の巨人</p>
          <p className="mt-4 text-[12px] leading-relaxed text-parchment/65">
            Mindless, driven by instinct and sunlight. They vary from 3 to 15 metres, and their only
            purpose is to eat humans — not to kill, but to find a shifter.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {['3–5 m', '5–10 m', '10–15 m'].map((range) => (
              <div key={range} className="rounded border border-white/10 bg-white/[0.03] px-2 py-1.5 text-center">
                <p className="font-mono text-[9px] text-parchment/70">{range}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal
        scene={SCENE}
        start={0.35}
        end={0.48}
        fadeIn={0.02}
        fadeOut={0.025}
        y={20}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      >
        <div className="flex items-center gap-3 rounded-full border border-secondary/50 bg-secondary/10 px-5 py-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-secondary-light" />
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-secondary-light">
            Warning · Abnormal detected
          </span>
        </div>
        <p className="mt-5 max-w-md text-sm text-parchment/65">
          Unpredictable movement. No interest in the walls. It will find a way in.
        </p>
      </Reveal>

      <Reveal
        scene={SCENE}
        start={0.5}
        end={0.78}
        fadeIn={0.03}
        fadeOut={0.03}
        y={24}
        className="absolute inset-x-0 bottom-[10%] flex justify-center px-4"
      >
        <div className="glass-card w-full max-w-3xl p-4 md:p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-mono text-[8px] uppercase tracking-[0.28em] text-smoke">The Nine Titans</p>
            <p className="font-jp text-[8px] tracking-[0.2em] text-smoke">九つの巨人</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {nineTitans.map((titan) => (
              <div
                key={titan.name}
                className="group rounded border border-white/10 bg-white/[0.025] p-2 transition-colors hover:border-white/25 hover:bg-white/[0.05]"
              >
                <div className="flex items-baseline justify-between">
                  <p className="font-display text-[11px] text-parchment/90">{titan.name}</p>
                  <span className="font-mono text-[8px]" style={{ color: titan.accent }}>
                    {titan.height}
                  </span>
                </div>
                <p className="font-jp mt-0.5 text-[8px] tracking-[0.2em] text-parchment/35">{titan.jp}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal
        scene={SCENE}
        start={0.8}
        end={1.01}
        fadeIn={0.03}
        fadeOut={0.02}
        y={18}
        className="absolute inset-0 flex flex-col items-center justify-center px-6"
      >
        <div className="glass-card w-full max-w-md p-5">
          <p className="mb-4 text-center font-mono text-[8px] uppercase tracking-[0.28em] text-smoke">
            Size comparison
          </p>
          <div className="space-y-2.5">
            {sizes.map((size) => (
              <div key={size.label} className="flex items-center gap-3">
                <span className="w-16 shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-ash">
                  {size.label}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(size.value / 60) * 100}%`,
                      backgroundColor: size.accent,
                      boxShadow: `0 0 8px ${size.accent}80`,
                    }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right font-mono text-[9px] text-parchment/60">
                  {size.value} m
                </span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  )
}
