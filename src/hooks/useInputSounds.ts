
import { useEffect } from 'react'
import { playKey, playKeyUp, playClick } from '@/lib/sound'
import { useSetup } from '@/store/useSetup'

export function useInputSounds() {
  const powered = useSetup((s) => s.powered)
  const soundOn = useSetup((s) => s.soundOn)

  useEffect(() => {
    if (!powered || !soundOn) return
    const kd = (e: KeyboardEvent) => {
      if (!e.repeat) playKey(e.code) // holding a key shouldn't machine-gun
    }
    const ku = () => playKeyUp()
    const md = () => playClick(true)
    const mu = () => playClick(false)

    window.addEventListener('keydown', kd)
    window.addEventListener('keyup', ku)
    window.addEventListener('mousedown', md)
    window.addEventListener('mouseup', mu)
    return () => {
      window.removeEventListener('keydown', kd)
      window.removeEventListener('keyup', ku)
      window.removeEventListener('mousedown', md)
      window.removeEventListener('mouseup', mu)
    }
  }, [powered, soundOn])
}
