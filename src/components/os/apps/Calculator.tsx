import { useEffect, useReducer, useState } from 'react'
import { motion } from 'framer-motion'
import { useSetup, selectFocused } from '@/store/useSetup'
import { press, pretty, initialCalc } from '@/lib/calc'

type Btn = {
  k: string
  label?: string
  kind: 'fn' | 'op' | 'num'
  span?: number
  isBL?: boolean
  isBR?: boolean
  col: number // 1-indexed column (1, 2, 3, 4)
  row: number // 1-indexed row (1..5)
}

const buttons: Btn[] = [
  // Row 1
  { k: 'C', kind: 'fn', col: 1, row: 1 },
  { k: '+/-', kind: 'fn', col: 2, row: 1 },
  { k: '%', kind: 'fn', col: 3, row: 1 },
  { k: '÷', kind: 'op', col: 4, row: 1 },
  // Row 2
  { k: '7', kind: 'num', col: 1, row: 2 },
  { k: '8', kind: 'num', col: 2, row: 2 },
  { k: '9', kind: 'num', col: 3, row: 2 },
  { k: '×', kind: 'op', col: 4, row: 2 },
  // Row 3
  { k: '4', kind: 'num', col: 1, row: 3 },
  { k: '5', kind: 'num', col: 2, row: 3 },
  { k: '6', kind: 'num', col: 3, row: 3 },
  { k: '−', kind: 'op', col: 4, row: 3 },
  // Row 4
  { k: '1', kind: 'num', col: 1, row: 4 },
  { k: '2', kind: 'num', col: 2, row: 4 },
  { k: '3', kind: 'num', col: 3, row: 4 },
  { k: '+', kind: 'op', col: 4, row: 4 },
  // Row 5
  { k: '0', kind: 'num', span: 2, isBL: true, col: 1, row: 5 },
  { k: '.', kind: 'num', col: 3, row: 5 },
  { k: '=', kind: 'op', isBR: true, col: 4, row: 5 },
]

// Real-keyboard keys that aren't digits
const keyMap: Record<string, string> = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
  '%': '%',
  '.': '.',
  Enter: '=',
  '=': '=',
  Backspace: 'DEL',
  Escape: 'C',
  c: 'C',
  C: 'C',
}

export default function Calculator() {
  const [state, dispatch] = useReducer(press, initialCalc)
  const [flash, setFlash] = useState<string | null>(null)
  const focused = useSetup((s) => selectFocused(s) === 'calculator')

  // Real keyboard works only while this window is focused
  useEffect(() => {
    if (!focused) return
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return
      const key = /^\d$/.test(e.key) ? e.key : keyMap[e.key]
      if (!key) return
      e.preventDefault()
      dispatch(key)
      setFlash(key) // briefly light up the matching on-screen button
      setTimeout(() => setFlash(null), 120)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focused])

  const text = pretty(state.display)
  const size =
    text.length > 11 ? 'text-[2.6cqw]' : text.length > 8 ? 'text-[3.8cqw]' : 'text-[5.4cqw]'
  const selected = state.op && state.fresh ? state.op : null // operator waiting for next number

  const clearLabel = state.display !== '0' || !state.fresh ? 'C' : 'AC'

  return (
    <div
      onMouseDown={(e) => e.preventDefault()} // buttons must never hold keyboard focus
      className="flex h-full w-full min-h-0 flex-1 flex-col select-none bg-[#2c203b] text-white"
    >
      {/* Top Display Area: seamless dark header with display number right-aligned */}
      <div className="relative flex h-[8.25cqw] shrink-0 items-end justify-end overflow-hidden px-[1.8cqw] pb-[1.1cqw] bg-gradient-to-b from-[#352846] to-[#2c203b]">
        <span className={`font-light tracking-tight leading-none text-white select-none ${size}`}>
          {text}
        </span>
      </div>

      {/* Button Grid: 4 columns x 5 rows, zero gap with hairline divider borders */}
      <div className="grid min-h-0 flex-1 grid-cols-4 grid-rows-5 gap-0 border-t border-[#251b31]">
        {buttons.map((b) => {
          const on = b.k === selected
          const isClear = b.k === 'C'
          const label = isClear ? clearLabel : b.label ?? b.k

          // Exact color palettes from design screenshot
          let bgClass = 'bg-[#62537a] hover:bg-[#6d5d86] active:bg-[#796894]' // number buttons
          let textClass = 'text-white text-[2.4cqw]'

          if (b.kind === 'fn') {
            bgClass = 'bg-[#4d3d63] hover:bg-[#574670] active:bg-[#64527f]' // C, +/-, %
            textClass = 'text-white text-[2.2cqw]'
          } else if (b.kind === 'op') {
            bgClass = on
              ? 'bg-white text-[#f99f1b]'
              : 'bg-[#f99f1b] hover:bg-[#faa92d] active:bg-[#e68e12] text-white' // orange operations
            textClass = on ? 'text-[#f99f1b] text-[2.6cqw] font-medium' : 'text-white text-[2.6cqw]'
          }

          // Dividers: 1px border between cells
          const borderRight = b.col + (b.span ?? 1) - 1 < 4 ? 'border-r border-[#251b31]' : ''
          const borderBottom = b.row < 5 ? 'border-b border-[#251b31]' : ''
          const roundedCorner = b.isBL ? 'rounded-bl-[1.3cqw]' : b.isBR ? 'rounded-br-[1.3cqw]' : ''

          return (
            <motion.button
              key={b.k}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.08 }}
              onClick={() => dispatch(b.k)}
              style={b.span ? { gridColumn: `span ${b.span}` } : undefined}
              className={`flex items-center justify-center font-normal transition-colors duration-75 cursor-pointer select-none outline-none ${borderRight} ${borderBottom} ${roundedCorner} ${bgClass} ${textClass} ${
                flash === b.k ? 'brightness-125' : ''
              }`}
            >
              <span>{label}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
