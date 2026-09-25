export type KeyDef = {
  code: string // matches KeyboardEvent.code, e.g. "KeyA"
  label: string // main legend
  top?: string // small shifted legend above (e.g. "!" over "1")
  w?: number // width in key units, default 1
  align?: 'left' | 'right' // a text-style modifier legend
  small?: boolean // smaller legend text
  accent?: boolean // use the skin's accent colors (the red keys)
}
type Stack = { stack: [KeyDef, KeyDef]; w?: number }
export type Cell = KeyDef | Stack
export type Row = { compact?: boolean; cells: Cell[] }
export type Layout = { units: number; rows: Row[] } // units = width of one full row
export type LayoutId = 'apple' | 'compact'

const k = (code: string, label: string, o: Partial<KeyDef> = {}): KeyDef => ({
  code,
  label,
  ...o,
})
const letters = (s: string) => s.split('').map((c) => k(`Key${c}`, c))

const shifted = ')!@#$%^&*('
const digits = '1234567890'.split('').map((d) => k(`Digit${d}`, d, { top: shifted[Number(d)] }))

// White Apple-style board: 15 units wide
const appleRows: Row[] = [
  {
    compact: true,
    cells: [
      k('Escape', 'esc', { w: 1.5, align: 'left' }),
      ...Array.from({ length: 12 }, (_, i) => k(`F${i + 1}`, `F${i + 1}`, { small: true })),
      k('Power', '', { w: 1.5 }),
    ],
  },
  {
    cells: [
      k('Backquote', '`', { top: '~' }),
      ...digits,
      k('Minus', '-', { top: '_' }),
      k('Equal', '=', { top: '+' }),
      k('Backspace', 'delete', { w: 2, align: 'right' }),
    ],
  },
  {
    cells: [
      k('Tab', 'tab', { w: 1.5, align: 'left' }),
      ...letters('QWERTYUIOP'),
      k('BracketLeft', '[', { top: '{' }),
      k('BracketRight', ']', { top: '}' }),
      k('Backslash', '\\', { w: 1.5, top: '|' }),
    ],
  },
  {
    cells: [
      k('CapsLock', 'caps lock', { w: 1.75, align: 'left' }),
      ...letters('ASDFGHJKL'),
      k('Semicolon', ';', { top: ':' }),
      k('Quote', "'", { top: '"' }),
      k('Enter', 'return', { w: 2.25, align: 'right' }),
    ],
  },
  {
    cells: [
      k('ShiftLeft', 'shift', { w: 2.25, align: 'left' }),
      ...letters('ZXCVBNM'),
      k('Comma', ',', { top: '<' }),
      k('Period', '.', { top: '>' }),
      k('Slash', '/', { top: '?' }),
      k('ShiftRight', 'shift', { w: 2.75, align: 'right' }),
    ],
  },
  {
    cells: [
      k('Fn', 'fn', { align: 'left' }),
      k('ControlLeft', 'control', { align: 'left' }),
      k('AltLeft', 'option', { align: 'left' }),
      k('MetaLeft', 'command', { w: 1.25, align: 'left' }),
      k('Space', '', { w: 5.5 }),
      k('MetaRight', 'command', { w: 1.25, align: 'right' }),
      k('AltRight', 'option', { align: 'right' }),
      k('ArrowLeft', '◀', { small: true }),
      { stack: [k('ArrowUp', '▲', { small: true }), k('ArrowDown', '▼', { small: true })] },
      k('ArrowRight', '▶', { small: true }),
    ],
  },
]

// Red-and-white compact board: 16 units wide (extra pgup/pgdn/home/end column)
const A = { accent: true } // shorthand: this key uses the accent color

const compactRows: Row[] = [
  {
    compact: true,
    cells: [
      k('Escape', 'esc', { align: 'left', ...A }),
      ...Array.from({ length: 12 }, (_, i) =>
        k(`F${i + 1}`, `F${i + 1}`, { small: true, accent: i >= 4 && i <= 7 }),
      ),
      k('F13', '⊞', { small: true, ...A }),
      k('Delete', 'del', { align: 'right', ...A }),
      k('Power', '', { small: true, ...A }),
    ],
  },
  {
    cells: [
      k('Backquote', '`', { top: '~' }),
      ...digits,
      k('Minus', '-', { top: '_' }),
      k('Equal', '=', { top: '+' }),
      k('Backspace', '←', { w: 2, ...A }),
      k('PageUp', 'pgup', { align: 'right', ...A }),
    ],
  },
  {
    cells: [
      k('Tab', 'tab', { w: 1.5, align: 'left', ...A }),
      ...letters('QWERTYUIOP'),
      k('BracketLeft', '[', { top: '{' }),
      k('BracketRight', ']', { top: '}' }),
      k('Backslash', '\\', { w: 1.5, top: '|' }),
      k('PageDown', 'pgdn', { align: 'right', ...A }),
    ],
  },
  {
    cells: [
      k('CapsLock', 'caps lock', { w: 1.75, align: 'left', ...A }),
      ...letters('ASDFGHJKL'),
      k('Semicolon', ';', { top: ':' }),
      k('Quote', "'", { top: '"' }),
      k('Enter', 'return', { w: 2.25, align: 'right', ...A }),
      k('Home', 'home', { align: 'right', ...A }),
    ],
  },
  {
    cells: [
      k('ShiftLeft', 'shift', { w: 2.25, align: 'left', ...A }),
      ...letters('ZXCVBNM'),
      k('Comma', ',', { top: '<' }),
      k('Period', '.', { top: '>' }),
      k('Slash', '/', { top: '?' }),
      k('ShiftRight', 'shift', { w: 1.75, align: 'right', ...A }),
      k('ArrowUp', '˄', { small: true, ...A }),
      k('End', 'end', { align: 'right', ...A }),
    ],
  },
  {
    cells: [
      k('Fn', 'fn', { align: 'left', ...A }),
      k('ControlLeft', 'ctrl', { align: 'left', ...A }),
      k('AltLeft', 'option', { align: 'left', ...A }),
      k('MetaLeft', '⌘', { w: 1.25, small: true, ...A }),
      k('Space', '', { w: 6.5 }),
      k('MetaRight', '⌘', { w: 1.25, small: true, ...A }),
      k('AltRight', 'option', { align: 'right', ...A }),
      k('ArrowLeft', '‹', { small: true, ...A }),
      k('ArrowDown', '˅', { small: true, ...A }),
      k('ArrowRight', '›', { small: true, ...A }),
    ],
  },
]

export const keyboardLayouts: Record<LayoutId, Layout> = {
  apple: { units: 15, rows: appleRows },
  compact: { units: 16, rows: compactRows },
}
