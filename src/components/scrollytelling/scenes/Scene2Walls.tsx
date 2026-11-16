'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Clouds, Particles, SceneAtmosphere, SkyDome } from '../three/Atmosphere'
import { Forest } from '../three/Figures'
import { paintVertices } from '../three/geometry'
import { Surface } from '../three/materials'
import { KeyLight } from '../three/Lighting'
import { SceneEnvironment, type EnvPreset } from '../three/environment'
import { annularWall } from '../three/geometry'
import { SCENE_FX } from '@/lib/sceneKeyframes'
import { seededRandom } from '@/lib/utils'
import { motionAllowed } from '@/lib/reducedMotion'

const SCENE = 1
const FX = SCENE_FX[SCENE]
const ENV: EnvPreset = 'wallNoon'

type Wall = { radius: number; height: number; thickness: number; color: string; label: string }

function WallRing({ wall }: { wall: Wall }) {
  const geometry = useMemo(
    () => annularWall(wall.radius, wall.height, wall.thickness, 128, 1.6),
    [wall]
  )
  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <Surface
        kind="stone"
        color={wall.color}
        repeat={[Math.round(wall.radius / 4), 3]}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

/** District tower with a signal beacon — the four towns on each wall. */
function District({ radius, seed }: { radius: number; seed: number }) {
  const beacon = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    if (!beacon.current) return
    const t = motionAllowed() ? state.clock.elapsedTime : 0
    beacon.current.intensity = 12 + Math.sin(t * 1.4 + seed) * 4
  })

  const blocks = useMemo(() => {
    const rnd = seededRandom(seed * 131)
    return Array.from({ length: 7 }, () => ({
      x: (rnd() - 0.5) * 16,
      z: (rnd() - 0.5) * 16,
      w: 2 + rnd() * 4,
      h: 2 + rnd() * 4,
      d: 2 + rnd() * 4,
    }))
  }, [seed])

  return (
    <group>
      {blocks.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]} castShadow receiveShadow>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <Surface kind="plaster" color="#b8ab93" repeat={2} />
        </mesh>
      ))}
      <mesh position={[0, 5, 0]} castShadow>
        <cylinderGeometry args={[1.1, 1.6, 10, 10]} />
        <Surface kind="stone" color="#9d947f" repeat={[2, 2]} />
      </mesh>
      <mesh position={[0, 10.6, 0]}>
        <coneGeometry args={[1.8, 2.4, 8]} />
        <Surface kind="roof" color="#6d4a34" repeat={2} />
      </mesh>
      <mesh position={[0, 11.6, 0]}>
        <sphereGeometry args={[0.55, 12, 10]} />
        <meshStandardMaterial color="#ffd08a" emissive="#ffb45c" emissiveIntensity={4} toneMapped={false} />
      </mesh>
      <pointLight ref={beacon} position={[0, 12, 0]} color="#ffd08a" intensity={12} distance={46} decay={2} />
    </group>
  )
}

