'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Ground, Particles, SceneAtmosphere, SkyDome } from '../three/Atmosphere'
import { TitanBody } from '../three/Figures'
import { Surface } from '../three/materials'
import { ContactShadow, KeyLight } from '../three/Lighting'
import { ModelSlot } from '../three/ModelSlot'
import { SceneEnvironment, type EnvPreset } from '../three/environment'
import { limbGeometry, loftGeometry, matrixAt, mergeGeometries } from '../three/geometry'
import { SCENE_FX } from '@/lib/sceneKeyframes'
import { seededRandom } from '@/lib/utils'
import { motionAllowed } from '@/lib/reducedMotion'

const SCENE = 6
const COUNT = 120
const FX = SCENE_FX[SCENE]
const ENV: EnvPreset = 'rumblingInferno'

/** A ~500-triangle titan silhouette, built once and instanced 120×. */
function useHordeGeometry() {
  return useMemo(() => {
    const torso = loftGeometry(
      [
        { y: 0, rx: 1.5, rz: 1.0 },
        { y: 1.4, rx: 1.35, rz: 0.95 },
        { y: 3.0, rx: 1.7, rz: 1.1 },
        { y: 4.2, rx: 1.5, rz: 1.0 },
      ],
      { radial: 10, capRound: 0.3 }
    )
    const head = new THREE.SphereGeometry(0.95, 12, 10)
    const neck = new THREE.CylinderGeometry(0.45, 0.55, 0.7, 8)
    const arm = limbGeometry({
      length: 3.4,
      radial: 8,
      profile: [
        { t: 0, rx: 0.55, rz: 0.55 },
        { t: 0.5, rx: 0.42, rz: 0.45 },
        { t: 1, rx: 0.34, rz: 0.36 },
      ],
    })
    const leg = limbGeometry({
      length: 4.4,
      radial: 8,
      profile: [
        { t: 0, rx: 0.75, rz: 0.7 },
        { t: 0.5, rx: 0.6, rz: 0.6 },
        { t: 1, rx: 0.5, rz: 0.55 },
      ],
    })
    const foot = new THREE.BoxGeometry(1.1, 0.4, 1.7)
    return mergeGeometries([
      { geometry: torso, matrix: matrixAt([0, 4.4, 0]) },
      { geometry: neck, matrix: matrixAt([0, 8.9, 0]) },
      { geometry: head, matrix: matrixAt([0, 9.7, 0.05], [0, 0, 0], [1, 1.05, 1.05]) },
      { geometry: arm, matrix: matrixAt([-1.85, 8.5, 0], [0.1, 0, 0.12]) },
      { geometry: arm, matrix: matrixAt([1.85, 8.5, 0], [0.1, 0, -0.12]) },
      { geometry: leg, matrix: matrixAt([-0.85, 4.2, 0]) },
      { geometry: leg, matrix: matrixAt([0.85, 4.2, 0]) },
      { geometry: foot, matrix: matrixAt([-0.85, 0.2, 0.35]) },
      { geometry: foot, matrix: matrixAt([0.85, 0.2, 0.35]) },
    ])
  }, [])
}

function TitanHorde() {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const geometry = useHordeGeometry()

  const army = useMemo(() => {
    const rnd = seededRandom(1234)
    return Array.from({ length: COUNT }, () => ({
      x: (rnd() - 0.5) * 460,
      z: -30 - rnd() * 360,
      scale: 0.8 + rnd() * 0.7,
      speed: 0.5 + rnd() * 0.9,
      phase: rnd() * Math.PI * 2,
    }))
  }, [])

  useFrame((state) => {
    const inst = mesh.current
    if (!inst) return
    const t = motionAllowed() ? state.clock.elapsedTime : 12
    army.forEach((titan, i) => {
      const z = ((titan.z + t * titan.speed * 1.6 + 400) % 400) - 400
      dummy.position.set(titan.x, 0, z)
      dummy.rotation.set(0, Math.sin(titan.phase) * 0.18, 0)
      dummy.scale.setScalar(6.4 * titan.scale)
      dummy.updateMatrix()
      inst.setMatrixAt(i, dummy.matrix)
    })
    inst.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, COUNT]} frustumCulled={false}>
      <meshStandardMaterial color="#180605" roughness={0.95} metalness={0} />
    </instancedMesh>
  )
}

/** Embers drifting up over the horde. */
function Embers() {
  return (
    <>
      <Particles count={1500} color="#FF5A18" size={0.85} area={340} height={110} opacity={0.5} speed={2.4} seed={71} rise />
      <Particles count={500} color="#ffcc88" size={0.3} area={280} height={80} opacity={0.4} speed={1.4} seed={73} rise />
    </>
  )
}

export function Scene7Rumbling() {
  const rubble = useMemo(() => {
    const rnd = seededRandom(9)
    return Array.from({ length: 30 }, () => ({
      position: [-60 + rnd() * 120, 2 + rnd() * 22, -8 - rnd() * 70] as [number, number, number],
      scale: [2 + rnd() * 4, 3 + rnd() * 7, 2 + rnd() * 4] as [number, number, number],
      rotation: [rnd() * 3, rnd() * 3, rnd() * 3] as [number, number, number],
    }))
  }, [])

  return (
    <>
      <SceneEnvironment preset={ENV} intensity={1.25} />
      <SceneAtmosphere bg="#1a0201" fog="#5e1a0c" near={55} far={480} />
      <SkyDome preset={ENV} radius={880} exposure={FX.exposure} />

      <ambientLight intensity={0.16} color="#ff9a66" />
      <KeyLight
        position={[-80, 90, 60]}
        target={[0, 25, -120]}
        intensity={2.2}
        color="#ff8a44"
        shadowScale={110}
        shadowMapSize={2048}
        normalBias={0.3}
        radius={3}
      />
      <pointLight position={[0, 45, -150]} intensity={1600} distance={560} decay={2} color="#ff3300" />
      {/* firelight bouncing back at the camera so the foreground is not a silhouette */}
      <pointLight position={[0, 16, 34]} intensity={700} distance={230} decay={2} color="#ff7a33" />
      <hemisphereLight args={['#ff5a2a', '#1a0500', 0.3]} />

      <Ground color="#1c0806" size={1400} repeat={190} />

      <TitanHorde />

      {/* foreground colossal titans */}
      <ModelSlot
        slot="colossal-titan-full"
        position={[-24, 0, -30]}
        rotationY={0.3}
        sceneIndex={SCENE}
        targetHeight={60}
        fallback={
          <TitanBody height={60} pose="march" variant="colossal" skin="#7a3120" eye="#FF4400" glow={5} animate={false} />
        }
      />
      <ModelSlot
        slot="colossal-titan-full"
        position={[27, 0, -46]}
        rotationY={-0.4}
        sceneIndex={SCENE}
        targetHeight={55}
        fallback={
          <TitanBody height={55} pose="stand" variant="colossal" skin="#672a1a" eye="#FF3300" glow={4} muscles={false} animate={false} />
        }
      />

      <ContactShadow position={[0, 0.05, -30]} scale={90} opacity={0.5} blur={3.4} far={40} resolution={512} />

      {rubble.map((chunk, i) => (
        <mesh key={i} position={chunk.position} rotation={chunk.rotation} scale={chunk.scale} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <Surface kind="rock" color="#3d2a20" repeat={[2, 2]} />
        </mesh>
      ))}

      <Embers />
    </>
  )
}
