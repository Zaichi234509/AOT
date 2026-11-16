'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { seededRandom } from '@/lib/utils'
import { getQuality } from '@/lib/quality'
import { Surface } from './materials'
import { ENV_PRESETS, ENV_SUN_DIRECTION, type EnvPreset } from './environment'
import { motionAllowed } from '@/lib/reducedMotion'
import { debugFlags } from '@/lib/debugFlags'

const quality = getQuality()

/* ────────────────────────────── Sky dome ────────────────────────────── */

const skyVertex = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/**
 * Sky with a sun disc, horizon haze and (optionally) a drifting cloud layer.
 * Colours are linear and the result is put through the same ACES curve the rest
 * of the scene uses, so the sky never looks pasted on.
 */
const skyFragment = /* glsl */ `
  uniform vec3 uZenith;
  uniform vec3 uHorizon;
  uniform vec3 uGround;
  uniform vec3 uSunColor;
  uniform vec3 uSunDir;
  uniform float uSunDisc;
  uniform float uSunSharpness;
  uniform float uHalo;
  uniform float uCloudiness;
  uniform float uExposure;
  uniform float uTime;
  varying vec3 vWorld;

  const mat3 ACES_INPUT = mat3(
    vec3(0.59719, 0.07600, 0.02840),
    vec3(0.35458, 0.90834, 0.13383),
    vec3(0.04823, 0.01566, 0.83777)
  );
  const mat3 ACES_OUTPUT = mat3(
    vec3( 1.60475, -0.10208, -0.00327),
    vec3(-0.53108,  1.10813, -0.07276),
    vec3(-0.07367, -0.00605,  1.07602)
  );

  vec3 rrtAndOdt(vec3 v) {
    vec3 a = v * (v + 0.0245786) - 0.000090537;
    vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081;
    return a / b;
  }

  vec3 aces(vec3 color) {
    color *= uExposure / 0.6;
    color = ACES_INPUT * color;
    color = rrtAndOdt(color);
    color = ACES_OUTPUT * color;
    return clamp(color, 0.0, 1.0);
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float sum = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      sum += vnoise(p) * amp;
      p *= 2.02;
      amp *= 0.5;
    }
    return sum;
  }

  void main() {
    vec3 dir = normalize(vWorld);
    float h = dir.y;

    vec3 col = mix(uHorizon, uZenith, smoothstep(-0.02, 0.62, h));
    col = mix(uGround, col, smoothstep(-0.5, 0.015, h));

    // horizon haze
    float haze = exp(-max(h, 0.0) * 11.0);
    col += uHorizon * haze * 0.28;

    float d = max(dot(dir, uSunDir), 0.0);
    col += uSunColor * pow(d, uSunSharpness) * uSunDisc;
    col += uSunColor * pow(d, 6.0) * uHalo;

    if (uCloudiness > 0.001 && h > 0.005) {
      vec2 p = dir.xz / max(0.1, h + 0.14);
      float n = fbm(p * 0.55 + vec2(uTime * 0.0045, uTime * 0.0022));
      float detail = fbm(p * 1.7 - vec2(uTime * 0.006, 0.0));
      float cloud = smoothstep(0.46, 0.82, n * 0.75 + detail * 0.35);
      cloud *= smoothstep(0.0, 0.22, h) * uCloudiness;
      vec3 lit = mix(vec3(0.32, 0.33, 0.36), uSunColor * 1.15, 0.35 + pow(d, 3.0) * 0.65);
      col = mix(col, lit, cloud * 0.72);
    }

    col = aces(col);

    // ordered-ish dither kills 8-bit banding in the gradients
    float dither = (hash(gl_FragCoord.xy) - 0.5) / 220.0;
    gl_FragColor = vec4(col + dither, 1.0);
  }
`

