import { AnimatePresence, motion } from 'framer-motion'
import Desktop from '@/components/os/Desktop'
import { useSetup } from '@/store/useSetup'
import { monitorSkins } from '@/data/skins'
import BootScreen from './BootScreen'

export default function Monitor() {
  const skin = monitorSkins[useSetup((s) => s.monitor)]
  const powered = useSetup((s) => s.powered)
  const booting = useSetup((s) => s.booting)

  return (
    <div className="relative z-10 flex w-full flex-col items-center">
      <motion.div
        aria-hidden
        initial={false}
        animate={
          powered
            ? { backgroundColor: skin.glow, opacity: [0.3, 0.5, 0.3] }
            : { backgroundColor: skin.glow, opacity: 0 }
        }
        transition={{
          backgroundColor: { duration: 0.6 },
          opacity: powered
            ? { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }
            : { duration: 0.4 },
        }}
        className="pointer-events-none absolute inset-x-[-6%] top-[-8%] -z-10 h-[75%] rounded-full blur-3xl"
      />

      {/* Body: edge-to-edge screen + chin (no white bezel boundary) */}
      <div className="w-full overflow-hidden rounded-2xl shadow-2xl">
        {/* The screen: edge-to-edge, mini OS lives here */}
        <div
          id="screen"
          className="relative aspect-video overflow-hidden [container-type:inline-size]"
          style={{ background: skin.wallpaper }}
        >
          <Desktop />
          <AnimatePresence>
            {!powered && (
              <motion.div
                key="off"
                className="absolute inset-0 z-50 flex items-center justify-center bg-black"
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
              >
                {booting && <BootScreen />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chin: height comes from padding */}
        <motion.div animate={{ backgroundColor: skin.chin }} className="pt-[7%]" />
      </div>

      {/* Stand */}
      <motion.div
        animate={{ backgroundColor: skin.stand }}
        className="aspect-[5/4] w-[12%]"
      />
      <motion.div
        animate={{ backgroundColor: skin.stand }}
        className="h-3 w-[22%] rounded-md shadow-md"
      />
    </div>
  )
}

