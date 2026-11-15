'use client'

import { Scene1Overlay } from './Scene1Overlay'
import { Scene2Overlay } from './Scene2Overlay'
import { Scene3Overlay } from './Scene3Overlay'
import { Scene4Overlay } from './Scene4Overlay'
import { Scene5Overlay } from './Scene5Overlay'
import { Scene6Overlay } from './Scene6Overlay'
import { Scene7Overlay } from './Scene7Overlay'

export function OverlayLayer() {
  return (
    <div className="pointer-events-none absolute inset-0 z-30" id="overlay-layer">
      <Scene1Overlay />
      <Scene2Overlay />
      <Scene3Overlay />
      <Scene4Overlay />
      <Scene5Overlay />
      <Scene6Overlay />
      <Scene7Overlay />
    </div>
  )
}
