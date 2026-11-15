'use client'

import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode; fallback: ReactNode }
type State = { failed: boolean }

/** If WebGL init throws (old GPU, blocked context), drop to the 2D stage. */
export class CanvasBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.warn('[AoT Archive] 3D stage unavailable, using 2D parallax fallback.', error)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export function supportsWebGL(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl')
    return Boolean(gl)
  } catch {
    return false
  }
}
