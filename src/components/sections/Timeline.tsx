'use client'

import { useMemo, useState } from 'react'
import timelineRaw from '@/data/timeline.json'
import type { TimelineEvent } from '@/types/scene'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useSectionReveal } from '@/hooks/useGSAP'
import { cn } from '@/lib/utils'

const events = timelineRaw as TimelineEvent[]

export function Timeline() {
  const rootRef = useSectionReveal<HTMLDivElement>([])
  const eras = useMemo(() => Array.from(new Set(events.map((e) => e.era))), [])
  const [era, setEra] = useState<string | null>(null)

  const visible = era ? events.filter((e) => e.era === era) : events

  return (
    <section id="timeline" className="section-shell bg-ink-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_20%,rgba(204,34,0,0.07),transparent_55%)]" />
      <div className="noise-overlay" />

      <div ref={rootRef} className="container-aot relative">
        <SectionHeader
          eyebrow="Section 07 · The Chronicle"
          title="Timeline"
          titleJP="年表"
          subtitle="From a slave girl beneath a tree to the last Titan walking across a flattened world — two thousand years in fifteen moments."
          accent="#D4A574"
        />

        <div className="mt-10 flex flex-wrap justify-center gap-2" data-reveal>
          <button
            type="button"
            onClick={() => setEra(null)}
            className={cn(
              'focus-ring rounded-full border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] transition',
              era === null
                ? 'border-primary-light/70 bg-primary/25 text-parchment'
                : 'border-white/10 text-smoke hover:border-white/30 hover:text-ash'
            )}
          >
            All eras
          </button>
          {eras.map((name) => {
            const color = events.find((e) => e.era === name)?.color ?? '#8A8278'
            return (
              <button
                key={name}
                type="button"
                onClick={() => setEra(era === name ? null : name)}
                className={cn(
                  'focus-ring rounded-full border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] transition',
                  era === name ? 'text-parchment' : 'text-smoke hover:text-ash'
                )}
                style={{
                  borderColor: era === name ? `${color}aa` : 'rgba(255,255,255,0.1)',
                  backgroundColor: era === name ? `${color}22` : 'transparent',
                }}
              >
                {name}
              </button>
            )
          })}
        </div>

        <ol className="relative mt-12">
          {/* central spine */}
          <span
            aria-hidden
            className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/20 to-transparent md:left-1/2 md:-translate-x-1/2"
          />

          {visible.map((event, index) => {
            const right = index % 2 === 1
            return (
              <li
                key={event.id}
                className="relative pl-12 md:grid md:grid-cols-2 md:gap-10 md:pl-0"
                data-reveal
              >
                <span
                  aria-hidden
                  className="absolute left-4 top-6 z-10 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border md:left-1/2"
                  style={{
                    borderColor: event.color,
                    backgroundColor: '#0A0A0A',
                    boxShadow: `0 0 14px ${event.color}80`,
                  }}
                />

                <div
                  className={cn(
                    'py-5',
                    right ? 'md:col-start-2 md:pl-10' : 'md:col-start-1 md:pr-10 md:text-right'
                  )}
                >
                  <div
                    className={cn(
                      'inline-flex flex-col gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 transition-colors hover:border-white/20 md:max-w-[460px]',
                      !right && 'md:ml-auto'
                    )}
                    style={{ borderLeftColor: `${event.color}66` }}
                  >
                    <div className={cn('flex items-center gap-2', !right && 'md:justify-end')}>
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: event.color }}>
                        {event.year}
                      </span>
                      <span className="h-px w-6 bg-white/15" />
                      <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-smoke">
                        {event.era}
                      </span>
                    </div>
                    <h3 className="font-display text-base leading-snug text-parchment md:text-lg">
                      {event.title}
                    </h3>
                    <p className="text-[12.5px] leading-relaxed text-ash">{event.description}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>

        <p className="mt-10 text-center font-jp text-[10px] tracking-[0.3em] text-smoke/60">
          歴史は繰り返す
        </p>
      </div>
    </section>
  )
}
