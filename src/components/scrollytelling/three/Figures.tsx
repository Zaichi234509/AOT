'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getQuality } from '@/lib/quality'
import { Surface } from './materials'
import {
  limbGeometry,
  loftGeometry,
  matrixAt,
  mergeGeometries,
  paintVertices,
  sculptHead,
  type Lobe,
  type Ring,
} from './geometry'

const quality = getQuality()

function useDispose(...geometries: Array<THREE.BufferGeometry | null | undefined>) {
  const latest = useRef(geometries)
  latest.current = geometries
  useEffect(() => {
    return () => {
      for (const geometry of latest.current) geometry?.dispose()
    }
  }, [])
}

/** Sum of gaussian lobes applied to a geometry's vertices. */
function sculptWithLobes(geometry: THREE.BufferGeometry, lobes: Lobe[], scale: number) {
  const anchors = lobes.map((l) => ({
    v: new THREE.Vector3(...l.at).normalize(),
    t: l.tightness,
    amount: l.amount * scale,
  }))
  const position = geometry.attributes.position as THREE.BufferAttribute
  const v = new THREE.Vector3()
  const centre = new THREE.Vector3()
  geometry.computeBoundingBox()
  geometry.boundingBox?.getCenter(centre)
  for (let i = 0; i < position.count; i += 1) {
    v.fromBufferAttribute(position, i)
    const dir = v.clone().sub(centre).normalize()
    let delta = 0
    for (const a of anchors) {
      const d = Math.max(0, dir.dot(a.v))
      delta += Math.pow(d, a.t) * a.amount
    }
    v.addScaledVector(dir, delta)
    position.setXYZ(i, v.x, v.y, v.z)
  }
  position.needsUpdate = true
  geometry.computeVertexNormals()
  return geometry
}

/* ─────────────────────────────── Titans ─────────────────────────────── */

export type TitanPose = 'stand' | 'hunch' | 'reach' | 'march'
export type TitanVariant = 'attack' | 'colossal' | 'pure' | 'armored'

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
  variant?: TitanVariant
  /** skip the facial detail for distant silhouettes */
  simpleFace?: boolean
}

const TITAN_LOBES: Lobe[] = [
  // brow ridge
  { at: [0, 0.36, 0.9], tightness: 7, amount: 0.075 },
  // eye sockets
  { at: [-0.42, 0.2, 0.82], tightness: 22, amount: -0.11 },
  { at: [0.42, 0.2, 0.82], tightness: 22, amount: -0.11 },
  // cheekbones
  { at: [-0.66, -0.02, 0.62], tightness: 8, amount: 0.06 },
  { at: [0.66, -0.02, 0.62], tightness: 8, amount: 0.06 },
  // nose
  { at: [0, 0.14, 1], tightness: 34, amount: 0.05 },
  { at: [0, -0.05, 1], tightness: 70, amount: 0.045 },
  // mouth recess + chin
  { at: [0, -0.34, 0.94], tightness: 9, amount: -0.035 },
  { at: [0, -0.58, 0.78], tightness: 12, amount: 0.06 },
  { at: [-0.46, -0.44, 0.55], tightness: 12, amount: 0.045 },
  { at: [0.46, -0.44, 0.55], tightness: 12, amount: 0.045 },
  // skull mass + temple flattening
  { at: [0, 0.2, -1], tightness: 4, amount: 0.05 },
  { at: [-0.95, 0.15, 0.05], tightness: 10, amount: -0.035 },
  { at: [0.95, 0.15, 0.05], tightness: 10, amount: -0.035 },
]

const TORSO_LOBES: Lobe[] = [
  // pectorals
  { at: [-0.45, 0.42, 0.85], tightness: 5, amount: 0.035 },
  { at: [0.45, 0.42, 0.85], tightness: 5, amount: 0.035 },
  // abdominal blocks
  { at: [-0.28, 0.06, 0.95], tightness: 10, amount: 0.022 },
  { at: [0.28, 0.06, 0.95], tightness: 10, amount: 0.022 },
  { at: [-0.26, -0.22, 0.95], tightness: 11, amount: 0.018 },
  { at: [0.26, -0.22, 0.95], tightness: 11, amount: 0.018 },
  // trapezius / shoulders
  { at: [-0.55, 0.75, 0.1], tightness: 5, amount: 0.03 },
  { at: [0.55, 0.75, 0.1], tightness: 5, amount: 0.03 },
  // shoulder blades and spine groove
  { at: [-0.45, 0.45, -0.85], tightness: 6, amount: 0.025 },
  { at: [0.45, 0.45, -0.85], tightness: 6, amount: 0.025 },
  { at: [0, 0.2, -0.98], tightness: 14, amount: -0.025 },
  // lats
  { at: [-0.9, 0.1, -0.2], tightness: 6, amount: 0.03 },
  { at: [0.9, 0.1, -0.2], tightness: 6, amount: 0.03 },
]

