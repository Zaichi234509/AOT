'use client'

import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor, Preload } from '@react-three/drei'
import * as THREE from 'three'
import { Experience } from './Experience'
import { getQuality } from '@/lib/quality'
import { debugFlags } from '@/lib/debugFlags'

/**
 * Kept in its own module so the whole three.js stack can be lazy-loaded.
 *
 * `paused` unmounts nothing — it stops the render loop when the stage has been
 * scrolled out of view (or the tab is hidden). Before this, the canvas kept
 * issuing draw calls at full rate while visitors were reading the Titan
 * Bestiary two thousand pixels further down the page.
 */
export default function SceneCanvas({ paused = false }: { paused?: boolean }) {
  const quality = getQuality()
  const [dpr, setDpr] = useState(quality.dpr[1])

  return (
    <Canvas
      className="absolute inset-0"
      style={{ position: 'absolute', inset: 0 }}
      frameloop={paused ? 'never' : 'always'}
      dpr={[quality.dpr[0], dpr]}
      shadows={quality.shadows ? { type: quality.shadowMapType } : false}
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
        stencil: false,
      }}
      camera={{ fov: 60, near: 0.1, far: 1600, position: [0, 10, 80] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = debugFlags().exposure ?? 1.08
        gl.shadowMap.type = quality.shadowMapType
      }}
      performance={{ min: 0.5 }}
    >
      <PerformanceMonitor
        onDecline={() =>
          setDpr((current) => Math.max(quality.dpr[0], Number((current - 0.2).toFixed(2))))
        }
        onIncline={() => setDpr((current) => Math.min(quality.dpr[1], Number((current + 0.1).toFixed(2))))}
      />
      <Experience />
      <Preload all />
    </Canvas>
  )
}
