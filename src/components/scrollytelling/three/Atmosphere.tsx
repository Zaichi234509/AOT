'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { seededRandom } from '@/lib/utils'

/* ────────────────────────────── Sky dome ────────────────────────────── */

type SkyProps = {
  top: string
  horizon: string
  bottom: string
  radius?: number
}

const skyVertex = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const skyFragment = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uBottom;
  varying vec3 vWorld;
  void main() {
    float h = normalize(vWorld).y;
    vec3 col = mix(uHorizon, uTop, smoothstep(0.0, 0.6, h));
    col = mix(uBottom, col, smoothstep(-0.55, 0.05, h));
    gl_FragColor = vec4(col, 1.0);
  }
`

export function SkyDome({ top, horizon, bottom, radius = 700 }: SkyProps) {
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color(top) },
      uHorizon: { value: new THREE.Color(horizon) },
      uBottom: { value: new THREE.Color(bottom) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useEffect(() => {
    uniforms.uTop.value.set(top)
    uniforms.uHorizon.value.set(horizon)
    uniforms.uBottom.value.set(bottom)
  }, [top, horizon, bottom, uniforms])

  return (
    <mesh scale={radius} frustumCulled={false}>
      <sphereGeometry args={[1, 32, 20]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
        toneMapped={false}
        uniforms={uniforms}
        vertexShader={skyVertex}
        fragmentShader={skyFragment}
      />
    </mesh>
  )
}

/* ─────────────────────────── Particle layers ─────────────────────────── */

type ParticleProps = {
  count?: number
  color?: string
  size?: number
  area?: number
  height?: number
  speed?: number
  opacity?: number
  seed?: number
  rise?: boolean
  spread?: number
}

export function Particles({
  count = 240,
  color = '#D4A574',
  size = 0.4,
  area = 70,
  height = 40,
  speed = 1.2,
  opacity = 0.55,
  seed = 1,
  rise = false,
  spread = 1,
}: ParticleProps) {
  const ref = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const rnd = seededRandom(seed * 7919 + 11)
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      arr[i * 3] = (rnd() - 0.5) * area
      arr[i * 3 + 1] = rnd() * height
      arr[i * 3 + 2] = (rnd() - 0.5) * area * spread
    }
    return arr
  }, [count, area, height, seed, spread])

  const velocities = useMemo(() => {
    const rnd = seededRandom(seed * 104729 + 3)
    return Float32Array.from({ length: count }, () => 0.4 + rnd() * 1.2)
  }, [count, seed])

  useFrame((_, delta) => {
    const points = ref.current
    if (!points) return
    const attr = points.geometry.attributes.position as THREE.BufferAttribute
    const arr = attr.array as Float32Array
    const step = Math.min(delta, 0.05) * speed
    for (let i = 0; i < count; i += 1) {
      const idx = i * 3 + 1
      arr[idx] += rise ? step * velocities[i] : -step * velocities[i] * 0.25
      if (arr[idx] > height) arr[idx] = 0
      if (arr[idx] < 0) arr[idx] = height
      arr[i * 3] += Math.sin(arr[idx] * 0.3 + i) * step * 0.25
    }
    attr.needsUpdate = true
    points.rotation.y += delta * 0.01
  })

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        sizeAttenuation
        blending={rise ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  )
}

/* ───────────────────────────── Ground ───────────────────────────── */

type GroundProps = {
  y?: number
  color?: string
  size?: number
  roughness?: number
  metalness?: number
}

export function Ground({
  y = 0,
  color = '#2a2620',
  size = 900,
  roughness = 0.96,
  metalness = 0.02,
}: GroundProps) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow>
      <planeGeometry args={[size, size, 1, 1]} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  )
}

/* ─────────────────────────── Steam puffs ─────────────────────────── */

export function Steam({ position = [0, 0, 0], count = 14, radius = 6, color = '#d8cfc4' }: { position?: [number, number, number]; count?: number; radius?: number; color?: string }) {
  const group = useRef<THREE.Group>(null)

  const puffs = useMemo(() => {
    const rnd = seededRandom(42)
    return Array.from({ length: count }, () => ({
      x: (rnd() - 0.5) * radius,
      y: rnd() * radius * 1.2,
      z: (rnd() - 0.5) * radius * 0.6,
      s: 0.6 + rnd() * 2.2,
      phase: rnd() * Math.PI * 2,
    }))
  }, [count, radius])

  useFrame((state) => {
    if (!group.current) return
    group.current.children.forEach((child, i) => {
      const p = puffs[i]
      if (!p) return
      child.position.y = p.y + Math.sin(state.clock.elapsedTime * 0.3 + p.phase) * 0.8
      child.position.x = p.x + Math.sin(state.clock.elapsedTime * 0.16 + p.phase) * 1.2
      const material = (child as THREE.Mesh).material as THREE.MeshBasicMaterial
      if (material) material.opacity = 0.035 + (Math.sin(state.clock.elapsedTime * 0.4 + p.phase) + 1) * 0.03
    })
  })

  return (
    <group ref={group} position={position}>
      {puffs.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[p.s, 10, 10]} />
          <meshBasicMaterial color={color} transparent opacity={0.05} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

/* ─────────────────────── Procedural textures ─────────────────────── */

let brickTexture: THREE.CanvasTexture | null = null
export function getBrickTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null
  if (brickTexture) return brickTexture
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = '#6d6355'
  ctx.fillRect(0, 0, 256, 256)
  const rnd = seededRandom(5)
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const w = 64
      const h = 32
      const x = col * w + (row % 2 ? 32 : 0) - 32
      const shade = 88 + Math.floor(rnd() * 42)
      ctx.fillStyle = `rgb(${shade + 22},${shade + 12},${shade})`
      ctx.fillRect(x + 2, row * h + 2, w - 4, h - 4)
      ctx.strokeStyle = 'rgba(35,30,24,0.8)'
      ctx.lineWidth = 2
      ctx.strokeRect(x + 2, row * h + 2, w - 4, h - 4)
    }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(3, 2)
  texture.colorSpace = THREE.SRGBColorSpace
  brickTexture = texture
  return texture
}

let muscleTexture: THREE.CanvasTexture | null = null
export function getMuscleTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null
  if (muscleTexture) return muscleTexture
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = '#8a4a3c'
  ctx.fillRect(0, 0, 256, 256)
  const rnd = seededRandom(23)
  for (let i = 0; i < 260; i += 1) {
    const x = rnd() * 256
    const y = rnd() * 256
    const w = 6 + rnd() * 40
    const h = 1 + rnd() * 4
    const light = rnd() > 0.5
    ctx.fillStyle = light ? 'rgba(196,120,96,0.35)' : 'rgba(88,44,34,0.4)'
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rnd() * Math.PI)
    ctx.fillRect(0, 0, w, h)
    ctx.restore()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 3)
  texture.colorSpace = THREE.SRGBColorSpace
  muscleTexture = texture
  return texture
}

/* ───────────────────────── Scene atmosphere ───────────────────────── */

/**
 * Sets scene background + fog from inside the scene graph.
 *
 * R3F's `<color attach="background" />` only works as a direct child of the
 * scene, but every scene is mounted inside a keyed group for remounting. This
 * component does the same job explicitly (and restores the previous values on
 * unmount).
 */
export function SceneAtmosphere({
  bg,
  fog,
  near,
  far,
}: {
  bg: string
  fog: string
  near: number
  far: number
}) {
  const { scene } = useThree()

  useEffect(() => {
    const previousBackground = scene.background
    const previousFog = scene.fog
    scene.background = new THREE.Color(bg)
    scene.fog = new THREE.Fog(fog, near, far)
    return () => {
      scene.background = previousBackground
      scene.fog = previousFog
    }
  }, [scene, bg, fog, near, far])

  return null
}
