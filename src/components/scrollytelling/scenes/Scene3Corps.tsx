'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Ground, Particles, SkyDome, SceneAtmosphere } from '../three/Atmosphere'
import { CorpsFigure, TitanBody } from '../three/Figures'
import { getStageProgress, sceneLocalProgress } from '@/lib/scroll'

const SCENE = 2

export function Scene3Corps() {
  const key = useRef<THREE.SpotLight>(null)
  const titan = useRef<THREE.Group>(null)

  useFrame((state) => {
    const local = sceneLocalProgress(getStageProgress(), SCENE)
    if (key.current) key.current.intensity = 260 + Math.sin(state.clock.elapsedTime * 0.7) * 30
    if (titan.current) {
      titan.current.position.x = 3.5 + Math.sin(state.clock.elapsedTime * 0.25) * 0.4
      titan.current.rotation.y = -0.5 + local * 0.25
    }
  })

  return (
    <>
      <SceneAtmosphere bg="#080d16" fog="#111c2e" near={8} far={70} />

      <SkyDome top="#060a14" horizon="#1b2c46" bottom="#0a1108" radius={420} />

      <ambientLight intensity={0.18} color="#8fb6e0" />
      <directionalLight position={[-8, 12, 6]} intensity={2.4} color="#4A90D9" />
      <directionalLight position={[6, 8, -8]} intensity={1.2} color="#c4956a" />
      <spotLight
        ref={key}
        position={[0, 14, 3]}
        angle={0.5}
        penumbra={0.8}
        intensity={280}
        distance={60}
        color="#ffe4bd"
      />
      <pointLight position={[0, 1.2, 5]} intensity={12} distance={22} color="#4a7c3f" />

      <Ground color="#0e1410" size={300} roughness={0.9} />

      {/* dais */}
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[9, 64]} />
        <meshStandardMaterial color="#1b241c" roughness={0.85} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6.4, 6.6, 64]} />
        <meshStandardMaterial color="#4a7c3f" emissive="#4a7c3f" emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[8.6, 8.75, 64]} />
        <meshStandardMaterial color="#2d5a27" emissive="#2d5a27" emissiveIntensity={0.5} />
      </mesh>

      {/* the trio */}
      <CorpsFigure position={[-2.4, 0, 0.4]} rotationY={0.35} capeColor="#2D5A27" pose="salute" />
      <CorpsFigure position={[0, 0, 0]} rotationY={0} capeColor="#2D5A27" />
      <CorpsFigure position={[2.4, 0, 0.4]} rotationY={-0.35} capeColor="#2D5A27" pose="salute" accent="#e8e2d4" />

      {/* the Attack Titan, looming behind */}
      <group ref={titan} position={[3.5, 0, -16]}>
        <TitanBody height={15} skin="#7d4232" eye="#FF4400" pose="hunch" glow={3.5} animate={false} />
      </group>

      <Particles count={140} color="#e8d6b8" size={0.09} area={26} height={8} opacity={0.5} seed={9} />
      <Particles count={60} color="#9fd0ff" size={0.05} area={50} height={26} opacity={0.35} seed={12} />

      {/* ODM wire trails */}
      {wireTrails.map((wire, i) => (
        <primitive key={i} object={wire} />
      ))}
    </>
  )
}

function buildWire(coords: number[]): THREE.Line {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(coords[0], coords[1], coords[2]),
    new THREE.Vector3(
      (coords[0] + coords[3]) / 2,
      Math.max(coords[1], coords[4]) + 1.4,
      (coords[2] + coords[5]) / 2
    ),
    new THREE.Vector3(coords[3], coords[4], coords[5]),
  ])
  const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(24))
  const material = new THREE.LineBasicMaterial({ color: '#9aa4ad', transparent: true, opacity: 0.35 })
  return new THREE.Line(geometry, material)
}

const wireTrails = [
  buildWire([-6, 4.6, -2, 6, 6.2, -6]),
  buildWire([-4, 5.2, 1, 7, 4.4, -3]),
]
