'use client'

import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Experience } from './Experience'

/** Kept in its own module so the whole three.js stack can be lazy-loaded. */
export default function SceneCanvas() {
  return (
    <Canvas
      className="absolute inset-0"
      dpr={[1, 1.6]}
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
        stencil: false,
      }}
      camera={{ fov: 60, near: 0.1, far: 1600, position: [0, 10, 80] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.08
      }}
    >
      <Experience />
    </Canvas>
  )
}
