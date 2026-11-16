'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Particles, SceneAtmosphere } from '../three/Atmosphere'
import { Surface } from '../three/materials'
import { ContactShadow, KeyLight } from '../three/Lighting'
import { Sphere } from '../three/primitives'
import { SceneEnvironment, type EnvPreset } from '../three/environment'
import { SCENE_FX } from '@/lib/sceneKeyframes'
import { seededRandom } from '@/lib/utils'
import { motionAllowed } from '@/lib/reducedMotion'

const SCENE = 5
const FX = SCENE_FX[SCENE]
const ENV: EnvPreset = 'basementLamp'

const WOOD = '#4a2f1c'
const WOOD_DARK = '#2c1a0f'

export function Scene6Basement() {
  const candle = useRef<THREE.PointLight>(null)

  const books = useMemo(() => {
    const rnd = seededRandom(11)
    const items: Array<{ x: number; y: number; z: number; h: number; color: string }> = []
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
    if (!candle.current) return
    const t = motionAllowed() ? state.clock.elapsedTime : 0
    candle.current.intensity = 9 + Math.sin(t * 8.2) * 1.4 + Math.sin(t * 3.1) * 0.9
  })

  return (
    <>
      <SceneEnvironment preset={ENV} intensity={0.55} />
      <SceneAtmosphere bg="#050403" fog="#0c0906" near={5} far={30} />

      {/* the only real daylight: the stairwell */}
      <KeyLight
        position={[0.6, 6.2, 6.5]}
        target={[0, 0.2, -7]}
        intensity={3.2}
        color="#b9cdf0"
        shadowScale={7}
        shadowMapSize={2048}
        normalBias={0.015}
        radius={3}
      />
      <ambientLight intensity={0.1} color="#8a6b48" />
      <pointLight position={[0.7, 1.2, -9.9]} intensity={11} distance={8} decay={2} color="#ffb066" />
      <pointLight position={[2.4, 1.7, -9.6]} intensity={5} distance={5} decay={2} color="#ff9a52" />
      <pointLight position={[0, 1.1, 3.6]} intensity={7} distance={9} decay={2} color="#9fb4d8" />

      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -5]} receiveShadow>
        <planeGeometry args={[11, 18, 1, 1]} />
        <Surface kind="stone" color="#3b342b" repeat={[7, 11]} normalScale={0.3} roughness={0.96} envMapIntensity={0.3} />
      </mesh>

      {/* walls */}
      <mesh position={[0, 1.8, -13.2]} receiveShadow>
        <boxGeometry args={[11, 3.6, 0.3]} />
        <Surface kind="brick" color="#4a4038" repeat={[8, 3]} />
      </mesh>
      <mesh position={[-5.4, 1.8, -6]} receiveShadow>
        <boxGeometry args={[0.3, 3.6, 14.6]} />
        <Surface kind="brick" color="#463c34" repeat={[10, 3]} />
      </mesh>
      <mesh position={[5.4, 1.8, -6]} receiveShadow>
        <boxGeometry args={[0.3, 3.6, 14.6]} />
        <Surface kind="brick" color="#463c34" repeat={[10, 3]} />
      </mesh>
      <mesh position={[0, 3.62, -6]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[11, 14.6]} />
        <Surface kind="plaster" color="#2a241d" repeat={[6, 6]} />
      </mesh>

      {/* ceiling beams */}
      {[-11, -8, -5, -2, 1].map((z) => (
        <mesh key={z} position={[0, 3.4, z]} castShadow>
          <boxGeometry args={[11, 0.28, 0.34]} />
          <Surface kind="wood" color={WOOD_DARK} repeat={[8, 1]} />
        </mesh>
      ))}

      {/* staircase down into the room */}
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} position={[0, (i + 1) * 0.2, 4.4 - i * 0.52]} receiveShadow castShadow>
          <boxGeometry args={[3.2, 0.2, 0.52]} />
          <Surface kind="stone" color={i % 2 ? '#4a423a' : '#3f382f'} repeat={2} />
        </mesh>
      ))}

      {/* door */}
      <group position={[0, 0, -12.9]}>
        <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.9, 2.3, 0.16]} />
          <Surface kind="wood" color={WOOD} repeat={[2, 3]} />
        </mesh>
        {[-0.55, 0.55].map((x) => (
          <mesh key={x} position={[x, 1.15, 0.1]}>
            <boxGeometry args={[0.62, 2.1, 0.04]} />
            <Surface kind="wood" color={WOOD_DARK} repeat={[1, 3]} />
          </mesh>
        ))}
        {[0.6, 1.4, 1.95].map((y) => (
          <mesh key={y} position={[0, y, 0.12]}>
            <boxGeometry args={[1.86, 0.08, 0.03]} />
            <Surface kind="iron" color="#2f2d2a" repeat={1} />
          </mesh>
        ))}
        <mesh position={[0.62, 1.12, 0.13]}>
          <sphereGeometry args={[0.05, 12, 10]} />
          <meshStandardMaterial color="#ffcf8a" emissive="#ff9944" emissiveIntensity={7} toneMapped={false} />
        </mesh>
        <pointLight position={[0.62, 1.12, 0.45]} intensity={4} distance={4} decay={2} color="#ff9944" />
        <mesh position={[0, 1.2, -0.05]}>
          <boxGeometry args={[2.32, 2.62, 0.12]} />
          <Surface kind="wood" color="#1a1310" repeat={[2, 2]} />
        </mesh>
      </group>

      {/* bookshelf */}
      <group position={[-4.4, 0, -10.4]}>
        <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.6, 2.9, 0.5]} />
          <Surface kind="wood" color={WOOD_DARK} repeat={[3, 3]} />
        </mesh>
        {[0.5, 1.12, 1.74, 2.36].map((y) => (
          <mesh key={y} position={[0, y, 0.2]}>
            <boxGeometry args={[2.4, 0.06, 0.16]} />
            <Surface kind="wood" color={WOOD} repeat={[3, 1]} />
          </mesh>
        ))}
      </group>
      {books.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, b.z + 0.22]} rotation={[0, 0, (i % 5) * 0.015]} castShadow>
          <boxGeometry args={[0.16, b.h, 0.28]} />
          <Surface kind="paper" color={b.color} repeat={1} normalScale={0.3} />
        </mesh>
      ))}

      {/* desk, journal, candle */}
      <group position={[2.4, 0, -10.2]} rotation={[0, -0.25, 0]}>
        <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.1, 1.1]} />
          <Surface kind="wood" color={WOOD} repeat={[3, 2]} />
        </mesh>
        {[-0.95, 0.95].map((x) =>
          [-0.45, 0.45].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, 0.39, z]} castShadow>
              <boxGeometry args={[0.09, 0.78, 0.09]} />
              <Surface kind="wood" color={WOOD_DARK} repeat={[1, 3]} />
            </mesh>
          ))
        )}
        <mesh position={[0, 0.85, 0.05]} rotation={[0, 0.18, 0]} castShadow>
          <boxGeometry args={[0.9, 0.05, 0.62]} />
          <Surface kind="paper" color="#d8cfbc" repeat={1} normalScale={0.3} />
        </mesh>
        {/* candle + flame */}
        <mesh position={[0.72, 0.9, -0.3]} castShadow>
          <cylinderGeometry args={[0.05, 0.06, 0.24, 12]} />
          <Surface kind="paper" color="#efe6d2" repeat={1} />
        </mesh>
        <Sphere position={[0.72, 1.06, -0.3]} radius={0.035} color="#ffd08a" emissive="#ff9944" intensity={9} />
        <pointLight ref={candle} position={[0.72, 1.12, -0.3]} intensity={9} distance={7} decay={2} color="#ffb066" />
      </group>

      {/* photograph */}
      <mesh position={[2.2, 2.15, -13.02]} rotation={[0, 0, -0.03]}>
        <boxGeometry args={[1.1, 0.8, 0.04]} />
        <Surface kind="paper" color="#c9b697" repeat={1} emissive="#241a12" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[2.2, 2.15, -12.98]}>
        <boxGeometry args={[0.92, 0.62, 0.02]} />
        <Surface kind={`paper`} color="#6d5c46" repeat={1} />
      </mesh>

      <ContactShadow position={[0, 0.02, -8]} scale={12} opacity={0.85} blur={2.2} far={5} resolution={768} />

      <Particles count={160} color="#FFCC88" size={0.06} area={9} height={3.2} opacity={0.6} speed={0.12} seed={51} />
    </>
  )
}
