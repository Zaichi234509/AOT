'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Particles, SceneAtmosphere } from '../three/Atmosphere'

const WOOD = '#3a2416'
const WOOD_DARK = '#24160d'
const STONE = '#3a3430'

export function Scene6Basement() {
  const candle = useRef<THREE.PointLight>(null)
  const doorGlow = useRef<THREE.PointLight>(null)

  const books = useMemo(() => {
    const items: { x: number; y: number; z: number; h: number; color: string }[] = []
    let seed = 11
    const rnd = () => {
      seed = (seed * 48271) % 2147483647
      return (seed % 1000) / 1000
    }
    for (let shelf = 0; shelf < 4; shelf += 1) {
      for (let i = 0; i < 9; i += 1) {
        items.push({
          x: -4.4 + i * 0.22,
          y: 0.55 + shelf * 0.62,
          z: -10.4,
          h: 0.32 + rnd() * 0.14,
          color: ['#5a3a24', '#432a1a', '#6b4a2c', '#33241a'][Math.floor(rnd() * 4)],
        })
      }
    }
    return items
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (candle.current) {
      candle.current.intensity = 16 + Math.sin(t * 8.2) * 2.4 + Math.sin(t * 3.1) * 1.6
    }
    if (doorGlow.current) {
      doorGlow.current.intensity = 7 + Math.sin(t * 1.4) * 1.8
    }
  })

  return (
    <>
      <SceneAtmosphere bg="#050403" fog="#0b0805" near={4} far={26} />

      <ambientLight intensity={0.12} color="#8a6b48" />
      <pointLight position={[0, 2.4, 2]} intensity={6} distance={12} color="#5a4a7a" />

      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -7]}>
        <planeGeometry args={[10, 16]} />
        <meshStandardMaterial color="#241d17" roughness={1} />
      </mesh>

      {/* walls */}
      <mesh position={[0, 1.8, -13]} receiveShadow>
        <boxGeometry args={[10, 3.6, 0.3]} />
        <meshStandardMaterial color={STONE} roughness={1} />
      </mesh>
      <mesh position={[-5, 1.8, -7]}>
        <boxGeometry args={[0.3, 3.6, 13]} />
        <meshStandardMaterial color="#2e2924" roughness={1} />
      </mesh>
      <mesh position={[5, 1.8, -7]}>
        <boxGeometry args={[0.3, 3.6, 13]} />
        <meshStandardMaterial color="#2e2924" roughness={1} />
      </mesh>
      <mesh position={[0, 3.5, -7]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 13]} />
        <meshStandardMaterial color="#1c1814" roughness={1} />
      </mesh>

      {/* stone staircase descending into the room */}
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} position={[0, (i + 1) * 0.22, 3 - i * 0.55]} receiveShadow>
          <boxGeometry args={[3.2, 0.22, 0.56]} />
          <meshStandardMaterial color={i % 2 ? '#3a332c' : '#332d27'} roughness={1} />
        </mesh>
      ))}

      {/* the door */}
      <group position={[0, 0, -12.7]}>
        <mesh position={[0, 1.15, 0]}>
          <boxGeometry args={[1.9, 2.3, 0.16]} />
          <meshStandardMaterial color={WOOD} roughness={0.9} />
        </mesh>
        <mesh position={[-0.55, 1.15, 0.1]}>
          <boxGeometry args={[0.6, 2.1, 0.04]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.95} />
        </mesh>
        <mesh position={[0.55, 1.15, 0.1]}>
          <boxGeometry args={[0.6, 2.1, 0.04]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.95} />
        </mesh>
        {/* keyhole */}
        <mesh position={[0.62, 1.12, 0.13]}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial color="#ffcf8a" emissive="#ff9944" emissiveIntensity={5} toneMapped={false} />
        </mesh>
        <pointLight ref={doorGlow} position={[0.62, 1.12, 0.4]} intensity={7} distance={5} color="#ff9944" />
        {/* frame */}
        <mesh position={[0, 1.2, -0.02]}>
          <boxGeometry args={[2.3, 2.6, 0.12]} />
          <meshStandardMaterial color="#1a1310" roughness={1} />
        </mesh>
      </group>

      {/* bookshelf */}
      <mesh position={[-4.2, 1.4, -10.6]}>
        <boxGeometry args={[2.4, 2.8, 0.5]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.95} />
      </mesh>
      {books.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, b.z]} rotation={[0, 0, (i % 5) * 0.02]}>
          <boxGeometry args={[0.18, b.h, 0.3]} />
          <meshStandardMaterial color={b.color} roughness={0.95} />
        </mesh>
      ))}

      {/* desk + journal */}
      <group position={[2.4, 0, -10.2]} rotation={[0, -0.25, 0]}>
        <mesh position={[0, 0.78, 0]}>
          <boxGeometry args={[2.2, 0.1, 1.1]} />
          <meshStandardMaterial color={WOOD} roughness={0.85} />
        </mesh>
        {[-0.95, 0.95].map((x) =>
          [-0.45, 0.45].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, 0.39, z]}>
              <boxGeometry args={[0.1, 0.78, 0.1]} />
              <meshStandardMaterial color={WOOD_DARK} roughness={0.95} />
            </mesh>
          ))
        )}
        {/* journal */}
        <mesh position={[0, 0.86, 0.05]} rotation={[0, 0.18, 0]}>
          <boxGeometry args={[0.9, 0.05, 0.62]} />
          <meshStandardMaterial color="#d8cfbc" roughness={0.9} />
        </mesh>
        {/* candle */}
        <mesh position={[0.7, 0.88, -0.3]}>
          <cylinderGeometry args={[0.05, 0.06, 0.24, 10]} />
          <meshStandardMaterial color="#e8e0cc" roughness={0.8} />
        </mesh>
        <mesh position={[0.7, 1.03, -0.3]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#ffd08a" emissive="#ff9944" emissiveIntensity={6} toneMapped={false} />
        </mesh>
        <pointLight ref={candle} position={[0.7, 1.1, -0.3]} intensity={16} distance={9} color="#ffb066" />
      </group>

      {/* photograph on the wall */}
      <mesh position={[2.2, 2.15, -12.8]} rotation={[0, 0, -0.03]}>
        <boxGeometry args={[1.1, 0.8, 0.04]} />
        <meshStandardMaterial color="#c9b697" roughness={0.9} emissive="#33251a" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[2.2, 2.15, -12.76]}>
        <boxGeometry args={[0.92, 0.62, 0.02]} />
        <meshStandardMaterial color="#6d5c46" roughness={1} />
      </mesh>

      {/* light leak from the stair opening */}
      <mesh position={[0, 1.1, 3.4]} rotation={[0.2, 0, 0]}>
        <coneGeometry args={[2.4, 5, 16, 1, true]} />
        <meshBasicMaterial color="#ffcc88" transparent opacity={0.035} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      <Particles count={90} color="#FFCC88" size={0.035} area={9} height={3.2} opacity={0.55} speed={0.12} seed={51} />
    </>
  )
}
