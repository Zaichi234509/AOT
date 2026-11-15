'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Ground, Particles, SceneAtmosphere, SkyDome } from '../three/Atmosphere'
import { CorpsFigure, TitanBody } from '../three/Figures'
import { Surface } from '../three/materials'
import { ContactShadow, KeyLight } from '../three/Lighting'
import { ModelSlot } from '../three/ModelSlot'
import { SceneEnvironment, type EnvPreset } from '../three/environment'
import { SCENE_FX } from '@/lib/sceneKeyframes'
import { getStageProgress, sceneLocalProgress } from '@/lib/scroll'
import { motionAllowed } from '@/lib/reducedMotion'

const SCENE = 2
const FX = SCENE_FX[SCENE]
const ENV: EnvPreset = 'corpsNight'

export function Scene3Corps() {
  const key = useRef<THREE.DirectionalLight | null>(null)
  const titan = useRef<THREE.Group>(null)

  useFrame((state) => {
    const local = sceneLocalProgress(getStageProgress(), SCENE)
    const t = motionAllowed() ? state.clock.elapsedTime : 0
    if (key.current) key.current.intensity = 3.1 + Math.sin(t * 0.7) * 0.25
    if (titan.current) {
      titan.current.position.x = 7.0 + Math.sin(t * 0.25) * 0.45
      titan.current.rotation.y = -0.35 + local * 0.2
    }
  })

  return (
    <>
      <SceneEnvironment preset={ENV} intensity={1.0} />
      <SceneAtmosphere bg="#070b14" fog="#16233a" near={14} far={110} />
      <SkyDome preset={ENV} radius={520} exposure={FX.exposure} />

      <ambientLight intensity={0.1} color="#8fb6e0" />
      <KeyLight
        lightRef={key}
        position={[-8, 12, 10]}
        target={[0, 1.2, 0]}
        intensity={4.2}
        color="#e6eeff"
        shadowScale={9}
        shadowMapSize={2048}
        normalBias={0.02}
        radius={4}
      />
      {/* warm rim from behind the trio — separates them from the night */}
      <directionalLight position={[9, 5, -12]} intensity={1.5} color="#c99a6b" />
      <spotLight
        position={[0, 14, 4]}
        angle={0.55}
        penumbra={0.9}
        intensity={120}
        distance={60}
        color="#ffe4bd"
        decay={2}
      />

      <Ground color="#182018" size={320} repeat={90} />

      {/* dais */}
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[9, 64]} />
        <Surface kind="stone" color="#1b241c" repeat={[7, 7]} />
      </mesh>
      <mesh position={[0, 0.075, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6.4, 6.6, 96]} />
        <meshStandardMaterial color="#3d6634" emissive="#4a7c3f" emissiveIntensity={0.3} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.075, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[8.6, 8.75, 96]} />
        <meshStandardMaterial color="#284a22" emissive="#2d5a27" emissiveIntensity={0.22} roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.095, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.2, 3.3, 96]} />
        <meshStandardMaterial color="#7d8872" emissive="#96a684" emissiveIntensity={0.12} roughness={0.7} />
      </mesh>

      {/* the trio */}
      <ModelSlot
        slot="eren-yeager"
        position={[-2.1, 0, 0.5]}
        rotationY={0.3}
        sceneIndex={SCENE}
        fallback={<CorpsFigure capeColor="#2D5A27" animate />}
      />
      <ModelSlot
        slot="mikasa-ackerman"
        position={[0, 0, 0]}
        sceneIndex={SCENE}
        fallback={<CorpsFigure capeColor="#2D5A27" animate />}
      />
      <ModelSlot
        slot="levi-ackerman"
        position={[2.1, 0, 0.5]}
        rotationY={-0.3}
        sceneIndex={SCENE}
        fallback={<CorpsFigure capeColor="#2D5A27" pose="salute" accent="#e8e2d4" hair="#141110" animate />}
      />

      <ContactShadow position={[0, 0.11, 0]} scale={8.5} opacity={0.8} blur={2.6} far={5} resolution={768} />

      {/* the Attack Titan, looming behind */}
      <group ref={titan} position={[7.0, 0, -62]}>
        <ModelSlot
          slot="attack-titan"
          sceneIndex={SCENE}
          fallback={<TitanBody height={15} skin="#5f3426" eye="#FF4400" pose="hunch" glow={3.5} animate={false} />}
        />
      </group>

      <Particles count={220} color="#e8d6b8" size={0.22} area={26} height={9} opacity={0.42} seed={9} />
      <Particles count={120} color="#9fd0ff" size={0.12} area={50} height={26} opacity={0.32} seed={12} spread={1.4} />
    </>
  )
}
