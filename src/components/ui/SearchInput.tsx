'use client'

import { Search, X } from 'lucide-react'

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  className?: string
  id?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  label = 'Search',
  className,
  id = 'aot-search',
}: Props) {
  return (
    <div className={className}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="group relative flex items-center">
        <Search
          size={16}
          className="pointer-events-none absolute left-4 text-smoke transition-colors group-focus-within:text-primary-light"
        />
        <input
          id={id}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="focus-ring h-12 w-full rounded-lg border border-white/10 bg-white/[0.04] pl-11 pr-11 font-body text-sm text-parchment placeholder:text-smoke/70 transition-colors focus:border-primary-light/60 focus:bg-white/[0.06]"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear search"
            className="focus-ring absolute right-3 grid h-7 w-7 place-items-center rounded-full text-smoke transition hover:bg-white/10 hover:text-parchment"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>
    </div>
  )
}
