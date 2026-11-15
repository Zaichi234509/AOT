'use client'

import { Suspense } from 'react'
import { useStore } from '@/store/useStore'
import { CameraController } from './CameraController'
import { PostProcessingFX } from './PostProcessingFX'
import { Scene1Shiganshina } from './scenes/Scene1Shiganshina'
import { Scene2Walls } from './scenes/Scene2Walls'
import { Scene3Corps } from './scenes/Scene3Corps'
import { Scene4Titans } from './scenes/Scene4Titans'
import { Scene5Trost } from './scenes/Scene5Trost'
import { Scene6Basement } from './scenes/Scene6Basement'
import { Scene7Rumbling } from './scenes/Scene7Rumbling'

const SCENES = [
  Scene1Shiganshina,
  Scene2Walls,
  Scene3Corps,
  Scene4Titans,
  Scene5Trost,
  Scene6Basement,
  Scene7Rumbling,
]

export function Experience() {
  const activeScene = useStore((s) => s.activeScene)
  const Scene = SCENES[activeScene] ?? SCENES[0]

  return (
    <>
      <CameraController />
      <Suspense fallback={null}>
        <group key={activeScene}>
          <Scene />
        </group>
      </Suspense>
      <PostProcessingFX />
    </>
  )
}
