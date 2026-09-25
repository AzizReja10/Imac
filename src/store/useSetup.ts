import { create } from 'zustand'
import type { MonitorSkinId, KeyboardSkinId, MouseSkinId } from '@/data/skins'
import type { AppId } from '@/data/apps'

type Win = { id: AppId; z: number; minimized: boolean; maximized: boolean }

export type SetupState = {
  monitor: MonitorSkinId
  setMonitor: (id: MonitorSkinId) => void
  keyboard: KeyboardSkinId
  setKeyboard: (id: KeyboardSkinId) => void
  mouse: MouseSkinId
  setMouse: (id: MouseSkinId) => void
  soundOn: boolean
  toggleSound: () => void
  powered: boolean
  booting: boolean
  startBoot: () => void
  finishBoot: () => void
  powerOff: () => void
  windows: Win[]
  zTop: number
  openApp: (id: AppId) => void
  focusApp: (id: AppId) => void
  closeApp: (id: AppId) => void
  minimizeApp: (id: AppId) => void
  restoreApp: (id: AppId) => void
  toggleMaximize: (id: AppId) => void
  notes: string
  setNotes: (text: string) => void
}

export const useSetup = create<SetupState>((set, get) => ({
  monitor: 'yellow',
  setMonitor: (monitor) => set({ monitor }),
  keyboard: 'silver',
  setKeyboard: (keyboard) => set({ keyboard }),
  mouse: 'white',
  setMouse: (mouse) => set({ mouse }),
  soundOn: true,
  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
  powered: false,
  booting: false,
  startBoot: () => set((s) => (s.powered || s.booting ? s : { booting: true })), // ignore repeat presses mid-boot
  finishBoot: () => set({ powered: true, booting: false }),
  powerOff: () => set({ powered: false, booting: false }),

  windows: [],
  zTop: 0,

  openApp: (id) => {
    const w = get().windows.find((w) => w.id === id)
    if (w?.minimized) return get().restoreApp(id) // a dock click brings a minimized window back
    if (w) return get().focusApp(id)
    set((s) => ({
      zTop: s.zTop + 1,
      windows: [...s.windows, { id, z: s.zTop + 1, minimized: false, maximized: false }],
    }))
  },

  focusApp: (id) =>
    set((s) => {
      const w = s.windows.find((w) => w.id === id)
      if (!w || w.z === s.zTop) return s // missing or already on top: no change
      const z = s.zTop + 1
      return { zTop: z, windows: s.windows.map((w) => (w.id === id ? { ...w, z } : w)) }
    }),

  closeApp: (id) => set((s) => ({ windows: s.windows.filter((w) => w.id !== id) })),

  minimizeApp: (id) =>
    set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, minimized: true } : w)) })),

  restoreApp: (id) =>
    set((s) => {
      const z = s.zTop + 1 // comes back on top
      return { zTop: z, windows: s.windows.map((w) => (w.id === id ? { ...w, z, minimized: false } : w)) }
    }),

  toggleMaximize: (id) =>
    set((s) => {
      const z = s.zTop + 1
      return { zTop: z, windows: s.windows.map((w) => (w.id === id ? { ...w, z, maximized: !w.maximized } : w)) }
    }),

  notes: '',
  setNotes: (notes) => set({ notes }),
}))

// The focused app is the visible window with the highest z (minimized windows can't have focus)
export const selectFocused = (s: SetupState): AppId | null => {
  const visible = s.windows.filter((w) => !w.minimized)
  return visible.length ? visible.reduce((a, b) => (a.z > b.z ? a : b)).id : null
}

