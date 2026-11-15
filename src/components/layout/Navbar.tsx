'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, Volume2, VolumeX, X } from 'lucide-react'
import { NAV_LINKS } from '@/lib/constants'
import { useStore } from '@/store/useStore'
import { WingsLogo } from '@/components/ui/WingsLogo'
import { cn } from '@/lib/utils'
import { getLenisInstance } from '@/lib/smooth-scroll'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeHash, setActiveHash] = useState('#hero')
  const navOpen = useStore((s) => s.navOpen)
  const setNavOpen = useStore((s) => s.setNavOpen)
  const soundOn = useStore((s) => s.soundOn)
  const toggleSound = useStore((s) => s.toggleSound)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.6)
      const stage = document.getElementById('stage-track')
      const past3D = stage ? window.scrollY > stage.offsetTop + stage.offsetHeight - window.innerHeight : true
      if (!past3D) {
        setActiveHash('#hero')
        return
      }
      const sections = NAV_LINKS.filter((l) => l.href !== '#hero')
      let current = '#lore'
      for (const link of sections) {
        const el = document.querySelector(link.href)
        if (!el) continue
        const top = (el as HTMLElement).getBoundingClientRect().top
        if (top <= 160) current = link.href
      }
      setActiveHash(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!navOpen) return
    getLenisInstance()?.stop()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNavOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      getLenisInstance()?.start()
    }
  }, [navOpen, setNavOpen])

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-[100] transition-all duration-500 ease-out-expo',
          scrolled || navOpen
            ? 'border-b border-white/[0.07] bg-ink-950/90 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent'
        )}
      >
        <div className="mx-auto flex h-[60px] max-w-[1400px] items-center justify-between gap-4 px-4 md:h-[72px] md:px-8">
          <Link
            href="#hero"
            className="focus-ring group flex items-center gap-3"
            aria-label="AoT Archive — back to top"
          >
            <WingsLogo
              size={26}
              className="text-parchment/90 transition-colors group-hover:text-primary-light"
            />
            <span className="font-display text-[13px] font-bold uppercase tracking-[0.18em] text-parchment md:text-sm">
              AoT <span className="text-primary-light">Archive</span>
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => {
              const active = activeHash === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'focus-ring group relative px-3 py-2 font-body text-[13px] transition-colors duration-300',
                    active ? 'text-primary-light' : 'text-ash hover:text-parchment'
                  )}
                >
                  {link.label}
                  <span
                    aria-hidden
                    className={cn(
                      'absolute inset-x-3 bottom-0 h-px origin-left bg-primary-light transition-transform duration-300 ease-out-expo',
                      active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    )}
                  />
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={soundOn}
              aria-label={soundOn ? 'Mute ambient sound' : 'Enable ambient sound'}
              title={soundOn ? 'Mute ambience' : 'Enable ambience'}
              className="focus-ring grid h-10 w-10 place-items-center rounded-full text-ash transition hover:bg-white/5 hover:text-parchment"
            >
              {soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
            </button>
            <button
              type="button"
              onClick={() => setNavOpen(!navOpen)}
              aria-expanded={navOpen}
              aria-controls="mobile-nav"
              aria-label={navOpen ? 'Close menu' : 'Open menu'}
              className="focus-ring grid h-10 w-10 place-items-center rounded-full text-parchment transition hover:bg-white/5 lg:hidden"
            >
              {navOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        id="mobile-nav"
        aria-hidden={!navOpen}
        className={cn(
          'fixed inset-0 z-[99] flex flex-col justify-center bg-ink-950/97 px-8 backdrop-blur-2xl transition-all duration-500 ease-out-expo lg:hidden',
          navOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div className="noise-overlay" />
        <nav aria-label="Mobile" className="relative flex flex-col gap-1">
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setNavOpen(false)}
              className="focus-ring group flex items-baseline justify-between border-b border-white/[0.06] py-4"
              style={{
                transform: navOpen ? 'translateY(0)' : 'translateY(18px)',
                opacity: navOpen ? 1 : 0,
                transition: `all 500ms cubic-bezier(0.16,1,0.3,1) ${navOpen ? i * 45 + 80 : 0}ms`,
              }}
            >
              <span className="font-display text-2xl text-parchment group-hover:text-primary-light">
                {link.label}
              </span>
              <span className="font-mono text-[10px] tracking-[0.2em] text-smoke">
                0{i + 1}
              </span>
            </Link>
          ))}
        </nav>
        <p className="font-jp relative mt-10 text-xs tracking-[0.3em] text-smoke">心臓を捧げよ</p>
      </div>
    </>
  )
}