export function Scene2Walls() {
  const walls = useMemo<Wall[]>(
    () => [
      { radius: 96, height: 9, thickness: 7, color: '#8c8371', label: 'Maria' },
      { radius: 64, height: 8, thickness: 6, color: '#9a917d', label: 'Rose' },
      { radius: 34, height: 7, thickness: 5.5, color: '#a89e88', label: 'Sina' },
    ],
    []
  )

  const villages = useMemo(() => {
    const rnd = seededRandom(404)
    return Array.from({ length: 46 }, () => {
      const angle = rnd() * Math.PI * 2
      const r = 14 + Math.sqrt(rnd()) * 88
      return {
        x: Math.cos(angle) * r,
        z: Math.sin(angle) * r,
        w: 1.6 + rnd() * 3,
        h: 1.6 + rnd() * 2.6,
        rot: rnd() * Math.PI,
      }
    })
  }, [])

  const villagesRef = useRef<THREE.InstancedMesh>(null)
  const villagesGeometry = useMemo(() => {
    const roof = new THREE.ConeGeometry(0.9, 0.9, 4)
    const base = new THREE.BoxGeometry(1, 1, 1)
    const merged: THREE.BufferGeometry[] = []
    base.translate(0, 0.5, 0)
    roof.translate(0, 1.45, 0)
    merged.push(base, roof)
    const positions: number[] = []
    const normals: number[] = []
    const uvs: number[] = []
    const indices: number[] = []
    let offset = 0
    for (const geometry of merged) {
      const pos = geometry.attributes.position as THREE.BufferAttribute
      const nor = geometry.attributes.normal as THREE.BufferAttribute
      const uv = geometry.attributes.uv as THREE.BufferAttribute
      for (let i = 0; i < pos.count; i += 1) {
        positions.push(pos.getX(i), pos.getY(i), pos.getZ(i))
        normals.push(nor.getX(i), nor.getY(i), nor.getZ(i))
        uvs.push(uv.getX(i), uv.getY(i))
      }
      const index = geometry.index
      if (index) for (let i = 0; i < index.count; i += 1) indices.push(index.getX(i) + offset)
      offset += pos.count
      geometry.dispose()
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geo.setIndex(indices)
    geo.computeBoundingSphere()
    paintVertices(geo, (y, position) => {
      const x = position?.x ?? 0
      if (y > 1.05) return [0.19 + Math.abs(x) * 0.02, 0.12, 0.09]
      return [0.5 + Math.abs(x) * 0.03, 0.44, 0.35]
    })
    return geo
  }, [])

  const dummy = useMemo(() => new THREE.Object3D(), [])
  useFrame(() => {
    const inst = villagesRef.current
    if (!inst) return
    villages.forEach((v, i) => {
      dummy.position.set(v.x, 0, v.z)
      dummy.rotation.set(0, v.rot, 0)
      dummy.scale.set(v.w, v.h, v.w)
      dummy.updateMatrix()
      inst.setMatrixAt(i, dummy.matrix)
    })
    inst.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <SceneEnvironment preset={ENV} intensity={1.25} />
      <SceneAtmosphere bg="#a9d3e8" fog="#b6d8e8" near={260} far={900} />
      <SkyDome preset={ENV} radius={1100} exposure={FX.exposure} />

      <ambientLight intensity={0.18} color="#dff0ff" />
      <KeyLight
        position={[220, 300, 140]}
        target={[0, 0, 0]}
        intensity={2.6}
        color="#fff4dd"
        shadowScale={240}
        shadowMapSize={2048}
        normalBias={0.4}
        radius={2}
      />

      {/* terrain: fields inside the walls, darker scrub outside */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]} receiveShadow>
        <circleGeometry args={[300, 96]} />
        <Surface kind="dirt" color="#63713f" repeat={70} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]}>
        <planeGeometry args={[2400, 2400]} />
        <Surface kind="dirt" color="#4d5a38" repeat={220} />
      </mesh>

      {walls.map((wall) => (
        <WallRing key={wall.label} wall={wall} />
      ))}

      {/* villages inside Maria */}
      <instancedMesh ref={villagesRef} args={[villagesGeometry, undefined, villages.length]} receiveShadow>
        <Surface kind="plaster" color="#8d8471" plain vertexColors />
      </instancedMesh>

      {walls.map((wall, i) =>
        [0, 1, 2, 3].map((d) => {
          const angle = (d / 4) * Math.PI * 2 + Math.PI / 4 + i * 0.2
          return (
            <group
              key={`${wall.label}-${d}`}
              position={[Math.cos(angle) * wall.radius, 0, Math.sin(angle) * wall.radius]}
            >
              <District radius={wall.radius} seed={i * 7 + d + 1} />
            </group>
          )
        })
      )}

      {/* royal palace at the centre */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 4, 0]} castShadow receiveShadow>
          <boxGeometry args={[9, 8, 9]} />
          <Surface kind="plaster" color="#e2d6bb" repeat={3} />
        </mesh>
        <mesh position={[0, 10, 0]} castShadow>
          <coneGeometry args={[7, 6, 4]} />
          <Surface kind="roof" color="#7d5638" repeat={2} />
        </mesh>
        {[-1, 1].map((sx) =>
          [-1, 1].map((sz) => (
            <mesh key={`${sx}-${sz}`} position={[sx * 5, 6, sz * 5]} castShadow>
              <cylinderGeometry args={[1.2, 1.4, 12, 10]} />
              <Surface kind="stone" color="#d8c9a8" repeat={[2, 3]} />
            </mesh>
          ))
        )}
      </group>

      <Forest count={760} radius={290} innerRadius={104} height={12} seed={5} color="#ffffff" />
      <Forest count={300} radius={78} innerRadius={38} height={9} seed={12} color="#ffffff" position={[0, 0, 12]} />

      <Clouds count={16} radius={380} height={210} size={210} opacity={0.2} seed={8} />
      <Particles count={260} color="#e8f1f7" size={1.4} area={400} height={70} opacity={0.2} speed={0.35} seed={21} spread={1} />
    </>
  )
}
