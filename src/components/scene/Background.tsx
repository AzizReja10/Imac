import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { look } from '@/lib/pointer'
import { reducedMotion } from '@/lib/motion'
import { useSetup } from '@/store/useSetup'
import { monitorSkins } from '@/data/skins'

type Energy = MutableRefObject<number> // 0 = calm; each key press adds a little, and it decays

// A soft round dot. Points are squares by default, so we paint a radial gradient to use as their texture
function makeDot() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

type LayerProps = {
  count: number
  size: number
  opacity: number
  zMin: number
  zMax: number
  speed: number
  energy: Energy
  dot: THREE.Texture
}

// One depth layer of drifting particles
function Layer({ count, size, opacity, zMin, zMax, speed, energy, dot }: LayerProps) {
  const powered = useSetup((s) => s.powered)
  const glow = monitorSkins[useSetup((s) => s.monitor)].glow
  const target = useMemo(() => new THREE.Color(glow), [glow])
  const initial = useRef(glow) // set once, so React never overwrites the smooth color blend below
  const geo = useRef<THREE.BufferGeometry>(null)
  const mat = useRef<THREE.PointsMaterial>(null)

  const seed = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const baseX = new Float32Array(count)
    const phase = new Float32Array(count)
    const v = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      baseX[i] = (Math.random() - 0.5) * 30
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16
      pos[i * 3 + 2] = zMin + Math.random() * (zMax - zMin)
      phase[i] = Math.random() * Math.PI * 2
      v[i] = 0.4 + Math.random() * 0.8
    }
    return { pos, baseX, phase, v }
  }, [count, zMin, zMax])

  useFrame(({ clock }, delta) => {
    const g = geo.current
    const m = mat.current
    if (!g || !m) return

    const t = clock.elapsedTime
    const boost = 1 + energy.current * 4 // typing makes the particles rise faster
    const attr = g.attributes.position as THREE.BufferAttribute
    const arr = attr.array as Float32Array

    for (let i = 0; i < count; i++) {
      let y = arr[i * 3 + 1] + seed.v[i] * speed * boost * delta
      if (y > 8) y = -8 // wrap: leave at the top, re-enter at the bottom
      arr[i * 3 + 1] = y
      arr[i * 3] = seed.baseX[i] + Math.sin(t * 0.4 + seed.phase[i]) * 0.5 // gentle sideways sway
    }
    attr.needsUpdate = true

    m.color.lerp(target, Math.min(1, delta * 3)) // blend to the new monitor color
    m.opacity += ((powered ? opacity : 0) - m.opacity) * Math.min(1, delta * 1.5) // fade in after power-on
  })

  return (
    <points frustumCulled={false}>
      <bufferGeometry ref={geo}>
        <bufferAttribute attach="attributes-position" args={[seed.pos, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={mat}
        map={dot}
        size={size}
        sizeAttenuation
        transparent
        opacity={0}
        depthWrite={false}
        color={initial.current}
      />
    </points>
  )
}

// Camera parallax, plus the decay of the typing energy
function Rig({ energy }: { energy: Energy }) {
  useFrame(({ camera }, delta) => {
    const k = Math.min(1, delta * 2)
    camera.position.x += (look.x.get() * 1.2 - camera.position.x) * k
    camera.position.y += (-look.y.get() * 0.8 - camera.position.y) * k
    camera.lookAt(0, 0, 0)
    energy.current *= Math.exp(-delta * 2.5)
  })
  return null
}

function Scene({ energy }: { energy: Energy }) {
  const dot = useMemo(makeDot, [])
  return (
    <>
      <Rig energy={energy} />
      {/* far layer: many small dots. near layer: a few big blurry ones */}
      <Layer count={160} size={0.14} opacity={0.55} zMin={-8} zMax={-3} speed={0.25} energy={energy} dot={dot} />
      <Layer count={40} size={0.6} opacity={0.22} zMin={0} zMax={3} speed={0.45} energy={energy} dot={dot} />
    </>
  )
}

export default function Background() {
  const energy = useRef(0)

  useEffect(() => {
    const bump = () => {
      energy.current = Math.min(1.5, energy.current + 0.4)
    }
    window.addEventListener('keydown', bump)
    return () => window.removeEventListener('keydown', bump)
  }, [])

  if (reducedMotion()) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 1.5]} gl={{ alpha: true }}>
        <Scene energy={energy} />
      </Canvas>
    </div>
  )
}
