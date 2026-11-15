'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getBrickTexture, getMuscleTexture } from './Atmosphere'

/* ─────────────────────────────── Titans ─────────────────────────────── */

export type TitanPose = 'stand' | 'hunch' | 'reach' | 'march'

type TitanProps = {
  height?: number
  position?: [number, number, number]
  rotationY?: number
  skin?: string
  eye?: string
  pose?: TitanPose
  muscles?: boolean
  glow?: number
  animate?: boolean
}

/**
 * Parametric titan built from capsules. 1 unit = 1 metre, so a 15 m titan is
 * genuinely 15 units tall against the 1.7 m human figures.
 */
export function TitanBody({
  height = 15,
  position = [0, 0, 0],
  rotationY = 0,
  skin = '#8a4a3c',
  eye = '#FF4400',
  pose = 'stand',
  muscles = true,
  glow = 4,
  animate = true,
}: TitanProps) {
  const group = useRef<THREE.Group>(null)
  const texture = useMemo(() => (muscles ? getMuscleTexture() : null), [muscles])

  const h = height
  const legLen = h * 0.44
  const legR = h * 0.048
  const hipY = legLen
  const torsoLen = h * 0.3
  const torsoR = h * 0.082
  const shoulderY = hipY + torsoLen * 0.92
  const armLen = h * 0.36
  const armR = h * 0.036
  const headR = h * 0.075
  const headY = hipY + torsoLen + headR * 0.85

  const torsoX = pose === 'hunch' ? 0.42 : pose === 'reach' ? 0.16 : 0.05
  const leftArmZ = pose === 'reach' ? 1.7 : pose === 'march' ? -0.35 : 0.12
  const rightArmZ = pose === 'reach' ? 0.12 : pose === 'march' ? 0.45 : 0.12
  const leftLegX = pose === 'march' ? 0.3 : 0.02
  const rightLegX = pose === 'march' ? -0.28 : 0.02

  useFrame((state) => {
    if (!group.current || !animate) return
    const t = state.clock.elapsedTime
    group.current.rotation.z = Math.sin(t * 0.45) * 0.006
    group.current.position.y = position[1] + Math.sin(t * 0.7) * h * 0.003
  })

  const material = (
    <meshStandardMaterial
      color={texture ? '#ffffff' : skin}
      map={texture ?? undefined}
      roughness={0.88}
      metalness={0.02}
    />
  )

  return (
    <group ref={group} position={position} rotation={[0, rotationY, 0]}>
      {/* legs */}
      <group rotation={[leftLegX, 0, 0]}>
        <mesh position={[-h * 0.055, hipY / 2, 0]} castShadow>
          <capsuleGeometry args={[legR, legLen - legR * 2, 4, 10]} />
          {material}
        </mesh>
      </group>
      <group rotation={[rightLegX, 0, 0]}>
        <mesh position={[h * 0.055, hipY / 2, 0]} castShadow>
          <capsuleGeometry args={[legR, legLen - legR * 2, 4, 10]} />
          {material}
        </mesh>
      </group>
      {/* feet */}
      <mesh position={[-h * 0.055, legR * 0.5, h * 0.02]}>
        <boxGeometry args={[legR * 2.4, legR * 1.1, legR * 4]} />
        <meshStandardMaterial color={skin} roughness={0.9} />
      </mesh>
      <mesh position={[h * 0.055, legR * 0.5, h * 0.02]}>
        <boxGeometry args={[legR * 2.4, legR * 1.1, legR * 4]} />
        <meshStandardMaterial color={skin} roughness={0.9} />
      </mesh>

      {/* torso */}
      <group position={[0, hipY, 0]} rotation={[torsoX, 0, 0]}>
        <mesh position={[0, torsoLen / 2, 0]} castShadow>
          <capsuleGeometry args={[torsoR, torsoLen, 6, 14]} />
          {material}
        </mesh>
        {/* shoulders */}
        <mesh position={[0, torsoLen * 0.86, 0]}>
          <boxGeometry args={[torsoR * 3.4, torsoR * 0.8, torsoR * 1.5]} />
          <meshStandardMaterial color={skin} roughness={0.88} />
        </mesh>

        {/* arms */}
        <group position={[-torsoR * 1.5, torsoLen * 0.85, 0]} rotation={[0.12, 0, leftArmZ]}>
          <mesh position={[0, -armLen / 2, 0]} castShadow>
            <capsuleGeometry args={[armR, armLen - armR * 2, 4, 10]} />
            {material}
          </mesh>
        </group>
        <group position={[torsoR * 1.5, torsoLen * 0.85, 0]} rotation={[0.12, 0, rightArmZ]}>
          <mesh position={[0, -armLen / 2, 0]} castShadow>
            <capsuleGeometry args={[armR, armLen - armR * 2, 4, 10]} />
            {material}
          </mesh>
        </group>

        {/* neck + head */}
        <mesh position={[0, torsoLen + headR * 0.25, 0]}>
          <cylinderGeometry args={[headR * 0.32, headR * 0.42, headR * 0.8, 8]} />
          <meshStandardMaterial color={skin} roughness={0.9} />
        </mesh>
        <group position={[0, torsoLen + headR * 0.95, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[headR, 20, 16]} />
            <meshStandardMaterial color={skin} roughness={0.85} map={texture ?? undefined} />
          </mesh>
          {/* brow ridge */}
          <mesh position={[0, headR * 0.3, headR * 0.55]} rotation={[0.3, 0, 0]}>
            <boxGeometry args={[headR * 1.5, headR * 0.26, headR * 0.5]} />
            <meshStandardMaterial color={skin} roughness={0.9} />
          </mesh>
          {/* eyes */}
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * headR * 0.36, headR * 0.08, headR * 0.86]}>
              <sphereGeometry args={[headR * 0.15, 10, 10]} />
              <meshStandardMaterial
                color={eye}
                emissive={eye}
                emissiveIntensity={glow}
                toneMapped={false}
              />
            </mesh>
          ))}
          {[-1, 1].map((side) => (
            <pointLight
              key={`l-${side}`}
              position={[side * headR * 0.4, headR * 0.1, headR * 1.1]}
              color={eye}
              intensity={h * 0.7}
              distance={h * 1.4}
              decay={2}
            />
          ))}
          {/* jaw */}
          <mesh position={[0, -headR * 0.52, headR * 0.34]}>
            <boxGeometry args={[headR * 1.1, headR * 0.36, headR * 0.72]} />
            <meshStandardMaterial color={skin} roughness={0.95} />
          </mesh>
          {/* mouth line */}
          <mesh position={[0, -headR * 0.4, headR * 0.78]}>
            <boxGeometry args={[headR * 0.76, headR * 0.07, headR * 0.06]} />
            <meshStandardMaterial color="#2a0d08" roughness={1} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

