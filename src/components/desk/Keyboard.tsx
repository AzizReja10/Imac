import { AnimatePresence, motion } from 'framer-motion'
import { keyboardLayouts, type KeyDef } from '@/data/keyboardLayout'
import { keyboardSkins } from '@/data/skins'
import { useSetup } from '@/store/useSetup'
import { usePressedKeys } from '@/hooks/usePressedKeys'
import { pressKey, releaseKey } from '@/lib/virtualKeys'
import PowerKey from './PowerKey'

type Skin = (typeof keyboardSkins)[keyof typeof keyboardSkins]

const PAD = 1.4 // frame padding, in cqw

function Keycap({ def, down, lit, skin }: { def: KeyDef; down: boolean; lit: boolean; skin: Skin }) {
  const c = def.accent ? skin.accent : skin.base
  const corner = !!def.align && skin.legend === 'corner' // legend tucked in a corner
  const small = def.small || !!def.align // text labels use the smaller size

  return (
    <motion.div
      initial={false}
      onPointerDown={() => pressKey(def.code)}
      onPointerUp={() => releaseKey(def.code)}
      onPointerLeave={() => releaseKey(def.code)}
      onPointerCancel={() => releaseKey(def.code)}
      onMouseDown={(e) => {
        e.preventDefault() // keeps focus in the text field, so typing continues
        e.stopPropagation() // and doesn't count as a mouse click on the screen
      }}
      onMouseUp={(e) => e.stopPropagation()}
      animate={{
        y: down ? 2 : 0,
        scale: down ? 0.97 : 1,
        backgroundColor: down ? c.keyDown : c.key,
        boxShadow: down
          ? `0 0 0 ${c.edge}, 0 1px 1px rgba(0,0,0,0.2)`
          : `0 2px 0 ${c.edge}, 0 3px 5px rgba(0,0,0,0.18)`,
      }}
      transition={{ type: 'spring', stiffness: 700, damping: 35, mass: 0.6 }}
      style={{ color: c.text }}
      className={`relative flex h-full w-full select-none cursor-pointer touch-manipulation rounded-[0.7cqw] px-[0.7cqw] py-[0.4cqw] font-bold ${
        small ? 'text-[1.4cqw]' : 'text-[2.2cqw]'
      } ${
        corner
          ? `items-end ${def.align === 'left' ? 'justify-start' : 'justify-end'}`
          : 'flex-col items-center justify-center'
      }`}
    >
      {def.code === 'CapsLock' && (
        <span
          className="absolute left-[0.8cqw] top-[0.8cqw] h-[0.6cqw] w-[0.6cqw] rounded-full"
          style={{ background: lit ? '#22c55e' : '#d4d4d8', boxShadow: lit ? '0 0 6px #22c55e' : 'none' }}
        />
      )}
      {def.top && <span className="text-[1.5cqw] font-semibold leading-none opacity-85">{def.top}</span>}
      <span className="font-bold leading-tight tracking-tight">{def.label}</span>
    </motion.div>
  )
}

export default function Keyboard() {
  const { pressed, caps } = usePressedKeys() // stays here, so keys stay "held" across a skin swap
  const id = useSetup((s) => s.keyboard)
  const skin = keyboardSkins[id]
  const { units, rows } = keyboardLayouts[skin.layout]
  const unit = (100 - PAD * 2) / units // width of one key unit, in cqw

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="w-full [container-type:inline-size]"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={id}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          style={{ padding: `${PAD}cqw`, borderRadius: '2.4cqw', backgroundColor: skin.body }}
          className="shadow-xl"
        >
          {rows.map((row, r) => (
            <div
              key={r}
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${units * 4}, minmax(0, 1fr))`,
                height: `${row.compact ? unit * 0.65 : unit * 0.9}cqw`,
              }}
            >
              {row.cells.map((cell) => {
                const span = { gridColumn: `span ${Math.round((cell.w ?? 1) * 4)}` }
                if ('stack' in cell) {
                  return (
                    <div key={cell.stack[0].code} style={span} className="p-[0.25cqw]">
                      <div className="flex h-full flex-col gap-[0.5cqw]">
                        {cell.stack.map((def) => (
                          <div key={def.code} className="min-h-0 flex-1">
                            <Keycap def={def} down={pressed.has(def.code)} lit={false} skin={skin} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }
                return (
                  <div key={cell.code} style={span} className="p-[0.25cqw]">
                    {cell.code === 'Power' ? (
                      <PowerKey c={cell.accent ? skin.accent : skin.base} />
                    ) : (
                      <Keycap def={cell} down={pressed.has(cell.code)} lit={caps} skin={skin} />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
