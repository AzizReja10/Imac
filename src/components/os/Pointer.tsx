import { motion, useSpring, useTransform } from 'framer-motion'
import { pointer } from '@/lib/pointer'

export default function Pointer() {
  const left = useTransform(pointer.x, (v) => `${v * 100}%`)
  const top = useTransform(pointer.y, (v) => `${v * 100}%`)
  const opacity = useSpring(pointer.visible, { stiffness: 400, damping: 40 })
  const press = useSpring(pointer.pressed, { stiffness: 600, damping: 30 })
  const scale = useTransform(press, [0, 1], [1, 0.8])

  return (
    <motion.div
      style={{ left, top, opacity, scale, originX: 0, originY: 0 }}
      className="pointer-events-none absolute z-50"
    >
      {/* Magic UI Colored Pointer in vibrant electric blue with white outline */}
      <svg
        stroke="#ffffff"
        fill="#2563eb"
        strokeWidth="1.2"
        viewBox="0 0 16 16"
        className="h-auto w-[2.2cqw] rotate-[-70deg] drop-shadow-[0_2px_4px_rgba(0,0,0,0.28)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z" />
      </svg>
    </motion.div>
  )
}
