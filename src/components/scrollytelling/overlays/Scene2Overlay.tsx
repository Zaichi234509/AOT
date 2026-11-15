'use client'

import { Reveal } from './Reveal'

const SCENE = 1

const walls = [
  {
    name: 'Wall Maria',
    jp: 'ウォール・マリア',
    radius: '480 km',
    districts: 'Shiganshina · Trost',
    status: 'BREACHED — 845',
    statusColor: '#CC2200',
    accent: '#D4A574',
    side: 'left' as const,
    start: 0.2,
    end: 0.44,
  },
  {
    name: 'Wall Rose',
    jp: 'ウォール・ローゼ',
    radius: '380 km',
    districts: 'Trost · Krolva · Karanes',
    status: 'COMPROMISED — 850',
    statusColor: '#D4874A',
    accent: '#87CEEB',
    side: 'right' as const,
    start: 0.46,
    end: 0.68,
  },
  {
    name: 'Wall Sina',
    jp: 'ウォール・シーナ',
    radius: '250 km',
    districts: 'Stohess · Mitras',
    status: 'INTACT — ROYAL SEAT',
    statusColor: '#4A7C3F',
    accent: '#D8C9A8',
    side: 'center' as const,
    start: 0.7,
    end: 0.9,
  },
]

export function Scene2Overlay() {
  return (
    <div className="absolute inset-0">
      <Reveal
        scene={SCENE}
        start={0}
        end={0.17}
        fadeIn={0.015}
        fadeOut={0.04}
        y={0}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      >
        <p className="eyebrow mb-4">The geography of fear</p>
        <h2
          className="hero-title text-4xl text-parchment md:text-6xl"
          style={{ textShadow: '0 16px 50px rgba(0,0,0,0.8)' }}
        >
          The Three Walls
        </h2>
        <p className="font-jp mt-4 text-lg tracking-[0.4em] text-parchment/60">三重の壁</p>
        <p className="mt-6 max-w-md text-sm text-parchment/55">
          Humanity’s last refuge: three concentric rings of 50-metre walls, built a century ago by
          hands no living person remembers.
        </p>
      </Reveal>

      {walls.map((wall) => {
        const position =
          wall.side === 'left'
            ? 'left-0 md:pl-10'
            : wall.side === 'right'
              ? 'right-0 md:pr-10'
              : 'inset-x-0 items-center'
        return (
          <Reveal
            key={wall.name}
            scene={SCENE}
            start={wall.start}
            end={wall.end}
            fadeIn={0.03}
            fadeOut={0.035}
            x={wall.side === 'left' ? -50 : wall.side === 'right' ? 50 : 0}
            y={0}
            className={`absolute inset-y-0 flex w-full max-w-[440px] items-center px-6 ${position}`}
          >
            <div className="glass-card w-full p-5 md:p-7" style={{ borderColor: `${wall.accent}33` }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.3em]" style={{ color: wall.accent }}>
                    {wall.radius} radius
                  </p>
                  <h3 className="mt-1.5 font-display text-xl text-parchment md:text-2xl">{wall.name}</h3>
                  <p className="font-jp mt-1 text-[10px] tracking-[0.25em] text-parchment/45">{wall.jp}</p>
                </div>
                <span
                  className="mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 font-mono text-[8px] uppercase tracking-[0.16em]"
                  style={{ borderColor: `${wall.statusColor}66`, color: wall.statusColor }}
                >
                  <span className="h-1 w-1 rounded-full" style={{ backgroundColor: wall.statusColor }} />
                  {wall.status}
                </span>
              </div>
              <div className="mt-4 h-px w-full" style={{ backgroundColor: `${wall.accent}22` }} />
              <dl className="mt-4 grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <dt className="font-mono text-[8px] uppercase tracking-[0.2em] text-smoke">Districts</dt>
                  <dd className="mt-1 text-parchment/75">{wall.districts}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[8px] uppercase tracking-[0.2em] text-smoke">Garrison</dt>
                  <dd className="mt-1 text-parchment/75">Stationed · 24h watch</dd>
                </div>
              </dl>
            </div>
          </Reveal>
        )
      })}

      <Reveal
        scene={SCENE}
        start={0.88}
        end={1.02}
        fadeIn={0.03}
        fadeOut={0.02}
        y={20}
        className="absolute inset-x-0 bottom-[12%] flex justify-center px-6"
      >
        <div className="glass-card flex flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6 py-4 text-center">
          {[
            ['Walls built', '107 years ago'],
            ['Total height', '50 m'],
            ['Known breach', 'Wall Maria · 845'],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="font-mono text-[8px] uppercase tracking-[0.24em] text-smoke">{label}</p>
              <p className="font-display text-sm text-parchment/85">{value}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  )
}
