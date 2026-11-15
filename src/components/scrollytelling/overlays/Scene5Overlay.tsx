'use client'

import { Reveal } from './Reveal'
import { ScrollCounter, ScrollFlash } from './fx'

const SCENE = 4

export function Scene5Overlay() {
  return (
    <div className="absolute inset-0">
      <Reveal
        scene={SCENE}
        start={0}
        end={0.13}
        fadeIn={0.008}
        fadeOut={0.03}
        y={40}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      >
        <p className="eyebrow mb-4">Year 850 · Trost District</p>
        <h2
          className="hero-title text-4xl uppercase text-parchment md:text-6xl"
          style={{ textShadow: '0 18px 60px rgba(0,0,0,0.9)' }}
        >
          Battle of Trost
        </h2>
        <p className="font-jp mt-4 text-lg tracking-[0.4em] text-parchment/60">トロスト区攻防戦</p>
      </Reveal>

      <ScrollFlash scene={SCENE} peak={0.38} spread={0.02} color="#ffffff" maxOpacity={0.4} />
      <ScrollFlash scene={SCENE} peak={0.6} spread={0.02} color="#ffffff" maxOpacity={0.35} />

      <Reveal
        scene={SCENE}
        start={0.14}
        end={0.3}
        fadeIn={0.02}
        fadeOut={0.025}
        y={0}
        className="absolute inset-x-0 top-[16%] flex justify-center px-6"
      >
        <div className="glass-card flex items-center gap-4 px-5 py-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-smoke">ODM top speed</span>
          <span className="font-display text-2xl text-parchment">142</span>
          <span className="font-mono text-[10px] text-ash">km/h</span>
        </div>
      </Reveal>

      <Reveal
        scene={SCENE}
        start={0.3}
        end={0.42}
        fadeIn={0.015}
        fadeOut={0.02}
        y={14}
        className="absolute inset-x-0 top-[28%] flex flex-col items-center px-6 text-center"
      >
        <p className="font-display text-xl uppercase tracking-[0.3em] text-secondary-light">Titan kill</p>
        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.3em] text-parchment/45">
          First confirmed solo kill · Mikasa
        </p>
      </Reveal>

      <Reveal
        scene={SCENE}
        start={0.46}
        end={0.64}
        fadeIn={0.03}
        fadeOut={0.03}
        y={20}
        className="absolute inset-x-0 bottom-[14%] flex justify-center px-6"
      >
        <div className="glass-card grid w-full max-w-2xl grid-cols-2 gap-4 p-5 md:grid-cols-4">
          {[
            { label: 'Titans engaged', value: 62, suffix: '' },
            { label: 'Casualties', value: 208, suffix: '' },
            { label: 'Evacuated', value: 300000, suffix: '≈' },
            { label: 'Outcome', value: 1, suffix: '' },
          ].map((stat, i) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-xl text-parchment md:text-2xl">
                {stat.label === 'Outcome' ? (
                  'Victory'
                ) : (
                  <ScrollCounter
                    scene={SCENE}
                    start={0.46}
                    end={0.62}
                    to={stat.value}
                    suffix={stat.label === 'Evacuated' ? '' : ''}
                  />
                )}
              </p>
              <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.18em] text-smoke">{stat.label}</p>
              {i === 2 ? <p className="mt-0.5 font-mono text-[7px] text-smoke/60">≈ citizens</p> : null}
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal
        scene={SCENE}
        start={0.68}
        end={0.84}
        fadeIn={0.025}
        fadeOut={0.03}
        y={24}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      >
        <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-secondary-light">
          The first transformation
        </p>
        <p className="mt-4 max-w-xl font-display text-2xl leading-snug text-parchment md:text-4xl">
          “I’ll close the gate… no matter what it takes.”
        </p>
        <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.28em] text-ash">
          Eren Yeager · Attack Titan awakens
        </p>
      </Reveal>

      <Reveal
        scene={SCENE}
        start={0.86}
        end={1.01}
        fadeIn={0.025}
        fadeOut={0.02}
        y={10}
        className="absolute inset-x-0 bottom-[18%] flex justify-center px-6"
      >
        <div className="glass-card max-w-md px-6 py-4 text-center">
          <p className="font-display text-base text-parchment/90">
            The boulder that sealed Wall Rose.
          </p>
          <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.28em] text-smoke">
            Humanity’s first victory
          </p>
        </div>
      </Reveal>
    </div>
  )
}