export function SkyDome({
  preset,
  radius = 700,
  exposure = 1.08,
  animate = true,
}: {
  preset: EnvPreset
  radius?: number
  exposure?: number
  animate?: boolean
}) {
  const def = ENV_PRESETS[preset]
  const uniforms = useMemo(
    () => ({
      uZenith: { value: new THREE.Color(def.zenith) },
      uHorizon: { value: new THREE.Color(def.horizon) },
      uGround: { value: new THREE.Color(def.ground) },
      uSunColor: { value: new THREE.Color(def.sunColor) },
      uSunDir: { value: ENV_SUN_DIRECTION[preset].clone() },
      uSunDisc: { value: def.sunDisc * 0.02 },
      uSunSharpness: { value: def.sunSharpness },
      uHalo: { value: def.halo*0.35 },
      uCloudiness: { value: quality.tier === 'low' ? def.cloudiness * 0.5 : def.cloudiness },
      uExposure: { value: exposure },
      uTime: { value: 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [preset]
  )

  useEffect(() => {
    uniforms.uExposure.value = exposure
  }, [exposure, uniforms])

  useFrame((_, delta) => {
    if (!animate || !motionAllowed()) return
    uniforms.uTime.value += Math.min(delta, 0.05)
  })

  if (!debugFlags().sky) return null

  return (
    <mesh scale={radius} frustumCulled={false} renderOrder={-1}>
      <sphereGeometry args={[1, 40, 24]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        depthTest={false}
        fog={false}
        toneMapped={false}
        uniforms={uniforms}
        vertexShader={skyVertex}
        fragmentShader={skyFragment}
      />
    </mesh>
  )
}

/* ─────────────────────────────── Sprites ─────────────────────────────── */

let softSprite: THREE.DataTexture | null = null

/** Soft radial falloff used by every particle/steam/smoke sprite. */
function getSoftSprite(): THREE.DataTexture {
  if (softSprite) return softSprite
  const size = 64
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (x + 0.5) / size - 0.5
      const dy = (y + 0.5) / size - 0.5
      const r = Math.hypot(dx, dy) * 2
      const falloff = Math.max(0, 1 - r)
      const alpha = Math.pow(falloff, 1.9)
      const i = (y * size + x) * 4
      data[i] = 255
      data[i + 1] = 255
      data[i + 2] = 255
      data[i + 3] = Math.round(alpha * 255)
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.needsUpdate = true
  softSprite = texture
  return texture
}

/* ─────────────────────────── Particle layers ─────────────────────────── */

const particleVertex = /* glsl */ `
  attribute float aSeed;
  attribute float aScale;
  uniform float uTime;
  uniform float uHeight;
  uniform float uSpeed;
  uniform float uSize;
  uniform float uRise;
  uniform float uSpread;
  uniform float uOpacity;
  varying float vAlpha;

  void main() {
    vec3 pos = position;
    float seed = aSeed * 6.2831853;
    float speed = uSpeed * (0.35 + aSeed * 1.4);

    // wrap vertically so the field is endless
    float travel = uTime * speed * (uRise > 0.5 ? 1.0 : -0.35);
    pos.y = mod(pos.y + travel + uHeight, uHeight);
    pos.x += sin(uTime * 0.6 + seed) * uSpread;
    pos.z += cos(uTime * 0.45 + seed * 1.7) * uSpread * 0.7;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    float distanceFade = smoothstep(4.0, 40.0, -mv.z) * (1.0 - smoothstep(220.0, 420.0, -mv.z));
    vAlpha = uOpacity * distanceFade * (0.35 + aSeed * 0.65);

    gl_PointSize = uSize * aScale * (420.0 / max(1.0, -mv.z));
    gl_Position = projectionMatrix * mv;
  }
`

const particleFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform sampler2D uMap;
  varying float vAlpha;

  void main() {
    float mask = texture2D(uMap, gl_PointCoord).a;
    float alpha = mask * vAlpha;
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`

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
  animate?: boolean
}

/** GPU-animated sprite field — no per-frame CPU work, soft round particles. */
export function Particles({
  count = 240,
  color = '#D4A574',
  size = 0.9,
  area = 70,
  height = 40,
  speed = 1.2,
  opacity = 0.55,
  seed = 1,
  rise = false,
  spread = 1,
  animate = true,
}: ParticleProps) {
  const scaled = Math.max(12, Math.round(count * quality.particleScale))
  const geometry = useMemo(() => {
    const rnd = seededRandom(seed * 7919 + 11)
    const positions = new Float32Array(scaled * 3)
    const seeds = new Float32Array(scaled)
    const scales = new Float32Array(scaled)
    for (let i = 0; i < scaled; i += 1) {
      positions[i * 3] = (rnd() - 0.5) * area
      positions[i * 3 + 1] = rnd() * height
      positions[i * 3 + 2] = (rnd() - 0.5) * area * spread
      seeds[i] = rnd()
      scales[i] = 0.45 + rnd() * 1.35
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), Math.max(area, height) * 1.2)
    return geo
  }, [scaled, area, height, seed, spread])

  useEffect(() => () => geometry.dispose(), [geometry])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHeight: { value: height },
      uSpeed: { value: speed },
      uSize: { value: size },
      uRise: { value: rise ? 1 : 0 },
      uSpread: { value: spread * 0.6 },
      uOpacity: { value: opacity },
      uColor: { value: new THREE.Color(color) },
      uMap: { value: getSoftSprite() },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [height, speed, size, rise, spread, opacity, color]
  )

  useFrame((_, delta) => {
    if (!animate || !motionAllowed()) return
    uniforms.uTime.value += Math.min(delta, 0.05)
  })

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={particleVertex}
        fragmentShader={particleFragment}
        transparent
        depthWrite={false}
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
  repeat?: number
}

export function Ground({ y = 0, color = '#3d3226', size = 900, repeat = 90 }: GroundProps) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow>
      <planeGeometry args={[size, size, 1, 1]} />
      <Surface kind="dirt" color={color} repeat={repeat} normalScale={0.8} />
    </mesh>
  )
}

/* ─────────────────────────── Steam puffs ─────────────────────────── */

/**
 * Rising steam: big, very soft sprites. The emission column is what sells the
 * Colossal Titan, so it gets its own translucent layer rather than being mixed
 * into the dust field.
 */
export function Steam({
  position = [0, 0, 0],
  count = 26,
  radius = 10,
  height = 34,
  color = '#e0d8cd',
  opacity = 0.14,
}: {
  position?: [number, number, number]
  count?: number
  radius?: number
  height?: number
  color?: string
  opacity?: number
}) {
  const group = useRef<THREE.Group>(null)
  const scaled = Math.max(6, Math.round(count * quality.particleScale))

  const puffs = useMemo(() => {
    const rnd = seededRandom(4242)
    return Array.from({ length: scaled }, () => ({
      x: (rnd() - 0.5) * radius,
      y: rnd() * height,
      z: (rnd() - 0.5) * radius * 0.7,
      scale: 3 + rnd() * 9,
      speed: 0.35 + rnd() * 0.5,
      phase: rnd() * Math.PI * 2,
      opacity: 0.4 + rnd() * 0.6,
    }))
  }, [scaled, radius, height])

  useFrame((state) => {
    if (!group.current) return
    const t = motionAllowed() ? state.clock.elapsedTime : 4
    group.current.children.forEach((child, i) => {
      const p = puffs[i]
      if (!p) return
      const rise = ((p.y + t * p.speed * 2.4) % (height * 1.3)) as number
      child.position.set(
        p.x + Math.sin(t * 0.22 + p.phase) * 2.2,
        rise,
        p.z + Math.cos(t * 0.18 + p.phase) * 1.4
      )
      const grow = 0.7 + (rise / (height * 1.3)) * 1.6
      child.scale.setScalar(p.scale * grow)
      const material = (child as THREE.Mesh).material as THREE.MeshBasicMaterial
      if (material) {
        const fade = Math.sin((rise / (height * 1.3)) * Math.PI)
        material.opacity = opacity * p.opacity * Math.max(0, fade)
      }
    })
  })

  return (
    <group ref={group} position={position}>
      {puffs.map((p, i) => (
        <sprite key={i} position={[p.x, p.y, p.z]} scale={[p.scale, p.scale, 1]}>
          <spriteMaterial
            map={getSoftSprite()}
            color={color}
            transparent
            opacity={opacity}
            depthWrite={false}
            blending={THREE.NormalBlending}
          />
        </sprite>
      ))}
    </group>
  )
}

/* ───────────────────────────── Cloud layer ───────────────────────────── */

/**
 * Slow drifting cloud billboards. Cheap (sprites, one texture) and they give
 * the aerial shots a horizon instead of an empty gradient.
 */
export function Clouds({
  count = 18,
  radius = 320,
  height = 62,
  size = 96,
  color = '#ffffff',
  opacity = 0.26,
  seed = 8,
  animate = true,
}: {
  count?: number
  radius?: number
  height?: number
  size?: number
  color?: string
  opacity?: number
  seed?: number
  animate?: boolean
}) {
  const group = useRef<THREE.Group>(null)
  const scaled = Math.max(6, Math.round(count * quality.particleScale))

  const puffs = useMemo(() => {
    const rnd = seededRandom(seed * 6151)
    return Array.from({ length: scaled }, () => {
      const angle = rnd() * Math.PI * 2
      const r = radius * (0.25 + rnd() * 0.75)
      return {
        x: Math.cos(angle) * r,
        y: height * (0.55 + rnd() * 0.7),
        z: Math.sin(angle) * r,
        scale: size * (0.5 + rnd() * 0.9),
        opacity: opacity * (0.5 + rnd() * 0.7),
      }
    })
  }, [scaled, radius, height, size, opacity, seed])

  useFrame((state) => {
    if (!group.current || !animate || !motionAllowed()) return
    group.current.rotation.y = state.clock.elapsedTime * 0.0035
  })

  return (
    <group ref={group}>
      {puffs.map((p, i) => (
        <sprite key={i} position={[p.x, p.y, p.z]} scale={[p.scale, p.scale * 0.55, 1]}>
          <spriteMaterial
            map={getSoftSprite()}
            color={color}
            transparent
            opacity={p.opacity}
            depthWrite={false}
            fog
          />
        </sprite>
      ))}
    </group>
  )
}

/* ───────────────────────── Scene atmosphere ───────────────────────── */

/**
 * Sets scene background + fog from inside the scene graph, and restores the
 * previous values on unmount (each scene is mounted in a keyed group).
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
