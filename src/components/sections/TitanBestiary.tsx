'use client'

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { ChevronLeft, ChevronRight, ShieldAlert, Swords } from 'lucide-react'
import titansRaw from '@/data/titans.json'
import pureRaw from '@/data/pure-titans.json'
import type { Titan, PureTitanClass } from '@/types/titan'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { Tabs } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import { GlassCard } from '@/components/ui/GlassCard'
import { Modal } from '@/components/ui/Modal'
import { useSectionReveal } from '@/hooks/useGSAP'
import { getLenisInstance } from '@/lib/smooth-scroll'
import { cn, padIndex, prefersReducedMotion } from '@/lib/utils'

const titans = titansRaw as Titan[]
const pureTitans = pureRaw as PureTitanClass[]

type Tab = 'nine' | 'pure'

const THREAT_COLOR: Record<PureTitanClass['threat'], string> = {
  Low: '#7A8C6A',
  Moderate: '#B08A3E',
  High: '#D4874A',
  Extreme: '#CC2200',
}

const SIZE_SCALE = [
  { label: 'Human', metres: 1.7, accent: '#A09888' },
  { label: 'Cart', metres: 4, accent: '#7A8C6A' },
  { label: 'Jaw', metres: 5, accent: '#D4874A' },
  { label: 'Female', metres: 14, accent: '#9B7BB8' },
  { label: 'Attack', metres: 15, accent: '#4A7C3F' },
  { label: 'Beast', metres: 17, accent: '#B08A3E' },
  { label: 'Colossal', metres: 60, accent: '#CC2200' },
]

type MoveKind = 'prev' | 'next' | 'first' | 'last'
type MoveSource = 'key' | 'button'
type CarouselApi = {
  /** Moves the carousel and returns the index it landed on. */
  move: (kind: MoveKind, source: MoveSource, focusSlide?: boolean) => number
  /** Re-measures and re-clamps after the slide list or the layout changed. */
  refresh: () => void
}

const clampNumber = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/**
 * The Nine Titans rail as a carousel: one native scroll container (scroll-snap,
 * touch momentum) plus wheel-to-horizontal, mouse drag, arrow keys, prev/next
 * and a progress rail. Every measurement is read from the DOM.
 */
