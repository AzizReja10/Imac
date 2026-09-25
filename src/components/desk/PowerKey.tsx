import { motion } from 'framer-motion'
import { useSetup } from '@/store/useSetup'
import { unlockAudio, playBoot } from '@/lib/sound'
import type { KeyColor } from '@/data/skins'

export default function PowerKey({ c }: { c: KeyColor }) {
  const powered = useSetup((s) => s.powered)
  const booting = useSetup((s) => s.booting)
  const startBoot = useSetup((s) => s.startBoot)
  const powerOff = useSetup((s) => s.powerOff)

  const toggle = async () => {
    if (powered) return powerOff()
    if (booting) return
    await unlockAudio() // must be called from inside this real click handler, not later
    playBoot()
    startBoot()
  }

  return (
    <motion.button
      onClick={toggle}
      onMouseDown={(e) => e.preventDefault()} // don't steal focus from Notes/Terminal if they're open
      whileTap={{ scale: 0.93 }}
      animate={{ backgroundColor: c.key, boxShadow: `0 2px 0 ${c.edge}, 0 3px 5px rgba(0,0,0,0.18)` }}
      style={{ color: c.text }}
      className="relative flex h-full w-full items-center justify-center rounded-[0.7cqw] cursor-pointer"
      aria-label={powered ? 'Power off' : 'Power on'}
      title={powered ? 'Power off' : 'Power on'}
    >
      <svg viewBox="0 0 24 24" className="h-[1.6cqw] w-[1.6cqw]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 3v9" />
        <path d="M6.4 6.6a8 8 0 1 0 11.2 0" />
      </svg>
      <span
        className="absolute right-[0.6cqw] top-[0.6cqw] h-[0.4cqw] w-[0.4cqw] rounded-full"
        style={{
          background: powered ? '#22c55e' : booting ? '#eab308' : 'transparent',
          boxShadow: powered ? '0 0 4px #22c55e' : booting ? '0 0 4px #eab308' : 'none',
        }}
      />
    </motion.button>
  )
}
