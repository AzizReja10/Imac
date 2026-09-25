// Respect the OS "reduce motion" setting: no tilt, no floating particles
export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
