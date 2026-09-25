import { motionValue } from 'framer-motion'

// Pointer position inside the screen, normalized 0..1 (not pixels)
export const pointer = {
  x: motionValue(0.5),
  y: motionValue(0.5),
  visible: motionValue(0),
  pressed: motionValue(0), // 1 while a mouse button is held down
}

export const look = {
  x: motionValue(0), // mouse position across the whole window, from -1 (left) to 1 (right)
  y: motionValue(0), // -1 (top) to 1 (bottom)
}
