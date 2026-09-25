export type Op = '+' | '−' | '×' | '÷'

export type CalcState = {
  display: string // what the screen shows, as a plain string ("12.5", "-3")
  acc: number | null // the left-hand number waiting for an operator
  op: Op | null // the pending operator
  fresh: boolean // true = the next digit starts a new number
}

export const initialCalc: CalcState = { display: '0', acc: null, op: null, fresh: true }

const isOp = (k: string): k is Op => ['+', '−', '×', '÷'].includes(k)

const apply = (a: number, b: number, op: Op) =>
  op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : b === 0 ? NaN : a / b

// toPrecision(12) hides float noise: 0.1 + 0.2 shows 0.3, not 0.30000000000000004
const fmt = (n: number) => (Number.isFinite(n) ? String(Number(n.toPrecision(12))) : 'Error')

// Adds thousands separators for display only
export const pretty = (d: string) => {
  if (d === 'Error' || d.includes('e')) return d
  const [int, dec] = d.split('.')
  const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return dec === undefined ? withCommas : `${withCommas}.${dec}`
}

// Used as a reducer: press(state, key) -> new state
export function press(prev: CalcState, key: string): CalcState {
  const s = prev.display === 'Error' ? initialCalc : prev // any key recovers from an error

  if (key === 'AC' || key === 'C') return initialCalc

  if (/^\d$/.test(key)) {
    if (s.fresh) return { ...s, display: key, fresh: false }
    if (s.display.replace(/[-.]/g, '').length >= 12) return s // 12 digits max
    return { ...s, display: s.display === '0' ? key : s.display + key }
  }

  if (key === '.') {
    if (s.fresh) return { ...s, display: '0.', fresh: false }
    return s.display.includes('.') ? s : { ...s, display: s.display + '.' }
  }

  if (key === '±' || key === '+/-') {
    if (s.display === '0') return s
    return { ...s, display: s.display.startsWith('-') ? s.display.slice(1) : '-' + s.display }
  }

  if (key === '%') return { ...s, display: fmt(Number(s.display) / 100), fresh: true }

  if (key === 'DEL') {
    if (s.fresh) return s
    const d = s.display.slice(0, -1)
    return { ...s, display: d === '' || d === '-' ? '0' : d }
  }

  if (isOp(key)) {
    // Chained: "2 + 3 ×" resolves 2 + 3 first, then waits for the next number
    if (s.op && s.acc !== null && !s.fresh) {
      const r = apply(s.acc, Number(s.display), s.op)
      return { display: fmt(r), acc: r, op: key, fresh: true }
    }
    return { ...s, acc: Number(s.display), op: key, fresh: true }
  }

  if (key === '=') {
    if (s.op === null || s.acc === null) return s
    const r = apply(s.acc, Number(s.display), s.op)
    return { display: fmt(r), acc: null, op: null, fresh: true }
  }

  return s
}
