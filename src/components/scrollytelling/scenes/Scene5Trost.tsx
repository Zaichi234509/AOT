'use client'

import { useMemo } from 'react'
import { Ground, Particles, SkyDome, SceneAtmosphere } from '../three/Atmosphere'
import { Building, TitanBody } from '../three/Figures'
import { getBrickTexture } from '../three/Atmosphere'

function CityBlock() {
  const buildings = useMemo(() => {
    const items: {
      position: [number, number, number]
      width: number
      depth: number
      height: number
      rotationY: number
    }[] = []
    let seed = 17
    const rnd = () => {
      seed = (seed * 16807) % 2147483647
      return (seed % 1000) / 1000
    }
    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 7; col += 1) {
        const width = 6 + rnd() * 4
        const depth = 6 + rnd() * 4
        const height = 9 + rnd() * 9
        const x = -30 + col * 10 + (rnd() - 0.5) * 2
        const z = 6 - row * 26 + (rnd() - 0.5) * 4
        // leave a gutter for the camera flight path
        if (col === 3 && row < 3) continue
        items.push({ position: [x, 0, z], width, depth, height, rotationY: (rnd() - 0.5) * 0.3 })
      }
    }
    return items
  }, [])

  return (
    <group>
      {buildings.map((b, i) => (
        <Building key={i} {...b} color={i % 2 ? '#4a3b2c' : '#54432f'} windows={i % 3 !== 0} />
      ))}
    </group>
  )
}

export function Scene5Trost() {
  const brick = useMemo(() => getBrickTexture(), [])

  return (
    <>
      <SceneAtmosphere bg="#6b4a2c" fog="#8a6038" near={30} far={190} />

      <SkyDome top="#2a1c30" horizon="#d4874a" bottom="#4a3220" />

      <ambientLight intensity={0.6} color="#ffd9b0" />
      <directionalLight position={[40, 70, 30]} intensity={2} color="#ffc07a" />
      <pointLight position={[0, 20, -60]} intensity={140} distance={180} color="#ff6a2a" />
      <hemisphereLight args={['#ffb787', '#2a1f14', 0.8]} />

      <Ground color="#3a2b1e" />

      {/* Wall Rose at the far end of the district */}
      <mesh position={[0, 25, -95]} receiveShadow>
        <boxGeometry args={[260, 50, 12]} />
        <meshStandardMaterial color="#6d6152" map={brick ?? undefined} roughness={0.95} />
      </mesh>

      <CityBlock />

      {/* the boulder Eren carried to plug the gate */}
      <mesh position={[2, 9, -62]} castShadow>
        <icosahedronGeometry args={[9, 2]} />
        <meshStandardMaterial color="#5a5248" roughness={1} flatShading />
      </mesh>

      {/* a titan stalking between the houses */}
      <group position={[-14, 0, -34]} rotation={[0, 0.4, 0]}>
        <TitanBody height={12} pose="reach" skin="#8a6048" eye="#FF4400" glow={3} muscles />
      </group>
      <group position={[18, 0, -18]} rotation={[0, -0.6, 0]}>
        <TitanBody height={6} pose="march" skin="#9a7a5c" eye="#ffb000" glow={2.5} />
      </group>

      <Particles count={520} color="#D4874A" size={0.5} area={110} height={40} opacity={0.35} seed={41} />
      <Particles count={150} color="#ffbb66" size={0.14} area={80} height={30} opacity={0.5} seed={43} rise />

      {/* rooftop tiles / falling debris */}
      {Array.from({ length: 26 }).map((_, i) => (
        <mesh
          key={i}
          position={[-26 + ((i * 37) % 62), 2 + ((i * 13) % 34), -6 - ((i * 17) % 60)]}
          rotation={[i * 0.4, i * 0.7, i * 0.2]}
        >
          <boxGeometry args={[1.4, 0.16, 1.1]} />
          <meshStandardMaterial color="#6a4a30" roughness={0.95} />
        </mesh>
      ))}
    </>
  )
}