/**
 * Parametric titan.
 *
 * Proportions follow the show's giants rather than human ratios: long limbs, a
 * small head, a heavy jaw and a wide mouth. Limbs are lofted from elliptical
 * cross-sections so they have deltoids, biceps, calves and ankles, the torso is
 * sculpted with pectoral/abdominal lobes, and the skull is displaced from a
 * sphere along anatomical features. 1 unit = 1 metre, feet at y = 0.
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
  variant = 'attack',
  simpleFace = false,
}: TitanProps) {
  const group = useRef<THREE.Group>(null)
  const radial = Math.max(8, Math.round(quality.radialSegments * (height > 30 ? 1.15 : 1)))

  const anatomy = useMemo(() => {
    const H = height
    const colossal = variant === 'colossal'
    const pure = variant === 'pure'
    const headR = H * (colossal ? 0.048 : pure ? 0.072 : 0.055)
    const hipY = H * (pure ? 0.45 : 0.465)
    const shoulderY = H - headR * 2.5
    const neckTop = shoulderY + headR * 0.75
    const headY = neckTop + headR * 0.98
    const shoulderHalf = H * (colossal ? 0.088 : pure ? 0.115 : 0.098)
    const upperArm = H * (colossal ? 0.2 : 0.185)
    const foreArm = H * (colossal ? 0.19 : 0.175)
    const hipJointX = H * 0.046
    const kneeY = H * (pure ? 0.27 : 0.255)
    return {
      H,
      headR,
      hipY,
      shoulderY,
      neckTop,
      headY,
      shoulderHalf,
      upperArm,
      foreArm,
      hipJointX,
      kneeY,
      ankleY: H * 0.05,
      torsoBottom: hipY - H * 0.055,
      torsoTop: shoulderY,
      colossal,
      pure,
    }
  }, [height, variant])

  const geometries = useMemo(() => {
    const {
      H,
      headR,
      hipY,
      shoulderY,
      shoulderHalf,
      upperArm,
      foreArm,
      hipJointX,
      kneeY,
      ankleY,
      torsoBottom,
      torsoTop,
    } = anatomy

    /* torso */
    const span = torsoTop - torsoBottom
    const torsoRings: Ring[] = [
      { y: torsoBottom, rx: H * 0.078, rz: H * 0.055 },
      { y: torsoBottom + span * 0.1, rx: H * 0.088, rz: H * 0.06 },
      { y: torsoBottom + span * 0.34, rx: H * 0.074, rz: H * 0.05 },
      { y: torsoBottom + span * 0.58, rx: H * 0.088, rz: H * 0.056 },
      { y: torsoBottom + span * 0.8, rx: H * 0.098, rz: H * 0.061 },
      { y: torsoTop, rx: H * 0.086, rz: H * 0.055 },
    ]
    const torso = loftGeometry(torsoRings, { radial, capRound: 0.15 })
    sculptWithLobes(torso, TORSO_LOBES, H * 0.55)

    /* neck */
    const neck = loftGeometry(
      [
        { y: 0, rx: headR * 0.6, rz: headR * 0.62 },
        { y: headR * 0.6, rx: headR * 0.44, rz: headR * 0.47 },
        { y: headR * 1.15, rx: headR * 0.41, rz: headR * 0.43 },
      ],
      { radial: Math.max(8, Math.round(radial * 0.6)), capBottom: false }
    )

    /* head */
    const head = sculptHead(headR, TITAN_LOBES, variant === 'pure' ? 1.14 : 1.04, 1.16, 1.02)

    /* mouth line and teeth */
    const mouthY = -headR * 0.38
    const mouthZ = headR * 1.04
    const teethParts: Array<{ geometry: THREE.BufferGeometry; matrix: THREE.Matrix4 }> = []
    const toothCount = simpleFace ? 0 : 10
    for (let i = 0; i < toothCount; i += 1) {
      const t = (i / (toothCount - 1) - 0.5) * 2
      const x = t * headR * 0.46
      const z = mouthZ - Math.abs(t) * headR * 0.16
      teethParts.push({
        geometry: new THREE.BoxGeometry(headR * 0.085, headR * 0.16, headR * 0.09),
        matrix: matrixAt([x, mouthY, z], [0.1, 0, -t * 0.25]),
      })
      teethParts.push({
        geometry: new THREE.BoxGeometry(headR * 0.075, headR * 0.12, headR * 0.08),
        matrix: matrixAt([x, mouthY - headR * 0.24, z], [-0.08, 0, -t * 0.2]),
      })
    }
    const teeth = teethParts.length ? mergeGeometries(teethParts) : null

    /* arms: deltoid → biceps → elbow → forearm → hand */
    const buildArm = () => {
      const deltoid = new THREE.SphereGeometry(H * 0.052, radial, Math.max(6, radial / 2))
      const upper = limbGeometry({
        length: upperArm,
        radial,
        backBias: 1.12,
        profile: [
          { t: 0, rx: H * 0.038, rz: H * 0.04 },
          { t: 0.22, rx: H * 0.036, rz: H * 0.042 },
          { t: 0.55, rx: H * 0.029, rz: H * 0.032 },
          { t: 0.85, rx: H * 0.026, rz: H * 0.028 },
          { t: 1, rx: H * 0.028, rz: H * 0.03 },
        ],
      })
      const fore = limbGeometry({
        length: foreArm,
        radial,
        profile: [
          { t: 0, rx: H * 0.031, rz: H * 0.033 },
          { t: 0.25, rx: H * 0.029, rz: H * 0.03 },
          { t: 0.7, rx: H * 0.022, rz: H * 0.023 },
          { t: 1, rx: H * 0.019, rz: H * 0.021 },
        ],
      })
      const hand = new THREE.BoxGeometry(H * 0.032, H * 0.062, H * 0.022)
      const fingers: Array<{ geometry: THREE.BufferGeometry; matrix: THREE.Matrix4 }> = []
      for (let f = 0; f < 4; f += 1) {
        fingers.push({
          geometry: new THREE.BoxGeometry(H * 0.0075, H * 0.038, H * 0.009),
          matrix: matrixAt([(f - 1.5) * H * 0.0085, -H * 0.048, 0], [0.12, 0, 0]),
        })
      }
      fingers.push({
        geometry: new THREE.BoxGeometry(H * 0.008, H * 0.028, H * 0.01),
        matrix: matrixAt([H * 0.02, -H * 0.02, H * 0.004], [0, 0, -0.55]),
      })
      return mergeGeometries([
        { geometry: deltoid, matrix: matrixAt([0, 0, 0]) },
        { geometry: upper, matrix: matrixAt([0, -H * 0.005, 0]) },
        { geometry: fore, matrix: matrixAt([0, -upperArm - H * 0.002, 0]) },
        { geometry: hand, matrix: matrixAt([0, -upperArm - foreArm - H * 0.03, 0]) },
        ...fingers.map((f) => ({
          geometry: f.geometry,
          matrix: new THREE.Matrix4()
            .makeTranslation(0, -upperArm - foreArm - H * 0.03, 0)
            .multiply(f.matrix),
        })),
      ])
    }

    /* legs: thigh → calf → foot, origin at the hip joint */
    const buildLeg = () => {
      const thighLen = hipY - kneeY
      const calfLen = kneeY - ankleY
      const thigh = limbGeometry({
        length: thighLen,
        radial,
        backBias: 1.08,
        profile: [
          { t: 0, rx: H * 0.062, rz: H * 0.058 },
          { t: 0.2, rx: H * 0.064, rz: H * 0.062 },
          { t: 0.6, rx: H * 0.05, rz: H * 0.05 },
          { t: 0.92, rx: H * 0.043, rz: H * 0.045 },
          { t: 1, rx: H * 0.045, rz: H * 0.046 },
        ],
      })
      const calf = limbGeometry({
        length: calfLen,
        radial,
        backBias: 1.22,
        profile: [
          { t: 0, rx: H * 0.044, rz: H * 0.046 },
          { t: 0.18, rx: H * 0.046, rz: H * 0.055 },
          { t: 0.55, rx: H * 0.033, rz: H * 0.036 },
          { t: 0.9, rx: H * 0.022, rz: H * 0.024 },
          { t: 1, rx: H * 0.021, rz: H * 0.023 },
        ],
      })
      const foot = new THREE.BoxGeometry(H * 0.045, H * 0.036, H * 0.098)
      const toes = new THREE.BoxGeometry(H * 0.042, H * 0.022, H * 0.028)
      return mergeGeometries([
        { geometry: thigh, matrix: matrixAt([0, 0, 0]) },
        { geometry: calf, matrix: matrixAt([0, -thighLen, 0]) },
        {
          geometry: foot,
          matrix: matrixAt([0, -thighLen - calfLen + H * 0.012, H * 0.026]),
        },
        {
          geometry: toes,
          matrix: matrixAt([0, -thighLen - calfLen + H * 0.006, H * 0.074]),
        },
      ])
    }

    const arm = buildArm()
    const leg = buildLeg()

    return { torso, neck, head, teeth, arm, leg, mouthY, mouthZ }
  }, [anatomy, radial, variant, simpleFace])

  useDispose(
    geometries.torso,
    geometries.neck,
    geometries.head,
    geometries.teeth,
    geometries.arm,
    geometries.leg
  )

  const torsoPitch = pose === 'hunch' ? 0.34 : pose === 'reach' ? 0.1 : 0.02
  const armSwing = pose === 'march' ? 0.4 : 0
  const leftArmPitch = pose === 'reach' ? -1.45 : pose === 'hunch' ? -0.32 : -0.06
  const rightArmPitch = pose === 'reach' ? -0.35 : pose === 'hunch' ? -0.3 : 0.06
  const leftLegPitch = pose === 'march' ? 0.32 : 0.03
  const rightLegPitch = pose === 'march' ? -0.3 : 0.03
  const headPitch = -torsoPitch * 0.55

  useFrame((state) => {
    if (!group.current || !animate) return
    const t = state.clock.elapsedTime
    group.current.rotation.z = Math.sin(t * 0.42) * 0.005
    group.current.position.y = position[1] + Math.sin(t * 0.66) * height * 0.0022
  })

  const skinRepeat = Math.max(2, Math.round(height / 3.75))
  const skinSurface = (
    <Surface
      kind="skin"
      color={skin}
      repeat={[skinRepeat, skinRepeat]}
      normalScale={muscles ? 1 : 0.35}
      roughness={variant === 'colossal' ? 0.62 : 0.74}
    />
  )

  const { H, headR, hipY, shoulderY, headY, shoulderHalf, hipJointX } = anatomy

  return (
    <group ref={group} position={position} rotation={[0, rotationY, 0]}>
      {/* torso + pelvis */}
      <mesh geometry={geometries.torso} castShadow receiveShadow>
        {skinSurface}
      </mesh>

      {/* neck */}
      <mesh geometry={geometries.neck} position={[0, shoulderY - headR * 0.5, 0]} castShadow>
        {skinSurface}
      </mesh>

      {/* head */}
      <group position={[0, headY, 0]} rotation={[headPitch, 0, 0]}>
        <mesh geometry={geometries.head} castShadow>
          {skinSurface}
        </mesh>
        {geometries.teeth ? (
          <mesh geometry={geometries.teeth} castShadow>
            <Surface kind="paper" color="#e8dcc4" roughness={0.55} normalScale={0.2} plain />
          </mesh>
        ) : null}
        {/* mouth cavity */}
        {!simpleFace ? (
          <mesh position={[0, geometries.mouthY, geometries.mouthZ * 0.9]} scale={[headR * 0.62, headR * 0.19, headR * 0.2]}>
            <sphereGeometry args={[1, 16, 12]} />
            <meshStandardMaterial color="#2b0d08" roughness={0.85} />
          </mesh>
        ) : null}
        {/* eyes */}
        {!simpleFace
          ? [-1, 1].map((side) => (
              <mesh
                key={side}
                position={[side * headR * 0.38, headR * 0.17, headR * 1.0]}
                scale={[1, 0.8, 0.7]}
              >
                <sphereGeometry args={[headR * 0.17, 14, 12]} />
                <meshStandardMaterial
                  color={eye}
                  emissive={eye}
                  emissiveIntensity={glow}
                  roughness={0.25}
                  toneMapped={false}
                />
              </mesh>
            ))
          : null}
      </group>

      {/* arms */}
      <group position={[-shoulderHalf, shoulderY, 0]} rotation={[leftArmPitch, 0, 0.14 + armSwing]}>
        <mesh geometry={geometries.arm} castShadow receiveShadow>
          {skinSurface}
        </mesh>
      </group>
      <group position={[shoulderHalf, shoulderY, 0]} rotation={[rightArmPitch, 0, -0.14 - armSwing]}>
        <mesh geometry={geometries.arm} castShadow receiveShadow>
          {skinSurface}
        </mesh>
      </group>

      {/* legs */}
      <group position={[-hipJointX, hipY, 0]} rotation={[leftLegPitch, 0, 0.02]}>
        <mesh geometry={geometries.leg} castShadow receiveShadow>
          {skinSurface}
        </mesh>
      </group>
      <group position={[hipJointX, hipY, 0]} rotation={[rightLegPitch, 0, -0.02]}>
        <mesh geometry={geometries.leg} castShadow receiveShadow>
          {skinSurface}
        </mesh>
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
  hair?: string
}

