'use client'

import { useMemo, useState } from 'react'
import { ShieldAlert, Swords } from 'lucide-react'
import titansRaw from '@/data/titans.json'
import pureRaw from '@/data/pure-titans.json'
import type { Titan, PureTitanClass } from '@/types/titan'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { ImageSearchLink } from '@/components/ui/ImageSearchLink'
import { Tabs } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import { GlassCard } from '@/components/ui/GlassCard'
import { Modal } from '@/components/ui/Modal'
import { ScenePoster } from '@/components/ui/ScenePoster'
import { useSectionReveal } from '@/hooks/useGSAP'

const titans = titansRaw as Titan[]
const pureTitans = pureRaw as PureTitanClass[]

type Tab = 'nine' | 'pure'

const THREAT_COLOR: Record<PureTitanClass['threat'], string> = {
  Low: '#7A8C6A',
  Moderate: '#B08A3E',
  High: '#D4874A',
  Extreme: '#CC2200',
}

const SIZE_SCALE = [
  { label: 'Human', metres: 1.7, accent: '#A09888' },
  { label: 'Cart', metres: 4, accent: '#7A8C6A' },
  { label: 'Jaw', metres: 5, accent: '#D4874A' },
  { label: 'Female', metres: 14, accent: '#9B7BB8' },
  { label: 'Attack', metres: 15, accent: '#4A7C3F' },
  { label: 'Beast', metres: 17, accent: '#B08A3E' },
  { label: 'Colossal', metres: 60, accent: '#CC2200' },
]

