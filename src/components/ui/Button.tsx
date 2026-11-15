import Link from 'next/link'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const base =
  'group relative inline-flex items-center justify-center gap-2 font-body font-medium tracking-wide uppercase transition-all duration-300 ease-out-expo focus-ring disabled:opacity-40 disabled:pointer-events-none'

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-parchment border border-primary-light/60 hover:bg-primary-light hover:shadow-glowGreen hover:-translate-y-0.5',
  secondary:
    'bg-secondary text-parchment border border-secondary-light/50 hover:bg-secondary-light hover:shadow-glowRed hover:-translate-y-0.5',
  outline:
    'bg-transparent text-parchment border border-white/20 hover:border-primary-light hover:text-white hover:bg-primary/15',
  ghost: 'bg-white/5 text-parchment border border-transparent hover:bg-white/10',
}

const sizes: Record<Size, string> = {
  sm: 'text-[11px] px-4 py-2 rounded-md',
  md: 'text-xs px-6 py-3 rounded-md',
  lg: 'text-sm px-8 py-4 rounded-lg',
}

type Shared = {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

type ButtonProps = Shared & ComponentPropsWithoutRef<'button'>

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </button>
  )
}

type LinkButtonProps = Shared & { href: string; external?: boolean }

export function LinkButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  href,
  external,
}: LinkButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className)
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  )
}
