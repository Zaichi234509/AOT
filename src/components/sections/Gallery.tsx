'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Tabs } from '@/components/ui/Tabs'
import { ScenePoster, type PosterMotif } from '@/components/ui/ScenePoster'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { useSectionReveal } from '@/hooks/useGSAP'
import { cn } from '@/lib/utils'

type Category = 'All' | 'Anime' | 'Manga' | 'Official' | 'Fan Art'

type GalleryItem = {
  id: string
  title: string
  caption: string
  category: Exclude<Category, 'All'>
  motif: PosterMotif
  aspect: string
  accent: string
}

const ITEMS: GalleryItem[] = [
  { id: 'g01', title: 'The Wall at Dawn', caption: 'Wall Maria, southern face — 845, hours before the breach.', category: 'Anime', motif: 'wall', aspect: 'aspect-[4/3]', accent: '#D4A574' },
  { id: 'g02', title: 'Colossal', caption: 'The Colossal Titan above Shiganshina. Steam still rising.', category: 'Anime', motif: 'colossal', aspect: 'aspect-[3/4]', accent: '#CC2200' },
  { id: 'g03', title: 'Wings of Freedom', caption: 'Survey Corps standard, 104th graduation.', category: 'Official', motif: 'wings', aspect: 'aspect-square', accent: '#4A7C3F' },
  { id: 'g04', title: 'The Rooftop Run', caption: 'Trost, third street — ODM gear at full extension.', category: 'Anime', motif: 'trost', aspect: 'aspect-[4/3]', accent: '#D4874A' },
  { id: 'g05', title: 'Nape Strike', caption: 'A blade’s length from the spine. Draft panel.', category: 'Manga', motif: 'titan', aspect: 'aspect-[3/5]', accent: '#CC2200' },
  { id: 'g06', title: 'Three Rings', caption: 'Paradis from the air — Maria, Rose and Sina.', category: 'Official', motif: 'map', aspect: 'aspect-[4/3]', accent: '#D4A574' },
  { id: 'g07', title: 'The Basement Door', caption: 'The key turns. Chapter 84, panel 3.', category: 'Manga', motif: 'basement', aspect: 'aspect-[3/4]', accent: '#FF9944' },
  { id: 'g08', title: 'Survey Corps Charge', caption: 'Capes forward, horses at full gallop.', category: 'Official', motif: 'corps', aspect: 'aspect-[4/3]', accent: '#4A7C3F' },
  { id: 'g09', title: 'The Sea', caption: 'Year 851. The first horizon that isn’t a wall.', category: 'Anime', motif: 'sky', aspect: 'aspect-square', accent: '#87CEEB' },
  { id: 'g10', title: 'Rumbling Horizon', caption: 'Sixty million footsteps. Fort Salta, final chapter.', category: 'Manga', motif: 'rumbling', aspect: 'aspect-[3/4]', accent: '#FF4400' },
  { id: 'g11', title: 'Levi, Mid-Air', caption: 'Fan study — the strongest soldier, one more time.', category: 'Fan Art', motif: 'corps', aspect: 'aspect-[3/5]', accent: '#87CEEB' },
  { id: 'g12', title: 'Historia Crowned', caption: 'Coronation at Mitras, painted study.', category: 'Fan Art', motif: 'wings', aspect: 'aspect-[3/4]', accent: '#C0B7A4' },
  { id: 'g13', title: 'Inside the Walls', caption: 'The gate mechanism at Trost, schematic plate.', category: 'Official', motif: 'wall', aspect: 'aspect-[4/3]', accent: '#8A9BA8' },
  { id: 'g14', title: 'Abnormal', caption: 'It does not look at you. It looks at the gate.', category: 'Anime', motif: 'titan', aspect: 'aspect-[3/4]', accent: '#FF4400' },
  { id: 'g15', title: 'Utgard Night', caption: 'The 104th holds the tower. Ink and wash.', category: 'Manga', motif: 'sky', aspect: 'aspect-[4/3]', accent: '#7A8C6A' },
  { id: 'g16', title: 'Liberio Festival', caption: 'The night the world declared war.', category: 'Anime', motif: 'rumbling', aspect: 'aspect-square', accent: '#9B3B2E' },
  { id: 'g17', title: 'Commander', caption: 'Erwin’s last gamble. Charcoal study.', category: 'Fan Art', motif: 'corps', aspect: 'aspect-[3/4]', accent: '#8A9BA8' },
  { id: 'g18', title: 'Boulder', caption: 'Sisyphus in Trost — the stone that saved a district.', category: 'Manga', motif: 'trost', aspect: 'aspect-[4/3]', accent: '#B08A3E' },
  { id: 'g19', title: 'Pathways', caption: 'The Paths: sand, stars and a girl with a bucket.', category: 'Official', motif: 'sky', aspect: 'aspect-[3/5]', accent: '#C0B7A4' },
  { id: 'g20', title: 'Sasageyo', caption: 'The salute. Fists over hearts.', category: 'Anime', motif: 'wings', aspect: 'aspect-square', accent: '#D4A574' },
]

