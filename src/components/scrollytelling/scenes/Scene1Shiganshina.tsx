'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Ground, Particles, SceneAtmosphere, SkyDome, Steam } from '../three/Atmosphere'
import { Building, TitanBody, WallGate } from '../three/Figures'
import { Surface } from '../three/materials'
import { KeyLight } from '../three/Lighting'
import { ModelSlot } from '../three/ModelSlot'
import { SceneEnvironment, type EnvPreset } from '../three/environment'
import { SCENE_FX } from '@/lib/sceneKeyframes'
import { getStageProgress, sceneLocalProgress } from '@/lib/scroll'
import { seededRandom } from '@/lib/utils'
import { motionAllowed } from '@/lib/reducedMotion'

const SCENE = 0
const FX = SCENE_FX[SCENE]
const ENV: EnvPreset = 'shiganshinaDusk'

/** The wall coming apart: one instanced mesh, driven by scroll. */
function Debris() {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const chunks = useMemo(() => {
    const rnd = seededRandom(77)
    return Array.from({ length: 30 }, () => ({
      base: [(-1 + rnd() * 2) * 40, 0.6 + rnd() * 2.2, -58 + rnd() * 14] as [number, number, number],
      scatter: [(-1 + rnd() * 2) * 30, rnd() * 26, 10 + rnd() * 30] as [number, number, number],
      size: 0.8 + rnd() * 3.2,
      spin: [rnd() * 3, rnd() * 3, rnd() * 3] as [number, number, number],
      delay: rnd() * 0.16,
    }))
  }, [])

  useFrame(() => {
    const inst = mesh.current
    if (!inst) return
    const local = sceneLocalProgress(getStageProgress(), SCENE)
    const burst = Math.max(0, Math.min(1, (local - 0.46) / 0.22))
    chunks.forEach((c, i) => {
      const t = Math.max(0, Math.min(1, (burst - c.delay) / (1 - c.delay || 1)))
      const ease = 1 - Math.pow(1 - t, 2)
      dummy.position.set(
        c.base[0] + c.scatter[0] * ease,
        c.base[1] + c.scatter[1] * ease + Math.sin(t * Math.PI) * 7,
        c.base[2] + c.scatter[2] * ease
      )
      dummy.rotation.set(c.spin[0] * ease, c.spin[1] * ease, c.spin[2] * ease)
      dummy.scale.setScalar(c.size * (1 - ease * 0.12))
      dummy.updateMatrix()
      inst.setMatrixAt(i, dummy.matrix)
    })
    inst.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, chunks.length]} castShadow receiveShadow>
      <dodecahedronGeometry args={[1, 0]} />
      <Surface kind="rock" color="#6a5c4b" repeat={1} />
    </instancedMesh>
  )
}

export function Scene1Shiganshina() {
  const key = useRef<THREE.DirectionalLight | null>(null)

  useFrame(() => {
    if (!key.current) return
    const local = sceneLocalProgress(getStageProgress(), SCENE)
    // golden hour → dread grey → blood red
    const warmth = 1 - Math.min(1, local / 0.7)
    key.current.intensity = motionAllowed() ? 3.0 - local * 0.7 : 2.6
    key.current.color.setRGB(1, 0.78 + warmth * 0.14, 0.58 + warmth * 0.22)
  })

  const town = useMemo(() => {
    const rnd = seededRandom(31)
    const houses: Array<{
      position: [number, number, number]
      width: number
      depth: number
      height: number
      rotationY: number
      tone: string
    }> = []
    for (let row = -1; row < 4; row += 1) {
      for (const side of [-1, 1]) {
        for (let i = 0; i < 3; i += 1) {
          const width = 7 + rnd() * 5
          const depth = 7 + rnd() * 5
          houses.push({
            position: [
              side * (row < 0 ? 17 + i * 11 + rnd() * 3 : 27 + i * 14 + rnd() * 4),
              0,
              52 - row * 20 - rnd() * 5,
            ],
            width,
            depth,
            height: 7 + rnd() * 8,
            rotationY: (rnd() - 0.5) * 0.5,
            tone: rnd() > 0.5 ? '#54432f' : '#4a3b2c',
          })
        }
      }
    }
    return houses
  }, [])

  return (
    <>
      <SceneEnvironment preset={ENV} intensity={1.15} />
      <SceneAtmosphere bg="#8a6743" fog="#8f7358" near={90} far={640} />
      <SkyDome preset={ENV} radius={760} exposure={FX.exposure} />

      {/* IBL does the ambient; a low fill keeps the stone from going black */}
      <ambientLight intensity={0.1} color="#cfd9ea" />
      <KeyLight
        lightRef={key}
        position={[-150, 78, -105]}
        target={[0, 24, -55]}
        intensity={3.4}
        color="#ffd7a8"
        shadowScale={130}
        shadowMapSize={2048}
        normalBias={0.09}
        radius={3.5}
      />
      {/* cool sky bounce from the opposite side keeps the shadows blue, not brown */}
      <directionalLight position={[90, 40, 60]} intensity={1.15} color="#9fb6d8" />
      {/* heat from the titan itself */}
      <pointLight position={[0, 30, -26]} intensity={150} distance={95} decay={2} color="#ff7a3a" />

      <Ground color="#4d4436" size={900} repeat={140} />

      <ModelSlot
        slot="wall-maria-gate"
        position={[0, 0, -62]}
        fallback={<WallGate height={50} width={190} color="#736a5c" gateWidth={18} />}
      />

      {/* Colossal Titan, standing in the breach */}
      <ModelSlot
        slot="colossal-titan-head"
        position={[0, 0, -30]}
        sceneIndex={SCENE}
        fallback={
          <TitanBody
            height={60}
            pose="reach"
            variant="colossal"
            skin="#9d6553"
            eye="#FF5A28"
            glow={5}
          />
        }
      />
      <Steam position={[0, 44, -30]} count={22} radius={15} height={46} opacity={0.18} />

      {town.map((house, i) => (
        <Building
          key={i}
          position={house.position}
          width={house.width}
          depth={house.depth}
          height={house.height}
          rotationY={house.rotationY}
          color={house.tone}
          roofColor="#3b2a1c"
          windows={i % 2 === 0}
        />
      ))}

      <Debris />

      <Particles count={420} color="#e5c39a" size={0.5} area={150} height={58} opacity={0.42} seed={3} spread={1} />
      <Particles count={220} color="#ff8a3c" size={0.5} area={90} height={40} opacity={0.3} seed={9} rise />
    </>
  )
}
