import { motion } from 'framer-motion'

type Props = { checked: boolean; onChange: () => void }

export default function PowerSwitch({ checked, onChange }: Props) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`flex h-[2.6cqw] w-[4.8cqw] shrink-0 items-center rounded-full p-[0.3cqw] transition-[background-color,box-shadow] duration-200 ${
        checked
          ? 'justify-end bg-emerald-500 shadow-[0_0_1.2cqw_rgba(16,185,129,0.55)]'
          : 'justify-start bg-zinc-300'
      }`}
    >
      {/* The knob doesn't move itself: the track's justify-start/end changes,
          and `layout` animates the knob from the old position to the new one */}
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 32 }}
        className="h-[2cqw] w-[2cqw] rounded-full bg-white shadow-md"
      />
    </button>
  )
}
