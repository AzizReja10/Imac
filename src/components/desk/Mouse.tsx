import { useRef } from 'react'
import { motion, useSpring, useTransform, useVelocity } from 'framer-motion'
import { pointer } from '@/lib/pointer'
import { mouseSkins } from '@/data/skins'
import { useSetup } from '@/store/useSetup'
import { playClick } from '@/lib/sound'
import { dispatchScreenEvent, executeDeskMouseClick } from '@/lib/screenPointer'

const RANGE_X = 14 // how far the mouse travels horizontally from pad's center, in cqw
const RANGE_Y = 16 // how far the mouse travels vertically from pad's center, in cqw
// Smooth, weighted hardware inertia (mimics real mouse glide)
const follow = { stiffness: 140, damping: 22, mass: 0.8 }
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

export default function Mouse() {
  const skin = mouseSkins[useSetup((s) => s.mouse)]
  const soundOn = useSetup((s) => s.soundOn)
  const padRef = useRef<HTMLDivElement>(null)

  const isDragging = useRef(false)
  const startPos = useRef({ x: 0, y: 0, px: 0.5, py: 0.5, moved: false })

  const sx = useSpring(pointer.x, follow)
  const sy = useSpring(pointer.y, follow)
  const x = useTransform(sx, (v) => `${(clamp01(v) - 0.5) * 2 * RANGE_X}cqw`)
  const y = useTransform(sy, (v) => `${(clamp01(v) - 0.5) * 2 * RANGE_Y}cqw`)

  const vx = useVelocity(sx)
  const tilt = useSpring(useTransform(vx, [-2, 2], [-6, 6]), { stiffness: 120, damping: 20 })

  const press = useSpring(pointer.pressed, { stiffness: 600, damping: 30 })
  const scale = useTransform(press, [0, 1], [1, 0.965])
  const shade = useTransform(press, [0, 1], [0, 1])

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return // left-click only
    e.stopPropagation()

    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {}

    isDragging.current = true
    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      px: pointer.x.get(),
      py: pointer.y.get(),
      moved: false,
    }

    pointer.visible.set(1)
    pointer.pressed.set(1)
    if (soundOn) playClick(true)

    dispatchScreenEvent('down', pointer.x.get(), pointer.y.get())
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return
    const dx = e.clientX - startPos.current.x
    const dy = e.clientY - startPos.current.y
    const dist = Math.hypot(dx, dy)
    if (dist > 3) {
      startPos.current.moved = true
    }

    const pad = padRef.current
    const padRect = pad?.getBoundingClientRect()
    const padWidth = padRect ? padRect.width : 160
    const padHeight = padRect ? padRect.height : 200

    const sensX = 1 / padWidth
    const sensY = 1 / padHeight

    const nextX = clamp01(startPos.current.px + dx * sensX)
    const nextY = clamp01(startPos.current.py + dy * sensY)

    pointer.x.set(nextX)
    pointer.y.set(nextY)
    pointer.visible.set(1)

    dispatchScreenEvent('move', nextX, nextY)
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return
    isDragging.current = false
    pointer.pressed.set(0)
    if (soundOn) playClick(false)

    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {}

    const curX = pointer.x.get()
    const curY = pointer.y.get()

    dispatchScreenEvent('up', curX, curY)
    dispatchScreenEvent('click', curX, curY)

    const pad = padRef.current
    if (pad) {
      const r = pad.getBoundingClientRect()
      const inside =
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom
      if (!inside) {
        pointer.visible.set(0)
        pointer.x.set(0.5)
        pointer.y.set(0.5)
      }
    }
  }

  // Hover over the mousepad guides the mouse and monitor pointer with direct tracking
  const onPadPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging.current) return
    const pad = padRef.current
    if (!pad) return
    const r = pad.getBoundingClientRect()
    const nx = clamp01((e.clientX - (r.left + r.width * 0.15)) / (r.width * 0.7))
    const ny = clamp01((e.clientY - (r.top + r.height * 0.15)) / (r.height * 0.7))

    pointer.x.set(nx)
    pointer.y.set(ny)
    pointer.visible.set(1)
    dispatchScreenEvent('move', nx, ny)
  }

  const onPadPointerLeave = () => {
    if (isDragging.current) return
    pointer.visible.set(0)
    pointer.x.set(0.5)
    pointer.y.set(0.5)
  }

  const onPadClick = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.target !== padRef.current || isDragging.current) return
    const pad = padRef.current
    if (!pad) return
    const r = pad.getBoundingClientRect()
    const nx = clamp01((e.clientX - (r.left + r.width * 0.15)) / (r.width * 0.7))
    const ny = clamp01((e.clientY - (r.top + r.height * 0.15)) / (r.height * 0.7))
    pointer.x.set(nx)
    pointer.y.set(ny)
    executeDeskMouseClick()
  }

  return (
    <div className="group relative w-full select-none" onPointerLeave={onPadPointerLeave}>
      <motion.div
        ref={padRef}
        initial={false}
        animate={{ backgroundColor: skin.pad }}
        onPointerMove={onPadPointerMove}
        onPointerLeave={onPadPointerLeave}
        onClick={onPadClick}
        className="relative flex aspect-[4/5] w-full cursor-crosshair items-center justify-center rounded-[18px] shadow-[0_4px_16px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.45)] border border-black/5 [container-type:inline-size] touch-none"
      >
        <motion.div
          initial={false}
          animate={{ backgroundColor: skin.body }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            x,
            y,
            rotate: tilt,
            scale,
            boxShadow:
              '0 4px 12px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.12), inset 0 1px 2px rgba(255,255,255,0.7), inset 0 -1px 2px rgba(0,0,0,0.08)',
          }}
          className="relative h-[56cqw] w-[34cqw] cursor-grab active:cursor-grabbing rounded-b-[12cqw] rounded-t-[16cqw] touch-none"
          title="Drag to move on monitor • Left click to operate"
        >
          {/* Subtle click zone dividing line indicator at top */}
          <div className="absolute top-[8%] left-1/2 h-[15%] w-[1px] -translate-x-1/2 bg-black/10 rounded-full" />
          {/* Fixed gloss on top of the animated base color */}
          <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/35 via-transparent to-black/5 pointer-events-none" />
          <motion.div
            style={{ opacity: shade, backgroundColor: skin.shade }}
            className="absolute inset-0 rounded-[inherit] pointer-events-none"
          />
        </motion.div>
      </motion.div>
    </div>
  )
}
