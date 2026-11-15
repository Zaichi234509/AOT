'use client'

import { useEffect, useRef } from 'react'
import { SCENES } from '@/lib/constants'
import { subscribeProgress } from '@/lib/scroll'
import { clamp, smoothstep } from '@/lib/utils'

/**
 * 2D parallax fallback for phones / low-power GPUs.
 *
 * No WebGL: each scene becomes a layered gradient plate with a slow parallax
 * drift. The HTML overlays above stay identical, so the story still reads the
 * same way — just without the real-time 3D.
 */
export function MobileStage() {
  const layers = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    return subscribeProgress((progress) => {
      SCENES.forEach((scene, i) => {
        const el = layers.current[i]
        if (!el) return
        const local = clamp((progress - scene.start) / (scene.end - scene.start), 0, 1)
        const fadeIn = smoothstep(scene.start - 0.012, scene.start + 0.012, progress)
        const fadeOut = 1 - smoothstep(scene.end - 0.012, scene.end + 0.012, progress)
        const alpha = i === 0 ? fadeOut : Math.min(fadeIn, fadeOut)
        el.style.opacity = alpha.toFixed(3)
        el.style.transform = `translate3d(0, ${(-local * 12).toFixed(2)}%, 0) scale(${(1.12 + local * 0.06).toFixed(3)})`
      })
    })
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden bg-ink-950">
      {SCENES.map((scene, i) => (
        <div
          key={scene.id}
          ref={(el) => {
            layers.current[i] = el
          }}
          className="absolute inset-0 will-change-transform"
          style={{
            background: scene.gradient,
            opacity: i === 0 ? 1 : 0,
            transition: 'opacity 120ms linear',
          }}
        >
          {/* layered silhouette shapes give the flat gradient depth */}
          <svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
            <rect width="400" height="700" fill="url(#m-fade)" opacity="0" />
            {scene.id === 'shiganshina' ? (
              <>
                <rect x="0" y="470" width="400" height="230" fill="#1c130c" opacity="0.85" />
                <path d="M150 470 L150 300 Q200 240 250 300 L250 470 Z" fill="#120c07" opacity="0.9" />
                <path d="M120 300 Q200 120 280 300 Z" fill="#3a2114" opacity="0.5" />
              </>
            ) : null}
            {scene.id === 'walls' ? (
              <>
                <ellipse cx="200" cy="470" rx="190" ry="60" fill="#4a5f36" opacity="0.7" />
                <ellipse cx="200" cy="480" rx="130" ry="40" fill="#5d7a42" opacity="0.7" />
                <ellipse cx="200" cy="490" rx="70" ry="22" fill="#6d8a4c" opacity="0.7" />
                <path d="M0 500 Q100 440 200 470 Q300 500 400 460 L400 700 L0 700 Z" fill="#2a2620" opacity="0.7" />
              </>
            ) : null}
            {scene.id === 'corps' ? (
              <>
                <path d="M0 560 Q100 500 200 540 Q300 580 400 520 L400 700 L0 700 Z" fill="#0a100c" />
                {[130, 200, 270].map((x) => (
                  <g key={x}>
                    <circle cx={x} cy="480" r="12" fill="#050806" />
                    <path d={`M${x - 20} 500 L${x + 20} 500 L${x + 26} 570 L${x - 26} 570 Z`} fill="#070b08" />
                    <path d={`M${x - 22} 505 L${x - 40} 560 L${x - 8} 575 Z`} fill="#22422a" opacity="0.8" />
                  </g>
                ))}
              </>
            ) : null}
            {scene.id === 'titans' ? (
              <>
                <path d="M0 600 Q100 560 200 590 Q300 620 400 570 L400 700 L0 700 Z" fill="#0c0f09" />
                <path d="M150 600 Q140 430 200 400 Q260 430 250 600 Z" fill="#12150d" />
                <circle cx="200" cy="360" r="46" fill="#12150d" />
                <circle cx="184" cy="356" r="5" fill="#FF4400" opacity="0.9" />
                <circle cx="216" cy="356" r="5" fill="#FF4400" opacity="0.9" />
              </>
            ) : null}
            {scene.id === 'trost' ? (
              <>
                {[
                  [20, 420, 70, 180],
                  [100, 460, 60, 140],
                  [170, 400, 56, 200],
                  [240, 450, 66, 150],
                  [315, 430, 60, 170],
                ].map(([x, y, w, h], idx) => (
                  <g key={idx}>
                    <rect x={x} y={y} width={w} height={h} fill="#2a1c11" opacity="0.9" />
                    <path d={`M${x - 8} ${y} L${x + w / 2} ${y - 25} L${x + w + 8} ${y} Z`} fill="#170f08" />
                  </g>
                ))}
                <path d="M0 610 Q100 580 200 605 Q300 630 400 590 L400 700 L0 700 Z" fill="#1a1008" />
              </>
            ) : null}
            {scene.id === 'basement' ? (
              <>
                <rect x="0" y="0" width="400" height="700" fill="#050403" opacity="0.6" />
                <rect x="240" y="330" width="130" height="280" fill="#1b120a" />
                <rect x="250" y="340" width="110" height="270" fill="#2d1f13" />
                <circle cx="340" cy="480" r="7" fill="#ff9944" />
                <circle cx="340" cy="480" r="60" fill="#ff9944" opacity="0.12" />
                {Array.from({ length: 7 }).map((_, idx) => (
                  <rect key={idx} x={40 + idx * 14} y={560 + idx * 16} width={230 - idx * 26} height="16" fill="#2a1d12" opacity={0.9 - idx * 0.08} />
                ))}
              </>
            ) : null}
            {scene.id === 'rumbling' ? (
              <>
                <circle cx="200" cy="380" r="220" fill="#ff4400" opacity="0.16" />
                {Array.from({ length: 12 }).map((_, idx) => {
                  const x = 5 + idx * 34
                  const h = 140 + ((idx * 37) % 120)
                  return (
                    <g key={idx}>
                      <path d={`M${x} 660 L${x} ${660 - h} Q${x - 14} ${640 - h} ${x + 10} ${620 - h} Q${x + 30} ${645 - h} ${x + 22} 660 Z`} fill="#0b0201" />
                      <circle cx={x + 10} cy={610 - h} r="3" fill="#ff7733" />
                    </g>
                  )
                })}
              </>
            ) : null}
            <linearGradient id="m-fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#000" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.75" />
            </linearGradient>
            <rect width="400" height="700" fill="url(#m-fade)" />
          </svg>

          <div className="absolute inset-0 noise-overlay" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,transparent_20%,rgba(0,0,0,0.65)_100%)]" />
        </div>
      ))}
      <p className="absolute bottom-3 right-4 font-mono text-[8px] uppercase tracking-[0.25em] text-parchment/25">
        2D parallax mode
      </p>
    </div>
  )
}
