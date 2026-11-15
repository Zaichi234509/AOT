'use client'

import { SCENES } from '@/lib/constants'
import { scrollForScene } from '@/lib/scroll'
import { scrollToY } from '@/lib/smooth-scroll'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

/** Right-edge scene navigation, visible only while the 3D stage is on screen. */
export function SceneDots() {
  const active = useStore((s) => s.activeScene)
  const stageProgress = useStore((s) => s.stageProgressRounded)

  return (
    <nav
      aria-label="3D scene navigation"
      className={cn(
        'fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-5 transition-opacity duration-500 md:flex',
        stageProgress > 0.001 && stageProgress < 0.999 ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
    >
      {SCENES.map((scene) => {
        const isActive = scene.index === active
        return (
          <button
            key={scene.id}
            type="button"
            onClick={() => scrollToY(scrollForScene(scene.index) + 8, 1.5)}
            aria-label={`Go to scene ${scene.index + 1}: ${scene.title}`}
            aria-current={isActive ? 'true' : undefined}
            className="group relative grid h-8 w-8 place-items-center"
          >
            <span
              className="absolute right-full mr-3 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.2em] text-ash opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              aria-hidden
            >
              {scene.label}
            </span>
            <span
              className={cn(
                'block rounded-full transition-all duration-300',
                isActive
                  ? 'h-3 w-3 bg-primary-light'
                  : 'h-2 w-2 bg-white/25 group-hover:scale-125 group-hover:bg-white/50'
              )}
              style={isActive ? { boxShadow: `0 0 12px ${scene.accent}` } : undefined}
            />
          </button>
        )
      })}
    </nav>
  )
}
