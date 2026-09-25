import { useEffect, useRef } from 'react'
import { motion, useAnimationControls, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { apps, type DockApp } from '@/data/apps'
import { useSetup } from '@/store/useSetup'
import { pointer } from '@/lib/pointer'

const OFF = -1e5 // "mouse is not over the dock"

function DockIcon({ app, mouseX }: { app: DockApp; mouseX: MotionValue<number> }) {
  const ref = useRef<HTMLDivElement>(null)
  const controls = useAnimationControls()

  // Distance from the mouse to this icon's center, measured in icon-widths
  const dist = useTransform(mouseX, (x) => {
    const b = ref.current?.getBoundingClientRect()
    return b ? (x - (b.left + b.width / 2)) / b.width : 99
  })
  const target = useTransform(dist, [-3, -1.32, 0, 1.32, 3], [1, 1.15, 1.45, 1.15, 1])
  const scale = useSpring(target, { stiffness: 300, damping: 22, mass: 0.4 })

  const bounce = () =>
    controls.start({ y: ['0%', '-45%', '0%', '-25%', '0%'], transition: { duration: 0.8, ease: 'easeOut' } })

  const running = useSetup((s) => s.windows.some((w) => w.id === app.id))
  const openApp = useSetup((s) => s.openApp)

  const launch = () => {
    if (!running) bounce() // like macOS: bounce only when launching, not when focusing
    openApp(app.id)
  }

  return (
    <div ref={ref} data-dock-app={app.id} className="group relative aspect-square w-[5cqw]">
      <span className="pointer-events-none absolute bottom-full left-1/2 mb-[3cqw] -translate-x-1/2 whitespace-nowrap rounded-[0.6cqw] bg-zinc-800/85 px-[1cqw] py-[0.4cqw] text-[1.3cqw] text-white opacity-0 transition-opacity group-hover:opacity-100">
        {app.name}
      </span>
      <motion.div
        style={{ scale, originY: 1, background: app.bg }}
        animate={controls}
        onClick={launch}
        className="flex h-full w-full items-center justify-center rounded-[1.1cqw] text-[2.6cqw] text-white shadow-lg ring-1 ring-black/10"
      >
        <app.Icon />
      </motion.div>
      {running && (
        <span className="absolute -bottom-[0.9cqw] left-1/2 h-[0.45cqw] w-[0.45cqw] -translate-x-1/2 rounded-full bg-black/60" />
      )}
    </div>
  )
}

export default function Dock() {
  const mouseX = useMotionValue(OFF)

  useEffect(() => {
    const update = () => {
      const vis = pointer.visible.get()
      const py = pointer.y.get()
      const px = pointer.x.get()

      if (!vis || py < 0.82) {
        mouseX.set(OFF)
        return
      }

      const screen = document.getElementById('screen')
      if (!screen) {
        mouseX.set(OFF)
        return
      }

      const rect = screen.getBoundingClientRect()
      const clientX = rect.left + px * rect.width
      mouseX.set(clientX)
    }

    const unsubs = [
      pointer.x.on('change', update),
      pointer.y.on('change', update),
      pointer.visible.on('change', update),
    ]

    return () => unsubs.forEach((u) => u())
  }, [mouseX])

  return (
    <div className="absolute inset-x-0 bottom-[1.2cqw] z-40 flex justify-center">
      <div
        onPointerMove={(e) => mouseX.set(e.clientX)}
        onPointerLeave={() => mouseX.set(OFF)}
        onMouseDown={(e) => e.preventDefault()}
        className="flex items-end gap-[1.6cqw] rounded-[2cqw] border border-white/40 bg-white/30 px-[1.4cqw] py-[1cqw] shadow-xl backdrop-blur-xl"
      >
        {apps.map((app) => (
          <DockIcon key={app.id} app={app} mouseX={mouseX} />
        ))}
      </div>
    </div>
  )
}
