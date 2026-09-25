import { useEffect, useRef, type KeyboardEvent, type MouseEvent } from 'react'
import { useSetup, selectFocused } from '@/store/useSetup'

const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

export default function Notes() {
  const ref = useRef<HTMLTextAreaElement>(null)
  const text = useSetup((s) => s.notes)
  const setNotes = useSetup((s) => s.setNotes)
  const focused = useSetup((s) => selectFocused(s) === 'notes')

  // Keys go here only while Notes is the focused window
  useEffect(() => {
    if (focused) ref.current?.focus({ preventScroll: true })
    else ref.current?.blur()
  }, [focused])

  // Tab inserts spaces instead of moving focus to the next button
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Tab') return
    e.preventDefault()
    const el = e.currentTarget
    el.setRangeText('  ', el.selectionStart, el.selectionEnd, 'end')
    setNotes(el.value) // setRangeText doesn't fire an input event, so sync by hand
  }

  // Clicking the padding around the textarea should still focus it
  const keepFocus = (e: MouseEvent) => {
    if (e.target === ref.current) return
    e.preventDefault()
    ref.current?.focus({ preventScroll: true })
  }

  const trimmed = text.trim()
  const words = trimmed ? trimmed.split(/\s+/).length : 0

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#fffdf6]" onMouseDown={keepFocus}>
      <p className="pt-[1.4cqw] text-center text-[1.2cqw] text-black/35">{today}</p>

      <textarea
        ref={ref}
        value={text}
        onChange={(e) => setNotes(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Start typing…"
        spellCheck={false}
        inputMode="none"
        className="min-h-0 flex-1 resize-none select-text bg-transparent px-[2.2cqw] py-[1cqw] text-[1.7cqw] leading-[1.55] text-black/85 caret-[#f5a800] outline-none [scrollbar-width:thin] selection:bg-yellow-200 placeholder:text-black/25"
      />

      <div className="flex justify-between border-t border-black/5 px-[2.2cqw] py-[0.7cqw] text-[1.1cqw] text-black/35">
        <span>{words} words</span>
        <span>{text.length} characters</span>
      </div>
    </div>
  )
}