const FILTERS: Category[] = ['All', 'Anime', 'Manga', 'Official', 'Fan Art']

export function Gallery() {
  const rootRef = useSectionReveal<HTMLDivElement>([])
  const [filter, setFilter] = useState<Category>('All')
  const [visible, setVisible] = useState(9)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const filtered = useMemo(
    () => (filter === 'All' ? ITEMS : ITEMS.filter((i) => i.category === filter)),
    [filter]
  )

  const shown = filtered.slice(0, visible)
  const activeItem = openIndex !== null ? filtered[openIndex] : null

  useEffect(() => {
    setVisible(9)
  }, [filter])

  useEffect(() => {
    if (openIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setOpenIndex((i) => ((i ?? 0) + 1) % filtered.length)
      if (e.key === 'ArrowLeft') setOpenIndex((i) => ((i ?? 0) - 1 + filtered.length) % filtered.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openIndex, filtered.length])

  return (
    <section id="gallery" className="section-shell bg-ink-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(212,165,116,0.07),transparent_50%)]" />
      <div className="noise-overlay" />

      <div ref={rootRef} className="container-aot relative">
        <SectionHeader
          eyebrow="Section 09 · The Archive Plates"
          title="Gallery"
          titleJP="画廊"
          subtitle="Original archive plates drawn for this project — atmospheres, districts and key beats. Real captures can be dropped into /public/images/gallery."
          accent="#D4A574"
        />

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3" data-reveal>
          <Tabs<Category>
            items={FILTERS.map((f) => ({
              id: f,
              label: f,
              count: f === 'All' ? ITEMS.length : ITEMS.filter((i) => i.category === f).length,
              color: '#D4A574',
            }))}
            value={filter}
            onChange={setFilter}
            variant="pill"
            ariaLabel="Gallery category"
          />
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-smoke">
            {filtered.length} plates
          </p>
        </div>

        <div className="masonry mt-8">
          {shown.map((item) => {
            const index = filtered.findIndex((f) => f.id === item.id)
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setOpenIndex(index)}
                className="focus-ring group block w-full overflow-hidden rounded-lg border border-white/10 text-left transition-colors hover:border-white/25"
                aria-label={`Open ${item.title}`}
              >
                <div className={cn('relative w-full', item.aspect)}>
                  <ScenePoster
                    motif={item.motif}
                    accent={item.accent}
                    showLabel={false}
                    seed={index * 13 + 3}
                    className="transition-transform duration-700 ease-out-expo group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-80" />
                  <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="grid h-7 w-7 place-items-center rounded-full border border-white/25 bg-black/50 text-parchment">
                      <Expand size={12} />
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <p className="font-display text-sm text-parchment">{item.title}</p>
                    <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.18em] text-ash/70">
                      {item.category}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {visible < filtered.length ? (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => setVisible((v) => v + 9)}
              className="focus-ring rounded-md border border-white/15 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.24em] text-ash transition hover:border-primary-light hover:text-parchment"
            >
              Load more plates
            </button>
          </div>
        ) : null}
      </div>

      <Modal
        open={activeItem !== null}
        onClose={() => setOpenIndex(null)}
        labelledBy="gallery-title"
        className="max-w-5xl"
      >
        {activeItem ? (
          <div>
            <div className="relative aspect-[16/10] max-h-[70vh] w-full">
              <ScenePoster motif={activeItem.motif} accent={activeItem.accent} showLabel={false} seed={openIndex ?? 1} />
            </div>
            <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Badge color={activeItem.accent}>{activeItem.category}</Badge>
                <h3 id="gallery-title" className="mt-2 font-display text-xl text-parchment">
                  {activeItem.title}
                </h3>
                <p className="mt-1 text-[12px] text-ash">{activeItem.caption}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOpenIndex((i) => ((i ?? 0) - 1 + filtered.length) % filtered.length)}
                  aria-label="Previous plate"
                  className="focus-ring grid h-9 w-9 place-items-center rounded-full border border-white/15 text-ash transition hover:border-white/40 hover:text-parchment"
                >
                  <ChevronLeft size={15} />
                </button>
                <span className="font-mono text-[10px] text-smoke">
                  {(openIndex ?? 0) + 1} / {filtered.length}
                </span>
                <button
                  type="button"
                  onClick={() => setOpenIndex((i) => ((i ?? 0) + 1) % filtered.length)}
                  aria-label="Next plate"
                  className="focus-ring grid h-9 w-9 place-items-center rounded-full border border-white/15 text-ash transition hover:border-white/40 hover:text-parchment"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  )
}
