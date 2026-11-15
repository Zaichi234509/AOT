import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  eyebrow?: string
  title: string
  titleJP?: string
  subtitle?: ReactNode
  align?: 'center' | 'left'
  accent?: string
  className?: string
}

export function SectionHeader({
  eyebrow,
  title,
  titleJP,
  subtitle,
  align = 'center',
  accent = '#4A7C3F',
  className,
}: Props) {
  return (
    <header
      className={cn(
        'relative mx-auto flex max-w-[760px] flex-col',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className
      )}
    >
      {eyebrow ? (
        <div className="mb-5 flex items-center gap-3" data-reveal>
          <span className="h-px w-8" style={{ backgroundColor: `${accent}bb` }} />
          <span className="eyebrow" style={{ color: accent }}>
            {eyebrow}
          </span>
          <span className="h-px w-8" style={{ backgroundColor: `${accent}bb` }} />
        </div>
      ) : null}

      <h2 className="section-title text-parchment" data-reveal data-reveal-delay="0.05">
        {title}
      </h2>

      {titleJP ? (
        <p
          className="font-jp mt-3 text-base text-ash md:text-lg"
          data-reveal
          data-reveal-delay="0.1"
        >
          {titleJP}
        </p>
      ) : null}

      <div className="mt-6 flex w-full items-center justify-center gap-3 opacity-70">
        <span className="h-px max-w-[120px] flex-1 bg-gradient-to-r from-transparent to-white/25" />
        <span className="h-1.5 w-1.5 rotate-45 border border-white/40" />
        <span className="h-px max-w-[120px] flex-1 bg-gradient-to-l from-transparent to-white/25" />
      </div>

      {subtitle ? (
        <p
          className={cn(
            'mt-6 max-w-[620px] text-[15px] leading-relaxed text-ash',
            align === 'center' ? 'mx-auto' : ''
          )}
          data-reveal
          data-reveal-delay="0.15"
        >
          {subtitle}
        </p>
      ) : null}
    </header>
  )
}
