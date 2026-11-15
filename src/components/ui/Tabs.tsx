'use client'

import { cn } from '@/lib/utils'

export type TabItem<T extends string> = {
  id: T
  label: string
  count?: number
  color?: string
}

type Props<T extends string> = {
  items: TabItem<T>[]
  value: T
  onChange: (value: T) => void
  variant?: 'underline' | 'pill'
  className?: string
  ariaLabel?: string
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  variant = 'underline',
  className,
  ariaLabel = 'Filter',
}: Props<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'no-scrollbar flex max-w-full items-center gap-1 overflow-x-auto',
        variant === 'underline' ? 'border-b border-white/10' : 'flex-wrap gap-2',
        className
      )}
    >
      {items.map((item) => {
        const active = item.id === value
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              'focus-ring relative whitespace-nowrap px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors duration-300',
              variant === 'pill' &&
                'rounded-full border px-4 py-2 text-[10px] tracking-[0.14em]',
              variant === 'underline'
                ? active
                  ? 'text-parchment'
                  : 'text-smoke hover:text-ash'
                : active
                  ? 'border-primary-light bg-primary/25 text-parchment'
                  : 'border-white/10 bg-white/[0.03] text-smoke hover:border-white/25 hover:text-ash'
            )}
            style={
              active && variant === 'underline'
                ? { color: item.color ?? '#F5F0E8' }
                : active && item.color
                  ? { borderColor: `${item.color}88`, color: '#F5F0E8' }
                  : undefined
            }
          >
            <span className="flex items-center gap-2">
              {item.label}
              {typeof item.count === 'number' ? (
                <span className="font-mono text-[9px] text-smoke">{item.count}</span>
              ) : null}
            </span>
            {variant === 'underline' ? (
              <span
                aria-hidden
                className={cn(
                  'absolute inset-x-2 -bottom-px h-[2px] origin-left transition-transform duration-300 ease-out-expo',
                  active ? 'scale-x-100' : 'scale-x-0'
                )}
                style={{ backgroundColor: item.color ?? '#4A7C3F' }}
              />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
