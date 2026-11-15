'use client'

import { Component, Suspense, useEffect, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { DRACO_DECODER_PATH, MODEL_SLOTS, modelUrl, slotsForScene, type ModelSlotId } from '@/lib/models'
import { getStageProgress, sceneLocalProgress } from '@/lib/scroll'
import { motionAllowed } from '@/lib/reducedMotion'

/** Errors inside a slot must not take the stage down — show the fallback. */
class SlotBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.warn('[AoT Archive] model slot failed to load, keeping procedural mesh.', error)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

type ModelSlotProps = {
  slot: ModelSlotId
  /** rendered while loading, on error, and whenever the slot is unconfigured */
  fallback: ReactNode
  position?: [number, number, number]
  rotationY?: number
  scale?: number | [number, number, number]
  /**
   * When set, the model's animation clip is scrubbed by this scene's local
   * scroll progress instead of playing on its own.
   */
  sceneIndex?: number
  castShadow?: boolean
  receiveShadow?: boolean
}

/**
 * One authored model, with its procedural stand-in.
 *
 * - unconfigured (`modelUrl()` returns null) → fallback only, zero requests
 * - loading → fallback (Suspense), so the stage never shows a hole
 * - load error → fallback (error boundary)
 * - loaded → the glb, with shadows and animation clips applied
 */
export function ModelSlot({
  slot,
  fallback,
  position = [0, 0, 0],
  rotationY = 0,
  scale = 1,
  sceneIndex,
  castShadow = true,
  receiveShadow = true,
}: ModelSlotProps) {
  const url = modelUrl(slot)

  if (!url) {
    return (
      <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
        {fallback}
      </group>
    )
  }

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <SlotBoundary fallback={fallback}>
        <Suspense fallback={fallback}>
          <GltfSlot
            url={url}
            slot={slot}
            sceneIndex={sceneIndex}
            castShadow={castShadow}
            receiveShadow={receiveShadow}
          />
        </Suspense>
      </SlotBoundary>
    </group>
  )
}

function GltfSlot({
  url,
  slot,
  sceneIndex,
  castShadow,
  receiveShadow,
}: {
  url: string
  slot: ModelSlotId
  sceneIndex?: number
  castShadow: boolean
  receiveShadow: boolean
}) {
  const group = useRef<THREE.Group>(null)
  const gltf = useGLTF(url, DRACO_DECODER_PATH || false, true)
  const scene = gltf.scene
  const animations = gltf.animations ?? []
  const { actions, mixer } = useAnimations(animations, group)

  /* Shadows + sane material defaults for anything authored elsewhere. */
  useEffect(() => {
    if (!scene) return
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = castShadow
      mesh.receiveShadow = receiveShadow
      mesh.frustumCulled = true
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const material of materials) {
        const standard = material as THREE.MeshStandardMaterial
        if (standard && 'envMapIntensity' in standard) {
          standard.envMapIntensity = 1.05
          standard.needsUpdate = true
        }
      }
    })
  }, [scene, castShadow, receiveShadow])

  /* Animation clips: scrubbed by scroll where the scene is scroll-driven. */
  useEffect(() => {
    if (!animations.length) return
    const preferred = MODEL_SLOTS[slot].clips ?? []
    const clip =
      animations.find((a) => preferred.includes(a.name)) ?? animations[0]
    const action = actions[clip.name]
    if (!action) return
    action.reset().play()
    if (sceneIndex !== undefined) mixer.timeScale = 0
    return () => {
      action.stop()
    }
  }, [actions, animations, mixer, sceneIndex, slot])

  useFrame(() => {
    if (sceneIndex === undefined || !animations.length) return
    const clip = animations[0]
    if (!clip) return
    const local = sceneLocalProgress(getStageProgress(), sceneIndex)
    mixer.setTime(local * clip.duration)
  })

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  )
}

/**
 * Warms the loader for the scene that is about to scroll into view. Only models
 * that are actually configured are fetched (none by default), and nothing is
 * requested on mobile / no-WebGL builds because the canvas never mounts there.
 */
export function PreloadSceneModels({ scene }: { scene: number }) {
  useEffect(() => {
    if (!motionAllowed()) return
    for (const slot of slotsForScene(scene)) {
      const url = modelUrl(slot)
      if (!url) continue
      try {
        useGLTF.preload(url, DRACO_DECODER_PATH || false, true)
      } catch {
        /* preloading is best-effort */
      }
    }
  }, [scene])
  return null
}
