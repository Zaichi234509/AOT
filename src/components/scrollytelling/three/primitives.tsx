'use client'

/** Tiny shared primitives used by the interior and effects. */

export function Sphere({
  position = [0, 0, 0],
  radius = 0.5,
  color = '#ffffff',
  emissive,
  intensity = 0,
  segments = 18,
}: {
  position?: [number, number, number]
  radius?: number
  color?: string
  emissive?: string
  intensity?: number
  segments?: number
}) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, segments, Math.max(8, Math.round(segments * 0.7))]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive ?? '#000000'}
        emissiveIntensity={intensity}
        toneMapped={!emissive || intensity <= 0}
        roughness={0.6}
      />
    </mesh>
  )
}
