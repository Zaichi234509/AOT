'use client'

import { Reveal } from './Reveal'
import { WingsLogo } from '@/components/ui/WingsLogo'

const SCENE = 2

const roster = [
  { name: 'Eren', role: 'Attack Titan', accent: '#4A7C3F' },
  { name: 'Mikasa', role: 'Ackerman', accent: '#CC2200' },
  { name: 'Levi', role: 'Captain', accent: '#87CEEB' },
  { name: 'Armin', role: 'Strategist', accent: '#D4A574' },
  { name: 'Erwin', role: 'Commander', accent: '#8A9BA8' },
  { name: 'Hange', role: 'Section Commander', accent: '#9B7BB8' },
  { name: 'Jean', role: 'Squad Leader', accent: '#B08A3E' },
  { name: 'Sasha', role: 'Scout', accent: '#D4874A' },
]

const cards = [
  {
    name: 'Eren Yeager',
    jp: 'エレン・イェーガー',
    quote: '“I’ll keep moving forward.”',
    stats: [
      ['Combat', 8],
      ['Initiative', 10],
      ['Intellect', 6],
      ['Titan', 10],
    ] as [string, number][],
    accent: '#4A7C3F',
    start: 0.1,
    end: 0.29,
    side: 'left',
  },
  {
    name: 'Mikasa Ackerman',
    jp: 'ミカサ・アッカーマン',
    quote: '“If I win, I live. If I don’t fight, I can’t win.”',
    stats: [
      ['Combat', 10],
      ['Initiative', 8],
      ['Intellect', 7],
      ['Titan', 0],
    ] as [string, number][],
    accent: '#CC2200',
    start: 0.34,
    end: 0.52,
    side: 'right',
  },
  {
    name: 'Levi Ackerman',
    jp: 'リヴァイ・アッカーマン',
    quote: '“No regrets.”',
    stats: [
      ['Combat', 10],
      ['Initiative', 9],
      ['Intellect', 8],
      ['Titan', 0],
    ] as [string, number][],
    accent: '#87CEEB',
    start: 0.52,
    end: 0.68,
    side: 'left',
  },
]

export function Scene3Overlay() {
  return (
    <div className="absolute inset-0">
      <Reveal
        scene={SCENE}
        start={0}
        end={0.1}
        fadeIn={0.012}
        fadeOut={0.03}
        y={0}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      >
        <WingsLogo size={64} className="text-primary-light" title="Wings of Freedom" />
        <h2 className="mt-6 font-display text-3xl font-black uppercase tracking-[0.12em] text-parchment md:text-5xl">
          Wings of Freedom
        </h2>
        <p className="font-jp mt-3 text-base tracking-[0.4em] text-parchment/55">自由の翼</p>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-ash/80">
          Survey Corps · 調査兵団
        </p>
      </Reveal>

      {cards.map((card) => (
        <Reveal
          key={card.name}
          scene={SCENE}
          start={card.start}
          end={card.end}
          fadeIn={0.03}
          fadeOut={0.03}
          x={card.side === 'left' ? -45 : 45}
          y={0}
          className={`absolute inset-y-0 flex w-full max-w-[360px] items-center px-6 ${
            card.side === 'left' ? 'left-0' : 'right-0'
          }`}
        >
          <div className="glass-card w-full p-5" style={{ borderColor: `${card.accent}44` }}>
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-lg text-parchment">{card.name}</h3>
              <span className="font-mono text-[9px]" style={{ color: card.accent }}>
                {card.stats[0][1]}/10
              </span>
            </div>
            <p className="font-jp text-[9px] tracking-[0.22em] text-parchment/40">{card.jp}</p>
            <div className="mt-4 space-y-2">
              {card.stats.map(([label, value]) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between font-mono text-[8px] uppercase tracking-[0.18em] text-smoke">
                    <span>{label}</span>
                    <span>{value}</span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${value * 10}%`,
                        backgroundColor: card.accent,
                        boxShadow: `0 0 8px ${card.accent}80`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 font-body text-[11px] italic leading-relaxed text-parchment/65">
              {card.quote}
            </p>
          </div>
        </Reveal>
      ))}

      <Reveal
        scene={SCENE}
        start={0.66}
        end={0.82}
        fadeIn={0.03}
        fadeOut={0.03}
        y={24}
        className="absolute inset-x-0 bottom-[14%] flex justify-center px-6"
      >
        <div className="glass-card w-full max-w-2xl p-4">
          <p className="mb-3 text-center font-mono text-[8px] uppercase tracking-[0.28em] text-smoke">
            Squad roster
          </p>
          <div className="grid grid-cols-4 gap-2 md:grid-cols-8">
            {roster.map((member) => (
              <div key={member.name} className="text-center">
                <div
                  className="mx-auto h-8 w-8 rounded-full border"
                  style={{
                    borderColor: `${member.accent}66`,
                    background: `radial-gradient(circle at 30% 30%, ${member.accent}55, transparent 70%)`,
                  }}
                />
                <p className="mt-1.5 truncate font-body text-[9px] text-parchment/75">{member.name}</p>
                <p className="truncate font-mono text-[7px] uppercase tracking-[0.12em] text-smoke">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal
        scene={SCENE}
        start={0.83}
        end={1}
        fadeIn={0.03}
        fadeOut={0.02}
        y={16}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      >
        <p className="font-display text-xl leading-relaxed text-parchment/90 md:text-3xl">
          “Give up on your dreams and die for us.”
        </p>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-ash">
          Commander Erwin Smith · Return to Shiganshina
        </p>
      </Reveal>
    </div>
  )
}
