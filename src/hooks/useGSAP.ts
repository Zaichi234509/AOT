'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false
function ensureRegistered() {
  if (registered) return
  gsap.registerPlugin(ScrollTrigger)
  registered = true
}

/**
 * GSAP ScrollTrigger batch reveal for a section.
 * Children marked with `data-reveal` fade up in a gentle stagger the first
 * time they enter the viewport.
 */
export function useSectionReveal<T extends HTMLElement>(deps: unknown[] = []) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    ensureRegistered()
    const root = ref.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (!targets.length) return

    const contextWrap = gsap.context(() => {
      targets.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            delay: Number(el.dataset.revealDelay ?? 0),
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          }
        )
      })
    }, root)

    ScrollTrigger.refresh()

    return () => {
      contextWrap.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ref
}

export { gsap, ScrollTrigger }