/* Wings of Freedom emblem, drawn once into a canvas. */
let emblemTexture: THREE.Texture | null = null
function getEmblemTexture(): THREE.Texture | null {
  if (typeof document === 'undefined') return null
  if (emblemTexture) return emblemTexture
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.clearRect(0, 0, size, size)
  ctx.fillStyle = '#ffffff'
  // two swept wings, mirrored, with feather notches
  const drawWing = (dir: number) => {
    ctx.save()
    ctx.translate(size / 2, size * 0.58)
    ctx.scale(dir, 1)
    ctx.beginPath()
    ctx.moveTo(4, 6)
    ctx.bezierCurveTo(size * 0.18, -size * 0.16, size * 0.34, -size * 0.12, size * 0.4, -size * 0.02)
    ctx.bezierCurveTo(size * 0.34, size * 0.02, size * 0.3, size * 0.06, size * 0.26, size * 0.1)
    ctx.bezierCurveTo(size * 0.28, size * 0.06, size * 0.24, size * 0.02, size * 0.2, size * 0.02)
    ctx.bezierCurveTo(size * 0.16, size * 0.04, size * 0.12, size * 0.08, size * 0.08, size * 0.06)
    ctx.bezierCurveTo(size * 0.06, size * 0.1, size * 0.02, size * 0.1, 4, size * 0.08)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
  drawWing(1)
  drawWing(-1)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  emblemTexture = texture
  return texture
}

/**
 * 1.7 m soldier: lofted limbs, a proper jacket with harness straps, ODM gear,
 * blades and a cloth cape that sags and folds instead of a flat plane.
 */
export function CorpsFigure({
  position = [0, 0, 0],
  rotationY = 0,
  cape = true,
  capeColor = '#2D5A27',
  accent = '#D8D2C4',
  pose = 'stand',
  scale = 1,
  animate = true,
  hair = '#2a211c',
}: CorpsProps) {
  const capeRef = useRef<THREE.Mesh>(null)
  const group = useRef<THREE.Group>(null)
  const radial = Math.max(8, Math.round(quality.radialSegments * 0.7))

  const geo = useMemo(() => {
    // legs: thigh → calf → boot, with a knee and a calf bulge
    const leg = limbGeometry({
      length: 0.86,
      radial,
      backBias: 1.1,
      profile: [
        { t: 0, rx: 0.088, rz: 0.092 },
        { t: 0.24, rx: 0.082, rz: 0.086 },
        { t: 0.52, rx: 0.062, rz: 0.066 },
        { t: 0.58, rx: 0.068, rz: 0.074 },
        { t: 0.8, rx: 0.052, rz: 0.056 },
        { t: 1, rx: 0.045, rz: 0.048 },
      ],
    })
    // arms with a deltoid, elbow and forearm taper
    const arm = limbGeometry({
      length: 0.6,
      radial,
      backBias: 1.06,
      profile: [
        { t: 0, rx: 0.056, rz: 0.058 },
        { t: 0.26, rx: 0.05, rz: 0.053 },
        { t: 0.55, rx: 0.038, rz: 0.041 },
        { t: 0.6, rx: 0.042, rz: 0.044 },
        { t: 1, rx: 0.03, rz: 0.032 },
      ],
    })
    const torso = loftGeometry(
      [
        { y: 0.86, rx: 0.152, rz: 0.1 },
        { y: 0.98, rx: 0.148, rz: 0.098 },
        { y: 1.1, rx: 0.158, rz: 0.104 },
        { y: 1.26, rx: 0.19, rz: 0.114 },
        { y: 1.38, rx: 0.208, rz: 0.118 },
        { y: 1.45, rx: 0.19, rz: 0.108 },
        { y: 1.48, rx: 0.12, rz: 0.088 },
      ],
      { radial, capRound: 0.2 }
    )
    sculptWithLobes(torso, [
      { at: [-0.6, 0.42, 0.78], tightness: 5, amount: 0.022 },
      { at: [0.6, 0.42, 0.78], tightness: 5, amount: 0.022 },
      { at: [0, 0.55, -0.9], tightness: 8, amount: 0.012 },
      { at: [0, 0.35, -0.98], tightness: 14, amount: -0.016 },
    ], 1)

    const head = sculptHead(0.102, [
      { at: [0, 0.05, 1], tightness: 34, amount: 0.07 },
      { at: [0, -0.32, 0.9], tightness: 11, amount: 0.05 },
      { at: [0, -0.05, 0.55], tightness: 26, amount: 0.012 },
      { at: [-0.62, 0.02, 0.6], tightness: 10, amount: 0.025 },
      { at: [0.62, 0.02, 0.6], tightness: 10, amount: 0.025 },
      { at: [0, 0.15, -1], tightness: 5, amount: 0.02 },
    ], 1, 1.07, 1.1)

    // hair: cap over the crown plus a back mass, so a face still reads
    const hairCap = new THREE.SphereGeometry(0.106, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.56)
    const hairBack = new THREE.SphereGeometry(0.105, 18, 12, Math.PI * 0.5, Math.PI, 0, Math.PI * 0.9)
    const hairFringe = new THREE.SphereGeometry(0.104, 18, 8, 0, Math.PI, Math.PI * 0.28, Math.PI * 0.16)
    const hairGeo = mergeGeometries([
      { geometry: hairCap, matrix: matrixAt([0, 0.004, 0], [0.06, 0, 0], [1.05, 0.98, 1.07]) },
      { geometry: hairBack, matrix: matrixAt([0, -0.004, -0.008], [0, 0, 0], [1.04, 1.02, 1.08]) },
      { geometry: hairFringe, matrix: matrixAt([0, 0.0, 0.004], [0, 0, 0], [1.04, 1.0, 1.06]) },
    ])

    // cape: narrower than the shoulders, sagging with folds and a rolled hem
    const capeGeo = new THREE.PlaneGeometry(0.44, 0.8, 12, 14)
    const capePos = capeGeo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < capePos.count; i += 1) {
      const x = capePos.getX(i)
      const y = capePos.getY(i)
      const across = x / 0.22
      const down = (0.4 - y) / 0.8
      const fold = Math.sin(across * 5.0 + down * 2.6) * 0.018 * (0.3 + down)
      const flare = 1 + down * 0.34
      capePos.setX(i, x * flare)
      capePos.setY(i, y - down * down * 0.035)
      capePos.setZ(i, -0.08 - down * down * 0.12 + fold - Math.abs(across) * 0.03)
    }
    // hinge the sheet at the shoulders so the pivot is the collar bone
    capeGeo.translate(0, -0.4, 0)
    capeGeo.computeVertexNormals()

    const blade = new THREE.BoxGeometry(0.008, 0.58, 0.022)
    const gear = new THREE.BoxGeometry(0.085, 0.13, 0.2)
    const boot = new THREE.BoxGeometry(0.115, 0.2, 0.235)
    const neck = new THREE.CylinderGeometry(0.048, 0.058, 0.12, 12)
    const collar = new THREE.TorusGeometry(0.095, 0.022, 8, 16)
    const hand = new THREE.BoxGeometry(0.046, 0.075, 0.04)

    return { leg, arm, torso, head, hairGeo, capeGeo, blade, gear, boot, neck, collar, hand }
  }, [radial])
  useDispose(geo.leg, geo.arm, geo.torso, geo.head, geo.hairGeo, geo.capeGeo, geo.blade, geo.gear, geo.boot, geo.neck, geo.collar, geo.hand)

  const emblem = useMemo(() => getEmblemTexture(), [])

  useFrame((state) => {
    if (!animate) return
    const t = state.clock.elapsedTime
    if (capeRef.current) {
      capeRef.current.rotation.x = -0.1 + Math.sin(t * 1.1 + position[0]) * 0.035
      capeRef.current.rotation.z = Math.sin(t * 0.7 + position[2]) * 0.03
    }
    if (group.current) {
      group.current.position.y = position[1] + Math.sin(t * 0.7 + position[0]) * 0.008
    }
  })

  const salute = pose === 'salute'
  const jacket = '#6f6149'
  const trousers = '#8b8578'
  const leather = '#3a2a1c'

  return (
    <group ref={group} position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {/* legs */}
      <mesh geometry={geo.leg} position={[-0.098, 0.9, 0]} castShadow receiveShadow>
        <Surface kind="cloth" color={trousers} repeat={2.4} />
      </mesh>
      <mesh geometry={geo.leg} position={[0.098, 0.9, 0]} castShadow receiveShadow>
        <Surface kind="cloth" color={trousers} repeat={2.4} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={`boot-${side}`} geometry={geo.boot} position={[side * 0.098, 0.1, 0.035]} castShadow receiveShadow>
          <Surface kind="leather" color="#2a2118" repeat={2} roughness={0.8} />
        </mesh>
      ))}

      {/* torso / jacket */}
      <mesh geometry={geo.torso} castShadow receiveShadow>
        <Surface kind="cloth" color={jacket} repeat={3} sheen={0.55} sheenColor="#b9bda6" />
      </mesh>

      {/* chest harness */}
      {[-1, 1].map((side) => (
        <mesh key={`strap-${side}`} position={[side * 0.062, 1.26, 0.104]} rotation={[0, 0, side * 0.24]}>
          <boxGeometry args={[0.042, 0.34, 0.016]} />
          <Surface kind="leather" color="#2c2118" repeat={2} />
        </mesh>
      ))}
      <mesh position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.159, 0.159, 0.055, 22, 1, true]} />
        <Surface kind="leather" color="#241a12" repeat={2} side={THREE.DoubleSide} />
      </mesh>
      {/* belt buckle + pouches */}
      <mesh position={[0, 1.05, 0.152]}>
        <boxGeometry args={[0.07, 0.05, 0.012]} />
        <Surface kind="steel" color="#a8adb4" repeat={1} roughness={0.4} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={`pouch-${side}`} position={[side * 0.17, 0.99, 0.02]} rotation={[0, 0, side * 0.1]} castShadow>
          <boxGeometry args={[0.075, 0.1, 0.055]} />
          <Surface kind="leather" color="#4a3722" repeat={2} />
        </mesh>
      ))}

      {/* collar */}
      <mesh geometry={geo.collar} position={[0, 1.455, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <Surface kind="cloth" color="#5d5039" repeat={2} />
      </mesh>

      {/* neck */}
      <mesh geometry={geo.neck} position={[0, 1.5, 0]}>
        <Surface kind="skin" color="#c8a489" repeat={1} normalScale={0.25} />
      </mesh>

      {/* arms + hands */}
      <mesh
        geometry={geo.arm}
        position={[-0.212, 1.4, 0]}
        rotation={[salute ? -1.35 : -0.05, 0, salute ? 0.1 : 0.11]}
        castShadow
      >
        <Surface kind="cloth" color={jacket} repeat={2} sheen={0.5} sheenColor="#b9bda6" />
      </mesh>
      <mesh geometry={geo.arm} position={[0.212, 1.4, 0]} rotation={[-0.05, 0, -0.11]} castShadow>
        <Surface kind="cloth" color={jacket} repeat={2} sheen={0.5} sheenColor="#b9bda6" />
      </mesh>
      <mesh geometry={geo.hand} position={[-0.238, 0.795, 0.018]} rotation={[0.1, 0, 0.11]} castShadow>
        <Surface kind="skin" color="#b58b73" repeat={1} normalScale={0.2} />
      </mesh>
      <mesh geometry={geo.hand} position={[0.238, 0.795, 0.018]} rotation={[0.1, 0, -0.11]} castShadow>
        <Surface kind="skin" color="#b58b73" repeat={1} normalScale={0.2} />
      </mesh>

      {/* head + hair */}
      <mesh geometry={geo.head} position={[0, 1.585, 0.004]} rotation={[0.04, 0, 0]} castShadow receiveShadow>
        <Surface kind="skin" color="#d3ac91" repeat={1} normalScale={0.3} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={`eye-${side}`} position={[side * 0.032, 1.598, 0.086]} scale={[1, 0.72, 0.6]}>
          <sphereGeometry args={[0.0135, 10, 8]} />
          <meshStandardMaterial color="#201612" roughness={0.45} />
        </mesh>
      ))}
      <mesh geometry={geo.hairGeo} position={[0, 1.59, -0.006]} castShadow>
        <Surface kind="cloth" color={hair} repeat={2.2} physical={false} roughness={0.72} />
      </mesh>

      {/* ODM gear */}
      {[-1, 1].map((side) => (
        <group key={`odm-${side}`} position={[side * 0.19, 0.86, -0.06]} rotation={[0.2, side * 0.28, 0]}>
          <mesh geometry={geo.gear} castShadow>
            <Surface kind="steel" color="#8b9199" repeat={1} roughness={0.45} />
          </mesh>
          <mesh position={[0, -0.02, -0.16]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.23, 12]} />
            <Surface kind="steel" color="#aab0b8" repeat={1} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.07, 0.0]} castShadow>
            <boxGeometry args={[0.03, 0.1, 0.02]} />
            <Surface kind="leather" color="#241a12" repeat={1} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.96, -0.15]} castShadow>
        <boxGeometry args={[0.28, 0.16, 0.09]} />
        <Surface kind="iron" color="#4d5158" repeat={1} />
      </mesh>

      {/* blades in the hip holsters */}
      {[-1, 1].map((side) => (
        <mesh
          key={`blade-${side}`}
          geometry={geo.blade}
          position={[side * 0.255, 1.0, 0.055]}
          rotation={[0.26, 0, side * 0.16]}
          castShadow
        >
          <Surface kind="steel" color="#8d939b" repeat={1} roughness={0.58} metalness={0.7} />
        </mesh>
      ))}

      {/* cape */}
      {cape ? (
        <group position={[0, 1.44, -0.115]}>
          <mesh ref={capeRef} geometry={geo.capeGeo} castShadow receiveShadow>
            <Surface kind="cloth" color={capeColor} repeat={2} side={THREE.DoubleSide} sheen={0.3} sheenColor="#7f8b76" roughness={0.94} />
          </mesh>
          {emblem ? (
            <mesh position={[0, -0.26, -0.14]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[0.3, 0.3]} />
              <meshStandardMaterial
                map={emblem}
                color="#ded8c6"
                transparent
                alphaTest={0.35}
                roughness={0.9}
                polygonOffset
                polygonOffsetFactor={-1}
              />
            </mesh>
          ) : null}
        </group>
      ) : null}
    </group>
  )
}

