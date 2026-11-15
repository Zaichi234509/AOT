'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, Clock, Sparkles, Star } from 'lucide-react'
import episodesRaw from '@/data/episodes.json'
import seasonsRaw from '@/data/seasons.json'
import type { Episode, Season } from '@/types/episode'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import { useSectionReveal } from '@/hooks/useGSAP'
import { cn } from '@/lib/utils'

const episodes = episodesRaw as Episode[]
const seasons = seasonsRaw as Season[]

const TAG_COLORS: Record<string, string> = {
  'Key Moment': '#CC2200',
  'Titan Reveal': '#D4874A',
  Battle: '#8A9BA8',
  Lore: '#87CEEB',
  Emotional: '#9B7BB8',
}

export function EpisodeGuide() {
  const rootRef = useSectionReveal<HTMLDivElement>([])
  const [season, setSeason] = useState<1 | 2 | 3 | 4>(1)
  const [keyOnly, setKeyOnly] = useState(false)
  const [expanded, setExpanded] = useState<string | null>('1-1')

  const list = useMemo(() => {
    return episodes
      .filter((e) => e.season === season)
      .filter((e) => (keyOnly ? e.tags.includes('Key Moment') : true))
  }, [season, keyOnly])

  const meta = seasons.find((s) => s.season === season)
  const average = useMemo(() => {
    const seasonEpisodes = episodes.filter((e) => e.season === season)
    return (seasonEpisodes.reduce((sum, e) => sum + e.rating, 0) / seasonEpisodes.length).toFixed(2)
  }, [season])

  return (
    <section id="episodes" className="section-shell bg-ink-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_10%_0%,rgba(135,206,235,0.08),transparent_50%)]" />
      <div className="noise-overlay" />

      <div ref={rootRef} className="container-aot relative">
        <SectionHeader
          eyebrow="Section 06 · The Record"
          title="Episode Guide"
          titleJP="各話一覧"
          subtitle="All 87 episodes across four seasons — with key moments flagged, ratings logged and synopses one click away."
          accent="#87CEEB"
        />

        <div className="mt-12 grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-center" data-reveal>
          <Tabs<`${1 | 2 | 3 | 4}`>
            items={seasons.map((s) => ({
              id: `${s.season}`,
              label: s.label,
              count: s.episodeCount,
              color: '#87CEEB',
            }))}
            value={`${season}`}
            onChange={(v) => {
              setSeason(Number(v) as 1 | 2 | 3 | 4)
              setExpanded(null)
            }}
            ariaLabel="Select season"
          />

          <button
            type="button"
            onClick={() => setKeyOnly(!keyOnly)}
            aria-pressed={keyOnly}
            className={cn(
              'focus-ring flex items-center gap-2 rounded-full border px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition',
              keyOnly
                ? 'border-secondary/70 bg-secondary/20 text-parchment'
                : 'border-white/10 text-smoke hover:border-white/30 hover:text-ash'
            )}
          >
            <Sparkles size={11} /> Key episodes
          </button>

          <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.16em] text-smoke">
            <span className="flex items-center gap-1.5">
              <Star size={11} className="text-gold" /> {average} avg
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={11} /> {meta?.year}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-y border-white/10 py-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-smoke">{meta?.studioNote}</p>
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-smoke">
            {list.length} episodes shown
          </p>
        </div>

        <ul className="mt-2 divide-y divide-white/[0.06]">
          {list.map((episode) => {
            const id = `${episode.season}-${episode.episode}`
            const open = expanded === id
            return (
              <li key={id} className="animate-fade-up">
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : id)}
                  aria-expanded={open}
                  className="focus-ring group flex w-full items-start gap-3 py-4 text-left md:gap-5"
                >
                  <span className="mt-0.5 w-10 shrink-0 font-mono text-[11px] tracking-[0.06em] text-smoke">
                    {String(episode.episode).padStart(2, '0')}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span
                        className={cn(
                          'font-display text-[15px] transition-colors md:text-base',
                          open ? 'text-primary-light' : 'text-parchment/90 group-hover:text-parchment'
                        )}
                      >
                        {episode.title}
                      </span>
                      <span className="font-jp text-[10px] tracking-[0.16em] text-smoke">
                        {episode.titleJP}
                      </span>
                    </span>

                    <span className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-smoke">
                        {episode.airDate}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[9px] text-ash">
                        <Star size={9} className="text-gold" />
                        {episode.rating.toFixed(1)}
                      </span>
                      <span className="flex flex-wrap gap-1">
                        {episode.tags.map((tag) => (
                          <Badge key={tag} color={TAG_COLORS[tag] ?? '#8A8278'}>
                            {tag}
                          </Badge>
                        ))}
                      </span>
                    </span>

                    <span
                      className="grid transition-[grid-template-rows,opacity] duration-500 ease-out-expo"
                      style={{ gridTemplateRows: open ? '1fr' : '0fr', opacity: open ? 1 : 0 }}
                    >
                      <span className="overflow-hidden">
                        <span className="mt-3 block max-w-2xl text-[13px] leading-relaxed text-ash">
                          {episode.synopsis}
                        </span>
                      </span>
                    </span>
                  </span>

                  <ChevronDown
                    size={15}
                    className={cn(
                      'mt-1 shrink-0 text-smoke transition-transform duration-300',
                      open ? 'rotate-180 text-primary-light' : 'group-hover:text-ash'
                    )}
                  />
                </button>
              </li>
            )
          })}
        </ul>

        {list.length === 0 ? (
          <p className="py-12 text-center text-sm text-ash">No episodes match this filter.</p>
        ) : null}
      </div>
    </section>
  )
}
