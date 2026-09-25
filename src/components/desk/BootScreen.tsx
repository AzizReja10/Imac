import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSetup } from '@/store/useSetup'

const DURATION = 3600 // ms; matches the apple.mp3 boot chime duration

export default function BootScreen() {
  const finishBoot = useSetup((s) => s.finishBoot)

  useEffect(() => {
    const id = setTimeout(finishBoot, DURATION)
    return () => clearTimeout(id)
  }, [finishBoot])

  return (
    <div className="flex flex-col items-center gap-[2.2cqw]">
      <motion.img
        src={`${import.meta.env.BASE_URL}apple.webp`}
        alt="Apple"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="h-[8cqw] w-auto select-none pointer-events-none object-contain"
        draggable={false}
      />

      <div className="h-[0.35cqw] w-[16cqw] overflow-hidden rounded-full bg-white/20">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: DURATION / 1000, ease: 'easeInOut' }}
          style={{ originX: 0 }}
          className="h-full w-full rounded-full bg-white"
        />
      </div>
    </div>
  )
}
