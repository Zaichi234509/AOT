'use client'

import { useEffect } from 'react'
import { ambience } from '@/lib/audio'
import { getStageProgress, subscribeProgress } from '@/lib/scroll'
import { useStore } from '@/store/useStore'

/** Bridges the navbar sound toggle to the procedural ambience engine. */
export function AudioProvider() {
  const soundOn = useStore((s) => s.soundOn)

  useEffect(() => {
    if (soundOn) {
      void ambience.start()
      ambience.setIntensity(getStageProgress())
    } else {
      ambience.stop()
    }
  }, [soundOn])

  useEffect(() => {
    return subscribeProgress((progress) => {
      if (soundOn) ambience.setIntensity(progress)
    })
  }, [soundOn])

  return null
}
