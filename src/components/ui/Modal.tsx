'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { getLenisInstance } from '@/lib/smooth-scroll'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  labelledBy?: string
  className?: string
}

export function Modal({ open, onClose, children, labelledBy, className }: Props) {
  const [mounted, setMounted] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    const lenis = getLenisInstance()
    lenis?.stop()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    panelRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      getLenisInstance()?.start()
    }
  }, [open, onClose])

  if (!mounted || !open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      style={{ padding: 'clamp(12px, 4vw, 48px)' }}
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/80 backdrop-blur-md"
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          'glass-card animate-fade-up relative max-h-[90vh] w-full max-w-4xl overflow-y-auto overscroll-contain outline-none',
          className
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="focus-ring absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/60 text-ash transition hover:border-white/40 hover:text-parchment"
        >
          <X size={16} />
        </button>
        {children}
      </div>
    </div>,
    document.body
  )
}
