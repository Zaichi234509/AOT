'use client'

import { ArrowUpRight, MessageCircle, Palette, Radio, Tv } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { WingsLogo } from '@/components/ui/WingsLogo'
import { LinkButton } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { ScenePoster } from '@/components/ui/ScenePoster'
import { useSectionReveal } from '@/hooks/useGSAP'

const socials = [
  { label: 'Discord', handle: 'Join the server', href: 'https://discord.com', icon: MessageCircle, note: 'Watch parties, theories and ODM drills.' },
  { label: 'Twitter / X', handle: '@aotarchive', href: 'https://x.com', icon: Radio, note: 'Screenshots, release notes and polls.' },
  { label: 'Reddit', handle: 'r/ShingekiNoKyojin', href: 'https://www.reddit.com/r/ShingekiNoKyojin/', icon: MessageCircle, note: 'Chapter readers and anime-only refugees.' },
  { label: 'MyAnimeList', handle: 'Attack on Titan', href: 'https://myanimelist.net/anime/16498/Shingeki_no_Kyojin', icon: Tv, note: 'Ratings, reviews and episode scores.' },
]

export function Community() {
  const rootRef = useSectionReveal<HTMLDivElement>([])

  return (
    <section id="community" className="relative overflow-hidden bg-ink-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(45,90,39,0.18),transparent_60%)]" />
      <div className="noise-overlay" />

      <div ref={rootRef} className="relative mx-auto max-w-[1280px] px-6 pb-8 pt-24 md:px-8 md:pt-32">
        <SectionHeader
          eyebrow="Section 10 · The Ranks"
          title="Community"
          titleJP="コミュニティ"
          subtitle="The story ends. The argument doesn't. Find the people still reading, still watching and still picking a side."
          accent="#4A7C3F"
        />

        <div className="mt-14 grid gap-4 lg:grid-cols-3" data-reveal>
          {/* Discord */}
          <GlassCard hover className="flex h-full flex-col">
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-primary-light/40 bg-primary/20 text-primary-light">
                <MessageCircle size={17} />
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-smoke">Live hub</span>
            </div>
            <h3 className="mt-5 font-display text-xl text-parchment">Discord</h3>
            <p className="mt-2 flex-1 text-[13px] leading-relaxed text-ash">
              Weekly rewatch threads, a channel for every arc, and an argument about the ending that
              has been running since 2021.
            </p>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring mt-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary-light transition hover:text-parchment"
            >
              Join server <ArrowUpRight size={12} />
            </a>
          </GlassCard>

          {/* Social */}
          <GlassCard hover className="flex h-full flex-col">
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-skyblue/40 bg-skyblue/10 text-skyblue">
                <Radio size={17} />
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-smoke">Feeds</span>
            </div>
            <h3 className="mt-5 font-display text-xl text-parchment">Social</h3>
            <ul className="mt-2 flex-1 space-y-2.5">
              {socials.slice(1).map((social) => {
                const Icon = social.icon
                return (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-ring group flex items-start gap-2.5"
                    >
                      <Icon size={12} className="mt-1 shrink-0 text-smoke group-hover:text-skyblue" />
                      <span>
                        <span className="block font-body text-[12.5px] text-parchment/85 group-hover:text-parchment">
                          {social.label} · {social.handle}
                        </span>
                        <span className="block text-[11px] text-smoke">{social.note}</span>
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </GlassCard>

          {/* Fan art */}
          <GlassCard hover padding="none" className="flex h-full flex-col">
            <div className="relative h-36">
              <ScenePoster motif="wings" accent="#9B7BB8" showLabel={false} seed={31} />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900 to-transparent" />
              <span className="absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-[#9B7BB8]/50 bg-black/40 text-[#9B7BB8]">
                <Palette size={15} />
              </span>
            </div>
            <div className="flex flex-1 flex-col p-5 pt-2">
              <h3 className="font-display text-xl text-parchment">Fan Art</h3>
              <p className="mt-2 flex-1 text-[13px] leading-relaxed text-ash">
                Submit a plate to the archive. Selected pieces are credited and featured in the
                gallery — ODM gear optional.
              </p>
              <a
                href="https://github.com/Zaichi234509/AOT/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring mt-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#9B7BB8] transition hover:text-parchment"
              >
                Submit your art <ArrowUpRight size={12} />
              </a>
            </div>
          </GlassCard>
        </div>

        {/* Big CTA */}
        <div className="relative mt-6 overflow-hidden rounded-xl border border-primary/40 bg-gradient-to-br from-primary/25 via-ink-850 to-ink-950 p-8 md:p-12" data-reveal>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(74,124,63,0.35),transparent_60%)]" />
          <div className="absolute -right-10 -top-10 opacity-[0.07]">
            <WingsLogo size={320} className="text-parchment" />
          </div>
          <div className="relative max-w-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-primary-light">
              Enlistment open
            </p>
            <h3 className="mt-4 font-display text-2xl leading-tight text-parchment md:text-4xl">
              Dedicate your heart — join the Survey Corps.
            </h3>
            <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-ash">
              No XP required. Bring a theory, a favourite death scene, or just a willingness to
              argue about whether the Rumbling was inevitable.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="https://discord.com" external size="md">
                Join the community
              </LinkButton>
              <LinkButton
                href="https://github.com/Zaichi234509/AOT"
                external
                size="md"
                variant="outline"
              >
                View the source
              </LinkButton>
            </div>
          </div>
        </div>
      </div>

      {/* marquee */}
      <div className="relative mt-16 overflow-hidden border-y border-white/[0.07] py-4">
        <div className="marquee-track">
          {[0, 1].map((group) => (
            <div key={group} className="flex shrink-0 items-center">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="flex items-center">
                  <span className="whitespace-nowrap px-6 font-display text-sm uppercase tracking-[0.3em] text-parchment/25">
                    心臓を捧げよ · Shinzou wo Sasageyo
                  </span>
                  <span className="h-1 w-1 rotate-45 bg-primary-light/50" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