/* ─────────────────────────────── Humans ─────────────────────────────── */

type CorpsProps = {
  position?: [number, number, number]
  rotationY?: number
  cape?: boolean
  capeColor?: string
  accent?: string
  pose?: 'stand' | 'walk' | 'salute'
  scale?: number
  animate?: boolean
}

/** 1.7 m soldier with ODM gear, blades and a flowing Wings of Freedom cape. */
export function CorpsFigure({
  position = [0, 0, 0],
  rotationY = 0,
  cape = true,
  capeColor = '#2D5A27',
  accent = '#D8D2C4',
  pose = 'stand',
  scale = 1,
  animate = true,
}: CorpsProps) {
  const capeRef = useRef<THREE.Mesh>(null)
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!animate) return
    const t = state.clock.elapsedTime
    if (capeRef.current) {
      capeRef.current.rotation.x = -0.18 + Math.sin(t * 1.4) * 0.05
      capeRef.current.rotation.z = Math.sin(t * 0.9) * 0.04
    }
    if (group.current) {
      group.current.position.y = position[1] + Math.sin(t * 0.8 + position[0]) * 0.012
    }
  })

  const jacket = '#6b5a42'
  const trousers = '#c9c2b2'

  return (
    <group ref={group} position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {/* legs */}
      <mesh position={[-0.11, 0.42, 0]}>
        <capsuleGeometry args={[0.075, 0.6, 3, 8]} />
        <meshStandardMaterial color={trousers} roughness={0.9} />
      </mesh>
      <mesh position={[0.11, 0.42, 0]}>
        <capsuleGeometry args={[0.075, 0.6, 3, 8]} />
        <meshStandardMaterial color={trousers} roughness={0.9} />
      </mesh>
      {/* boots */}
      <mesh position={[-0.11, 0.08, 0.02]}>
        <boxGeometry args={[0.14, 0.16, 0.24]} />
        <meshStandardMaterial color="#2b241c" roughness={0.95} />
      </mesh>
      <mesh position={[0.11, 0.08, 0.02]}>
        <boxGeometry args={[0.14, 0.16, 0.24]} />
        <meshStandardMaterial color="#2b241c" roughness={0.95} />
      </mesh>

      {/* torso / jacket */}
      <mesh position={[0, 1.08, 0]}>
        <capsuleGeometry args={[0.17, 0.42, 4, 10]} />
        <meshStandardMaterial color={jacket} roughness={0.85} />
      </mesh>

      {/* arms */}
      <mesh position={[-0.235, 1.04, 0]} rotation={[pose === 'salute' ? -1.4 : 0, 0, 0.18]}>
        <capsuleGeometry args={[0.055, 0.42, 3, 8]} />
        <meshStandardMaterial color={jacket} roughness={0.85} />
      </mesh>
      <mesh position={[0.235, 1.04, 0]} rotation={[0, 0, -0.18]}>
        <capsuleGeometry args={[0.055, 0.42, 3, 8]} />
        <meshStandardMaterial color={jacket} roughness={0.85} />
      </mesh>

      {/* head */}
      <mesh position={[0, 1.48, 0]}>
        <sphereGeometry args={[0.115, 14, 12]} />
        <meshStandardMaterial color="#d7b39a" roughness={0.75} />
      </mesh>

      {/* ODM gear */}
      <mesh position={[-0.2, 0.83, -0.06]} rotation={[0.2, 0.3, 0]}>
        <boxGeometry args={[0.12, 0.18, 0.3]} />
        <meshStandardMaterial color="#8d9199" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0.2, 0.83, -0.06]} rotation={[0.2, -0.3, 0]}>
        <boxGeometry args={[0.12, 0.18, 0.3]} />
        <meshStandardMaterial color="#8d9199" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.92, -0.16]}>
        <boxGeometry args={[0.34, 0.2, 0.1]} />
        <meshStandardMaterial color="#5b5f66" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* blades */}
      <mesh position={[-0.4, 1.06, 0.16]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.02, 0.72, 0.05]} />
        <meshStandardMaterial color={accent} metalness={0.85} roughness={0.18} />
      </mesh>
      <mesh position={[0.4, 1.06, 0.16]} rotation={[0, 0, -0.35]}>
        <boxGeometry args={[0.02, 0.72, 0.05]} />
        <meshStandardMaterial color={accent} metalness={0.85} roughness={0.18} />
      </mesh>

      {/* cape */}
      {cape ? (
        <mesh ref={capeRef} position={[0, 1.12, -0.18]} rotation={[-0.18, 0, 0]}>
          <planeGeometry args={[0.72, 1.05, 8, 8]} />
          <meshStandardMaterial
            color={capeColor}
            roughness={0.95}
            side={THREE.DoubleSide}
            transparent
            opacity={0.96}
          />
        </mesh>
      ) : null}
    </group>
  )
}

