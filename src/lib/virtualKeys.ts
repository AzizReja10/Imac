type TextEl = HTMLInputElement | HTMLTextAreaElement

const SPECIAL: Record<string, string> = {
  Enter: 'Enter', Backspace: 'Backspace', Tab: 'Tab', Escape: 'Escape', Delete: 'Delete',
  ArrowUp: 'ArrowUp', ArrowDown: 'ArrowDown', ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight',
  ShiftLeft: 'Shift', ShiftRight: 'Shift', ControlLeft: 'Control',
  AltLeft: 'Alt', AltRight: 'Alt', MetaLeft: 'Meta', MetaRight: 'Meta', CapsLock: 'CapsLock',
}

// [normal, shifted] for every key that isn't a letter or a digit
const SYMBOLS: Record<string, [string, string]> = {
  Backquote: ['`', '~'], Minus: ['-', '_'], Equal: ['=', '+'],
  BracketLeft: ['[', '{'], BracketRight: [']', '}'], Backslash: ['\\', '|'],
  Semicolon: [';', ':'], Quote: ["'", '"'], Comma: [',', '<'], Period: ['.', '>'], Slash: ['/', '?'],
  Space: [' ', ' '],
}

const isModifier = (code: string) => /^(Shift|Control|Alt|Meta)(Left|Right)$/.test(code) || code === 'Fn'

let shiftCode: string | null = null // the on-screen Shift that is currently armed
let caps = false // on-screen Caps Lock
const held = new Set<string>() // keys currently pressed, so each gets exactly one keyup

// The character a key types right now, or null for keys like Enter or the arrows
function charFor(code: string): string | null {
  const shift = shiftCode !== null
  if (/^Key[A-Z]$/.test(code)) return shift !== caps ? code[3] : code[3].toLowerCase() // XOR: shift or caps, not both
  if (/^Digit\d$/.test(code)) return shift ? ')!@#$%^&*('[Number(code[5])] : code[5]
  const s = SYMBOLS[code]
  return s ? s[shift ? 1 : 0] : null
}

// Fires a keyboard event at whatever has focus. Returns false if a handler called preventDefault.
function fire(type: 'keydown' | 'keyup', code: string, key: string) {
  const target: Element = document.activeElement ?? document.body
  const ev = new KeyboardEvent(type, {
    key,
    code,
    bubbles: true,
    cancelable: true,
    shiftKey: shiftCode !== null,
    modifierCapsLock: caps, // lets the Caps Lock LED read the state
  })
  return { ok: target.dispatchEvent(ev), target }
}

function insert(el: TextEl, text: string) {
  const s = el.selectionStart ?? el.value.length
  const e = el.selectionEnd ?? el.value.length
  el.setRangeText(text, s, e, 'end')
  // React sees the value changed behind its back and fires onChange
  el.dispatchEvent(new Event('input', { bubbles: true }))
}

function backspace(el: TextEl) {
  const s = el.selectionStart ?? 0
  const e = el.selectionEnd ?? 0
  if (s !== e) return insert(el, '') // a selection: delete it
  if (s === 0) return
  el.setRangeText('', s - 1, s, 'end')
  el.dispatchEvent(new Event('input', { bubbles: true }))
}

function move(el: TextEl, d: -1 | 1) {
  const s = el.selectionStart ?? 0
  const e = el.selectionEnd ?? 0
  const p = s !== e ? (d < 0 ? s : e) : Math.max(0, Math.min(el.value.length, s + d))
  el.setSelectionRange(p, p)
}

// What the browser would have done with this key if it were real
function applyDefault(el: Element, code: string, ch: string | null) {
  if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) return
  if (ch !== null) return insert(el, ch)
  if (code === 'Enter' && el instanceof HTMLTextAreaElement) insert(el, '\n')
  else if (code === 'Backspace') backspace(el)
  else if (code === 'ArrowLeft') move(el, -1)
  else if (code === 'ArrowRight') move(el, 1)
}

export function pressKey(code: string) {
  // Shift is "one-shot", like on a phone: tap it, then the next key is shifted
  if (code === 'ShiftLeft' || code === 'ShiftRight') {
    if (shiftCode) {
      const armed = shiftCode
      shiftCode = null
      fire('keyup', armed, 'Shift')
    } else {
      shiftCode = code
      fire('keydown', code, 'Shift')
    }
    return
  }

  if (code === 'CapsLock') caps = !caps

  const ch = charFor(code)
  held.add(code)
  const { ok, target } = fire('keydown', code, ch ?? SPECIAL[code] ?? code)
  if (ok) applyDefault(target, code, ch) // skipped when a handler took the key (Tab in Notes, Enter in Terminal...)
}

export function releaseKey(code: string) {
  if (!held.has(code)) return // Shift and repeated releases end up here
  held.delete(code)
  const ch = charFor(code)
  fire('keyup', code, ch ?? SPECIAL[code] ?? code)

  // The one-shot Shift ends after a normal key
  if (shiftCode && !isModifier(code) && code !== 'CapsLock') {
    const armed = shiftCode
    shiftCode = null
    fire('keyup', armed, 'Shift')
  }
}
