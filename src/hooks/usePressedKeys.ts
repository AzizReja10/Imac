import { useEffect, useState } from 'react'

// Keys whose default browser behaviour would fight the simulation
const BLOCK = new Set([
  'Tab', 'Space', 'Backspace', 'Quote', 'Slash',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
])

export function usePressedKeys() {
  const [pressed, setPressed] = useState<Set<string>>(new Set())
  const [caps, setCaps] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      const editing = !!t && (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT' || t.isContentEditable)
      // In a text field only Tab is blocked (it would move focus away); the rest must work natively
      const blocked = editing ? e.code === 'Tab' : BLOCK.has(e.code)
      if (blocked && !e.ctrlKey && !e.metaKey) e.preventDefault()

      setCaps(e.getModifierState('CapsLock'))
      if (e.code === 'CapsLock') return // shown by the LED, not a press
      setPressed((prev) => (prev.has(e.code) ? prev : new Set(prev).add(e.code)))
    }
    const up = (e: KeyboardEvent) => {
      setCaps(e.getModifierState('CapsLock'))
      if (e.code === 'CapsLock') return
      // While Cmd/Win is held, the OS swallows other keyups, so reset everything
      if (e.code.startsWith('Meta')) return setPressed(new Set())
      setPressed((prev) => {
        const next = new Set(prev)
        next.delete(e.code)
        return next
      })
    }
    const clear = () => setPressed(new Set())

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', clear)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', clear)
    }
  }, [])

  return { pressed, caps }
}
