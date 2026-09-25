import { useRef, type PointerEvent } from 'react'
import { AnimatePresence } from 'framer-motion'
import MenuBar from './MenuBar'
import Dock from './Dock'
import Pointer from './Pointer'
import Window from './Window'
import { pointer } from '@/lib/pointer'
import { useSetup } from '@/store/useSetup'

export default function Desktop() {
  const layer = useRef<HTMLDivElement>(null)
  const windows = useSetup((s) => s.windows)

  const move = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    pointer.x.set((e.clientX - r.left) / r.width)
    pointer.y.set((e.clientY - r.top) / r.height)
  }

  return (
    <div
      className="absolute inset-0 cursor-none select-none [&_*]:cursor-none"
      onPointerMove={move}
      onPointerEnter={() => pointer.visible.set(1)}
      onPointerLeave={() => {
        pointer.visible.set(0)
        pointer.x.set(0.5)
        pointer.y.set(0.5)
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <MenuBar />

      {/* Windows live here, below the menu bar, and can't be dragged out of it */}
      <div ref={layer} className="pointer-events-none absolute inset-x-0 bottom-0 top-[3.4cqw] z-10">
        <AnimatePresence>
          {windows.map((w) => (
            <Window
              key={w.id}
              id={w.id}
              z={w.z}
              minimized={w.minimized}
              maximized={w.maximized}
              constraints={layer}
            />
          ))}
        </AnimatePresence>
      </div>

      <Dock />
      <Pointer />
    </div>
  )
}
