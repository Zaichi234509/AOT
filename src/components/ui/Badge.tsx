import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  children: ReactNode
  color?: string
  variant?: 'solid' | 'outline' | 'muted'
  className?: string
  dot?: boolean
}

export function Badge({ children, color = '#4A7C3F', variant = 'outline', className, dot }: Props) {
  const style =
    variant === 'solid'
      ? { backgroundColor: color, borderColor: color, color: '#0A0A0A' }
      : variant === 'outline'
        ? { borderColor: `${color}66`, color, backgroundColor: `${color}14` }
        : { borderColor: 'rgba(255,255,255,0.1)', color: '#A09888', backgroundColor: 'rgba(255,255,255,0.03)' }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em]',
        className
      )}
      style={style}
    >
      {dot ? (
        <span className="inline-block h-1 w-1 rounded-full" style={{ backgroundColor: color }} />
      ) : null}
      {children}
    </span>
  )
}

export const AFFILIATION_COLORS: Record<string, string> = {
  'Survey Corps': '#4A7C3F',
  'Military Police': '#4A6FA5',
  Garrison: '#B08A3E',
  Marley: '#9B3B2E',
  Titan: '#CC2200',
  Civilian: '#8A8278',
}
