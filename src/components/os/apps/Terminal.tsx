import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { useSetup, selectFocused } from '@/store/useSetup'
import { run } from '@/lib/terminal'

type Line = { kind: 'in' | 'out'; text: string }

const PROMPT = 'guest@desk ~ %'

export default function Terminal() {
  const [lines, setLines] = useState<Line[]>([{ kind: 'out', text: 'desksh 1.0: type "help" to get started' }])
  const [value, setValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [pos, setPos] = useState<number | null>(null) // where we are while walking through history
  const input = useRef<HTMLInputElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const focused = useSetup((s) => selectFocused(s) === 'terminal')

  useEffect(() => {
    if (focused) input.current?.focus({ preventScroll: true })
    else input.current?.blur()
  }, [focused])

  // Keep the newest output in view (scrollTop, not scrollIntoView, which can shift the hidden screen)
  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  const submit = () => {
    const out = run(value)
    setLines((prev) =>
      out === 'clear'
        ? []
        : [...prev, { kind: 'in', text: value }, ...out.map((text): Line => ({ kind: 'out', text }))],
    )
    if (value.trim()) setHistory((h) => [...h, value])
    setValue('')
    setPos(null)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') return submit()

    if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault() // stop the caret jumping to the start
      const next = pos === null ? history.length - 1 : Math.max(0, pos - 1)
      setPos(next)
      setValue(history[next])
    } else if (e.key === 'ArrowDown' && pos !== null) {
      e.preventDefault()
      const next = pos + 1
      if (next >= history.length) {
        setPos(null)
        setValue('')
      } else {
        setPos(next)
        setValue(history[next])
      }
    }
  }

  const keepFocus = (e: MouseEvent) => {
    if (e.target === input.current) return
    e.preventDefault()
    input.current?.focus({ preventScroll: true })
  }

  return (
    <div
      onMouseDown={keepFocus}
      className="flex min-h-0 flex-1 flex-col bg-[#1c1c1e] font-mono text-[1.35cqw] leading-[1.5] text-[#e5e5ea]"
    >
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto p-[1.4cqw] [scrollbar-width:thin]">
        {lines.map((l, i) =>
          l.kind === 'in' ? (
            <div key={i}>
              <span className="text-[#30d158]">{PROMPT}</span> {l.text}
            </div>
          ) : (
            <div key={i} className="whitespace-pre-wrap break-words">
              {l.text}
            </div>
          ),
        )}

        <div className="flex">
          <span className="whitespace-pre text-[#30d158]">{PROMPT} </span>
          <input
            ref={input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            inputMode="none"
            className="min-w-0 flex-1 bg-transparent caret-[#30d158] outline-none"
          />
        </div>
      </div>
    </div>
  )
}
