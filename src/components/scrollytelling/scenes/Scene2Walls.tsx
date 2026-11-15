'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getBrickTexture, SkyDome, SceneAtmosphere } from '../three/Atmosphere'

type RingProps = {
  radius: number
  height: number
  color: string
  thickness?: number
}

function WallRing({ radius, height, color, thickness = 2.2 }: RingProps) {
  const texture = useMemo(() => getBrickTexture(), [])
  const map = useMemo(() => {
    if (!texture) return null
    const t = texture.clone()
    t.needsUpdate = true
    t.repeat.set(Math.max(8, Math.round(radius / 6)), Math.max(3, Math.round(height / 3)))
    return t
  }, [texture, radius, height])

  return (
    <group>
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[radius, radius, height, 96, 1, true]} />
        <meshStandardMaterial
          color={color}
          map={map ?? undefined}
          roughness={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, height + 0.4, 0]}>
        <cylinderGeometry args={[radius + thickness * 0.4, radius + thickness * 0.4, 0.8, 96, 1, true]} />
        <meshStandardMaterial color="#8b8271" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function Districts({ radius }: { radius: number }) {
  const beacons = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!beacons.current) return
    beacons.current.children.forEach((child, i) => {
      const light = child.children[0] as THREE.PointLight
      if (light) light.intensity = 6 + Math.sin(state.clock.elapsedTime * 1.6 + i) * 2.5
    })
  })

  return (
    <group ref={beacons}>
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4
        return (
          <group key={i} position={[Math.cos(angle) * radius, 1.5, Math.sin(angle) * radius]}>
            <pointLight color="#ffd08a" intensity={6} distance={40} />
            <mesh position={[0, 1.6, 0]}>
              <cylinderGeometry args={[0.5, 0.9, 3.2, 8]} />
              <meshStandardMaterial
                color="#ffd08a"
                emissive="#ffb45c"
                emissiveIntensity={2}
                toneMapped={false}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

export function Scene2Walls() {
  const rings = useMemo(
    () => [
      { radius: 96, height: 8, color: '#8c8371', label: 'Maria' },
      { radius: 64, height: 7, color: '#9a917d', label: 'Rose' },
      { radius: 34, height: 6, color: '#a89e88', label: 'Sina' },
    ],
    []
  )

  return (
    <>
      <SceneAtmosphere bg="#a9d3e8" fog="#a9d3e8" near={140} far={520} />

      <SkyDome top="#2f6fa8" horizon="#cfe8f5" bottom="#7d8a63" radius={800} />

      <ambientLight intensity={1.1} color="#dff0ff" />
      <directionalLight position={[120, 200, 80]} intensity={2.4} color="#fff4dd" />
      <hemisphereLight args={['#cfe8f5', '#5d6b3f', 1.1]} />

      {/* terrain */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <circleGeometry args={[220, 96]} />
        <meshStandardMaterial color="#5d7a42" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, 0]}>
        <planeGeometry args={[900, 900]} />
        <meshStandardMaterial color="#6b6152" roughness={1} />
      </mesh>

      {rings.map((ring, i) => (
        <WallRing key={ring.label} radius={ring.radius} height={ring.height} color={ring.color} />
      ))}

      <Districts radius={96} />
      <Districts radius={64} />
      <Districts radius={34} />

      {/* drifting clouds */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2
        const r = 60 + ((i * 37) % 120)
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * r, 42 + ((i * 13) % 26), Math.sin(angle) * r]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[14 + (i % 5) * 6, 12]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.22} depthWrite={false} />
          </mesh>
        )
      })}

      {/* central royal palace marker */}
      <mesh position={[0, 3, 0]}>
        <coneGeometry args={[4, 9, 6]} />
        <meshStandardMaterial color="#d8c9a8" emissive="#8a6a34" emissiveIntensity={0.3} roughness={0.8} />
      </mesh>
    </>
  )
}
