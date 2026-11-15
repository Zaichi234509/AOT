import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  children: ReactNode
  className?: string
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  borderColor?: string
  style?: CSSProperties
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8 md:p-10',
}

export function GlassCard({
  children,
  className,
  hover = false,
  padding = 'md',
  borderColor,
  style,
}: Props) {
  return (
    <div
      className={cn('glass-card relative overflow-hidden', paddings[padding], hover && 'glass-card-hover', className)}
      style={{ ...(borderColor ? { borderColor } : {}), ...style }}
    >
      {children}
    </div>
  )
}
