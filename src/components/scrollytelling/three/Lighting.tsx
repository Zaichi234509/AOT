'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { ContactShadows } from '@react-three/drei'
import { getQuality } from '@/lib/quality'

const quality = getQuality()

type KeyLightProps = {
  position: [number, number, number]
  intensity?: number
  color?: string
  target?: [number, number, number]
  /** half-size of the shadow frustum, in metres — keep it tight around the action */
  shadowScale?: number
  castShadow?: boolean
  bias?: number
  normalBias?: number
  radius?: number
  shadowMapSize?: number
  /** optional handle so a scene can animate intensity / colour with scroll */
  lightRef?: React.MutableRefObject<THREE.DirectionalLight | null>
}

/**
 * The scene's key light with a shadow camera sized to the shot.
 *
 * Shadows are what put objects on the floor, so every scene has one light with
 * a tight, deliberately sized frustum instead of a default 512-unit one (which
 * is blurry and wastes shadow-map resolution). On the `low` tier the map is
 * skipped entirely.
 */
export function KeyLight({
  position,
  intensity = 2.5,
  color = '#fff4e0',
  target = [0, 0, 0],
  shadowScale = 40,
  castShadow = true,
  bias = -0.0004,
  normalBias = 0.03,
  radius = 3,
  shadowMapSize,
  lightRef,
}: KeyLightProps) {
  const light = useRef<THREE.DirectionalLight | null>(null)
  const targetObject = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    targetObject.position.set(target[0], target[1], target[2])
    targetObject.updateMatrixWorld()
    if (light.current) {
      light.current.target = targetObject
      light.current.target.updateMatrixWorld()
    }
  }, [targetObject, target])

  const enabled = castShadow && quality.shadows
  const size = shadowMapSize ?? quality.shadowMapSize

  return (
    <directionalLight
      ref={(node) => {
        light.current = node
        if (lightRef) lightRef.current = node
      }}
      position={position}
      intensity={intensity}
      color={color}
      castShadow={enabled}
      shadow-mapSize-width={size}
      shadow-mapSize-height={size}
      shadow-camera-left={-shadowScale}
      shadow-camera-right={shadowScale}
      shadow-camera-top={shadowScale}
      shadow-camera-bottom={-shadowScale}
      shadow-camera-near={0.5}
      shadow-camera-far={Math.max(60, shadowScale * 7)}
      shadow-bias={bias}
      shadow-normalBias={normalBias}
      shadow-radius={radius}
    />
  )
}

/**
 * Soft contact occlusion where objects meet the floor. Rendered once per scene
 * (`frames={1}`) — the geometry barely moves, so there is no reason to pay for
 * it every frame.
 */
export function ContactShadow({
  position = [0, 0.02, 0],
  scale = 20,
  opacity = 0.75,
  blur = 2.4,
  far = 12,
  color = '#000000',
  resolution,
  frames = 1,
}: {
  position?: [number, number, number]
  scale?: number
  opacity?: number
  blur?: number
  far?: number
  color?: string
  resolution?: number
  frames?: number
}) {
  if (!quality.contactShadows) return null
  return (
    <ContactShadows
      position={position}
      scale={scale}
      opacity={opacity}
      blur={blur}
      far={far}
      color={color}
      resolution={resolution ?? 512}
      frames={frames}
    />
  )
}
