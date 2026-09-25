import type { IconType } from 'react-icons'
import { FaRegSmile, FaRegCompass, FaRegStickyNote, FaTerminal, FaCalculator, FaCog, FaGamepad } from 'react-icons/fa'

export type AppId = 'finder' | 'safari' | 'notes' | 'terminal' | 'calculator' | 'settings' | 'game'

export type DockApp = {
  id: AppId
  name: string
  Icon: IconType
  bg: string
  win: { x: number; y: number; w: number; h: number } // default window geometry, in cqw
}

export const apps: DockApp[] = [
  { id: 'finder', name: 'Finder', Icon: FaRegSmile, bg: 'linear-gradient(#5ac8fa, #1e7cf2)', win: { x: 5, y: 3, w: 56, h: 34 } },
  { id: 'safari', name: 'Safari', Icon: FaRegCompass, bg: 'linear-gradient(#64d2ff, #0a84ff)', win: { x: 14, y: 2, w: 64, h: 38 } },
  { id: 'notes', name: 'Notes', Icon: FaRegStickyNote, bg: 'linear-gradient(#ffe066, #ffbe00)', win: { x: 20, y: 5, w: 38, h: 34 } },
  { id: 'terminal', name: 'Terminal', Icon: FaTerminal, bg: 'linear-gradient(#3a3a3c, #0b0b0c)', win: { x: 26, y: 6, w: 48, h: 32 } },
  { id: 'calculator', name: 'Calculator', Icon: FaCalculator, bg: 'linear-gradient(#ff9f0a, #ff7a00)', win: { x: 60, y: 4, w: 23.5, h: 32 } },
  { id: 'settings', name: 'Settings', Icon: FaCog, bg: 'linear-gradient(#a1a1aa, #6b7280)', win: { x: 8, y: 1, w: 50, h: 42 } },
  { id: 'game', name: 'Game', Icon: FaGamepad, bg: 'linear-gradient(#f97316, #dc2626)', win: { x: 32, y: 6, w: 34, h: 38 } },
]

