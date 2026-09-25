import { useEffect, useRef, type ReactNode, type RefObject } from 'react'
import { animate, motion, useDragControls, useMotionValue } from 'framer-motion'
import { useSetup, selectFocused } from '@/store/useSetup'
import { monitorSkins } from '@/data/skins'
import { apps, type AppId } from '@/data/apps'
import { BorderBeam } from '@/components/ui/border-beam'
import AppBody from './apps/AppBody'

type Props = {
  id: AppId
  z: number
  minimized: boolean
  maximized: boolean
  constraints: RefObject<HTMLDivElement | null>
}

// Maximized geometry in cqw. The window layer is 52.85cqw tall and the dock starts near 48cqw
// from the top of the screen, so this stops just above the dock.
const MAX = { x: 1, y: 1, w: 98, h: 43 }

const bez: [number, number, number, number] = [0.32, 0.72, 0, 1]
const glide = { type: 'tween' as const, duration: 0.45, ease: bez } // minimize / restore
const size = { type: 'tween' as const, duration: 0.32, ease: bez } // maximize / restore
const spring = { type: 'spring' as const, stiffness: 380, damping: 30 } // open / close

function Light({
  color,
  label,
  onClick,
  size = 'h-[1.85cqw] w-[1.85cqw]',
  glyphSize = 'text-[1.35cqw]',
  children,
}: {
  color: string
  label: string
  onClick: () => void
  size?: string
  glyphSize?: string
  children: ReactNode
}) {
  return (
    <button
      aria-label={label}
      onPointerDown={(e) => e.stopPropagation()} // don't start a drag or a focus change from a button
      onDoubleClick={(e) => e.stopPropagation()} // a double-click on a button must not toggle maximize
      onClick={onClick}
      style={{ backgroundColor: color }}
      className={`flex ${size} cursor-pointer items-center justify-center rounded-full ring-1 ring-black/15 shadow-sm transition-transform hover:scale-110 active:scale-95`}
    >
      {/* the glyph appears when the mouse is over the group of three, like macOS */}
      <span className={`${glyphSize} font-bold leading-none text-black/60 opacity-0 transition-opacity group-hover:opacity-100`}>
        {children}
      </span>
    </button>
  )
}

