import { create } from 'zustand'

type Store = {
  /* boot */
  isLoading: boolean
  loadProgress: number
  setLoadProgress: (n: number) => void
  finishLoading: () => void

  /* global UI */
  navOpen: boolean
  setNavOpen: (open: boolean) => void
  soundOn: boolean
  toggleSound: () => void

  /* scroll (low-frequency mirror of the scroll bus) */
  activeScene: number
  setActiveScene: (i: number) => void
  stageProgressRounded: number
  setStageProgressRounded: (n: number) => void
  pageProgressRounded: number
  setPageProgressRounded: (n: number) => void

  /* lightbox / modals */
  activeCharacterId: string | null
  setActiveCharacterId: (id: string | null) => void
  activeTitanId: string | null
  setActiveTitanId: (id: string | null) => void
  galleryIndex: number | null
  setGalleryIndex: (i: number | null) => void
}

export const useStore = create<Store>((set, get) => ({
  isLoading: true,
  loadProgress: 0,
  setLoadProgress: (n) => set({ loadProgress: Math.min(100, Math.max(0, n)) }),
  finishLoading: () => set({ loadProgress: 100, isLoading: false }),

  navOpen: false,
  setNavOpen: (navOpen) => set({ navOpen }),
  soundOn: false,
  toggleSound: () => set({ soundOn: !get().soundOn }),

  activeScene: 0,
  setActiveScene: (activeScene) => {
    if (activeScene !== get().activeScene) set({ activeScene })
  },
  stageProgressRounded: 0,
  setStageProgressRounded: (n) => set({ stageProgressRounded: n }),
  pageProgressRounded: 0,
  setPageProgressRounded: (n) => set({ pageProgressRounded: n }),

  activeCharacterId: null,
  setActiveCharacterId: (activeCharacterId) => set({ activeCharacterId }),
  activeTitanId: null,
  setActiveTitanId: (activeTitanId) => set({ activeTitanId }),
  galleryIndex: null,
  setGalleryIndex: (galleryIndex) => set({ galleryIndex }),
}))
