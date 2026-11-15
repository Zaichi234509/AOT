'use client'

import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, Music, Play } from 'lucide-react'
import soundtrackRaw from '@/data/soundtrack.json'
import type { Track } from '@/types/scene'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { AudioPlayer } from '@/components/ui/AudioPlayer'
import { ScenePoster } from '@/components/ui/ScenePoster'
import { Badge } from '@/components/ui/Badge'
import { useSectionReveal } from '@/hooks/useGSAP'
import { cn } from '@/lib/utils'

const tracks = soundtrackRaw as Track[]

export function SoundtrackPlayer() {
  const rootRef = useSectionReveal<HTMLDivElement>([])
  const [trackId, setTrackId] = useState(tracks[0].id)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  const track = useMemo(() => tracks.find((t) => t.id === trackId) ?? tracks[0], [trackId])

  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      setProgress((prev) => {
        const next = prev + 0.25 / track.seconds
        if (next >= 1) {
          window.setTimeout(() => setPlaying(false), 0)
          return 1
        }
        return next
      })
    }, 250)
    return () => window.clearInterval(id)
  }, [playing, track.seconds])

  const selectTrack = (id: string) => {
    setTrackId(id)
    setProgress(0)
    setPlaying(true)
  }

  return (
    <section id="music" className="section-shell bg-ink-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_10%,rgba(155,123,184,0.1),transparent_55%)]" />
      <div className="noise-overlay" />

      <div ref={rootRef} className="container-aot relative">
        <SectionHeader
          eyebrow="Section 08 · The Score"
          title="The Sound of War"
          titleJP="戦争の音"
          subtitle="Hiroyuki Sawano's brass, choirs and broken pianos did as much for this story as any blade. Ten tracks, one archive."
          accent="#9B7BB8"
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.05fr_1fr]" data-reveal>
          {/* now playing */}
          <div className="glass-card overflow-hidden">
            <div className="relative h-56 md:h-64">
              <ScenePoster
                motif="wings"
                accent={track.accent}
                showLabel={false}
                seed={track.title.length * 11}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.2em] text-parchment/80 backdrop-blur">
                    <Music size={9} /> {track.type}
                  </span>
                  <Badge color={track.accent}>Season {track.season}</Badge>
                </div>
                <h3 className="mt-3 font-display text-2xl text-parchment md:text-3xl">{track.title}</h3>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ash">
                  {track.artist} · {track.duration}
                </p>
                <p className="mt-2 text-[11px] text-parchment/50">Featured in: {track.scene}</p>
              </div>
            </div>

            <div className="p-4">
              <AudioPlayer
                track={track}
                playing={playing}
                progress={progress}
                onToggle={() => {
                  if (progress >= 1) setProgress(0)
                  setPlaying(!playing)
                }}
                onSeek={(ratio) => setProgress(ratio)}
                onReset={() => {
                  setProgress(0)
                  setPlaying(false)
                }}
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-smoke">
                  Preview transport · no audio is streamed
                </p>
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(track.searchQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ash transition hover:text-primary-light"
                >
                  Listen officially <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>

          {/* track list */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-smoke">Track list</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-smoke">{tracks.length} tracks</p>
            </div>
            <ul className="max-h-[430px] divide-y divide-white/[0.05] overflow-y-auto">
              {tracks.map((t, i) => {
                const isActive = t.id === track.id
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => selectTrack(t.id)}
                      className={cn(
                        'focus-ring group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                        isActive ? 'bg-white/[0.05]' : 'hover:bg-white/[0.03]'
                      )}
                      aria-pressed={isActive}
                    >
                      <span className="w-5 shrink-0 font-mono text-[10px] text-smoke">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-colors"
                        style={{
                          borderColor: isActive ? `${t.accent}aa` : 'rgba(255,255,255,0.12)',
                          color: isActive ? t.accent : '#666058',
                        }}
                      >
                        {isActive && playing ? (
                          <span className="flex items-end gap-[2px]" aria-hidden>
                            {[0, 1, 2].map((b) => (
                              <span
                                key={b}
                                className="w-[2px] rounded-sm"
                                style={{
                                  backgroundColor: t.accent,
                                  height: 4,
                                  animation: `bar-dance ${520 + b * 110}ms ease-in-out infinite`,
                                }}
                              />
                            ))}
                          </span>
                        ) : (
                          <Play size={10} className="translate-x-[1px]" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            'block truncate font-body text-[13px] transition-colors',
                            isActive ? 'text-parchment' : 'text-parchment/80 group-hover:text-parchment'
                          )}
                        >
                          {t.title}
                        </span>
                        <span className="block truncate font-mono text-[9px] uppercase tracking-[0.14em] text-smoke">
                          {t.artist} · {t.type}
                        </span>
                      </span>
                      <span className="shrink-0 font-mono text-[9px] text-smoke">{t.duration}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3" data-reveal>
          {[
            ['Composer', 'Hiroyuki Sawano', 'The orchestral spine of the series.'],
            ['Opening themes', 'Linked Horizon', 'Revo’s three anthems for the walls.'],
            ['Final Season', 'SiM · Higuchi Ai', 'The Rumbling and Akuma no Ko.'],
          ].map(([label, name, note]) => (
            <div key={label} className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-smoke">{label}</p>
              <p className="mt-1 font-display text-sm text-parchment">{name}</p>
              <p className="mt-1 text-[11px] text-ash">{note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
