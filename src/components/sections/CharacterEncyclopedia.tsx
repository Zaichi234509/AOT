'use client'

import { useMemo, useState } from 'react'
import { Quote, Users } from 'lucide-react'
import charactersRaw from '@/data/characters.json'
import type { Affiliation, Character } from '@/types/character'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { Tabs } from '@/components/ui/Tabs'
import { Badge, AFFILIATION_COLORS } from '@/components/ui/Badge'
import { GlassCard } from '@/components/ui/GlassCard'
import { StatBar } from '@/components/ui/StatBar'
import { Modal } from '@/components/ui/Modal'
import { useSectionReveal } from '@/hooks/useGSAP'

const characters = charactersRaw as Character[]

type Filter = 'all' | Affiliation

export function CharacterEncyclopedia() {
  const rootRef = useSectionReveal<HTMLDivElement>([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [openId, setOpenId] = useState<string | null>(null)

  const affiliations = useMemo(() => {
    const counts = new Map<string, number>()
    characters.forEach((c) => counts.set(c.affiliation, (counts.get(c.affiliation) ?? 0) + 1))
    return Array.from(counts.entries())
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return characters.filter((c) => {
      const matchesFilter = filter === 'all' || c.affiliation === filter
      const haystack = `${c.name} ${c.nameJP} ${c.rank} ${c.titanForm ?? ''}`.toLowerCase()
      return matchesFilter && (!q || haystack.includes(q))
    })
  }, [query, filter])

  const active = characters.find((c) => c.id === openId) ?? null

  return (
    <section id="characters" className="section-shell bg-ink-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,rgba(74,124,63,0.12),transparent_55%)]" />
      <div className="noise-overlay" />

      <div ref={rootRef} className="container-aot relative">
        <SectionHeader
          eyebrow="Section 04 · The People"
          title="Character Encyclopedia"
          titleJP="人物名鑑"
          subtitle="Eighteen soldiers, warriors and monsters — searchable, filterable, and stat-verified by their own record books."
          accent="#4A7C3F"
        />

        <div className="mt-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between" data-reveal>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by name, rank or titan…"
            label="Search characters"
            className="w-full md:max-w-sm"
          />
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-smoke">
            <Users size={12} />
            {filtered.length} of {characters.length} records
          </p>
        </div>

        <div className="mt-4 overflow-x-auto" data-reveal data-reveal-delay="0.05">
          <Tabs<Filter>
            items={[
              { id: 'all', label: 'All', count: characters.length, color: '#F5F0E8' },
              ...affiliations.map(([name, count]) => ({
                id: name as Filter,
                label: name,
                count,
                color: AFFILIATION_COLORS[name] ?? '#4A7C3F',
              })),
            ]}
            value={filter}
            onChange={setFilter}
            ariaLabel="Filter characters by affiliation"
          />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((character) => (
            <div key={character.id} className="group animate-fade-up">
              <GlassCard
                padding="none"
                hover
                className="h-full"
                style={{ borderColor: `${character.accent}22` }}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-ink-850">
                  <button
                    type="button"
                    onClick={() => setOpenId(character.id)}
                    className="focus-ring absolute inset-0 block h-full w-full text-left"
                    aria-label={`Open ${character.name}'s profile`}
                  >
                    <img
                      src={character.image}
                      alt={`${character.name} — portrait still from Attack on Titan`}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
                    />
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 block bg-gradient-to-t from-black/90 to-transparent p-3 pt-10">
                      <span className="block font-display text-base text-parchment">
                        {character.name}
                      </span>
                      <span className="block font-mono text-[9px] uppercase tracking-[0.16em] text-ash/80">
                        {character.rank}
                      </span>
                    </span>
                  </button>
                  <div className="pointer-events-none absolute left-3 top-3">
                    <Badge color={AFFILIATION_COLORS[character.affiliation]} variant="solid">
                      {character.affiliation}
                    </Badge>
                  </div>
                </div>

                <div className="p-3.5">
                  <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-smoke">
                    <span>Combat</span>
                    <span style={{ color: character.accent }}>
                      {character.stats.combat}/10
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/[0.07]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${character.stats.combat * 10}%`,
                        backgroundColor: character.accent,
                      }}
                    />
                  </div>
                  {character.titanForm ? (
                    <p className="mt-2.5 truncate font-mono text-[9px] uppercase tracking-[0.14em] text-secondary-light/80">
                      ⬢ {character.titanForm}
                    </p>
                  ) : (
                    <p className="mt-2.5 truncate font-mono text-[9px] uppercase tracking-[0.14em] text-smoke/60">
                      {character.status}
                    </p>
                  )}
                </div>
              </GlassCard>
            </div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-10 rounded-lg border border-white/10 bg-white/[0.02] p-10 text-center">
            <p className="font-display text-lg text-parchment">No records found</p>
            <p className="mt-2 text-sm text-ash">Try a different name or clear the affiliation filter.</p>
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setFilter('all')
              }}
              className="focus-ring mt-4 rounded-md border border-white/15 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ash transition hover:border-primary-light hover:text-parchment"
            >
              Reset filters
            </button>
          </div>
        ) : null}
      </div>

      {/* ── profile modal ── */}
      <Modal open={Boolean(active)} onClose={() => setOpenId(null)} labelledBy="character-name">
        {active ? (
          <div className="grid gap-0 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <div className="relative min-h-[320px] overflow-hidden bg-ink-850 md:sticky md:top-0 md:h-[62vh] md:min-h-[380px] md:self-start">
              <img
                src={active.image}
                alt={`${active.name} — portrait still from Attack on Titan`}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/90 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-ink-900/80" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-5 md:hidden">
                <h3 className="font-display text-2xl text-parchment">{active.name}</h3>
              </div>
              <p className="absolute left-3 top-3 z-20 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.16em] text-parchment/70 backdrop-blur">
                Portrait · Archive still
              </p>
            </div>

            <div className="relative p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge color={AFFILIATION_COLORS[active.affiliation]} variant="solid">
                  {active.affiliation}
                </Badge>
                <Badge color={active.accent}>{active.rank}</Badge>
              </div>
              <h3 id="character-name" className="mt-3 hidden font-display text-3xl text-parchment md:block">
                {active.name}
              </h3>
              <p className="font-jp text-sm tracking-[0.2em] text-ash">{active.nameJP}</p>

              <dl className="mt-5 grid grid-cols-2 gap-3 border-y border-white/10 py-4 text-[12px]">
                {[
                  ['Status', active.status],
                  ['Age', active.age],
                  ['Height', active.height],
                  ['Weight', active.weight],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="font-mono text-[8px] uppercase tracking-[0.2em] text-smoke">{label}</dt>
                    <dd className="mt-0.5 text-parchment/80">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5">
                <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-smoke">Recorded stats</p>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  <StatBar label="Combat" value={active.stats.combat} accent={active.accent} />
                  <StatBar label="Initiative" value={active.stats.initiative} accent={active.accent} delay={80} />
                  <StatBar label="Intellect" value={active.stats.intellect} accent={active.accent} delay={160} />
                  <StatBar label="Teamwork" value={active.stats.teamwork} accent={active.accent} delay={240} />
                  <StatBar label="Titan power" value={active.stats.titan} accent="#CC2200" delay={320} />
                </div>
              </div>

              <p className="mt-5 text-[13px] leading-relaxed text-ash">{active.bio}</p>

              <div className="mt-5 space-y-2">
                {active.quotes.map((quote) => (
                  <div key={quote} className="flex gap-2 rounded border-l border-white/15 bg-white/[0.02] px-3 py-2">
                    <Quote size={11} className="mt-0.5 shrink-0 text-smoke" />
                    <p className="text-[12px] italic leading-relaxed text-parchment/70">{quote}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-smoke">Relationships</p>
                <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {active.relationships.map((rel) => (
                    <li key={rel.name} className="text-[12px] text-parchment/75">
                      <span className="text-parchment">{rel.name}</span>
                      <span className="text-smoke"> — {rel.relation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {active.titanForm ? (
                <div
                  className="mt-5 rounded border px-3 py-2.5"
                  style={{ borderColor: `${active.accent}44`, backgroundColor: `${active.accent}10` }}
                >
                  <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-smoke">Titan form</p>
                  <p className="mt-0.5 font-display text-sm" style={{ color: active.accent }}>
                    {active.titanForm}
                  </p>
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1 border-t border-white/10 pt-4 font-mono text-[9px] uppercase tracking-[0.16em] text-smoke">
                <span>First: {active.firstAppearance}</span>
                <span>Last: {active.lastAppearance}</span>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  )
}
