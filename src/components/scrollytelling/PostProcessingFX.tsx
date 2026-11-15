'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, BrightnessContrast, EffectComposer, HueSaturation, Noise, SSAO, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { useStore } from '@/store/useStore'
import { SCENE_FX } from '@/lib/sceneKeyframes'
import { getQuality } from '@/lib/quality'

type BloomLike = { intensity: number; luminanceThreshold: number }
type VignetteLike = { darkness: number; offset: number }
type GradeLike = { saturation: number; brightness: number; contrast: number }

const quality = getQuality()

/**
 * Global post stack with a per-scene grade.
 *
 * Each scene eases toward its own exposure, bloom, saturation, contrast and
 * vignette, so Shiganshina reads golden, the Corps reads cold, the Basement
 * reads lamplit and the Rumbling reads blown-out. SSAO is enabled only for the
 * close, human-scale shots where it actually reads, and only on the high tier.
 */
export function PostProcessingFX() {
  const bloom = useRef<BloomLike | null>(null)
  const vignette = useRef<VignetteLike | null>(null)
  const hue = useRef<GradeLike | null>(null)
  const contrast = useRef<GradeLike | null>(null)
  const { gl } = useThree()

  const scene = useStore((s) => s.activeScene)
  const fx = SCENE_FX[scene] ?? SCENE_FX[0]
  // SSAO is wired up but left off in every scene's grade: at these scene
  // scales the depth-based occlusion crushed the mid-tones (soldier jackets and
  // titan torsos went to near-black) far more than it helped. Contact shadows
  // do the grounding work instead. Set `ao` on any SCENE_FX entry to try it.
  const useAO = quality.ao && (fx.ao ?? 0) > 0

  useFrame(() => {
    const easing = 0.05
    if (gl.toneMappingExposure !== undefined) {
      gl.toneMappingExposure += (fx.exposure - gl.toneMappingExposure) * easing
    }
    if (bloom.current) {
      bloom.current.intensity += (fx.bloom - bloom.current.intensity) * easing
      bloom.current.luminanceThreshold += (fx.bloomThreshold - bloom.current.luminanceThreshold) * easing
    }
    if (vignette.current) {
      vignette.current.darkness += (fx.vignetteDarkness - vignette.current.darkness) * easing
      vignette.current.offset += (fx.vignetteOffset - vignette.current.offset) * easing
    }
    if (hue.current) {
      hue.current.saturation += (fx.saturation - 1 - hue.current.saturation) * easing
    }
    if (contrast.current) {
      contrast.current.contrast += (fx.contrast - 1 - contrast.current.contrast) * easing
      contrast.current.brightness += (fx.brightness - contrast.current.brightness) * easing
    }
  })

  return (
    <EffectComposer
      multisampling={quality.multisampling}
      enableNormalPass={useAO}
      frameBufferType={THREE.HalfFloatType}
    >
      {useAO ? (
        <SSAO
          intensity={fx.ao ?? 20}
          radius={fx.aoRadius ?? 0.12}
          luminanceInfluence={0.55}
          color={new THREE.Color(0, 0, 0)}
          worldDistanceThreshold={fx.aoDistance ?? 12}
          worldDistanceFalloff={2}
          worldProximityThreshold={2}
          worldProximityFalloff={1}
        />
      ) : (
        <></>
      )}
      <Bloom
        ref={bloom as never}
        intensity={fx.bloom}
        luminanceThreshold={fx.bloomThreshold}
        luminanceSmoothing={0.24}
        mipmapBlur
        radius={0.75}
      />
      <HueSaturation ref={hue as never} saturation={fx.saturation - 1} />
      <BrightnessContrast ref={contrast as never} brightness={fx.brightness} contrast={fx.contrast - 1} />
      <Vignette ref={vignette as never} eskil={false} offset={fx.vignetteOffset} darkness={fx.vignetteDarkness} />
      <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={fx.noise} />
    </EffectComposer>
  )
}
