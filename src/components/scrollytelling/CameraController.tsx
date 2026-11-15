'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { activeSceneIndex, getStageProgress, sceneLocalProgress } from '@/lib/scroll'
import { CAMERA_KEYS, SCENE_FX, sampleCamera } from '@/lib/sceneKeyframes'
import { lerp, smoothstep } from '@/lib/utils'

void CAMERA_KEYS

/**
 * Scroll-driven camera. Reads the progress bus directly each frame and eases
 * toward the keyframed pose so wheel/touch input never produces a hard jolt.
 */
export function CameraController() {
  const { camera, pointer } = useThree()
  const perspective = camera as THREE.PerspectiveCamera
  const position = useRef(new THREE.Vector3(0, 10, 80))
  const target = useRef(new THREE.Vector3(0, 20, 0))
  const lastScene = useRef(-1)

  useFrame((state) => {
    const progress = getStageProgress()
    const scene = activeSceneIndex(progress)
    const local = sceneLocalProgress(progress, scene)
    const sample = sampleCamera(scene, local)

    // subtle pointer parallax adds life without breaking the choreography
    const parallaxX = pointer.x * (scene === 1 ? 6 : 0.6)
    const parallaxY = pointer.y * (scene === 1 ? 6 : 0.35)

    // impact shake — colossal reveal, battle chaos, the Rumbling
    const fx = SCENE_FX[scene]
    const shake = fx.shake * (scene === 0 ? smoothstep(0.44, 0.58, local) : 1)
    const t = state.clock.elapsedTime
    const jitterX = shake > 0 ? Math.sin(t * 37.3) * shake * 0.45 : 0
    const jitterY = shake > 0 ? Math.cos(t * 41.1) * shake * 0.32 : 0

    const targetPos = new THREE.Vector3(
      sample.pos[0] + parallaxX + jitterX,
      sample.pos[1] + parallaxY + jitterY,
      sample.pos[2]
    )
    const targetLook = new THREE.Vector3(...sample.look)

    if (lastScene.current !== scene) {
      lastScene.current = scene
      position.current.copy(targetPos)
      target.current.copy(targetLook)
      camera.position.copy(position.current)
      camera.lookAt(target.current)
    } else {
      const damp = 0.12
      position.current.lerp(targetPos, damp)
      target.current.lerp(targetLook, damp)
      camera.position.copy(position.current)
      camera.lookAt(target.current)
    }

    const nextFov = lerp(perspective.fov, sample.fov, 0.1)
    if (Math.abs(perspective.fov - nextFov) > 0.01) {
      perspective.fov = nextFov
      perspective.updateProjectionMatrix()
    }
  })

  return null
}
