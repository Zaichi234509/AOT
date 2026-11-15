'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Compass, Minus, Move, Plus, RotateCcw } from 'lucide-react'
import locationsRaw from '@/data/map-locations.json'
import type { MapLocation } from '@/types'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ScenePoster, type PosterMotif } from '@/components/ui/ScenePoster'
import { Tabs } from '@/components/ui/Tabs'
import { useSectionReveal } from '@/hooks/useGSAP'
import { cn } from '@/lib/utils'

const locations = locationsRaw as MapLocation[]

type ViewMode = 'paradis' | 'marley' | 'world'

const VIEWS: Record<ViewMode, { scale: number; x: number; y: number }> = {
  paradis: { scale: 1.12, x: -10, y: 40 },
  marley: { scale: 1.45, x: -300, y: 20 },
  world: { scale: 1, x: 0, y: 0 },
}

const MOTIFS: Record<string, PosterMotif> = {
  Maria: 'wall',
  Rose: 'sky',
  Sina: 'map',
  Marley: 'rumbling',
  Beyond: 'wings',
}

const ROUTE = ['shiganshina', 'trost', 'stohess', 'liberio', 'fort-salta']

export function WorldMap() {
  const rootRef = useSectionReveal<HTMLDivElement>([])
  const [mode, setMode] = useState<ViewMode>('world')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [selected, setSelected] = useState<string>('shiganshina')
  const drag = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mapRef.current
    if (!el) return
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      setZoom((z) => Math.min(2.4, Math.max(0.9, +(z - event.deltaY * 0.0012).toFixed(3))))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const location = useMemo(
    () => locations.find((l) => l.id === selected) ?? locations[0],
    [selected]
  )

  const view = VIEWS[mode]
  const scale = view.scale * zoom

  const routePoints = useMemo(
    () =>
      ROUTE.map((id) => {
        const loc = locations.find((l) => l.id === id)
        return loc ? `${loc.position.x},${loc.position.y}` : null
      })
        .filter(Boolean)
        .join(' '),
    []
  )

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    setPan({
      x: drag.current.panX + (e.clientX - drag.current.startX),
      y: drag.current.panY + (e.clientY - drag.current.startY),
    })
  }

  const onPointerUp = () => {
    drag.current = null
  }

  return (
    <section id="lore" className="section-shell bg-ink-950">
      <div className="absolute inset-0 parchment-texture" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(212,165,116,0.09),transparent_60%)]" />
      <div className="noise-overlay" />

      <div ref={rootRef} className="container-aot relative">
        <SectionHeader
          eyebrow="Section 03 · The World"
          title="The World Map"
          titleJP="世界地図"
          subtitle="Three walls, one island, and a continent that spent a century calling everyone inside them devils. Drag to pan, zoom in, and open any district."
          accent="#D4A574"
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
          {/* ── map ── */}
          <div className="relative" data-reveal>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <Tabs<ViewMode>
                items={[
                  { id: 'paradis', label: 'Paradis', color: '#4A7C3F' },
                  { id: 'marley', label: 'Marley', color: '#9B3B2E' },
                  { id: 'world', label: 'Full World', color: '#D4A574' },
                ]}
                value={mode}
                onChange={(v) => {
                  setMode(v)
                  setZoom(1)
                  setPan({ x: 0, y: 0 })
                }}
                variant="pill"
                ariaLabel="Map view"
              />
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.9, +(z - 0.15).toFixed(2)))}
                  aria-label="Zoom out"
                  className="focus-ring grid h-9 w-9 place-items-center rounded border border-white/10 text-ash transition hover:border-white/30 hover:text-parchment"
                >
                  <Minus size={13} />
                </button>
                <span className="w-10 text-center font-mono text-[10px] text-smoke">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(2.4, +(z + 0.15).toFixed(2)))}
                  aria-label="Zoom in"
                  className="focus-ring grid h-9 w-9 place-items-center rounded border border-white/10 text-ash transition hover:border-white/30 hover:text-parchment"
                >
                  <Plus size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setZoom(1)
                    setPan({ x: 0, y: 0 })
                  }}
                  aria-label="Reset view"
                  className="focus-ring grid h-9 w-9 place-items-center rounded border border-white/10 text-ash transition hover:border-white/30 hover:text-parchment"
                >
                  <RotateCcw size={13} />
                </button>
              </div>
            </div>

            <div
              role="application"
              aria-label="Interactive world map of Paradis and Marley"
              className="relative aspect-[10/7] w-full cursor-grab touch-none overflow-hidden rounded-lg border border-white/10 bg-[#07141b] active:cursor-grabbing"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              ref={mapRef}
            >
              {/* ocean */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_35%,#123241_0%,#08161d_70%,#04090c_100%)]" />
              <div
                className="absolute inset-0"
                style={{
                  transform: `translate(${pan.x + view.x}px, ${pan.y + view.y}px) scale(${scale})`,
                  transformOrigin: '50% 45%',
                  transition: drag.current ? 'none' : 'transform 600ms cubic-bezier(0.16,1,0.3,1)',
                }}
              >
              <svg viewBox="0 0 1000 700" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
                <defs>
                  <radialGradient id="island-fill">
                    <stop offset="0%" stopColor="#3f4a33" />
                    <stop offset="100%" stopColor="#26301f" />
                  </radialGradient>
                  <pattern id="map-hatch" width="8" height="8" patternUnits="userSpaceOnUse">
                    <path d="M0 8 L8 0" stroke="#8a7a58" strokeWidth="0.5" opacity="0.25" />
                  </pattern>
                </defs>

                <g>
                  {/* Paradis */}
                  <circle cx="500" cy="340" r="272" fill="url(#island-fill)" stroke="#8a7a58" strokeWidth="2" />
                  <circle cx="500" cy="340" r="272" fill="url(#map-hatch)" />
                  <circle cx="500" cy="340" r="196" fill="none" stroke="#a2926d" strokeWidth="3" opacity="0.85" />
                  <circle cx="500" cy="340" r="134" fill="none" stroke="#a2926d" strokeWidth="3" opacity="0.9" />
                  <circle cx="500" cy="340" r="72" fill="none" stroke="#c0b08a" strokeWidth="3" />

                  {/* wall labels */}
                  <text x="500" y="152" textAnchor="middle" fill="#c0b08a" fontSize="11" fontFamily="monospace" letterSpacing="3" opacity="0.75">
                    WALL MARIA
                  </text>
                  <text x="500" y="214" textAnchor="middle" fill="#c0b08a" fontSize="10" fontFamily="monospace" letterSpacing="3" opacity="0.7">
                    WALL ROSE
                  </text>
                  <text x="500" y="276" textAnchor="middle" fill="#d8c9a8" fontSize="9" fontFamily="monospace" letterSpacing="3" opacity="0.7">
                    WALL SINA
                  </text>

                  {/* Marley */}
                  <path
                    d="M792 -20 L1020 -20 L1020 720 L846 720 Q 880 520 826 330 Q 800 150 792 -20 Z"
                    fill="#3a2f22"
                    stroke="#8a7a58"
                    strokeWidth="2"
                  />
                  <path
                    d="M792 -20 L1020 -20 L1020 720 L846 720 Q 880 520 826 330 Q 800 150 792 -20 Z"
                    fill="url(#map-hatch)"
                  />
                  <text x="905" y="360" textAnchor="middle" fill="#c9b48a" fontSize="12" fontFamily="monospace" letterSpacing="4" opacity="0.8">
                    MARLEY
                  </text>
                  <text x="500" y="352" textAnchor="middle" fill="#d8c9a8" fontSize="12" fontFamily="monospace" letterSpacing="5" opacity="0.55">
                    PARADIS
                  </text>

                  {/* sea route */}
                  <polyline
                    points={routePoints}
                    fill="none"
                    stroke="#D4A574"
                    strokeWidth="1.6"
                    strokeDasharray="5 8"
                    opacity="0.65"
                    className="route-path"
                  />

                  {/* compass */}
                  <g transform="translate(96 606)" opacity="0.65">
                    <circle r="34" fill="none" stroke="#c9b48a" strokeWidth="1" />
                    <path d="M0 -30 L7 0 L0 30 L-7 0 Z" fill="#c9b48a" opacity="0.8" />
                    <path d="M-30 0 L0 6 L30 0 L0 -6 Z" fill="#c9b48a" opacity="0.35" />
                    <text y="-42" textAnchor="middle" fill="#c9b48a" fontSize="10" fontFamily="monospace">
                      N
                    </text>
                  </g>
                  <g transform="translate(900 640)" opacity="0.5">
                    <path d="M0 0 h80" stroke="#c9b48a" strokeWidth="1" />
                    <path d="M0 -4 v8 M40 -3 v6 M80 -4 v8" stroke="#c9b48a" strokeWidth="1" />
                    <text x="0" y="-10" fill="#c9b48a" fontSize="8" fontFamily="monospace">
                      0
                    </text>
                    <text x="72" y="-10" fill="#c9b48a" fontSize="8" fontFamily="monospace">
                      100 km
                    </text>
                  </g>
                </g>
              </svg>
              </div>

              {/* pins (kept in a separate scaled layer so they stay clickable) */}
              <div
                className="absolute inset-0"
                style={{
                  transform: `translate(${pan.x + view.x}px, ${pan.y + view.y}px) scale(${scale})`,
                  transformOrigin: '50% 45%',
                  transition: drag.current ? 'none' : 'transform 600ms cubic-bezier(0.16,1,0.3,1)',
                }}
              >
                {locations.map((loc) => {
                  const isActive = loc.id === selected
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelected(loc.id)
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="focus-ring group absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center"
                      style={{ left: `${loc.position.x}%`, top: `${loc.position.y}%` }}
                      aria-label={`${loc.name} — open details`}
                      aria-pressed={isActive}
                    >
                      <span className="relative flex h-3 w-3 items-center justify-center">
                        <span
                          className="pin-ping absolute inline-flex h-3 w-3 rounded-full opacity-70"
                          style={{ backgroundColor: loc.accent }}
                        />
                        <span
                          className="relative inline-flex h-2 w-2 rounded-full ring-2 ring-black/40"
                          style={{ backgroundColor: loc.accent, boxShadow: `0 0 10px ${loc.accent}` }}
                        />
                      </span>
                      <span
                        className={cn(
                          'absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.16em] transition-opacity duration-200',
                          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        )}
                        style={{ color: loc.accent }}
                      >
                        {loc.name.replace(' District', '')}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded border border-white/10 bg-black/50 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.2em] text-parchment/50 backdrop-blur">
                <Move size={9} /> drag to pan · scroll to zoom
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
              {[
                ['#CC2200', 'Breach / battle'],
                ['#D4A574', 'Districts'],
                ['#4A7C3F', 'Paradis'],
                ['#9B3B2E', 'Marley'],
              ].map(([color, label]) => (
                <span key={label} className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-smoke">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* ── detail panel ── */}
          <div className="flex flex-col gap-4" data-reveal data-reveal-delay="0.1">
            <GlassCard padding="none" hover className="overflow-hidden">
              <div className="relative h-40">
                <ScenePoster
                  motif={MOTIFS[location.wall] ?? 'map'}
                  accent={location.accent}
                  showLabel={false}
                  seed={location.name.length * 13}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="flex items-center gap-2">
                    <Badge color={location.accent} dot>
                      Wall {location.wall}
                    </Badge>
                    <span className="font-jp text-[10px] tracking-[0.2em] text-parchment/50">
                      {location.nameJP}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-xl text-parchment">{location.name}</h3>
                </div>
              </div>

              <div className="p-4">
                <p className="text-[13px] leading-relaxed text-ash">{location.description}</p>

                <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.24em] text-smoke">
                  Recorded events
                </p>
                <ul className="mt-2 space-y-1.5">
                  {location.keyEvents.map((event) => (
                    <li key={event} className="flex items-start gap-2 text-[12px] text-parchment/75">
                      <span
                        className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                        style={{ backgroundColor: location.accent }}
                      />
                      {event}
                    </li>
                  ))}
                </ul>
              </div>
            </GlassCard>

            <div className="glass-card p-4">
              <div className="flex items-center gap-2">
                <Compass size={13} className="text-gold" />
                <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-smoke">
                  Fast travel
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {locations.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setSelected(loc.id)}
                    className={cn(
                      'focus-ring rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] transition',
                      loc.id === selected
                        ? 'border-primary-light/70 bg-primary/25 text-parchment'
                        : 'border-white/10 text-smoke hover:border-white/30 hover:text-ash'
                    )}
                  >
                    {loc.name.replace(' District', '')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
