import { Howl, Howler } from 'howler'
import { useSetup } from '@/store/useSetup'

const keys = new Howl({
  src: [`${import.meta.env.BASE_URL}sounds/keys.ogg`, `${import.meta.env.BASE_URL}sounds/keys.mp3`],
  volume: 0.5,
  sprite: {
    down1: [0, 110], down2: [300, 110], down3: [600, 110], down4: [900, 110],
    down5: [1200, 110], down6: [1500, 110], down7: [1800, 110], down8: [2100, 110],
    heavy1: [2400, 130], heavy2: [2700, 130],
    up1: [3000, 90], up2: [3300, 90], up3: [3600, 90], up4: [3900, 90], up5: [4200, 90],
  },
})

const bootSound = new Howl({
  src: [`${import.meta.env.BASE_URL}apple.mp3`],
  volume: 0.85,
})

let ctx: AudioContext | null = null
let noiseBuf: AudioBuffer | null = null

function getCtx() {
  if (!ctx) {
    ctx = new AudioContext()
    // 0.1s of white noise, reused by every click
    noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.1), ctx.sampleRate)
    const data = noiseBuf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  return ctx
}

// Must be called from inside a click handler (browser autoplay policy)
export async function unlockAudio() {
  const c = getCtx()
  if (c.state === 'suspended') await c.resume()
  if (Howler.ctx && Howler.ctx.state === 'suspended') {
    await Howler.ctx.resume()
  }
}

// Short filtered noise burst = the "click" part of a keypress
function burst(c: AudioContext, t: number, freq: number, q: number, peak: number, dur: number) {
  if (!noiseBuf) return
  const src = c.createBufferSource()
  src.buffer = noiseBuf
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = freq
  bp.Q.value = q
  const g = c.createGain()
  g.gain.setValueAtTime(peak, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + dur)
  src.connect(bp)
  bp.connect(g)
  g.connect(c.destination)
  src.start(t)
  src.stop(t + dur + 0.01)
}

const DOWNS = ['down1', 'down2', 'down3', 'down4', 'down5', 'down6', 'down7', 'down8']
const UPS = ['up1', 'up2', 'up3', 'up4', 'up5']
const HEAVY = new Set(['Space', 'Enter', 'Backspace', 'ShiftLeft', 'ShiftRight'])

const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

let last = ''

export function playKey(code: string) {
  let name: string
  if (HEAVY.has(code)) {
    name = pick(['heavy1', 'heavy2'])
  } else {
    do { name = pick(DOWNS) } while (name === last) // never the same clip twice in a row
  }
  last = name
  const id = keys.play(name)
  keys.rate(0.94 + Math.random() * 0.12, id) // ±6% pitch variation
}

export function playKeyUp() {
  keys.play(pick(UPS))
}

export function playClick(down: boolean) {
  if (!ctx || ctx.state !== 'running') return
  const t = ctx.currentTime
  if (down) burst(ctx, t, 4200, 1.6, 0.7, 0.02)
  else burst(ctx, t, 3200, 1.6, 0.35, 0.015)
}

export function playBoot() {
  const soundOn = useSetup.getState().soundOn
  if (!soundOn) return
  bootSound.stop()
  bootSound.play()
}

export function stopBoot() {
  bootSound.stop()
}
