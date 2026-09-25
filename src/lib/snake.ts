export type Pt = { x: number; y: number }
export type Dir = 'up' | 'down' | 'left' | 'right'

export const SIZE = 16 // grid is SIZE x SIZE cells

const DELTA: Record<Dir, Pt> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

export const opposite = (a: Dir, b: Dir) => DELTA[a].x === -DELTA[b].x && DELTA[a].y === -DELTA[b].y

export function randomFood(snake: Pt[]): Pt {
  const occupied = new Set(snake.map((p) => `${p.x},${p.y}`))
  const free: Pt[] = []
  for (let x = 0; x < SIZE; x++)
    for (let y = 0; y < SIZE; y++) if (!occupied.has(`${x},${y}`)) free.push({ x, y })
  return free[Math.floor(Math.random() * free.length)] // undefined only if the board is full, i.e. you've won
}

export function initialSnake(): Pt[] {
  const m = Math.floor(SIZE / 2)
  return [{ x: m - 1, y: m }, { x: m - 2, y: m }, { x: m - 3, y: m }] // head first
}

// speed ramps up with length, capped so it never becomes unplayable
export const speedFor = (length: number) => Math.max(70, 150 - length * 4)

export type Step = { snake: Pt[]; ate: boolean; dead: boolean }

export function step(snake: Pt[], dir: Dir, food: Pt): Step {
  const d = DELTA[dir]
  const head = { x: snake[0].x + d.x, y: snake[0].y + d.y }

  const hitWall = head.x < 0 || head.x >= SIZE || head.y < 0 || head.y >= SIZE
  const ate = head.x === food.x && head.y === food.y
  const body = ate ? snake : snake.slice(0, -1) // growing: keep the tail cell this turn
  const hitSelf = body.some((p) => p.x === head.x && p.y === head.y)

  if (hitWall || hitSelf) return { snake, ate: false, dead: true }
  return { snake: [head, ...body], ate, dead: false }
}
