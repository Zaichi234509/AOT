'use client'

import { useMemo } from 'react'
import { Ground, Particles, SceneAtmosphere, SkyDome } from '../three/Atmosphere'
import { TitanBody } from '../three/Figures'
import { Surface } from '../three/materials'
import { ContactShadow, KeyLight } from '../three/Lighting'
import { ModelSlot } from '../three/ModelSlot'
import { SceneEnvironment, type EnvPreset } from '../three/environment'
import { SCENE_FX } from '@/lib/sceneKeyframes'
import { seededRandom } from '@/lib/utils'

const SCENE = 3
const FX = SCENE_FX[SCENE]
const ENV: EnvPreset = 'titanMist'

export function Scene4Titans() {
  const debris = useMemo(() => {
    const rnd = seededRandom(88)
    return Array.from({ length: 26 }, () => ({
      position: [(-0.5 + rnd()) * 130, 0.4 + rnd() * 1.6, -70 + rnd() * 120] as [number, number, number],
      scale: 0.6 + rnd() * 2.6,
      rotation: [rnd() * 3, rnd() * 3, rnd() * 3] as [number, number, number],
    }))
  }, [])

  return (
    <>
      <SceneEnvironment preset={ENV} intensity={1.2} />
      <SceneAtmosphere bg="#1b2117" fog="#5d6650" near={18} far={132} />
      <SkyDome preset={ENV} radius={620} exposure={FX.exposure} />

      <ambientLight intensity={0.12} color="#b9c49a" />
      <KeyLight
        position={[-38, 48, 22]}
        target={[0, 7, -12]}
        intensity={2.1}
        color="#e8eed2"
        shadowScale={62}
        shadowMapSize={2048}
        normalBias={0.12}
        radius={3}
      />
      {/* cold bounce from the fog, and a red punch from the far fire */}
      <hemisphereLight args={['#8b9a6d', '#12150e', 0.28]} />
      <pointLight position={[0, 30, -60]} intensity={260} distance={170} decay={2} color="#ff5a1e" />
      {/* soft bounce from the misty ground */}
      <directionalLight position={[6, 2, 20]} intensity={0.35} color="#9aa87d" />

      <Ground color="#2b271c" size={520} repeat={120} />

      {/* the pure titans, at genuinely different heights */}
      <ModelSlot
        slot="pure-titan"
        position={[-11, 0, -15]}
        rotationY={0.5}
        sceneIndex={SCENE}
        fallback={<TitanBody height={15} pose="hunch" rotationY={0.5} skin="#8d6a52" eye="#FF4400" />}
      />
      <ModelSlot
        slot="pure-titan"
        position={[4.5, 0, -7]}
        rotationY={-0.2}
        sceneIndex={SCENE}
        fallback={<TitanBody height={7} pose="stand" rotationY={-0.2} skin="#9a7a5e" eye="#ffb000" glow={3} variant="pure" />}
      />
      <ModelSlot
        slot="pure-titan"
        position={[9, 0, 3]}
        rotationY={-0.6}
        sceneIndex={SCENE}
        fallback={<TitanBody height={3.2} pose="march" rotationY={-0.6} skin="#a08064" eye="#ffd36e" glow={2.5} variant="pure" />}
      />
      <ModelSlot
        slot="attack-titan"
        position={[-5, 0, 5]}
        rotationY={0.9}
        sceneIndex={SCENE}
        fallback={<TitanBody height={4.6} pose="reach" rotationY={0.9} skin="#7c5a44" eye="#FF4400" glow={3} />}
      />

      {/* the 60 m silhouette on the horizon */}
      <group position={[0, 0, -64]}>
        <ModelSlot
          slot="colossal-titan-head"
          sceneIndex={SCENE}
          fallback={<TitanBody height={60} pose="stand" skin="#2c2a24" eye="#FF2200" glow={2} muscles={false} animate={false} variant="colossal" />}
        />
      </group>

      {debris.map((rock, i) => (
        <mesh key={i} position={rock.position} rotation={rock.rotation} scale={rock.scale} castShadow receiveShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <Surface kind="rock" color="#4a4a3c" repeat={1} />
        </mesh>
      ))}

      <ContactShadow position={[0, 0.04, -6]} scale={34} opacity={0.55} blur={2.8} far={22} resolution={512} />

      <Particles count={420} color="#a8b78a" size={1.5} area={150} height={30} opacity={0.24} speed={0.5} seed={21} spread={1.2} />
      <Particles count={160} color="#ff7733" size={0.35} area={90} height={40} opacity={0.45} seed={33} rise />

      {/* low mist banks */}
      <Particles count={90} color="#9aa87d" size={16} area={150} height={6} opacity={0.1} speed={0.25} seed={51} spread={1} />
    </>
  )
}
