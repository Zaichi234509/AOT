/**
 * Small procedural-geometry toolkit.
 *
 * The scenes have no authored assets, so the figures are generated: limbs are
 * lofted from elliptical cross-sections (so they can have muscle bellies and
 * tapered joints instead of looking like capsules), skulls are sculpted by
 * pushing a sphere along a set of anatomical lobes, and static parts are merged
 * so a whole titan only costs a handful of draw calls.
 *
 * Everything is in metres, +Y up, feet at y = 0.
 */

import * as THREE from 'three'

export type Ring = {
  /** centre height */
  y: number
  /** half-width (x) */
  rx: number
  /** half-depth (z) */
  rz: number
  /** centre offset */
  ox?: number
  oz?: number
  /** extra shaping, multiplies the radius per angle (radians) */
  shape?: (angle: number, ring: number) => number
}

type LoftOptions = {
  radial?: number
  capTop?: boolean
  capBottom?: boolean
  /** vertical squash of the cap fans, 0 = flat */
  capRound?: number
}

/**
 * Loft a closed surface through a stack of elliptical rings.
 * Rings share vertices around the circumference so normals stay smooth.
 */
export function loftGeometry(rings: Ring[], options: LoftOptions = {}): THREE.BufferGeometry {
  const radial = Math.max(6, options.radial ?? 16)
  const ringsCount = rings.length
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  for (let i = 0; i < ringsCount; i += 1) {
    const ring = rings[i]
    for (let j = 0; j < radial; j += 1) {
      const angle = (j / radial) * Math.PI * 2
      const shape = ring.shape ? ring.shape(angle, i) : 1
      const x = (ring.ox ?? 0) + Math.cos(angle) * ring.rx * shape
      const z = (ring.oz ?? 0) + Math.sin(angle) * ring.rz * shape
      positions.push(x, ring.y, z)
      uvs.push(j / radial, i / Math.max(1, ringsCount - 1))
    }
  }

  for (let i = 0; i < ringsCount - 1; i += 1) {
    for (let j = 0; j < radial; j += 1) {
      const next = (j + 1) % radial
      const a = i * radial + j
      const b = i * radial + next
      const c = (i + 1) * radial + j
      const d = (i + 1) * radial + next
      indices.push(a, c, b, b, c, d)
    }
  }

  const addCap = (ring: Ring, index: number, up: boolean) => {
    const base = positions.length / 3
    const round = options.capRound ?? 0.25
    positions.push(ring.ox ?? 0, ring.y + (up ? ring.rx * round : -ring.rx * round), ring.oz ?? 0)
    uvs.push(0.5, up ? 1 : 0)
    for (let j = 0; j < radial; j += 1) {
      const next = (j + 1) % radial
      if (up) indices.push(base, index + j, index + next)
      else indices.push(base, index + next, index + j)
    }
  }

  if (options.capTop !== false) addCap(rings[ringsCount - 1], (ringsCount - 1) * radial, true)
  if (options.capBottom !== false) addCap(rings[0], 0, false)

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

/** Push every vertex out from the geometry centre; `fn` returns a delta in metres. */
export function displaceGeometry(
  geometry: THREE.BufferGeometry,
  fn: (position: THREE.Vector3, direction: THREE.Vector3) => number
) {
  geometry.computeBoundingSphere()
  const centre = geometry.boundingSphere?.center.clone() ?? new THREE.Vector3()
  const position = geometry.attributes.position as THREE.BufferAttribute
  const v = new THREE.Vector3()
  const dir = new THREE.Vector3()
  for (let i = 0; i < position.count; i += 1) {
    v.fromBufferAttribute(position, i)
    dir.copy(v).sub(centre).normalize()
    const delta = fn(v.clone(), dir)
    v.addScaledVector(dir, delta)
    position.setXYZ(i, v.x, v.y, v.z)
  }
  position.needsUpdate = true
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}

/** Transform + concatenate geometries into one draw call. */
export function mergeGeometries(
  parts: Array<{ geometry: THREE.BufferGeometry; matrix?: THREE.Matrix4 }>
): THREE.BufferGeometry {
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  let offset = 0
  const normalMatrix = new THREE.Matrix3()
  const v = new THREE.Vector3()

  for (const part of parts) {
    const geo = part.geometry
    const pos = geo.attributes.position as THREE.BufferAttribute
    const nor = geo.attributes.normal as THREE.BufferAttribute | undefined
    const uv = geo.attributes.uv as THREE.BufferAttribute | undefined
    const matrix = part.matrix ?? new THREE.Matrix4()
    normalMatrix.getNormalMatrix(matrix)

    for (let i = 0; i < pos.count; i += 1) {
      v.fromBufferAttribute(pos, i).applyMatrix4(matrix)
      positions.push(v.x, v.y, v.z)
      if (nor) {
        v.fromBufferAttribute(nor, i).applyMatrix3(normalMatrix).normalize()
        normals.push(v.x, v.y, v.z)
      } else {
        normals.push(0, 1, 0)
      }
      if (uv) uvs.push(uv.getX(i), uv.getY(i))
      else uvs.push(0, 0)
    }

    const index = geo.index
    if (index) {
      for (let i = 0; i < index.count; i += 1) indices.push(index.getX(i) + offset)
    } else {
      for (let i = 0; i < pos.count; i += 1) indices.push(i + offset)
    }
    offset += pos.count
    if (geo !== part.geometry) geo.dispose()
  }

  const merged = new THREE.BufferGeometry()
  merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  merged.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  merged.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  merged.setIndex(indices)
  merged.computeBoundingSphere()
  return merged
}

/** Bake per-vertex colours so one instanced mesh can carry trunk + foliage. */
export function paintVertices(
  geometry: THREE.BufferGeometry,
  fn: (y: number, position: THREE.Vector3) => [number, number, number]
) {
  const position = geometry.attributes.position as THREE.BufferAttribute
  const colors = new Float32Array(position.count * 3)
  const v = new THREE.Vector3()
  for (let i = 0; i < position.count; i += 1) {
    v.fromBufferAttribute(position, i)
    const [r, g, b] = fn(v.y, v)
    colors[i * 3] = r
    colors[i * 3 + 1] = g
    colors[i * 3 + 2] = b
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  return geometry
}

export function matrixAt(
  position: [number, number, number],
  rotation: [number, number, number] = [0, 0, 0],
  scale: [number, number, number] = [1, 1, 1]
): THREE.Matrix4 {
  return new THREE.Matrix4().compose(
    new THREE.Vector3(...position),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
    new THREE.Vector3(...scale)
  )
}

/**
 * A rounded, anatomically-ish limb: a stack of elliptical rings whose radii are
 * sampled from a piecewise profile, with optional front/back muscle bias.
 */
export type LimbSpec = {
  length: number
  /** radii sampled from 0 (proximal) to 1 (distal) */
  profile: Array<{ t: number; rx: number; rz: number; ox?: number; oz?: number }>
  radial?: number
  /** >1 adds mass to the back (+z) of the limb, <1 to the front */
  backBias?: number
  /** taper the very ends so the joint reads as a ball */
  capRound?: number
}

export function limbGeometry(spec: LimbSpec): THREE.BufferGeometry {
  const { length, profile, radial = 16, backBias = 1, capRound = 0.35 } = spec
  const rings: Ring[] = profile.map((p) => ({
    y: -p.t * length,
    rx: p.rx,
    rz: p.rz,
    ox: p.ox,
    oz: p.oz,
    shape: (angle: number) => {
      const s = Math.sin(angle)
      return s > 0 ? 1 + (backBias - 1) * s * s : 1
    },
  }))
  return loftGeometry(rings, { radial, capRound, capTop: true, capBottom: true })
}

/**
 * Sculpt a head out of a sphere.
 *
 * Lobes are gaussian bumps/dents at anchor directions, which is enough to read
 * as brow ridge, cheekbones, jaw, nose and the back of the skull.
 */
export type Lobe = {
  /** unit direction of the feature */
  at: [number, number, number]
  /** how wide the feature is, in radians-ish (higher = tighter) */
  tightness: number
  /** displacement in units of the sphere radius (negative = dent) */
  amount: number
}

export function sculptHead(radius: number, lobes: Lobe[], width = 1, depth = 1, height = 1): THREE.BufferGeometry {
  const geometry = new THREE.SphereGeometry(radius, 40, 28)
  const anchors = lobes.map((l) => {
    const v = new THREE.Vector3(...l.at).normalize()
    return { v, tightness: l.tightness, amount: l.amount }
  })
  const position = geometry.attributes.position as THREE.BufferAttribute
  const v = new THREE.Vector3()
  for (let i = 0; i < position.count; i += 1) {
    v.fromBufferAttribute(position, i)
    const dir = v.clone().normalize()
    let delta = 0
    for (const a of anchors) {
      const d = Math.max(0, dir.dot(a.v))
      delta += Math.pow(d, a.tightness) * a.amount
    }
    v.multiplyScalar(1 + delta)
    v.set(v.x * width, v.y * height, v.z * depth)
    position.setXYZ(i, v.x, v.y, v.z)
  }
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}

/**
 * An annular wall segment: outer face, top walkway, inner face, open at the
 * bottom (it stands on the ground). Use a DoubleSide material — the camera in
 * the walls scene is above and outside, so it sees both faces.
 */
export function annularWall(
  radius: number,
  height: number,
  thickness: number,
  segments = 96,
  parapet = 0.9
): THREE.BufferGeometry {
  const outer = radius + thickness / 2
  const inner = radius - thickness / 2
  const rings: Ring[] = [
    { y: 0, rx: outer, rz: outer },
    { y: height - parapet, rx: outer, rz: outer },
    { y: height - parapet * 0.4, rx: outer - thickness * 0.08, rz: outer - thickness * 0.08 },
    { y: height, rx: outer - thickness * 0.12, rz: outer - thickness * 0.12 },
    { y: height - parapet * 0.4, rx: inner + thickness * 0.06, rz: inner + thickness * 0.06 },
    { y: height - parapet, rx: inner, rz: inner },
    { y: 0, rx: inner, rz: inner },
  ]
  return loftGeometry(rings, { radial: segments, capTop: false, capBottom: false })
}