/* ────────────────────────────── Architecture ────────────────────────────── */

type WallGateProps = {
  height?: number
  width?: number
  position?: [number, number, number]
  rotationY?: number
  color?: string
  gateWidth?: number
}

/** Wall segment with an arched gate — the Shiganshina breach point. */
export function WallGate({
  height = 50,
  width = 120,
  position = [0, 0, 0],
  rotationY = 0,
  color = '#6d6355',
  gateWidth = 14,
}: WallGateProps) {
  const texture = useMemo(() => getBrickTexture(), [])
  const blocks = useMemo(() => {
    const items: { x: number; y: number; z: number; w: number; h: number; d: number }[] = []
    const rows = 8
    const blockH = height / rows
    for (let row = 0; row < rows; row += 1) {
      const y = row * blockH + blockH / 2
      const cols = 12
      const blockW = width / cols
      for (let col = 0; col < cols; col += 1) {
        const x = -width / 2 + col * blockW + blockW / 2
        if (Math.abs(x) < gateWidth / 2 + blockW * 0.2 && y < height * 0.62) continue
        items.push({
          x: x + (row % 2 ? blockW * 0.18 : -blockW * 0.1),
          y,
          z: 0,
          w: blockW * 1.02,
          h: blockH * 0.96,
          d: 10,
        })
      }
    }
    return items
  }, [width, height, gateWidth])

  const arches = Math.max(1, Math.ceil(gateWidth / 7))

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {blocks.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, b.z]} castShadow receiveShadow>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial color={color} map={texture ?? undefined} roughness={0.94} />
        </mesh>
      ))}
      {/* gate arch */}
      <mesh position={[0, height * 0.31, 0]}>
        <cylinderGeometry args={[gateWidth / 2, gateWidth / 2, 10, 24, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#3a332b" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, -0.2]}>
        <boxGeometry args={[gateWidth, height * 0.62, 8]} />
        <meshStandardMaterial color="#14100c" roughness={1} />
      </mesh>
      {/* arch stones */}
      {Array.from({ length: arches * 7 }).map((_, i, arr) => {
        const angle = (i / arr.length) * Math.PI
        const r = gateWidth / 2 + 1.4
        return (
          <mesh
            key={`a-${i}`}
            position={[Math.cos(angle) * r, height * 0.31 + Math.sin(angle) * r, 5.1]}
            rotation={[0, 0, angle - Math.PI / 2]}
          >
            <boxGeometry args={[1.5, 2.2, 1.2]} />
            <meshStandardMaterial color={color} roughness={0.92} />
          </mesh>
        )
      })}
    </group>
  )
}

