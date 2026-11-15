'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Ground, Particles, SkyDome, Steam, SceneAtmosphere } from '../three/Atmosphere'
import { TitanBody, WallGate } from '../three/Figures'
import { sceneLocalProgress, getStageProgress } from '@/lib/scroll'
import { seededRandom } from '@/lib/utils'

const SCENE = 0

function Debris() {
  const group = useRef<THREE.Group>(null)
  const chunks = useMemo(() => {
    const rnd = seededRandom(77)
    return Array.from({ length: 22 }, () => ({
      base: [(-1 + rnd() * 2) * 30, 0.5 + rnd() * 2, -30 + rnd() * 22] as [number, number, number],
      scatter: [(-1 + rnd() * 2) * 26, rnd() * 26, -18 + rnd() * 30] as [number, number, number],
      size: 1 + rnd() * 3.4,
      spin: [rnd() * 3, rnd() * 3, rnd() * 3] as [number, number, number],
      delay: rnd() * 0.14,
    }))
  }, [])

  useFrame(() => {
    if (!group.current) return
    const local = sceneLocalProgress(getStageProgress(), SCENE)
    const burst = Math.max(0, Math.min(1, (local - 0.5) / 0.2))
    group.current.children.forEach((child, i) => {
      const c = chunks[i]
      if (!c) return
      const t = Math.max(0, Math.min(1, (burst - c.delay) / (1 - c.delay || 1)))
      const ease = 1 - Math.pow(1 - t, 2)
      child.position.set(
        c.base[0] + c.scatter[0] * ease,
        c.base[1] + c.scatter[1] * ease + Math.sin(t * Math.PI) * 6,
        c.base[2] + c.scatter[2] * ease
      )
      child.rotation.x = c.spin[0] * ease
      child.rotation.y = c.spin[1] * ease
      child.rotation.z = c.spin[2] * ease
      child.scale.setScalar(1 - ease * 0.15)
    })
  })

  return (
    <group ref={group}>
      {chunks.map((c, i) => (
        <mesh key={i} position={c.base} castShadow>
          <dodecahedronGeometry args={[c.size, 0]} />
          <meshStandardMaterial color={i % 3 === 0 ? '#5c5145' : '#463c32'} roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

export function Scene1Shiganshina() {
  const light = useRef<THREE.DirectionalLight>(null)

  useFrame(() => {
    const local = sceneLocalProgress(getStageProgress(), SCENE)
    // golden hour → dread grey → blood red
    if (light.current) {
      const warmth = 1 - Math.min(1, local / 0.6)
      light.current.intensity = 2.1 - local * 0.9
      light.current.color.setRGB(1, 0.72 + warmth * 0.16, 0.5 + warmth * 0.24)
    }
  })

  return (
    <>
      <SceneAtmosphere bg="#6d4a2c" fog="#7a5333" near={55} far={330} />

      <SkyDome top="#241a2e" horizon="#e2a35f" bottom="#4b3320" />

      <ambientLight intensity={0.55} color="#ffd9ad" />
      <directionalLight ref={light} position={[50, 90, 50]} intensity={2.1} color="#ffc98a" />
      <pointLight position={[0, 30, -50]} intensity={90} distance={220} color="#ff5a1e" />

      <Ground color="#3d3226" />
      <WallGate height={50} width={150} position={[0, 0, -42]} color="#6b6152" gateWidth={16} />

      {/* Colossal Titan looming behind the wall */}
      <TitanBody
        height={60}
        position={[0, 0, -78]}
        pose="reach"
        skin="#8f4a38"
        eye="#FF5A28"
        glow={5}
      />
      <Steam position={[0, 58, -78]} count={16} radius={16} />

      <Debris />
      <Particles count={260} color="#D4A574" size={0.32} area={120} height={50} opacity={0.5} seed={3} />

      {/* distant rooftops of Shiganshina */}
      {Array.from({ length: 14 }).map((_, i) => {
        const x = -70 + i * 10.5
        const height = 3 + ((i * 7) % 5)
        return (
          <mesh key={i} position={[x, height / 2, 18]} castShadow>
            <boxGeometry args={[8, height, 10]} />
            <meshStandardMaterial color="#4a3d2e" roughness={0.95} />
          </mesh>
        )
      })}
    </>
  )
}
