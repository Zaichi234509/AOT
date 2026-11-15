'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Ground, Particles, SkyDome, SceneAtmosphere } from '../three/Atmosphere'
import { TitanBody } from '../three/Figures'
import { seededRandom } from '@/lib/utils'

const COUNT = 120

function TitanArmy() {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const army = useMemo(() => {
    const rnd = seededRandom(1234)
    return Array.from({ length: COUNT }, () => ({
      x: (rnd() - 0.5) * 420,
      z: -40 - rnd() * 340,
      scale: 0.8 + rnd() * 0.6,
      speed: 0.5 + rnd() * 0.9,
      phase: rnd() * Math.PI * 2,
    }))
  }, [])

  useFrame((state) => {
    const inst = mesh.current
    if (!inst) return
    const t = state.clock.elapsedTime
    army.forEach((titan, i) => {
      const z = ((titan.z + t * titan.speed * 1.6 + 400) % 400) - 400
      dummy.position.set(titan.x, 30 * titan.scale, z)
      dummy.scale.set(1.6 * titan.scale, 8.6 * titan.scale, 1.6 * titan.scale)
      dummy.rotation.y = Math.sin(titan.phase) * 0.15
      dummy.position.y += Math.sin(t * 1.2 + titan.phase) * 0.6
      dummy.updateMatrix()
      inst.setMatrixAt(i, dummy.matrix)
    })
    inst.instanceMatrix.needsUpdate = true
  })

  const eyePositions = useMemo(() => {
    const rnd = seededRandom(999)
    const arr = new Float32Array(COUNT * 2 * 3)
    for (let i = 0; i < COUNT * 2; i += 1) {
      arr[i * 3] = (rnd() - 0.5) * 420
      arr[i * 3 + 1] = 58 + rnd() * 6
      arr[i * 3 + 2] = -40 - rnd() * 340
    }
    return arr
  }, [])

  return (
    <group>
      <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <capsuleGeometry args={[1, 5, 3, 8]} />
        <meshStandardMaterial color="#140604" roughness={0.95} />
      </instancedMesh>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[eyePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.9}
          color="#ff7733"
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  )
}

export function Scene7Rumbling() {
  return (
    <>
      <SceneAtmosphere bg="#1a0000" fog="#40100a" near={40} far={420} />

      <SkyDome top="#170000" horizon="#ff4a12" bottom="#2a0400" radius={760} />

      <ambientLight intensity={0.35} color="#ff9a66" />
      <directionalLight position={[-40, 60, 30]} intensity={1.6} color="#ff5a1e" />
      <pointLight position={[0, 40, -140]} intensity={900} distance={500} color="#ff3300" />
      <hemisphereLight args={['#ff5a2a', '#1a0500', 0.7]} />

      <Ground color="#170705" size={1200} roughness={1} />

      <TitanArmy />

      {/* foreground colossal titans */}
      <group position={[-22, 0, -26]} rotation={[0, 0.3, 0]}>
        <TitanBody height={60} pose="march" skin="#6b2a1a" eye="#FF4400" glow={5} muscles animate={false} />
      </group>
      <group position={[26, 0, -42]} rotation={[0, -0.4, 0]}>
        <TitanBody height={58} pose="stand" skin="#5c2416" eye="#FF3300" glow={4} muscles={false} animate={false} />
      </group>

      {/* crumbling wall fragments */}
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh
          key={i}
          position={[-46 + i * 7.5, 6 + ((i * 11) % 20), -12 - ((i * 13) % 30)]}
          rotation={[i * 0.3, i * 0.5, i * 0.2]}
        >
          <boxGeometry args={[5, 8 + ((i * 5) % 8), 4]} />
          <meshStandardMaterial color="#4a3428" roughness={1} />
        </mesh>
      ))}

      <Particles count={1400} color="#FF4400" size={0.6} area={300} height={90} opacity={0.55} speed={2.4} seed={71} rise />
      <Particles count={500} color="#ffcc88" size={0.22} area={260} height={70} opacity={0.4} speed={1.4} seed={73} rise />

      {/* heat haze slabs */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 1 + i * 0.4, -60 - i * 30]}>
          <planeGeometry args={[600, 60]} />
          <meshBasicMaterial color="#ff5a1e" transparent opacity={0.03} depthWrite={false} />
        </mesh>
      ))}
    </>
  )
}