export default function Window({ id, z, minimized, maximized, constraints }: Props) {
  const app = apps.find((a) => a.id === id)!
  const g = maximized ? MAX : app.win
  const geo = { left: `${g.x}cqw`, top: `${g.y}cqw`, width: `${g.w}cqw`, height: `${g.h}cqw` }

  const ref = useRef<HTMLDivElement>(null)
  const controls = useDragControls()
  const focusApp = useSetup((s) => s.focusApp)
  const closeApp = useSetup((s) => s.closeApp)
  const minimizeApp = useSetup((s) => s.minimizeApp)
  const toggleMaximize = useSetup((s) => s.toggleMaximize)
  const focused = useSetup((s) => selectFocused(s) === id)
  const glow = monitorSkins[useSetup((s) => s.monitor)].glow
  const isCalc = id === 'calculator'

  // The window's drag offset, owned here (not by the drag system) so we can animate it ourselves
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const beforeMax = useRef({ x: 0, y: 0 }) // where it was before being maximized
  const beforeMin = useRef({ x: 0, y: 0 }) // where it was before being minimized
  const prevMax = useRef(maximized)
  const prevMin = useRef(minimized)

  // Maximize: slide the drag offset to 0 (the geometry change does the growing).
  // Restore: slide back to where the window was.
  useEffect(() => {
    if (prevMax.current === maximized) return
    prevMax.current = maximized
    if (maximized) {
      beforeMax.current = { x: x.get(), y: y.get() }
      animate(x, 0, size)
      animate(y, 0, size)
    } else {
      animate(x, beforeMax.current.x, size)
      animate(y, beforeMax.current.y, size)
    }
  }, [maximized, x, y])

  // Minimize: shrink about the window's center while moving that center onto the dock icon.
  // Restore: move back to where it was.
  useEffect(() => {
    if (prevMin.current === minimized) return
    prevMin.current = minimized
    if (minimized) {
      beforeMin.current = { x: x.get(), y: y.get() }
      const el = ref.current
      const icon = document.querySelector(`[data-dock-app="${id}"]`)
      if (!el || !icon) return
      const a = el.getBoundingClientRect()
      const b = icon.getBoundingClientRect()
      animate(x, x.get() + (b.left + b.width / 2) - (a.left + a.width / 2), glide)
      animate(y, y.get() + (b.top + b.height / 2) - (a.top + a.height / 2), glide)
    } else {
      animate(x, beforeMin.current.x, glide)
      animate(y, beforeMin.current.y, glide)
    }
  }, [minimized, id, x, y])

  return (
    <motion.div
      ref={ref}
      drag
      dragControls={controls}
      dragListener={false} // only the title bar starts a drag
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={constraints}
      initial={{ scale: 0.8, opacity: 0, ...geo }}
      animate={{ scale: minimized ? 0.12 : 1, opacity: minimized ? 0 : 1, ...geo }}
      exit={{ scale: 0.85, opacity: 0 }}
      transition={{
        default: spring,
        left: size,
        top: size,
        width: size,
        height: size,
        scale: minimized ? glide : spring,
        opacity: minimized ? glide : spring,
      }}
      onPointerDown={() => focusApp(id)}
      aria-hidden={minimized}
      style={{ x, y, zIndex: z, pointerEvents: minimized ? 'none' : 'auto' }}
      className={`absolute flex flex-col overflow-hidden shadow-2xl backdrop-blur-2xl transition-shadow ${
        isCalc
          ? 'rounded-[1.4cqw] border border-white/15 bg-[#2c203b]/95 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.7)]'
          : 'rounded-[1.2cqw] border border-white/50 bg-white/85'
      }`}
    >
      {isCalc ? (
        <>
          {/* Integrated macOS Traffic Lights at top-left of the dark calculator header */}
          <div className="group absolute left-[1.15cqw] top-[1.15cqw] z-20 flex items-center gap-[0.7cqw]">
            <Light color="#ff5f57" label="Close" onClick={() => closeApp(id)} size="h-[1.5cqw] w-[1.5cqw]" glyphSize="text-[1.1cqw]">×</Light>
            <Light color="#febc2e" label="Minimize" onClick={() => minimizeApp(id)} size="h-[1.5cqw] w-[1.5cqw]" glyphSize="text-[1.1cqw]">−</Light>
            <Light color="#28c840" label={maximized ? 'Restore' : 'Maximize'} onClick={() => toggleMaximize(id)} size="h-[1.5cqw] w-[1.5cqw]" glyphSize="text-[1.1cqw]">+</Light>
          </div>
          {/* Draggable header surface covering top display area */}
          <div
            onPointerDown={(e) => {
              if (!maximized) controls.start(e)
            }}
            onDoubleClick={() => toggleMaximize(id)}
            onMouseDown={(e) => e.preventDefault()}
            style={{ touchAction: 'none' }}
            className="absolute left-0 top-0 right-0 h-[8.25cqw] z-10 cursor-default select-none"
          />
        </>
      ) : (
        <div
          onPointerDown={(e) => {
            if (!maximized) controls.start(e) // a maximized window can't be dragged
          }}
          onDoubleClick={() => toggleMaximize(id)}
          onMouseDown={(e) => e.preventDefault()}
          style={{ touchAction: 'none' }}
          className="flex h-[4cqw] shrink-0 items-center gap-[0.9cqw] border-b border-black/10 bg-white/60 px-[1.4cqw]"
        >
          <div className="group flex items-center gap-[0.9cqw]">
            <Light color="#ff5f57" label="Close" onClick={() => closeApp(id)}>×</Light>
            <Light color="#febc2e" label="Minimize" onClick={() => minimizeApp(id)}>−</Light>
            <Light color="#28c840" label={maximized ? 'Restore' : 'Maximize'} onClick={() => toggleMaximize(id)}>+</Light>
          </div>
          <span className="flex-1 pr-[6cqw] text-center text-[1.45cqw] font-medium text-black/70">{app.name}</span>
        </div>
      )}

      <AppBody id={id} />
      {focused && <BorderBeam size={isCalc ? 70 : 90} duration={7} colorFrom={isCalc ? '#f99f1b' : glow} colorTo="#a855f7" />}
    </motion.div>
  )
}
