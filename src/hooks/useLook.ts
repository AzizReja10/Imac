import { useEffect } from 'react'
import { look } from '@/lib/pointer'

export function useLook() {
  useEffect(() => {
    const move = (e: PointerEvent) => {
      look.x.set((e.clientX / window.innerWidth) * 2 - 1)
      look.y.set((e.clientY / window.innerHeight) * 2 - 1)
    }
    const leave = () => {
      look.x.set(0)
      look.y.set(0)
    }

    window.addEventListener('pointermove', move)
    document.documentElement.addEventListener('pointerleave', leave) // mouse left the window: recenter

    return () => {
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [])
}
