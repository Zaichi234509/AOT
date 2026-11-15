import type Lenis from 'lenis'

let lenisInstance: Lenis | null = null

export function setLenisInstance(lenis: Lenis | null) {
  lenisInstance = lenis
}

export function getLenisInstance(): Lenis | null {
  return lenisInstance
}

export function scrollToY(y: number, duration = 1.3) {
  if (lenisInstance) {
    lenisInstance.scrollTo(y, { duration, lock: false })
    return
  }
  window.scrollTo({ top: y, behavior: 'smooth' })
}

export function scrollToTarget(target: string | HTMLElement, offset = -70, duration = 1.4) {
  const el = (typeof target === 'string' ? document.querySelector(target) : target) as HTMLElement | null
  if (!el) return
  if (lenisInstance) {
    lenisInstance.scrollTo(el, { offset, duration })
    return
  }
  const top = el.getBoundingClientRect().top + window.scrollY + offset
  window.scrollTo({ top, behavior: 'smooth' })
}
