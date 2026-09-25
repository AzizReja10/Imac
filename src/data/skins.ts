export const monitorSkins = {
  yellow: {
    name: 'Yellow',
    bezel: '#fffaf0',
    chin: '#f9e29a',
    stand: '#f6dc86',
    wallpaper: 'linear-gradient(135deg, #fde68a 0%, #fbbf24 50%, #fcd34d 100%)',
    glow: '#fbbf24',
  },
  orange: {
    name: 'Orange',
    bezel: '#fff5ee',
    chin: '#f9c39f',
    stand: '#f6b98f',
    wallpaper: 'linear-gradient(135deg, #fed7aa 0%, #fb923c 50%, #fdba74 100%)',
    glow: '#fb923c',
  },
} as const

export type MonitorSkinId = keyof typeof monitorSkins

export type KeyColor = { key: string; keyDown: string; edge: string; text: string }

// Every keyboard skin has the same shape, so TypeScript is happy reading any field
export const keyboardSkins = {
  silver: {
    name: 'Silver',
    layout: 'apple', // which key arrangement to draw (see keyboardLayout.ts)
    legend: 'corner', // modifier text sits in the bottom corner
    body: '#e5e7eb',
    base: { key: '#fafafa', keyDown: '#e4e4e7', edge: '#c9ccd1', text: '#3f3f46' },
    accent: { key: '#fafafa', keyDown: '#e4e4e7', edge: '#c9ccd1', text: '#3f3f46' },
  },
  crimson: {
    name: 'Crimson',
    layout: 'compact',
    legend: 'center', // modifier text is centered on the key
    body: '#e4e5eb',
    base: { key: '#f4f4f6', keyDown: '#dcdce0', edge: '#b9bac2', text: '#4a4a52' },
    accent: { key: '#c8161d', keyDown: '#a51117', edge: '#7c0d12', text: '#ffffff' },
  },
} as const

export type KeyboardSkinId = keyof typeof keyboardSkins

export const mouseSkins = {
  white: { name: 'White', body: '#f4f4f6', pad: '#d6d2ce', shade: 'rgba(0,0,0,0.06)' },
  graphite: { name: 'Graphite', body: '#2c2c30', pad: '#b9b4ae', shade: 'rgba(255,255,255,0.08)' },
} as const

export type MouseSkinId = keyof typeof mouseSkins
