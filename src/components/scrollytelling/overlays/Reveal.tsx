'use client'

import { useCallback, useEffect, useRef } from 'react'
import { getStageProgress, sceneLocalProgress, subscribeProgress } from '@/lib/scroll'
import { clamp, smoothstep } from '@/lib/utils'

type Props = {
  children: React.ReactNode
  /** scene-local progress where the element starts appearing */
  start: number
  /** scene-local progress where the element has fully left */
  end: number
  fadeIn?: number
  fadeOut?: number
  y?: number
  x?: number
  scale?: number
  className?: string
  /** scene index — omit to use global stage progress */
  scene?: number
  style?: React.CSSProperties
  as?: 'div' | 'span' | 'p' | 'blockquote'
}

/**
 * Scroll-linked reveal.
 *
 * Writes opacity/transform straight to the DOM on every animation frame so the
 * overlays stay in sync with the 3D camera without React re-rendering.
 */
export function Reveal({
  children,
  start,
  end,
  fadeIn = 0.04,
  fadeOut = 0.04,
  y = 24,
  x = 0,
  scale = 1,
  className,
  scene,
  style,
  as = 'div',
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const config = useRef({ start, end, fadeIn, fadeOut, y, x, scale, scene })
  config.current = { start, end, fadeIn, fadeOut, y, x, scale, scene }

  const apply = useCallback((globalProgress: number) => {
    const el = ref.current
    if (!el) return
    const c = config.current
    const p = c.scene === undefined ? globalProgress : sceneLocalProgress(globalProgress, c.scene)
    const inAlpha = smoothstep(c.start, c.start + c.fadeIn, p)
    const outAlpha = 1 - smoothstep(c.end - c.fadeOut, c.end, p)
    const alpha = clamp(inAlpha * outAlpha, 0, 1)
    const offsetY = (1 - inAlpha) * c.y - (1 - outAlpha) * c.y * 0.45
    const offsetX = (1 - inAlpha) * c.x
    const s = c.scale === 1 ? 1 : c.scale + (1 - inAlpha) * (1 - c.scale) * 0.35

    el.style.opacity = alpha.toFixed(3)
    el.style.transform = `translate3d(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px, 0) scale(${s.toFixed(3)})`
    el.style.visibility = alpha < 0.01 ? 'hidden' : 'visible'
  }, [])

  useEffect(() => {
    apply(getStageProgress())
    return subscribeProgress(apply)
  }, [apply])

  const Tag = as as 'div'

  return (
    <Tag
      ref={ref}
      className={className}
      style={{ opacity: 0, visibility: 'hidden', willChange: 'opacity, transform', ...style }}
    >
      {children}
    </Tag>
  )
}
