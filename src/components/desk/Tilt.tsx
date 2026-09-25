import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

export default function Tilt({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <motion.div className="flex w-full flex-col items-center justify-center">
        {children}
      </motion.div>
    </div>
  )
}