/* ────────────────────────────── Architecture ────────────────────────────── */

type WallGateProps = {
  height?: number
  width?: number
  /** brick rows / columns — raise them for a wider wall so stone size stays constant */
  rows?: number
  cols?: number
  position?: [number, number, number]
  rotationY?: number
  color?: string
  gateWidth?: number
}

/**
 * Wall segment with an arched gate — the Shiganshina breach point.
 * Bricks are a single InstancedMesh (one draw call) with per-instance colour
 * variation, plus voussoir stones around the arch, iron-bound doors and a
 * crenellated walkway.
 */
export function WallGate({
  height = 50,
  width = 150,
  rows = 9,
  cols = 14,
  position = [0, 0, 0],
  rotationY = 0,
  color = '#6d6355',
  gateWidth = 16,
}: WallGateProps) {
  const brickRef = useRef<THREE.InstancedMesh>(null)
  const walkRef = useRef<THREE.InstancedMesh>(null)

  const layout = useMemo(() => {
    const blockH = height / rows
    const blockW = width / cols
    const bricks: Array<{ x: number; y: number; w: number; h: number; tint: number }> = []
    let seed = 7
    const rnd = () => {
      seed = (seed * 16807) % 2147483647
      return (seed % 1000) / 1000
    }
    for (let row = 0; row < rows; row += 1) {
      const y = row * blockH + blockH / 2
      for (let col = 0; col < cols; col += 1) {
        const x = -width / 2 + col * blockW + blockW / 2 + (row % 2 ? blockW * 0.18 : -blockW * 0.1)
        const archTop = height * 0.62
        if (Math.abs(x) < gateWidth / 2 + blockW * 0.02 && y < archTop) {
          // arch opening: only fill the corners above the curve
          const archRadius = gateWidth / 2
          const dy = y - archTop
          if (dy < archRadius) continue
        }
        bricks.push({
          x,
          y,
          w: blockW * 0.99,
          h: blockH * 0.97,
          tint: 0.72 + rnd() * 0.45,
        })
      }
    }
    const parapet: Array<{ x: number }> = []
    for (let i = 0; i < 18; i += 1) {
      parapet.push({ x: -width / 2 + (i + 0.5) * (width / 18) })
    }
    return { bricks, parapet, blockW, blockH }
  }, [height, width, rows, cols, gateWidth])

  useEffect(() => {
    const mesh = brickRef.current
    if (mesh) {
      const matrix = new THREE.Matrix4()
      const tint = new THREE.Color()
      layout.bricks.forEach((b, i) => {
        matrix.makeScale(b.w, b.h, 10)
        matrix.setPosition(b.x, b.y, 0)
        mesh.setMatrixAt(i, matrix)
        tint.setRGB(b.tint, b.tint * 0.99, b.tint * 0.94)
        mesh.setColorAt(i, tint)
      })
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    }
    const walk = walkRef.current
    if (walk) {
      const matrix = new THREE.Matrix4()
      layout.parapet.forEach((p, i) => {
        matrix.makeScale(layout.blockW * 0.8, 1.6, 3.4)
        matrix.setPosition(p.x, height + 0.8, -3.2)
        walk.setMatrixAt(i, matrix)
      })
      walk.instanceMatrix.needsUpdate = true
    }
  }, [layout, height])

  const voussoirs = Math.max(9, Math.round(gateWidth / 1.6))

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <instancedMesh
        ref={brickRef}
        args={[undefined, undefined, layout.bricks.length]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <Surface kind="stone" color={color} repeat={[layout.blockW / 1.7, layout.blockH / 1.7]} />
      </instancedMesh>

      {/* gate recess */}
      <mesh position={[0, height * 0.31, -0.4]}>
        <boxGeometry args={[gateWidth, height * 0.62, 0.6]} />
        <meshStandardMaterial color="#0a0806" roughness={1} />
      </mesh>

      {/* doors */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * gateWidth * 0.24, 0, 3.4]} rotation={[0, side * 0.04, 0]}>
          <mesh position={[0, height * 0.29, 0]} castShadow>
            <boxGeometry args={[gateWidth * 0.47, height * 0.58, 0.5]} />
            <Surface kind="wood" color="#3a2416" repeat={[2, 6]} />
          </mesh>
          {[0.12, 0.3, 0.48].map((t) => (
            <mesh key={t} position={[0, height * t, 0.28]}>
              <boxGeometry args={[gateWidth * 0.47, 0.42, 0.12]} />
              <Surface kind="iron" color="#3c3a36" repeat={2} />
            </mesh>
          ))}
        </group>
      ))}

      {/* arch voussoirs */}
      {Array.from({ length: voussoirs }).map((_, i) => {
        const angle = (i / (voussoirs - 1)) * Math.PI
        const radius = gateWidth / 2 + 0.9
        const x = Math.cos(angle) * radius
        const y = height * 0.62 + Math.sin(angle) * radius * 0.9
        return (
          <mesh key={`v-${i}`} position={[x, y, 5.2]} rotation={[0, 0, angle - Math.PI / 2]} castShadow>
            <boxGeometry args={[gateWidth * 0.13, 1.5, 1.4]} />
            <Surface kind="granite" color={color} repeat={0.6} />
          </mesh>
        )
      })}

      {/* buttresses */}
      {[-1, 1].map((side) => (
        <mesh
          key={`buttress-${side}`}
          position={[side * (gateWidth / 2 + 5), height * 0.24, 4.4]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[5, height * 0.48, 4]} />
          <Surface kind="stone" color={color} repeat={1.2} />
        </mesh>
      ))}

      {/* crenellated walkway on top */}
      <instancedMesh ref={walkRef} args={[undefined, undefined, layout.parapet.length]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <Surface kind="stone" color="#7a7160" repeat={1} />
      </instancedMesh>
      <mesh position={[0, height + 0.15, -1.4]} receiveShadow>
        <boxGeometry args={[width, 0.5, 8.6]} />
        <Surface kind="stone" color="#7f7768" repeat={[width / 4, 2]} />
      </mesh>
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

/** Town house: stone plinth, plastered timber frame, tiled gable roof. */
export function Building({
  position,
  width = 8,
  depth = 8,
  height = 12,
  color = '#4a3b2c',
  roofColor = '#4a2f21',
  windows = true,
  rotationY = 0,
}: BuildingProps) {
  const roofHeight = height * 0.34
  const timber = '#3b2a1d'

  const roof = useMemo(() => {
    const halfW = width / 2 + 0.55
    const halfD = depth / 2 + 0.55
    const shape = new THREE.BufferGeometry()
    // gable prism: two slanted planes + two triangular gable ends
    const vertices = new Float32Array([
      -halfW, 0, -halfD,
      halfW, 0, -halfD,
      halfW, 0, halfD,
      -halfW, 0, halfD,
      0, roofHeight, -halfD,
      0, roofHeight, halfD,
    ])
    shape.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
    const uv = new Float32Array(12)
    for (let i = 0; i < 6; i += 1) {
      uv[i * 2] = (vertices[i * 3] + halfW) / (halfW * 2)
      uv[i * 2 + 1] = (vertices[i * 3 + 2] + halfD) / (halfD * 2)
    }
    shape.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
    shape.setIndex([
      0, 3, 5, 0, 5, 4,
      1, 4, 5, 1, 5, 2,
      0, 4, 1,
      3, 2, 5,
    ])
    shape.computeVertexNormals()
    return shape
  }, [width, depth, roofHeight])
  useDispose(roof)

  const windowRows = Math.max(1, Math.floor(height / 4.2))
  const windowCols = Math.max(1, Math.round(width / 3.4))

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* stone plinth */}
      <mesh position={[0, height * 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.3, height * 0.12, depth + 0.3]} />
        <Surface kind="stone" color="#6a6154" repeat={[2, 1]} />
      </mesh>
      {/* walls */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <Surface kind="plaster" color={color} repeat={[2, 2]} />
      </mesh>
      {/* timber frame */}
      {[-1, 1].map((side) => (
        <group key={`frame-${side}`}>
          <mesh position={[side * (width / 2 + 0.02), height * 0.55, 0]} castShadow>
            <boxGeometry args={[0.16, height * 0.8, 0.16]} />
            <Surface kind="wood" color={timber} repeat={[1, 4]} />
          </mesh>
          <mesh position={[side * (width / 2 + 0.02), height * 0.22, 0]} castShadow>
            <boxGeometry args={[0.14, 0.14, depth * 0.98]} />
            <Surface kind="wood" color={timber} repeat={[1, 3]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, height * 0.72, depth / 2 + 0.03]} castShadow>
        <boxGeometry args={[width, 0.14, 0.12]} />
        <Surface kind="wood" color={timber} repeat={[3, 1]} />
      </mesh>

      {/* roof */}
      <mesh geometry={roof} position={[0, height, 0]} castShadow receiveShadow>
        <Surface kind="roof" color={roofColor} repeat={[3, 2]} side={THREE.DoubleSide} />
      </mesh>
      {/* ridge beam */}
      <mesh position={[0, height + roofHeight, 0]} castShadow>
        <boxGeometry args={[0.24, 0.24, depth + 1.3]} />
        <Surface kind="wood" color="#2e2116" repeat={[1, 3]} />
      </mesh>
      {/* chimney */}
      <mesh position={[width * 0.25, height + roofHeight * 0.85, -depth * 0.2]} castShadow>
        <boxGeometry args={[0.7, roofHeight * 0.8, 0.7]} />
        <Surface kind="stone" color="#5c5347" repeat={1} />
      </mesh>

      {/* windows */}
      {windows
        ? Array.from({ length: windowRows }).map((_, row) =>
            Array.from({ length: windowCols }).map((__, col) => {
              const x = -width / 2 + (col + 0.5) * (width / windowCols)
              const y = height * 0.26 + row * (height * 0.28)
              return [-1, 1].map((side) => (
                <group key={`win-${row}-${col}-${side}`} position={[side * (width / 2 + 0.05), y, x]}>
                  <mesh rotation={[0, side > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
                    <planeGeometry args={[0.95, 1.25]} />
                    <meshStandardMaterial
                      color="#120c07"
                      roughness={0.6}
                      emissive="#ffb066"
                      emissiveIntensity={0.9}
                      toneMapped={false}
                    />
                  </mesh>
                  <mesh position={[0, 0, side * -0.02]} rotation={[0, side > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
                    <planeGeometry args={[1.15, 1.45]} />
                    <Surface kind="wood" color={timber} repeat={[1, 1]} />
                  </mesh>
                </group>
              ))
            })
          )
        : null}
    </group>
  )
}

/* ───────────────────────────── Rocks & nature ───────────────────────────── */

/** A weathered boulder — displaced icosahedron with a rock surface. */
export function Boulder({
  position = [0, 0, 0],
  radius = 9,
  color = '#5a5248',
  seed = 3,
  rotationY = 0,
}: {
  position?: [number, number, number]
  radius?: number
  color?: string
  seed?: number
  rotationY?: number
}) {
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(radius, quality.tier === 'low' ? 2 : 4)
    const positionAttribute = geo.attributes.position as THREE.BufferAttribute
    const v = new THREE.Vector3()
    const offsets = [seed * 1.7, seed * 3.1, seed * 5.3]
    for (let i = 0; i < positionAttribute.count; i += 1) {
      v.fromBufferAttribute(positionAttribute, i)
      const n = v.clone().normalize()
      const lump =
        Math.sin(n.x * 3.1 + offsets[0]) * 0.16 +
        Math.sin(n.y * 4.7 + offsets[1]) * 0.12 +
        Math.sin(n.z * 6.3 + offsets[2]) * 0.09 +
        Math.sin((n.x + n.z) * 9.1) * 0.05
      v.multiplyScalar(1 + lump)
      positionAttribute.setXYZ(i, v.x, v.y, v.z)
    }
    geo.computeVertexNormals()
    geo.computeBoundingSphere()
    return geo
  }, [radius, seed])
  useDispose(geometry)

  return (
    <mesh
      geometry={geometry}
      position={[position[0], position[1] + radius * 0.62, position[2]]}
      rotation={[0.12, rotationY, 0.08]}
      castShadow
      receiveShadow
    >
      <Surface kind="rock" color={color} repeat={[3, 3]} normalScale={1.3} />
    </mesh>
  )
}

/** Low-poly conifer, instanced — scale cues for aerial shots. */
export function Forest({
  count = 400,
  radius = 200,
  innerRadius = 20,
  height = 14,
  seed = 5,
  color = '#2c3a24',
  position = [0, 0, 0],
}: {
  count?: number
  radius?: number
  innerRadius?: number
  height?: number
  seed?: number
  color?: string
  position?: [number, number, number]
}) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const scaled = Math.max(20, Math.round(count * quality.particleScale))

  const treeGeometry = useMemo(() => {
    const trunk = new THREE.CylinderGeometry(0.3, 0.42, 3.2, 6)
    const lower = new THREE.ConeGeometry(2.4, 6.2, 7)
    const upper = new THREE.ConeGeometry(1.5, 5.4, 7)
    const merged = mergeGeometries([
      { geometry: trunk, matrix: matrixAt([0, 1.6, 0]) },
      { geometry: lower, matrix: matrixAt([0, 5.1, 0]) },
      { geometry: upper, matrix: matrixAt([0, 8.5, 0]) },
    ])
    paintVertices(merged, (y) => {
      if (y < 3.1) return [0.13, 0.1, 0.07]
      const shade = 0.55 + Math.min(0.45, (y - 3) / 12)
      return [0.16 * shade, 0.24 * shade, 0.13 * shade]
    })
    return merged
  }, [])
  useDispose(treeGeometry)

  useEffect(() => {
    const inst = mesh.current
    if (!inst) return
    let s = seed * 92821
    const rnd = () => {
      s = (s * 16807) % 2147483647
      return (s % 1000) / 1000
    }
    const dummy = new THREE.Object3D()
    for (let i = 0; i < scaled; i += 1) {
      const angle = rnd() * Math.PI * 2
      const r = innerRadius + Math.sqrt(rnd()) * (radius - innerRadius)
      const scale = 0.6 + rnd() * 0.9
      dummy.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r)
      dummy.rotation.y = rnd() * Math.PI * 2
      dummy.scale.set(scale, scale * (height / 11), scale)
      dummy.updateMatrix()
      inst.setMatrixAt(i, dummy.matrix)
    }
    inst.instanceMatrix.needsUpdate = true
  }, [scaled, radius, innerRadius, height, seed])

  return (
    <instancedMesh
      ref={mesh}
      args={[treeGeometry, undefined, scaled]}
      position={position}
      frustumCulled={false}
      castShadow={false}
      receiveShadow
    >
      <Surface kind="cloth" color={color} plain roughness={1} metalness={0} vertexColors />
    </instancedMesh>
  )
}