function TitanCarousel({ titans, onOpen }: { titans: Titan[]; onOpen: (id: string) => void }) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const barRef = useRef<HTMLSpanElement | null>(null)
  const apiRef = useRef<CarouselApi | null>(null)
  const trackId = useId()
  const count = titans.length
  const listKey = titans.map((titan) => titan.id).join('|')

  const [ui, setUi] = useState({ index: 0, canPrev: false, canNext: count > 1 })
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    // ── measurements ────────────────────────────────────────────────
    // stops[i] is the scrollLeft that puts slide i on the snap line; slides
    // that cannot reach it (the last screenful) share the final stop, `limit`.
    let slides: HTMLElement[] = []
    let stops: number[] = []
    let limit = 0
    let step = 0
    let firstEnd = 0
    let visible = 1

    const measure = () => {
      slides = Array.from(el.children) as HTMLElement[]
      const gutter = slides.length ? slides[0].offsetLeft : 0
      const raw = slides.map((slide) => slide.offsetLeft - gutter)
      const max = Math.max(0, el.scrollWidth - el.clientWidth)
      limit = raw.length ? clampNumber(raw[raw.length - 1], 0, max) : 0
      stops = raw.map((value) => Math.min(value, limit))
      step = raw.length > 1 ? raw[1] - raw[0] : el.clientWidth
      firstEnd = Math.max(0, stops.findIndex((value) => value >= limit - 1))
      // Progress bar length = the share of the track that is in view.
      visible = el.scrollWidth > 0 ? Math.min(1, el.clientWidth / el.scrollWidth) : 1
      if (barRef.current) barRef.current.style.width = `${(visible * 100).toFixed(3)}%`
    }

    const nearestStop = (x: number) =>
      stops.reduce((best, value) => (Math.abs(value - x) < Math.abs(best - x) ? value : best), stops[0] ?? 0)

    // ── read-out, arrows and progress bar ───────────────────────────
    let index = 0
    let held = false // index is pinned while a prev/next/keyboard scroll is in flight
    let holdTimer = 0

    const sync = () => {
      const total = stops.length
      const x = clampNumber(el.scrollLeft, 0, limit)

      // Bar offset = scrollLeft / (scrollWidth - clientWidth), as a share of
      // the room left over beside the bar (translate % is relative to the bar).
      const bar = barRef.current
      if (bar) {
        const ratio = limit > 0 ? x / limit : 0
        bar.style.transform = `translateX(${(ratio * ((1 - visible) / visible) * 100).toFixed(3)}%)`
      }

      if (!held && total) {
        let best = 0
        for (let i = 1; i < total; i++) {
          if (Math.abs(stops[i] - x) < Math.abs(stops[best] - x)) best = i
        }
        // On the final stop several slides are in view: keep a keyboard-chosen
        // one, otherwise report the last.
        index = best >= firstEnd ? (index >= firstEnd ? index : total - 1) : best
      }
      index = clampNumber(index, 0, Math.max(0, total - 1))

      const canPrev = x > 1
      const canNext = x < limit - 1
      setUi((prev) =>
        prev.index === index && prev.canPrev === canPrev && prev.canNext === canNext
          ? prev
          : { index, canPrev, canNext }
      )
    }

    const release = () => {
      window.clearTimeout(holdTimer)
      if (!held) return
      held = false
      sync()
    }
    // Released on arrival at the chosen slide's stop, when the user grabs the
    // track, or — if the scroll never gets there — after a quiet spell.
    const hold = () => {
      held = true
      window.clearTimeout(holdTimer)
      holdTimer = window.setTimeout(release, 1200)
    }
    const arrived = () => Math.abs(el.scrollLeft - (stops[index] ?? 0)) <= 1.5
    const onScroll = () => {
      if (held) {
        if (arrived()) release()
        else hold()
      }
      sync()
    }

    // ── glide: wheel and mouse drag drive scrollLeft directly ───────
    // While `data-gliding` is set the CSS drops snap + smooth behaviour so the
    // track follows the input 1:1; once the input goes quiet it eases onto a
    // stop and hands control back to native scroll-snap.
    let gliding = false
    let settling = false
    let pos = 0
    let target = 0
    let from = 0
    let raf = 0
    let lastFrame = 0
    let idleTimer = 0
    let fresh = false // the glide started from rest

    const stopGlide = () => {
      window.clearTimeout(idleTimer)
      cancelAnimationFrame(raf)
      raf = 0
      if (!gliding) return
      gliding = false
      settling = false
      el.removeAttribute('data-gliding')
    }

    const beginGlide = () => {
      if (gliding) return
      held = false
      window.clearTimeout(holdTimer)
      gliding = true
      settling = false
      fresh = true
      pos = target = from = el.scrollLeft
      el.setAttribute('data-gliding', '')
    }

    const tick = (now: number) => {
      raf = 0
      const dt = lastFrame ? clampNumber(now - lastFrame, 1, 250) : 16.7
      lastFrame = now
      pos += (target - pos) * (1 - Math.pow(0.82, dt / 16.7))
      if (Math.abs(target - pos) < 0.5) pos = target
      el.scrollLeft = pos
      if (pos !== target) raf = requestAnimationFrame(tick)
      else if (settling) stopGlide()
    }

    const run = () => {
      if (prefersReducedMotion()) {
        pos = target
        el.scrollLeft = pos
        if (settling) stopGlide()
        return
      }
      if (raf) return
      lastFrame = 0
      raf = requestAnimationFrame(tick)
    }

    // Pick the resting stop, rounding with a bias in the direction of travel.
    // `commit` guarantees at least one card for any deliberate movement, so a
    // single wheel notch always advances whatever its delta is.
    const settle = (commit: boolean) => {
      if (!gliding) return
      const travel = target - from
      const moved = Math.abs(travel) >= 3
      let stop = nearestStop(moved ? target + Math.sign(travel) * step * 0.4 : from)
      if (commit && moved) {
        if (travel > 0 && stop < from + 1) stop = stops.find((value) => value > from + 1) ?? limit
        if (travel < 0 && stop > from - 1) {
          stop = stops.reduce((best, value) => (value < from - 1 ? value : best), 0)
        }
      }
      target = stop
      settling = true
      run()
    }

    const push = (delta: number) => {
      beginGlide()
      if (settling) {
        // More input before the last glide landed: carry on from its stop.
        from = target
        settling = false
        fresh = false
      }
      target = clampNumber(target + delta, 0, limit)
      window.clearTimeout(idleTimer)
      idleTimer = window.setTimeout(() => settle(fresh), 120)
      run()
    }

    // ── wheel → horizontal ──────────────────────────────────────────
    // A wheel gesture belongs to the rail only if it started over it, so a page
    // scroll already in flight is not hijacked when the rail passes under the
    // pointer.
    let lastWheelAt = -Infinity
    let owned = false

    const onWindowWheel = (event: WheelEvent) => {
      if (event.timeStamp - lastWheelAt > 180) {
        owned = event.target instanceof Node && el.contains(event.target)
      }
      lastWheelAt = event.timeStamp
    }

    // The track opts out of Lenis (data-lenis-prevent-wheel), so when the rail
    // has nothing left to give, hand the delta to Lenis ourselves to keep the
    // page's smooth scroll. Without Lenis (reduced motion) the untouched event
    // simply scrolls the page natively.
    const scrollPage = (event: WheelEvent, delta: number) => {
      const lenis = getLenisInstance()
      if (!lenis || lenis.isStopped) return
      event.preventDefault()
      lenis.scrollTo(lenis.targetScroll + delta * lenis.options.wheelMultiplier, {
        programmatic: false,
        lerp: lenis.options.lerp,
        duration: lenis.options.duration,
        easing: lenis.options.easing,
      })
    }

    const onWheel = (event: WheelEvent) => {
      if (event.defaultPrevented || event.ctrlKey) return
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        // Sideways trackpad swipe: native horizontal scroll + snap handles it.
        stopGlide()
        release()
        return
      }
      const unit = event.deltaMode === 1 ? 100 / 6 : event.deltaMode === 2 ? window.innerHeight : 1
      const delta = event.deltaY * unit
      if (!delta) return

      const x = gliding ? pos : el.scrollLeft
      const canMove = delta < 0 ? x > 1 : x < limit - 1
      if (!owned || !canMove) {
        scrollPage(event, delta)
        return
      }
      event.preventDefault()
      push(delta)
    }

    // ── mouse drag (touch and pen keep native momentum scrolling) ───
    let drag: { x: number; start: number; moved: boolean } | null = null
    let suppressClick = false

    const onPointerMove = (event: PointerEvent) => {
      if (!drag) return
      if (!drag.moved) {
        if (Math.abs(event.clientX - drag.x) < 6) return
        window.clearTimeout(idleTimer)
        cancelAnimationFrame(raf)
        raf = 0
        beginGlide()
        if (settling) {
          from = target
          settling = false
        }
        drag = { x: event.clientX, start: pos, moved: true }
        el.setAttribute('data-dragging', '')
        return
      }
      pos = target = clampNumber(drag.start - (event.clientX - drag.x), 0, limit)
      el.scrollLeft = pos
    }

    const endDrag = () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', endDrag)
      window.removeEventListener('pointercancel', endDrag)
      const finished = drag
      drag = null
      if (!finished?.moved) return
      el.removeAttribute('data-dragging')
      suppressClick = true
      window.setTimeout(() => {
        suppressClick = false
      }, 0)
      settle(false)
    }

    const onPointerDown = (event: PointerEvent) => {
      release()
      if (event.pointerType !== 'mouse' || event.button !== 0 || limit <= 0) return
      drag = { x: event.clientX, start: 0, moved: false }
      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', endDrag)
      window.addEventListener('pointercancel', endDrag)
    }

    // A drag that ends on a card must not open its modal.
    const onClickCapture = (event: MouseEvent) => {
      if (!suppressClick) return
      suppressClick = false
      event.preventDefault()
      event.stopPropagation()
    }
    const onDragStart = (event: DragEvent) => event.preventDefault()

    // ── prev / next / keyboard ──────────────────────────────────────
    let moving = false

    const go = (next: number, source: MoveSource, focusSlide = false) => {
      stopGlide()
      index = next
      hold()
      moving = true
      if (focusSlide) slides[next].querySelector('button')?.focus({ preventScroll: true })
      moving = false
      if (source === 'key') slides[next].scrollIntoView({ inline: 'start', block: 'nearest' })
      else el.scrollTo({ left: stops[next] })
      if (arrived()) release()
      else sync()
      return next
    }

    const move: CarouselApi['move'] = (kind, source, focusSlide = false) => {
      const total = slides.length
      if (!total) return 0

      let next: number
      if (kind === 'first') next = 0
      else if (kind === 'last') next = total - 1
      else if (source === 'key') next = index + (kind === 'next' ? 1 : -1)
      // Buttons travel one scroll stop: the final stop counts as the last slide.
      else if (kind === 'next') next = index + 1 >= firstEnd ? total - 1 : index + 1
      else next = Math.min(index, firstEnd) - 1

      return go(clampNumber(next, 0, total - 1), source, focusSlide)
    }

    // Tabbing onto a card that is cut off by the edge: mandatory snap cancels
    // the browser's own minimal reveal, so bring that slide to the snap line.
    const onFocusIn = (event: FocusEvent) => {
      const focused = event.target
      if (moving || !(focused instanceof HTMLElement) || focused === el) return
      if (!focused.matches(':focus-visible')) return
      const at = slides.findIndex((slide) => slide.contains(focused))
      if (at < 0) return
      const view = el.getBoundingClientRect()
      const rect = slides[at].getBoundingClientRect()
      const gutter = slides[0].offsetLeft
      if (rect.left < view.left + gutter - 1 || rect.right > view.right - gutter + 1) {
        go(at, 'key')
      } else if (at >= firstEnd && el.scrollLeft >= limit - 1) {
        // Already in view on the final stop: let the read-out follow focus.
        index = at
        sync()
      }
    }

    const refresh = () => {
      stopGlide()
      measure()
      if (el.scrollLeft > limit) el.scrollTo({ left: limit, behavior: 'instant' })
      if (limit <= 0) index = 0 // everything fits: nothing is "ahead" any more
      sync()
    }

    apiRef.current = { move, refresh }
    refresh()

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('scroll', onScroll, { passive: true })
    el.addEventListener('scrollend', onScroll)
    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('click', onClickCapture, true)
    el.addEventListener('dragstart', onDragStart)
    el.addEventListener('focusin', onFocusIn)
    window.addEventListener('wheel', onWindowWheel, { capture: true, passive: true })
    window.addEventListener('resize', refresh)
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(refresh) : null
    observer?.observe(el)

    return () => {
      apiRef.current = null
      stopGlide()
      endDrag()
      window.clearTimeout(holdTimer)
      el.removeAttribute('data-dragging')
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('scrollend', onScroll)
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('click', onClickCapture, true)
      el.removeEventListener('dragstart', onDragStart)
      el.removeEventListener('focusin', onFocusIn)
      window.removeEventListener('wheel', onWindowWheel, { capture: true })
      window.removeEventListener('resize', refresh)
      observer?.disconnect()
    }
  }, [])

  // Search results changed: re-measure and re-clamp the scroll position.
  useEffect(() => {
    apiRef.current?.refresh()
  }, [listKey])

  const move = (kind: MoveKind, source: MoveSource, focusSlide = false) => {
    const landed = apiRef.current?.move(kind, source, focusSlide)
    // Moving focus onto a card already announces it.
    if (landed === undefined || focusSlide) return
    const titan = titans[landed]
    if (titan) setAnnouncement(`${titan.name}, ${landed + 1} of ${count}`)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    const kind: MoveKind | null =
      event.key === 'ArrowLeft'
        ? 'prev'
        : event.key === 'ArrowRight'
          ? 'next'
          : event.key === 'Home'
            ? 'first'
            : event.key === 'End'
              ? 'last'
              : null
    if (!kind) return
    event.preventDefault()
    move(kind, 'key', event.target !== event.currentTarget)
  }

  const arrowClass =
    'focus-ring grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/50 text-parchment/80 backdrop-blur transition-colors duration-300 hover:border-[#CC2200]/70 hover:text-parchment'
  const arrowDisabledClass = 'pointer-events-none opacity-40'

  return (
    <div className="mt-6">
      <div
        ref={trackRef}
        id={trackId}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label="The Nine Titans"
        data-lenis-prevent-wheel=""
        onKeyDown={onKeyDown}
        className={cn(
          'no-scrollbar relative -mx-6 flex gap-4 overflow-x-auto overflow-y-hidden px-6 pb-4 pt-2 md:-mx-2 md:px-2',
          'snap-x snap-mandatory scroll-pl-6 scroll-smooth overscroll-x-contain motion-reduce:scroll-auto md:scroll-pl-2',
          'cursor-grab active:cursor-grabbing',
          'data-[gliding]:snap-none data-[gliding]:scroll-auto',
          'data-[dragging]:cursor-grabbing data-[dragging]:select-none [&[data-dragging]_*]:cursor-grabbing',
          'outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary-light'
        )}
      >
        {titans.map((titan, i) => (
          <div
            key={titan.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}: ${titan.name}`}
            className="group relative w-[300px] shrink-0 snap-start snap-always md:w-[340px]"
          >
            <button
              type="button"
              onClick={() => onOpen(titan.id)}
              className="focus-ring block h-full w-full text-left"
              aria-label={`Open ${titan.name} details`}
            >
              <GlassCard padding="none" hover className="h-full" style={{ borderColor: `${titan.accent}2e` }}>
                <div className="relative h-44 overflow-hidden bg-ink-850">
                  <img
                    src={titan.image}
                    alt={`${titan.name} — still from Attack on Titan`}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover object-[center_32%] transition-transform duration-700 ease-out-expo group-hover:scale-[1.05]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/30 to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/50 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-parchment/80 backdrop-blur">
                    {titan.height}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="font-mono text-[9px] uppercase tracking-[0.24em]" style={{ color: titan.accent }}>
                      {titan.monogram} · Nine Titans
                    </p>
                    <h3 className="mt-1 font-display text-xl text-parchment">{titan.name}</h3>
                    <p className="font-jp text-[10px] tracking-[0.2em] text-parchment/50">{titan.nameJP}</p>
                  </div>
                </div>

                <div className="p-4">
                  <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-smoke">Current holder</p>
                  <p className="text-[13px] text-parchment/85">{titan.holder}</p>
                  <div className="mt-3 flex items-start gap-2">
                    <Swords size={11} className="mt-1 shrink-0" style={{ color: titan.accent }} />
                    <p className="line-clamp-3 text-[11.5px] leading-relaxed text-ash">{titan.ability}</p>
                  </div>
                  <div className="mt-2 flex items-start gap-2">
                    <ShieldAlert size={11} className="mt-1 shrink-0 text-secondary" />
                    <p className="line-clamp-2 text-[11.5px] leading-relaxed text-smoke">{titan.weakness}</p>
                  </div>
                </div>
              </GlassCard>
            </button>
          </div>
        ))}
      </div>

      {count > 1 ? (
        <div className="flex items-center gap-4">
          <p aria-hidden className="shrink-0 font-mono text-[9px] uppercase tabular-nums tracking-[0.2em] text-smoke">
            <span className="text-parchment/80">{padIndex(ui.index + 1)}</span> / {padIndex(count)}
          </p>
          <div aria-hidden className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-white/10">
            <span
              ref={barRef}
              className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-[#CC2200] will-change-transform"
            />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label="Previous titan"
              aria-controls={trackId}
              aria-disabled={!ui.canPrev}
              onClick={() => ui.canPrev && move('prev', 'button')}
              className={cn(arrowClass, !ui.canPrev && arrowDisabledClass)}
            >
              <ChevronLeft size={16} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Next titan"
              aria-controls={trackId}
              aria-disabled={!ui.canNext}
              onClick={() => ui.canNext && move('next', 'button')}
              className={cn(arrowClass, !ui.canNext && arrowDisabledClass)}
            >
              <ChevronRight size={16} aria-hidden />
            </button>
          </div>
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </div>
  )
}

export function TitanBestiary() {
  const rootRef = useSectionReveal<HTMLDivElement>([])
  const [tab, setTab] = useState<Tab>('nine')
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  const filteredTitans = useMemo(() => {
    const q = query.trim().toLowerCase()
    return titans.filter((titan) =>
      !q || `${titan.name} ${titan.nameJP} ${titan.holder} ${titan.ability} ${titan.weakness}`.toLowerCase().includes(q)
    )
  }, [query])
  const filteredPureTitans = useMemo(() => {
    const q = query.trim().toLowerCase()
    return pureTitans.filter((pure) =>
      !q || `${pure.name} ${pure.sizeRange} ${pure.threat} ${pure.description}`.toLowerCase().includes(q)
    )
  }, [query])

  const active = useMemo(() => titans.find((t) => t.id === openId) ?? null, [openId])

  return (
    <section id="titans" className="section-shell bg-ink-950">
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-murky/20 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(204,34,0,0.09),transparent_55%)]" />
      <div className="noise-overlay" />

      <div ref={rootRef} className="container-aot relative">
        <SectionHeader
          eyebrow="Section 05 · The Monsters"
          title="Titan Bestiary"
          titleJP="巨人図鑑"
          subtitle="Nine inheritors of Ymir's power, and the mindless hundreds that eat for reasons they will never understand."
          accent="#CC2200"
        />

        <div className="mt-12 flex flex-col gap-4" data-reveal>
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <Tabs<Tab>
              items={[
                { id: 'nine', label: 'The Nine Titans', count: titans.length, color: '#CC2200' },
                { id: 'pure', label: 'Pure Titans & Abnormals', count: pureTitans.length, color: '#7A8C6A' },
              ]}
              value={tab}
              onChange={setTab}
              ariaLabel="Titan category"
            />
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-smoke">
              Threat assessments · Survey Corps records
            </p>
          </div>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search titans, holders or abilities…"
            label="Search titans"
            className="w-full md:max-w-sm"
          />
        </div>

        {tab === 'nine' ? (
          filteredTitans.length > 0 ? <TitanCarousel titans={filteredTitans} onOpen={setOpenId} /> : null
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPureTitans.map((pure) => (
              <GlassCard key={pure.id} hover className="h-full" style={{ borderColor: `${THREAT_COLOR[pure.threat]}26` }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base text-parchment">{pure.name}</h3>
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-smoke">{pure.sizeRange}</p>
                  </div>
                  <Badge color={THREAT_COLOR[pure.threat]} dot>
                    {pure.threat}
                  </Badge>
                </div>
                <div className="mt-4 flex items-end gap-2" aria-hidden>
                  <div
                    className="w-2 rounded-sm"
                    style={{
                      height: `${Math.max(10, (pure.heightMeters / 60) * 90)}px`,
                      backgroundColor: `${THREAT_COLOR[pure.threat]}88`,
                    }}
                  />
                  <span className="font-mono text-[9px] text-smoke">{pure.heightMeters} m avg.</span>
                </div>
                <p className="mt-3 text-[12px] leading-relaxed text-ash">{pure.description}</p>
              </GlassCard>
            ))}
          </div>
        )}

        {((tab === 'nine' && filteredTitans.length === 0) || (tab === 'pure' && filteredPureTitans.length === 0)) ? (
          <p className="mt-8 rounded-lg border border-white/10 bg-white/[0.02] p-8 text-center font-display text-parchment">
            No titan records found. Try another search.
          </p>
        ) : null}

        {/* size comparison */}
        <div className="mt-12 glass-card p-5 md:p-6" data-reveal>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-lg text-parchment">Size comparison</h3>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-smoke">
              Every titan to scale against 60 m
            </p>
          </div>

          <div className="mt-6 flex items-end justify-between gap-2 overflow-x-auto pb-2 md:gap-4">
            {SIZE_SCALE.map((item) => {
              const height = 20 + (item.metres / 60) * 150
              return (
                <div key={item.label} className="flex min-w-[46px] flex-1 flex-col items-center gap-2">
                  <span className="font-mono text-[9px] text-parchment/60">{item.metres} m</span>
                  <svg
                    viewBox="0 0 40 100"
                    style={{ height, width: 'auto' }}
                    className="max-h-[170px] min-h-[26px]"
                    aria-hidden
                  >
                    <g fill={item.accent} opacity={item.label === 'Human' ? 0.65 : 0.85}>
                      <circle cx="20" cy="12" r="7" />
                      <path d="M20 20 q-9 0 -9 12 l0 26 q0 6 4 6 l1 24 q0 3 3 3 l3 0 q3 0 3 -3 l1 -20 l1 20 q0 3 3 3 l3 0 q3 0 3 -3 l1 -24 q4 0 4 -6 l0 -26 q0 -12 -9 -12 Z" />
                    </g>
                  </svg>
                  <span className="text-center font-mono text-[8px] uppercase tracking-[0.12em] text-smoke">
                    {item.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <Modal open={Boolean(active)} onClose={() => setOpenId(null)} labelledBy="titan-name">
        {active ? (
          <div>
            <div className="relative h-52 md:h-64 overflow-hidden bg-ink-850">
              <img
                src={active.image}
                alt={`${active.name} — still from Attack on Titan`}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
              <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-ink-900 via-ink-900/30 to-transparent" />
              <div className="pointer-events-none absolute right-4 top-4 z-10 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-parchment/75 backdrop-blur">
                Archive still
              </div>
              <div className="absolute inset-x-0 bottom-0 z-20 p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge color={active.accent} variant="solid">
                    Nine Titans
                  </Badge>
                  <Badge color="#A09888">{active.height}</Badge>
                </div>
                <h3 id="titan-name" className="mt-3 font-display text-3xl text-parchment">
                  {active.name}
                </h3>
                <p className="font-jp text-sm tracking-[0.2em] text-ash">{active.nameJP}</p>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-smoke">Current holder</p>
                  <p className="mt-1 text-[13px] text-parchment/85">{active.holder}</p>
                </div>
                <div>
                  <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-smoke">Height</p>
                  <p className="mt-1 text-[13px] text-parchment/85">{active.height}</p>
                </div>
              </div>

              <div className="mt-5">
                <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-smoke">Previous holders</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {active.previousHolders.map((holder) => (
                    <span
                      key={holder}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-ash"
                    >
                      {holder}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded border p-3.5" style={{ borderColor: `${active.accent}44` }}>
                  <p className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.2em] text-smoke">
                    <Swords size={10} /> Ability
                  </p>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-parchment/75">{active.ability}</p>
                </div>
                <div className="rounded border border-secondary/30 bg-secondary/[0.05] p-3.5">
                  <p className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.2em] text-smoke">
                    <ShieldAlert size={10} /> Weakness
                  </p>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-parchment/75">{active.weakness}</p>
                </div>
              </div>

              <p className="mt-5 border-t border-white/10 pt-4 text-[13px] leading-relaxed text-ash">
                {active.history}
              </p>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  )
}