export function TitanBestiary() {
  const rootRef = useSectionReveal<HTMLDivElement>([])
  const [tab, setTab] = useState<Tab>('nine')
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  const filteredTitans = useMemo(() => {
    const q = query.trim().toLowerCase()
    return titans.filter((titan) =>
      !q || `${titan.name} ${titan.nameJP} ${titan.holder} ${titan.ability} ${titan.weakness}`.toLowerCase().includes(q)
    )
  }, [query])
  const filteredPureTitans = useMemo(() => {
    const q = query.trim().toLowerCase()
    return pureTitans.filter((pure) =>
      !q || `${pure.name} ${pure.sizeRange} ${pure.threat} ${pure.description}`.toLowerCase().includes(q)
    )
  }, [query])

  const active = useMemo(() => titans.find((t) => t.id === openId) ?? null, [openId])

  return (
    <section id="titans" className="section-shell bg-ink-950">
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-murky/20 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(204,34,0,0.09),transparent_55%)]" />
      <div className="noise-overlay" />

      <div ref={rootRef} className="container-aot relative">
        <SectionHeader
          eyebrow="Section 05 · The Monsters"
          title="Titan Bestiary"
          titleJP="巨人図鑑"
          subtitle="Nine inheritors of Ymir's power, and the mindless hundreds that eat for reasons they will never understand."
          accent="#CC2200"
        />

        <div className="mt-12 flex flex-col gap-4" data-reveal>
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <Tabs<Tab>
              items={[
                { id: 'nine', label: 'The Nine Titans', count: titans.length, color: '#CC2200' },
                { id: 'pure', label: 'Pure Titans & Abnormals', count: pureTitans.length, color: '#7A8C6A' },
              ]}
              value={tab}
              onChange={setTab}
              ariaLabel="Titan category"
            />
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-smoke">
              Threat assessments · Survey Corps records
            </p>
          </div>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search titans, holders or abilities…"
            label="Search titans"
            className="w-full md:max-w-sm"
          />
        </div>

        {tab === 'nine' ? (
          <div className="-mx-6 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 no-scrollbar md:mx-0 md:px-0">
            {filteredTitans.map((titan) => (
              <div key={titan.id} className="group relative w-[300px] shrink-0 snap-start md:w-[340px]">
                <button
                  type="button"
                  onClick={() => setOpenId(titan.id)}
                  className="focus-ring block h-full w-full text-left"
                  aria-label={`Open ${titan.name} details`}
                >
                  <GlassCard padding="none" hover className="h-full" style={{ borderColor: `${titan.accent}2e` }}>
                    <div className="relative h-44 overflow-hidden">
                      <ScenePoster motif="titan" accent={titan.accent} showLabel={false} seed={titan.name.length * 7} />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/30 to-transparent" />
                      <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/50 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-parchment/80 backdrop-blur">
                        {titan.height}
                      </span>
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <p className="font-mono text-[9px] uppercase tracking-[0.24em]" style={{ color: titan.accent }}>
                          {titan.monogram} · Nine Titans
                        </p>
                        <h3 className="mt-1 font-display text-xl text-parchment">{titan.name}</h3>
                        <p className="font-jp text-[10px] tracking-[0.2em] text-parchment/50">{titan.nameJP}</p>
                      </div>
                    </div>

                    <div className="p-4">
                      <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-smoke">Current holder</p>
                      <p className="text-[13px] text-parchment/85">{titan.holder}</p>
                      <div className="mt-3 flex items-start gap-2">
                        <Swords size={11} className="mt-1 shrink-0" style={{ color: titan.accent }} />
                        <p className="line-clamp-3 text-[11.5px] leading-relaxed text-ash">{titan.ability}</p>
                      </div>
                      <div className="mt-2 flex items-start gap-2">
                        <ShieldAlert size={11} className="mt-1 shrink-0 text-secondary" />
                        <p className="line-clamp-2 text-[11.5px] leading-relaxed text-smoke">{titan.weakness}</p>
                      </div>
                    </div>
                  </GlassCard>
                </button>
                <ImageSearchLink
                  name={titan.name}
                  className="absolute right-3 top-3 z-10"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPureTitans.map((pure) => (
              <GlassCard key={pure.id} hover className="h-full" style={{ borderColor: `${THREAT_COLOR[pure.threat]}26` }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base text-parchment">{pure.name}</h3>
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-smoke">{pure.sizeRange}</p>
                  </div>
                  <Badge color={THREAT_COLOR[pure.threat]} dot>
                    {pure.threat}
                  </Badge>
                </div>
                <div className="mt-4 flex items-end gap-2" aria-hidden>
                  <div
                    className="w-2 rounded-sm"
                    style={{
                      height: `${Math.max(10, (pure.heightMeters / 60) * 90)}px`,
                      backgroundColor: `${THREAT_COLOR[pure.threat]}88`,
                    }}
                  />
                  <span className="font-mono text-[9px] text-smoke">{pure.heightMeters} m avg.</span>
                </div>
                <p className="mt-3 text-[12px] leading-relaxed text-ash">{pure.description}</p>
                <div className="mt-4 border-t border-white/10 pt-3">
                  <ImageSearchLink name={`${pure.name} titan`} variant="inline" />
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {((tab === 'nine' && filteredTitans.length === 0) || (tab === 'pure' && filteredPureTitans.length === 0)) ? (
          <p className="mt-8 rounded-lg border border-white/10 bg-white/[0.02] p-8 text-center font-display text-parchment">
            No titan records found. Try another search.
          </p>
        ) : null}

        {/* size comparison */}
        <div className="mt-12 glass-card p-5 md:p-6" data-reveal>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-lg text-parchment">Size comparison</h3>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-smoke">
              Every titan to scale against 60 m
            </p>
          </div>

          <div className="mt-6 flex items-end justify-between gap-2 overflow-x-auto pb-2 md:gap-4">
            {SIZE_SCALE.map((item) => {
              const height = 20 + (item.metres / 60) * 150
              return (
                <div key={item.label} className="flex min-w-[46px] flex-1 flex-col items-center gap-2">
                  <span className="font-mono text-[9px] text-parchment/60">{item.metres} m</span>
                  <svg
                    viewBox="0 0 40 100"
                    style={{ height, width: 'auto' }}
                    className="max-h-[170px] min-h-[26px]"
                    aria-hidden
                  >
                    <g fill={item.accent} opacity={item.label === 'Human' ? 0.65 : 0.85}>
                      <circle cx="20" cy="12" r="7" />
                      <path d="M20 20 q-9 0 -9 12 l0 26 q0 6 4 6 l1 24 q0 3 3 3 l3 0 q3 0 3 -3 l1 -20 l1 20 q0 3 3 3 l3 0 q3 0 3 -3 l1 -24 q4 0 4 -6 l0 -26 q0 -12 -9 -12 Z" />
                    </g>
                  </svg>
                  <span className="text-center font-mono text-[8px] uppercase tracking-[0.12em] text-smoke">
                    {item.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <Modal open={Boolean(active)} onClose={() => setOpenId(null)} labelledBy="titan-name">
        {active ? (
          <div>
            <div className="relative h-52 md:h-64 overflow-hidden bg-ink-850">
              <img
                src={active.image}
                alt={`${active.name} — still from Attack on Titan`}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
              <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-ink-900 via-ink-900/30 to-transparent" />
              <div className="pointer-events-none absolute right-4 top-4 z-10 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-parchment/75 backdrop-blur">
                Archive still
              </div>
              <div className="absolute inset-x-0 bottom-0 z-20 p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge color={active.accent} variant="solid">
                    Nine Titans
                  </Badge>
                  <Badge color="#A09888">{active.height}</Badge>
                </div>
                <h3 id="titan-name" className="mt-3 font-display text-3xl text-parchment">
                  {active.name}
                </h3>
                <p className="font-jp text-sm tracking-[0.2em] text-ash">{active.nameJP}</p>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-smoke">Current holder</p>
                  <p className="mt-1 text-[13px] text-parchment/85">{active.holder}</p>
                </div>
                <div>
                  <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-smoke">Height</p>
                  <p className="mt-1 text-[13px] text-parchment/85">{active.height}</p>
                </div>
              </div>

              <div className="mt-5">
                <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-smoke">Previous holders</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {active.previousHolders.map((holder) => (
                    <span
                      key={holder}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-ash"
                    >
                      {holder}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded border p-3.5" style={{ borderColor: `${active.accent}44` }}>
                  <p className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.2em] text-smoke">
                    <Swords size={10} /> Ability
                  </p>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-parchment/75">{active.ability}</p>
                </div>
                <div className="rounded border border-secondary/30 bg-secondary/[0.05] p-3.5">
                  <p className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.2em] text-smoke">
                    <ShieldAlert size={10} /> Weakness
                  </p>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-parchment/75">{active.weakness}</p>
                </div>
              </div>

              <p className="mt-5 border-t border-white/10 pt-4 text-[13px] leading-relaxed text-ash">
                {active.history}
              </p>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  )
}
