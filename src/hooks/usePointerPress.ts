import { useEffect } from 'react'
import { pointer } from '@/lib/pointer'

export function usePointerPress() {
  useEffect(() => {
    const down = () => pointer.pressed.set(1)
    const up = () => pointer.pressed.set(0)

    window.addEventListener('mousedown', down)
    window.addEventListener('mouseup', up)
    window.addEventListener('blur', up) // released outside the window = would get stuck

    return () => {
      window.removeEventListener('mousedown', down)
      window.removeEventListener('mouseup', up)
      window.removeEventListener('blur', up)
    }
  }, [])
}
