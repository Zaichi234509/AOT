'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Ground, Particles, SceneAtmosphere, SkyDome } from '../three/Atmosphere'
import { Boulder, Building, TitanBody, WallGate } from '../three/Figures'
import { ContactShadow, KeyLight } from '../three/Lighting'
import { ModelSlot } from '../three/ModelSlot'
import { SceneEnvironment, type EnvPreset } from '../three/environment'
import { SCENE_FX } from '@/lib/sceneKeyframes'
import { seededRandom } from '@/lib/utils'

const SCENE = 4
const FX = SCENE_FX[SCENE]
const ENV: EnvPreset = 'trostSunset'

function CityBlock() {
  const buildings = useMemo(() => {
    const rnd = seededRandom(17)
    const items: Array<{
      position: [number, number, number]
      width: number
      depth: number
      height: number
      rotationY: number
      tone: string
    }> = []
    for (let row = 0; row < 5; row += 1) {
      for (let col = 0; col < 9; col += 1) {
        const x = -40 + col * 10 + (rnd() - 0.5) * 2
        const z = 8 - row * 26 + (rnd() - 0.5) * 4
        // keep a 26 m wide street clear for the camera flight
        if (Math.abs(x) < 13) continue
        items.push({
          position: [x, 0, z],
          width: 7 + rnd() * 3,
          depth: 7 + rnd() * 3,
          height: 9 + rnd() * 10,
          rotationY: (rnd() - 0.5) * 0.24,
          tone: rnd() > 0.5 ? '#8d7f6a' : '#7d715e',
        })
      }
    }
    return items
  }, [])

  return (
    <group>
      {buildings.map((b, i) => (
        <Building
          key={i}
          {...b}
          roofColor={i % 3 === 0 ? '#5a3a26' : '#4a3020'}
          windows={i % 2 === 0}
        />
      ))}
    </group>
  )
}

export function Scene5Trost() {
  return (
    <>
      <SceneEnvironment preset={ENV} intensity={1.1} />
      <SceneAtmosphere bg="#6b4a2c" fog="#9a6b42" near={45} far={260} />
      <SkyDome preset={ENV} radius={700} exposure={FX.exposure} />

      <ambientLight intensity={0.14} color="#ffd9b0" />
      <KeyLight
        position={[62, 74, 26]}
        target={[0, 8, -40]}
        intensity={2.7}
        color="#ffc07a"
        shadowScale={86}
        shadowMapSize={2048}
        normalBias={0.09}
        radius={3}
      />
      <pointLight position={[0, 18, -70]} intensity={140} distance={150} decay={2} color="#ff7a3a" />
      <hemisphereLight args={['#ffb787', '#2a1f14', 0.3]} />

      <Ground color="#40301f" size={700} repeat={130} />

      {/* Wall Rose at the far end of the district */}
      <ModelSlot
        slot="wall-maria-gate"
        position={[0, 0, -98]}
        fallback={<WallGate height={50} width={210} rows={12} cols={30} gateWidth={24} color="#6d6152" />}
      />

      {/* the wider Trost district, kept behind the gate so the camera lane stays clear */}
      <ModelSlot
        slot="trost-district"
        position={[0, 0, -315]}
        targetHeight={60}
        castShadow={false}
        receiveShadow={false}
        fallback={<WallGate height={60} width={440} rows={14} cols={40} gateWidth={28} color="#6d6152" />}
      />

      <CityBlock />

      {/* the boulder that plugged the gate */}
      <ModelSlot
        slot="boulder"
        position={[2, 0, -86]}
        fallback={<Boulder radius={8.5} color="#5a5248" seed={7} rotationY={0.6} />}
      />

      <ModelSlot
        slot="attack-titan"
        position={[-15, 0, -36]}
        rotationY={0.4}
        sceneIndex={SCENE}
        targetHeight={15}
        fallback={<TitanBody height={15} pose="reach" rotationY={0.4} skin="#8a6048" eye="#FF4400" glow={3} />}
      />
      <ModelSlot
        slot="pure-titan"
        position={[19, 0, -20]}
        rotationY={-0.6}
        sceneIndex={SCENE}
        fallback={<TitanBody height={6} pose="march" rotationY={-0.6} skin="#9a7a5c" eye="#ffb000" glow={2.5} variant="pure" />}
      />

      <ContactShadow position={[0, 0.03, -50]} scale={44} opacity={0.6} blur={3} far={26} resolution={512} />

      <Particles count={620} color="#d99a62" size={0.85} area={140} height={46} opacity={0.3} seed={41} />
      <Particles count={220} color="#ffbb66" size={0.3} area={100} height={36} opacity={0.45} seed={43} rise />
    </>
  )
}
