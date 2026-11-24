import Link from 'next/link'
import { Github, Heart, MessageCircle, Tv } from 'lucide-react'
import { WingsLogo } from '@/components/ui/WingsLogo'

const columns = [
  {
    title: 'Navigation',
    links: [
      { label: 'Home', href: '#hero' },
      { label: 'Characters', href: '#characters' },
      { label: 'Episodes', href: '#episodes' },
      { label: 'Music', href: '#music' },
    ],
  },
  {
    title: 'Lore',
    links: [
      { label: 'The Walls', href: '#lore' },
      { label: 'The Titans', href: '#titans' },
      { label: 'Timeline', href: '#timeline' },
      { label: 'World Map', href: '#lore' },
    ],
  },
]

const community = [
  { label: 'Discord', href: 'https://discord.com', icon: MessageCircle },
  { label: 'Twitter / X', href: 'https://x.com', icon: Heart },
  { label: 'Reddit', href: 'https://www.reddit.com/r/ShingekiNoKyojin/', icon: MessageCircle },
  { label: 'MyAnimeList', href: 'https://myanimelist.net/anime/16498/Shingeki_no_Kyojin', icon: Tv },
]

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.07] bg-ink-950">
      <div className="noise-overlay" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(45,90,39,0.12),transparent_60%)]" />

      <div className="relative mx-auto max-w-[1280px] px-6 pb-10 pt-16 md:px-8 md:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          <div>
            <div className="flex items-center gap-3">
              <WingsLogo size={34} className="text-parchment/85" title="Wings of Freedom" />
              <div>
                <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-parchment">
                  AoT Archive
                </p>
                <p className="font-jp text-[10px] tracking-[0.3em] text-smoke">進撃の巨人</p>
              </div>
            </div>
            <p className="mt-6 max-w-xs font-display text-lg italic leading-relaxed text-ash">
              “Shinzou wo Sasageyo.”
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-smoke">
              心臓を捧げよ · Dedicate your hearts
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-smoke">{col.title}</p>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="focus-ring font-body text-[13px] text-ash transition-colors hover:text-primary-light"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-smoke">Community</p>
            <ul className="mt-5 space-y-3">
              {community.map((link) => {
                const Icon = link.icon
                return (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-ring group flex items-center gap-2.5 font-body text-[13px] text-ash transition-colors hover:text-primary-light"
                    >
                      <Icon size={13} className="text-smoke group-hover:text-primary-light" />
                      {link.label}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <div className="mt-14 h-px w-full bg-white/[0.07]" />

        <div className="mt-6 flex flex-col gap-3 text-[11px] leading-relaxed text-smoke md:flex-row md:items-center md:justify-between">
          <p>© 2024 AoT Archive — Fan Project</p>
          <p>Attack on Titan © Hajime Isayama / Kodansha</p>
          <p>This is a non-commercial fan-made website.</p>
        </div>

        <p className="mt-3 max-w-4xl text-[10px] leading-relaxed text-smoke/60">
          3D models: Prime Slayer3D, Kenny3D89, fectur.SEROD, Sidaivan,
          stevendwisetya and Khaled.Guesmi — CC BY 4.0.{' '}
          <a
            href="https://github.com/Zaichi234509/AOT/blob/main/public/models/README.md"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-smoke/30 underline-offset-2 transition hover:text-parchment"
          >
            Model credits
          </a>
        </p>

        <div className="mt-6 flex items-center justify-between">
          <a
            href="https://github.com/Zaichi234509/AOT"
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-smoke transition hover:text-parchment"
          >
            <Github size={12} /> Source
          </a>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-smoke/70">
            Built with Next.js + React Three Fiber
          </p>
        </div>
      </div>
    </footer>
  )
}
