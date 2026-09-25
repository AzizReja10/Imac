import { useEffect, useRef, useState, type TouchEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSetup, selectFocused } from '@/store/useSetup'
import { SIZE, initialSnake, randomFood, step, opposite, speedFor, type Pt, type Dir } from '@/lib/snake'

const KEY_DIR: Record<string, Dir> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right',
}
const BEST_KEY = 'desksim-snake-best'
const CELL = 100 / SIZE // one cell, in % of the board

export default function Game() {
  const [snake, setSnake] = useState<Pt[]>(initialSnake)
  const [food, setFood] = useState<Pt>(() => randomFood(initialSnake()))
  const [dir, setDir] = useState<Dir>('right')
  const [status, setStatus] = useState<'playing' | 'paused' | 'dead'>('paused')
  const [best, setBest] = useState(() => Number(localStorage.getItem(BEST_KEY) ?? 0))
  const nextDir = useRef<Dir>('right') // the queued direction, applied on the next tick
  const touch = useRef<{ x: number; y: number } | null>(null)
  const focused = useSetup((s) => selectFocused(s) === 'game')

  const score = snake.length - 3
  const restart = () => {
    const s = initialSnake()
    setSnake(s)
    setFood(randomFood(s))
    setDir('right')
    nextDir.current = 'right'
    setStatus('playing')
  }

  // Pause when the window loses focus, so the snake doesn't die off-screen
  useEffect(() => {
    if (!focused) {
      setStatus((s) => (s === 'playing' ? 'paused' : s))
    }
  }, [focused])


  // Game loop: one tick per interval, speed increasing with length
  useEffect(() => {
    if (status !== 'playing') return
    const id = setInterval(() => {
      setDir(nextDir.current)
      setSnake((prev) => {
        const res = step(prev, nextDir.current, food)
        if (res.dead) {
          setStatus('dead')
          setBest((b) => {
            const nb = Math.max(b, prev.length - 3)
            localStorage.setItem(BEST_KEY, String(nb))
            return nb
          })
          return prev
        }
        if (res.ate) setFood(randomFood(res.snake))
        return res.snake
      })
    }, speedFor(snake.length))
    return () => clearInterval(id)
  }, [status, snake.length, food])

  // Arrow keys / WASD, only while this window is focused
  useEffect(() => {
    if (!focused) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault()
        return setStatus((s) => (s === 'playing' ? 'paused' : s === 'paused' ? 'playing' : s))
      }
      const d = KEY_DIR[e.key]
      if (!d) return
      e.preventDefault()
      if (!opposite(d, dir)) nextDir.current = d // ignore a 180°: it would run the snake into itself
      if (status === 'dead') {
        restart()
      } else if (status !== 'playing') {
        setStatus('playing')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focused, dir, status])

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0]
    touch.current = { x: t.clientX, y: t.clientY }
  }
  const onTouchEnd = (e: TouchEvent) => {
    if (!touch.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touch.current.x
    const dy = t.clientY - touch.current.y
    touch.current = null
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return // a tap, not a swipe
    const d: Dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up'
    if (!opposite(d, dir)) nextDir.current = d
    if (status === 'dead') restart()
    else if (status !== 'playing') setStatus('playing')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center gap-[1.2cqw] bg-[#0f1a12] p-[2cqw]">
      <div className="flex w-full items-center justify-between">
        <div>
          <h2 className="text-[2.2cqw] font-bold text-[#9be89b]">Snake</h2>
          <p className="text-[1.05cqw] text-[#9be89b]/50">Arrow keys or swipe. Space to pause.</p>
        </div>
        <div className="flex gap-[0.6cqw]">
          {[['Score', score], ['Best', best]].map(([label, v]) => (
            <div key={label} className="rounded-[0.6cqw] bg-[#1c3320] px-[1cqw] py-[0.5cqw] text-center">
              <div className="text-[0.9cqw] uppercase tracking-wide text-[#9be89b]/60">{label}</div>
              <div className="text-[1.5cqw] font-bold leading-tight text-[#9be89b]">{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="relative aspect-square w-full max-w-[80%] touch-none overflow-hidden rounded-[0.9cqw] bg-[#16241a] ring-1 ring-[#9be89b]/15"
      >
        {/* food */}
        <motion.div
          key={`${food.x}-${food.y}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          style={{ left: `${food.x * CELL}%`, top: `${food.y * CELL}%`, width: `${CELL}%`, height: `${CELL}%` }}
          className="absolute flex items-center justify-center p-[0.15cqw]"
        >
          <div className="h-full w-full rounded-full bg-[#f65e3b] shadow-[0_0_1.2cqw_rgba(246,94,59,0.6)]" />
        </motion.div>

        {/* snake: each segment keeps its array index as a key, so segments glide rather than fade */}
        <AnimatePresence initial={false}>
          {snake.map((seg, i) => (
            <motion.div
              key={i}
              animate={{ left: `${seg.x * CELL}%`, top: `${seg.y * CELL}%` }}
              transition={{ type: 'tween', duration: speedFor(snake.length) / 1000, ease: 'linear' }}
              style={{ width: `${CELL}%`, height: `${CELL}%` }}
              className="absolute flex items-center justify-center p-[0.12cqw]"
            >
              <div
                className="h-full w-full rounded-[0.25cqw]"
                style={{ background: i === 0 ? '#9be89b' : '#5fb86a', opacity: i === 0 ? 1 : 1 - (i / snake.length) * 0.4 }}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {status !== 'playing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-[1cqw] bg-[#0f1a12]/75 backdrop-blur-xs"
            >
              <p className="text-[2.2cqw] font-bold text-[#9be89b]">
                {status === 'dead' ? 'Game over' : score === 0 ? 'Snake' : 'Paused'}
              </p>
              {status === 'dead' && <p className="text-[1.3cqw] text-[#9be89b]/70">Score: {score}</p>}
              <button
                onClick={status === 'dead' ? restart : () => setStatus('playing')}
                className="cursor-pointer rounded-[0.6cqw] bg-[#5fb86a] px-[1.4cqw] py-[0.7cqw] text-[1.2cqw] font-semibold text-[#0f1a12] transition-opacity hover:opacity-90 active:scale-95"
              >
                {status === 'dead' ? 'New game' : 'Play'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={restart}
        className="cursor-pointer rounded-[0.6cqw] bg-[#1c3320] px-[1.4cqw] py-[0.6cqw] text-[1.15cqw] font-semibold text-[#9be89b] transition-opacity hover:opacity-90 active:scale-95"
      >
        New game
      </button>
    </div>
  )
}
