'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useStore } from '@/store/useStore'
import { SCENE_FX } from '@/lib/sceneKeyframes'

type BloomLike = { intensity: number }
type VignetteLike = { darkness: number; offset: number }

/** Global post stack; per-scene targets are eased rather than snapped. */
export function PostProcessingFX() {
  const bloom = useRef<BloomLike | null>(null)
  const vignette = useRef<VignetteLike | null>(null)
  const scene = useStore((s) => s.activeScene)
  const fx = SCENE_FX[scene] ?? SCENE_FX[0]

  useFrame(() => {
    if (bloom.current) {
      bloom.current.intensity += (fx.bloom - bloom.current.intensity) * 0.05
    }
    if (vignette.current) {
      vignette.current.darkness += (fx.vignetteDarkness - vignette.current.darkness) * 0.05
      vignette.current.offset += (fx.vignetteOffset - vignette.current.offset) * 0.05
    }
  })

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        ref={bloom as never}
        intensity={fx.bloom}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.22}
        mipmapBlur
        radius={0.72}
      />
      <Vignette ref={vignette as never} eskil={false} offset={fx.vignetteOffset} darkness={fx.vignetteDarkness} />
      <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={fx.noise} />
    </EffectComposer>
  )
}
