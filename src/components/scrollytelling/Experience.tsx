'use client'

import { Suspense } from 'react'
import { useStore } from '@/store/useStore'
import { CameraController } from './CameraController'
import { PostProcessingFX } from './PostProcessingFX'
import { PreloadSceneModels } from './three/ModelSlot'
import { debugFlags } from '@/lib/debugFlags'
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

/**
 * Only the scene at the current scroll position is mounted, so only its models,
 * textures and geometry are resident. The next scene's *configured* models are
 * warmed in the background so the swap has something to show.
 */
export function Experience() {
  const activeScene = useStore((s) => s.activeScene)
  const Scene = SCENES[activeScene] ?? SCENES[0]
  const upcoming = Math.min(SCENES.length - 1, activeScene + 1)

  return (
    <>
      <CameraController />
      <PreloadSceneModels scene={upcoming} />
      <Suspense fallback={null}>
        <group key={activeScene}>
          <Scene />
        </group>
      </Suspense>
      {debugFlags().post ? <PostProcessingFX /> : null}
    </>
  )
}
