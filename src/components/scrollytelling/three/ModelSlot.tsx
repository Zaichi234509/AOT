'use client'

import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'
import {
  DRACO_DECODER_PATH,
  MODEL_SLOTS,
  modelUrl,
  slotsForScene,
  type ModelBonePose,
  type ModelSlotId,
} from '@/lib/models'
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
  /** extra multiplier applied after the model has been normalised to targetHeight */
  scale?: number | [number, number, number]
  /**
   * Override MODEL_SLOTS[slot].height. Useful when the same asset appears at
   * different sizes in different shots (e.g. a 55 m background titan).
   */
  targetHeight?: number
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
 * - loaded → a cloned, floor-aligned, height-normalised glb
 */
export function ModelSlot({
  slot,
  fallback,
  position = [0, 0, 0],
  rotationY = 0,
  scale = 1,
  targetHeight,
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
            targetHeight={targetHeight}
            castShadow={castShadow}
            receiveShadow={receiveShadow}
          />
        </Suspense>
      </SlotBoundary>
    </group>
  )
}

function applyBonePose(root: THREE.Object3D, pose: ModelBonePose[]) {
  if (!pose.length) return

  const bones: THREE.Bone[] = []
  root.traverse((child) => {
    if ((child as THREE.Bone).isBone) bones.push(child as THREE.Bone)
  })

  for (const correction of pose) {
    const bone = bones.find((candidate) => candidate.name.includes(correction.match))
    if (!bone) continue

    const [x, y, z] = correction.rotation
    const euler = new THREE.Euler(
      THREE.MathUtils.degToRad(x),
      THREE.MathUtils.degToRad(y),
      THREE.MathUtils.degToRad(z)
    )
    // Local post-multiply keeps the rig's bind orientation intact.
    bone.quaternion.multiply(new THREE.Quaternion().setFromEuler(euler))
  }
}

/**
 * Clone the cached glTF scene (SkeletonUtils also clones bone bindings, which
 * is what lets one skinned asset appear in several slots), then normalise it:
 *
 *   1. measure the *posed* world-space Box3
 *   2. scale uniformly to `targetHeight`
 *   3. centre X/Z on zero
 *   4. put the lowest vertex (feet / base) exactly on y = 0
 *
 * The scale and offset live on a wrapper group, so animation clips keep
 * operating in the model's authored units.
 */
function useNormalizedModel(
  scene: THREE.Object3D,
  slot: ModelSlotId,
  targetHeightOverride?: number
) {
  return useMemo(() => {
    const clone = SkeletonUtils.clone(scene)
    clone.updateMatrixWorld(true)

    applyBonePose(clone, MODEL_SLOTS[slot].pose ?? [])
    clone.updateMatrixWorld(true)

    const box = new THREE.Box3().setFromObject(clone, true)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)

    const targetHeight = targetHeightOverride ?? MODEL_SLOTS[slot].height ?? 0
    const measuredHeight = size.y
    const safeHeight = Number.isFinite(measuredHeight) && measuredHeight > 0 ? measuredHeight : targetHeight || 1
    const normalisedScale = targetHeight > 0 ? targetHeight / safeHeight : 1

    const holder = new THREE.Group()
    holder.name = `model-slot-${slot}`
    holder.add(clone)
    holder.scale.setScalar(normalisedScale)
    holder.position.set(
      -center.x * normalisedScale,
      -box.min.y * normalisedScale,
      -center.z * normalisedScale
    )

    return holder
  }, [scene, slot, targetHeightOverride])
}

function applyMaterialSettings(
  root: THREE.Object3D,
  slot: ModelSlotId,
  castShadow: boolean,
  receiveShadow: boolean
) {
  const config = MODEL_SLOTS[slot].material

  root.traverse((child) => {
    const mesh = child as THREE.Mesh
    if (!mesh.isMesh) return

    mesh.castShadow = castShadow
    mesh.receiveShadow = receiveShadow
    // A skinned mesh's authored bounding sphere does not follow its bones;
    // culling it can make an animated character pop out of view.
    mesh.frustumCulled = !(mesh as THREE.SkinnedMesh).isSkinnedMesh

    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const material of materials) {
      const standard = material as THREE.MeshStandardMaterial
      if (!standard || !('envMapIntensity' in standard)) continue

      standard.envMapIntensity = config?.envMapIntensity ?? 1.05
      if (config?.color) standard.color.set(config.color)
      if (config?.roughness !== undefined) standard.roughness = config.roughness
      if (config?.metalness !== undefined) standard.metalness = config.metalness
      standard.needsUpdate = true
    }
  })
}

function pickClip(animations: THREE.AnimationClip[], preferred: string[]) {
  return (
    animations.find((clip) => clip.duration > 0 && preferred.includes(clip.name)) ??
    animations.find((clip) => clip.duration > 0) ??
    animations[0]
  )
}

function GltfSlot({
  url,
  slot,
  sceneIndex,
  targetHeight,
  castShadow,
  receiveShadow,
}: {
  url: string
  slot: ModelSlotId
  sceneIndex?: number
  targetHeight?: number
  castShadow: boolean
  receiveShadow: boolean
}) {
  const group = useRef<THREE.Group>(null)
  const gltf = useGLTF(url, DRACO_DECODER_PATH, true)
  const animations = gltf.animations ?? []
  const model = useNormalizedModel(gltf.scene, slot, targetHeight)
  const { actions, mixer } = useAnimations(animations, group)
  const clip = useMemo(
    () => (animations.length ? pickClip(animations, MODEL_SLOTS[slot].clips ?? []) : undefined),
    [animations, slot]
  )

  /* Shadows + sane material defaults for anything authored elsewhere. */
  useEffect(() => {
    applyMaterialSettings(model, slot, castShadow, receiveShadow)
  }, [model, slot, castShadow, receiveShadow])

  /* Animation clips: scrubbed by scroll where the scene is scroll-driven. */
  useEffect(() => {
    if (!clip || clip.duration <= 0) return
    const action = actions[clip.name]
    if (!action) return

    action.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).play()
    mixer.timeScale = sceneIndex === undefined ? 1 : 0

    return () => {
      action.stop()
    }
  }, [actions, clip, mixer, sceneIndex])

  useFrame(() => {
    if (sceneIndex === undefined || !clip || clip.duration <= 0) return
    const local = sceneLocalProgress(getStageProgress(), sceneIndex)
    mixer.setTime(local * clip.duration)
  })

  return (
    <group ref={group}>
      <primitive object={model} />
    </group>
  )
}

/**
 * Warms the loader for the scene that is about to scroll into view. Only
 * shipped models are fetched, duplicate URLs are collapsed (the two Colossal
 * slots share one file), and nothing is requested on mobile / no-WebGL builds
 * because the canvas never mounts there.
 */
export function PreloadSceneModels({ scene }: { scene: number }) {
  useEffect(() => {
    if (!motionAllowed()) return

    const seen = new Set<string>()
    for (const slot of slotsForScene(scene)) {
      const url = modelUrl(slot)
      if (!url || seen.has(url)) continue
      seen.add(url)
      try {
        useGLTF.preload(url, DRACO_DECODER_PATH, true)
      } catch {
        /* preloading is best-effort */
      }
    }
  }, [scene])
  return null
}
