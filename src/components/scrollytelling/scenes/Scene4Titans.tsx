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
        position={[-44, 0, -52]}
        rotationY={0.45}
        sceneIndex={SCENE}
        fallback={<TitanBody height={15} pose="hunch" rotationY={0.45} skin="#8d6a52" eye="#FF4400" />}
      />
      <ModelSlot
        slot="pure-titan"
        position={[26, 0, -40]}
        rotationY={-0.25}
        sceneIndex={SCENE}
        fallback={<TitanBody height={7} pose="stand" rotationY={-0.25} skin="#9a7a5e" eye="#ffb000" glow={3} variant="pure" />}
      />
      <ModelSlot
        slot="pure-titan"
        position={[-10, 0, 2]}
        rotationY={-0.6}
        sceneIndex={SCENE}
        fallback={<TitanBody height={3.2} pose="march" rotationY={-0.6} skin="#a08064" eye="#ffd36e" glow={2.5} variant="pure" />}
      />
      <ModelSlot
        slot="attack-titan"
        position={[-18, 0, -28]}
        rotationY={0.55}
        sceneIndex={SCENE}
        targetHeight={15}
        fallback={<TitanBody height={15} pose="reach" rotationY={0.55} skin="#7c5a44" eye="#FF4400" glow={3} />}
      />

      {/* the Female Titan, caught mid-turn in the mist */}
      <ModelSlot
        slot="female-titan"
        position={[16, 0, -26]}
        rotationY={-0.45}
        sceneIndex={SCENE}
        targetHeight={14}
        fallback={
          <TitanBody
            height={14}
            pose="stand"
            rotationY={-0.45}
            skin="#a47362"
            eye="#FF7A3A"
            glow={3.5}
            animate={false}
          />
        }
      />

      {/* the 60 m silhouette on the horizon */}
      <group position={[0, 0, -64]}>
        <ModelSlot
          slot="colossal-titan-full"
          sceneIndex={SCENE}
          targetHeight={60}
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
      <ContactShadow position={[14, 0.04, -24]} scale={22} opacity={0.45} blur={3} far={16} resolution={512} />
      <ContactShadow position={[-18, 0.04, -28]} scale={20} opacity={0.5} blur={3} far={17} resolution={512} />
      <ContactShadow position={[-10, 0.04, 2]} scale={5.5} opacity={0.45} blur={2.2} far={4} resolution={256} />

      <Particles count={420} color="#a8b78a" size={1.5} area={150} height={30} opacity={0.24} speed={0.5} seed={21} spread={1.2} />
      <Particles count={160} color="#ff7733" size={0.35} area={90} height={40} opacity={0.45} seed={33} rise />

      {/* low mist banks */}
      <Particles count={90} color="#9aa87d" size={16} area={150} height={6} opacity={0.1} speed={0.25} seed={51} spread={1} />
    </>
  )
}
