import { pointer } from '@/lib/pointer'
import { playClick } from '@/lib/sound'
import { useSetup } from '@/store/useSetup'

export type ScreenPoint = {
  clientX: number
  clientY: number
  target: Element | null
}

export function getScreenTarget(xNorm: number, yNorm: number): ScreenPoint | null {
  const screen = document.getElementById('screen')
  if (!screen) return null

  const rect = screen.getBoundingClientRect()
  const clampedX = Math.max(0, Math.min(1, xNorm))
  const clampedY = Math.max(0, Math.min(1, yNorm))

  const clientX = rect.left + clampedX * rect.width
  const clientY = rect.top + clampedY * rect.height

  // Pointer SVG has pointer-events-none, so elementFromPoint sees the actual UI element beneath
  const target = document.elementFromPoint(clientX, clientY)
  return {
    clientX,
    clientY,
    target: target && screen.contains(target) ? target : null,
  }
}

export function dispatchScreenEvent(
  type: 'down' | 'move' | 'up' | 'click',
  xNorm: number,
  yNorm: number
) {
  const pt = getScreenTarget(xNorm, yNorm)
  if (!pt || !pt.target) return

  const { clientX, clientY, target } = pt

  const mouseInit: MouseEventInit = {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX,
    clientY,
    button: 0,
    buttons: type === 'down' || type === 'move' ? 1 : 0,
  }

  const pointerInit: PointerEventInit = {
    ...mouseInit,
    pointerId: 1,
    isPrimary: true,
  }

  if (type === 'down') {
    target.dispatchEvent(new PointerEvent('pointerdown', pointerInit))
    target.dispatchEvent(new MouseEvent('mousedown', mouseInit))
  } else if (type === 'move') {
    target.dispatchEvent(new PointerEvent('pointermove', pointerInit))
    target.dispatchEvent(new MouseEvent('mousemove', mouseInit))
  } else if (type === 'up') {
    target.dispatchEvent(new PointerEvent('pointerup', pointerInit))
    target.dispatchEvent(new MouseEvent('mouseup', mouseInit))
  } else if (type === 'click') {
    target.dispatchEvent(new PointerEvent('pointerdown', { ...pointerInit, buttons: 1 }))
    target.dispatchEvent(new MouseEvent('mousedown', { ...mouseInit, buttons: 1 }))
    target.dispatchEvent(new PointerEvent('pointerup', pointerInit))
    target.dispatchEvent(new MouseEvent('mouseup', mouseInit))
    target.dispatchEvent(new MouseEvent('click', mouseInit))

    // Handle focus for inputs and textareas
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      target.focus({ preventScroll: true })
    }

    // Ensure buttons and dock icons execute their action
    const clickable = target.closest('button, [role="button"], a') as HTMLElement | null
    if (clickable && clickable !== target) {
      clickable.click()
    }
  }
}

export function executeDeskMouseClick() {
  const x = pointer.x.get()
  const y = pointer.y.get()

  pointer.visible.set(1)
  pointer.pressed.set(1)
  if (useSetup.getState().soundOn) playClick(true)

  dispatchScreenEvent('down', x, y)

  setTimeout(() => {
    pointer.pressed.set(0)
    if (useSetup.getState().soundOn) playClick(false)
    dispatchScreenEvent('up', x, y)
    dispatchScreenEvent('click', x, y)
  }, 100)
}
