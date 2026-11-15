import Link from 'next/link'
import { WingsLogo } from '@/components/ui/WingsLogo'

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink-950 px-6 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(204,34,0,0.12),transparent_60%)]" />
      <div className="absolute inset-0 noise-overlay" />

      <div className="relative">
        <WingsLogo size={72} className="mx-auto text-parchment/70" />
        <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.4em] text-secondary-light">
          Wall breach detected
        </p>
        <h1 className="mt-4 font-display text-5xl font-black text-parchment md:text-7xl">404</h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-ash">
          This page was eaten by a titan, flattened by the Rumbling, or simply never existed. The
          archive is still standing, though.
        </p>
        <p className="font-jp mt-3 text-[11px] tracking-[0.3em] text-smoke">道に迷ったか</p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="focus-ring inline-flex items-center justify-center rounded-md border border-primary-light/60 bg-primary px-6 py-3 font-body text-xs uppercase tracking-wide text-parchment transition hover:bg-primary-light"
          >
            Return to the walls
          </Link>
          <Link
            href="/#characters"
            className="focus-ring inline-flex items-center justify-center rounded-md border border-white/20 px-6 py-3 font-body text-xs uppercase tracking-wide text-ash transition hover:border-primary-light hover:text-parchment"
          >
            Character archive
          </Link>
        </div>
      </div>
    </main>
  )
}
