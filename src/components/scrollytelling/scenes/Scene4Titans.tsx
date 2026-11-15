'use client'

import { Ground, Particles, SkyDome, SceneAtmosphere } from '../three/Atmosphere'
import { TitanBody } from '../three/Figures'

export function Scene4Titans() {
  return (
    <>
      <SceneAtmosphere bg="#1b2117" fog="#3a4a2a" near={12} far={90} />

      <SkyDome top="#0c1108" horizon="#4a5a34" bottom="#141810" radius={380} />

      <ambientLight intensity={0.35} color="#b9c49a" />
      <directionalLight position={[-30, 40, -20]} intensity={1.1} color="#cfd8a8" />
      <pointLight position={[0, 40, -40]} intensity={220} distance={180} color="#ff5a1e" />
      <hemisphereLight args={['#6d7a4a', '#12150e', 0.6]} />

      <Ground color="#241f16" size={400} />

      <TitanBody height={15} position={[-9, 0, -14]} pose="hunch" rotationY={0.5} skin="#8d6a52" eye="#FF4400" />
      <TitanBody height={7} position={[4, 0, -6]} pose="stand" rotationY={-0.2} skin="#9a7a5e" eye="#ffb000" glow={3} />
      <TitanBody height={3.2} position={[8, 0, 2]} pose="march" rotationY={-0.6} skin="#a08064" eye="#ffd36e" glow={2.5} />
      <TitanBody height={4.6} position={[-4, 0, 4]} pose="reach" rotationY={0.9} skin="#7c5a44" eye="#FF4400" glow={3} />

      {/* the colossal silhouette on the horizon */}
      <group position={[0, 0, -62]}>
        <TitanBody height={60} position={[0, 0, 0]} pose="stand" skin="#2c2a24" eye="#FF2200" glow={2} muscles={false} animate={false} />
      </group>

      <Particles count={420} color="#8a9160" size={0.55} area={90} height={26} opacity={0.3} seed={21} />
      <Particles count={200} color="#ff7733" size={0.16} area={70} height={30} opacity={0.5} seed={33} rise />

      {/* low fog slabs */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.4 + i * 0.5, -10 - i * 4]}>
          <planeGeometry args={[220, 40]} />
          <meshBasicMaterial color="#7f8a5c" transparent opacity={0.05} depthWrite={false} />
        </mesh>
      ))}
    </>
  )
}
