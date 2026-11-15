import { ExternalLink, Image as ImageIcon } from 'lucide-react'
import type { MouseEvent } from 'react'
import { cn } from '@/lib/utils'

/**
 * Build a Google Images search URL for a character / titan name.
 * Used as a plain `href` so the link works without JavaScript and
 * opens in a new tab (same pattern as the SoundtrackPlayer YouTube link).
 */
export function imageSearchHref(name: string, suffix = 'Attack on Titan'): string {
  const query = suffix ? `${name} ${suffix}` : name
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`
}

type Variant = 'chip' | 'inline' | 'button'

type Props = {
  /** Display name used for the search query, e.g. "Eren Yeager". */
  name: string
  /** Override the full search query (defaults to `${name} Attack on Titan`). */
  query?: string
  /** Visible label. Defaults to "Search images". */
  label?: string
  variant?: Variant
  /** Accent colour for the button variant border. */
  accent?: string
  className?: string
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}

const base =
  'focus-ring inline-flex items-center gap-1.5 font-mono uppercase tracking-[0.16em] transition-colors'

const variants: Record<Variant, string> = {
  // Pill overlaid on a card image — always visible so the href is discoverable.
  chip: 'rounded-full border border-white/25 bg-black/60 px-2.5 py-1.5 text-[9px] text-parchment backdrop-blur hover:border-white/60 hover:bg-black/85',
  // Quiet text link for card footers / meta rows.
  inline: 'text-[9px] text-ash hover:text-primary-light',
  // Solid action for detail modals.
  button:
    'rounded-md border border-white/20 bg-white/[0.04] px-4 py-2.5 text-[10px] text-parchment hover:border-primary-light/60 hover:bg-primary/15',
}

/**
 * Href-type image search link.
 *
 * Renders a real `<a href="…">` (not a button / onClick) pointing at a
 * Google Images search for the given character or titan, so it can be
 * right-clicked, opened in a new tab, and works without JS.
 */
export function ImageSearchLink({
  name,
  query,
  label = 'Search images',
  variant = 'chip',
  accent,
  className,
  onClick,
}: Props) {
  const href = query ? imageSearchHref(query, '') : imageSearchHref(name)
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Search images of ${name} on Google Images`}
      title={`Search images of ${name} on Google Images`}
      onClick={onClick}
      style={variant === 'button' && accent ? { borderColor: `${accent}66` } : undefined}
      className={cn(base, variants[variant], className)}
    >
      <ImageIcon size={variant === 'button' ? 13 : 11} aria-hidden />
      <span>{label}</span>
      <ExternalLink size={9} aria-hidden className="opacity-70" />
    </a>
  )
}