type BuildingProps = {
  position: [number, number, number]
  width?: number
  depth?: number
  height?: number
  color?: string
  roofColor?: string
  windows?: boolean
  rotationY?: number
}

export function Building({
  position,
  width = 8,
  depth = 8,
  height = 12,
  color = '#4a3b2c',
  roofColor = '#2c2016',
  windows = true,
  rotationY = 0,
}: BuildingProps) {
  const windowRows = Math.max(1, Math.floor(height / 4))
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} roughness={0.92} />
      </mesh>
      {/* roof */}
      <mesh position={[0, height + height * 0.12, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[Math.max(width, depth) * 0.78, height * 0.24, 4]} />
        <meshStandardMaterial color={roofColor} roughness={0.9} />
      </mesh>
      {windows
        ? Array.from({ length: windowRows }).map((_, row) =>
            [-1, 1].map((side) => (
              <mesh
                key={`w-${row}-${side}`}
                position={[side * (width / 2 + 0.02), 2.2 + row * 3.4, 0]}
                rotation={[0, side > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
              >
                <planeGeometry args={[width * 0.16, height * 0.12]} />
                <meshStandardMaterial
                  color="#ffb066"
                  emissive="#ff9944"
                  emissiveIntensity={0.7}
                  transparent
                  opacity={0.75}
                />
              </mesh>
            ))
          )
        : null}
    </group>
  )
}
