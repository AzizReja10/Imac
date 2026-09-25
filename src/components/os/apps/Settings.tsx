import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useSetup } from '@/store/useSetup'
import {
  monitorSkins,
  keyboardSkins,
  mouseSkins,
  type MonitorSkinId,
  type KeyboardSkinId,
  type MouseSkinId,
} from '@/data/skins'
import PowerSwitch from '@/components/ui/PowerSwitch'

type Item<T extends string> = { id: T; name: string; preview: ReactNode }

// One row of choices. The highlight ring slides between options via a shared layoutId.
function Section<T extends string>({
  title,
  group,
  items,
  value,
  onPick,
}: {
  title: string
  group: string
  items: Item<T>[]
  value: T
  onPick: (id: T) => void
}) {
  return (
    <section className="flex items-center gap-[1cqw]">
      <h3 className="w-[9cqw] shrink-0 text-[1.1cqw] font-semibold uppercase tracking-wider text-black/40">{title}</h3>
      <div className="flex gap-[1cqw]">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => onPick(it.id)}
            className="relative flex w-[10cqw] flex-col items-center gap-[0.6cqw] rounded-[1cqw] px-[0.8cqw] py-[1cqw] text-[1.2cqw] text-black/70"
          >
            {it.id === value && (
              <motion.span
                layoutId={`ring-${group}`}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className="absolute inset-0 rounded-[1cqw] bg-black/[0.05] ring-2 ring-blue-500"
              />
            )}
            <span className="relative">{it.preview}</span>
            <span className="relative">{it.name}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

const box = 'flex h-[4.2cqw] w-[6.6cqw] items-center justify-center'

const monitorItems = (Object.keys(monitorSkins) as MonitorSkinId[]).map((id) => {
  const s = monitorSkins[id]
  return {
    id,
    name: s.name,
    preview: (
      <span className="flex h-[4.2cqw] w-[6.6cqw] flex-col overflow-hidden rounded-[0.6cqw] shadow" style={{ background: s.chin }}>
        <span className="m-[0.35cqw] flex-1 rounded-[0.3cqw]" style={{ background: s.wallpaper }} />
        <span className="h-[0.9cqw]" />
      </span>
    ),
  }
})

const keyboardItems = (Object.keys(keyboardSkins) as KeyboardSkinId[]).map((id) => {
  const s = keyboardSkins[id]
  const row = [s.accent.key, s.base.key, s.base.key, s.base.key, s.accent.key]
  return {
    id,
    name: s.name,
    preview: (
      <span className="flex h-[4.2cqw] w-[6.6cqw] flex-col justify-center gap-[0.35cqw] rounded-[0.6cqw] p-[0.5cqw] shadow" style={{ background: s.body }}>
        {[0, 1, 2].map((r) => (
          <span key={r} className="flex flex-1 gap-[0.3cqw]">
            {row.map((c, i) => (
              <span key={i} className="flex-1 rounded-[0.2cqw]" style={{ background: c }} />
            ))}
          </span>
        ))}
      </span>
    ),
  }
})

const mouseItems = (Object.keys(mouseSkins) as MouseSkinId[]).map((id) => {
  const s = mouseSkins[id]
  return {
    id,
    name: s.name,
    preview: (
      <span className={box}>
        <span
          className="block h-[4.2cqw] w-[2.6cqw] rounded-b-[1.4cqw] rounded-t-[1.6cqw] shadow-md ring-1 ring-black/10"
          style={{ background: s.body }}
        />
      </span>
    ),
  }
})

export default function Settings() {
  const monitor = useSetup((s) => s.monitor)
  const setMonitor = useSetup((s) => s.setMonitor)
  const keyboard = useSetup((s) => s.keyboard)
  const setKeyboard = useSetup((s) => s.setKeyboard)
  const mouse = useSetup((s) => s.mouse)
  const setMouse = useSetup((s) => s.setMouse)
  const soundOn = useSetup((s) => s.soundOn)
  const toggleSound = useSetup((s) => s.toggleSound)

  return (
    <div
      onMouseDown={(e) => e.preventDefault()} // keep buttons from taking keyboard focus
      className="flex min-h-0 flex-1 flex-col gap-[1.4cqw] overflow-y-auto bg-[#f6f6f8] px-[2cqw] py-[1.6cqw]"
    >
      <Section title="Monitor" group="monitor" items={monitorItems} value={monitor} onPick={setMonitor} />
      <Section title="Keyboard" group="keyboard" items={keyboardItems} value={keyboard} onPick={setKeyboard} />
      <Section title="Mouse" group="mouse" items={mouseItems} value={mouse} onPick={setMouse} />

      <section className="flex items-center justify-between rounded-[1cqw] bg-white px-[1.6cqw] py-[1.1cqw] ring-1 ring-black/5">
        <div>
          <h3 className="text-[1.35cqw] font-medium text-black/75">Key and click sounds</h3>
          <p className="text-[1.1cqw] text-black/40">Typing and mouse clicks</p>
        </div>
        <PowerSwitch checked={soundOn} onChange={toggleSound} />
      </section>
    </div>
  )
}
