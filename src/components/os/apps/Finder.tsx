import { useState, type MouseEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { IconType } from 'react-icons'
import { FaFolder, FaFileAlt, FaRocket, FaDownload, FaImage, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { apps } from '@/data/apps'
import { resolve, type FsNode } from '@/data/fs'
import { useSetup } from '@/store/useSetup'

const sidebar: { name: string; Icon: IconType }[] = [
  { name: 'Applications', Icon: FaRocket },
  { name: 'Documents', Icon: FaFileAlt },
  { name: 'Downloads', Icon: FaDownload },
  { name: 'Pictures', Icon: FaImage },
]

// The big icon shown for each item in the grid
function Glyph({ node }: { node: FsNode }) {
  if (node.kind === 'folder') return <FaFolder className="h-[5cqw] w-[5cqw] text-sky-500" />

  if (node.kind === 'app') {
    const a = apps.find((x) => x.id === node.app)!
    return (
      <span
        className="flex h-[5cqw] w-[5cqw] items-center justify-center rounded-[1.1cqw] text-[2.6cqw] text-white shadow"
        style={{ background: a.bg }}
      >
        <a.Icon />
      </span>
    )
  }

  if (node.bg) {
    return <span className="block h-[4cqw] w-[5.4cqw] rounded-[0.5cqw] shadow ring-1 ring-black/10" style={{ background: node.bg }} />
  }
  return <FaFileAlt className="h-[4.4cqw] w-[4.4cqw] text-zinc-400" />
}

export default function Finder() {
  // History of visited paths, plus where we are in it (for back / forward)
  const [nav, setNav] = useState<{ hist: string[][]; i: number }>({ hist: [[]], i: 0 })
  const [sel, setSel] = useState<string | null>(null)
  const notes = useSetup((s) => s.notes)
  const openApp = useSetup((s) => s.openApp)

  const path = nav.hist[nav.i]
  const items = resolve(path).children
  const selected = items.find((n) => n.name === sel)
  const file = selected?.kind === 'file' ? selected : null

  const go = (p: string[]) => {
    setNav((n) => ({ hist: [...n.hist.slice(0, n.i + 1), p], i: n.i + 1 }))
    setSel(null)
  }
  const step = (d: -1 | 1) => {
    setNav((n) => {
      const i = n.i + d
      return i < 0 || i >= n.hist.length ? n : { ...n, i }
    })
    setSel(null)
  }
  const open = (n: FsNode) => {
    if (n.kind === 'folder') go([...path, n.name])
    else if (n.kind === 'app') openApp(n.app)
    else if (n.opens) openApp(n.opens)
    else setSel(n.name)
  }

  const opens = file?.opens
  const opener = opens ? apps.find((a) => a.id === opens) : undefined
  const text = file ? (file.opens === 'notes' ? notes || '(empty)' : file.text) : undefined

  const arrow = 'flex h-[2.6cqw] w-[2.6cqw] items-center justify-center rounded-[0.6cqw] text-[1.2cqw] text-black/55 enabled:hover:bg-black/5 disabled:opacity-30'

  return (
    <div
      onMouseDown={(e: MouseEvent) => e.preventDefault()} // buttons shouldn't hold keyboard focus
      className="flex min-h-0 flex-1 bg-white"
    >
      {/* Sidebar */}
      <aside className="w-[12cqw] shrink-0 border-r border-black/10 bg-zinc-100/80 p-[1cqw]">
        <p className="mb-[0.6cqw] px-[0.8cqw] text-[1cqw] font-semibold uppercase tracking-wider text-black/35">Favorites</p>
        {sidebar.map(({ name, Icon }) => (
          <button
            key={name}
            onClick={() => go([name])}
            className={`flex w-full items-center gap-[0.8cqw] rounded-[0.7cqw] px-[0.8cqw] py-[0.6cqw] text-left text-[1.3cqw] ${
              path[0] === name ? 'bg-black/10 text-black/85' : 'text-black/65 hover:bg-black/5'
            }`}
          >
            <Icon className="text-sky-500" />
            {name}
          </button>
        ))}
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-[4.2cqw] shrink-0 items-center gap-[0.6cqw] border-b border-black/10 px-[1.2cqw] text-[1.35cqw]">
          <button className={arrow} disabled={nav.i === 0} onClick={() => step(-1)}>
            <FaChevronLeft />
          </button>
          <button className={arrow} disabled={nav.i >= nav.hist.length - 1} onClick={() => step(1)}>
            <FaChevronRight />
          </button>
          <div className="ml-[0.8cqw] flex items-center gap-[0.6cqw]">
            {['Home', ...path].map((n, i) => (
              <span key={i} className="flex items-center gap-[0.6cqw]">
                {i > 0 && <span className="text-black/25">›</span>}
                <button
                  onClick={() => i < path.length && go(path.slice(0, i))}
                  className={i === path.length ? 'font-semibold text-black/80' : 'text-black/45 hover:text-black/70'}
                >
                  {n}
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          <div
            onClick={() => setSel(null)}
            className="min-w-0 flex-1 content-start overflow-y-auto p-[1.4cqw] [scrollbar-width:thin]"
          >
            {items.length === 0 && <p className="pt-[6cqw] text-center text-[1.3cqw] text-black/35">This folder is empty</p>}
            <div className="flex flex-wrap content-start gap-[0.6cqw]">
              {items.map((n) => (
                <button
                  key={n.name}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSel(n.name)
                  }}
                  onDoubleClick={() => open(n)}
                  className={`flex w-[10cqw] flex-col items-center gap-[0.6cqw] rounded-[1cqw] p-[0.8cqw] ${
                    sel === n.name ? 'bg-blue-500/15' : ''
                  }`}
                >
                  <Glyph node={n} />
                  <span
                    className={`max-w-full break-words rounded-[0.4cqw] px-[0.5cqw] text-center text-[1.15cqw] leading-tight ${
                      sel === n.name ? 'bg-blue-500 text-white' : 'text-black/75'
                    }`}
                  >
                    {n.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview pane: slides open when a file is selected */}
          <AnimatePresence>
            {file && (
              <motion.aside
                key="preview"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '16cqw', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 36 }}
                className="shrink-0 overflow-hidden border-l border-black/10 bg-zinc-50"
              >
                {/* fixed inner width, so the content doesn't reflow while the pane animates */}
                <div className="w-[16cqw] p-[1.4cqw]">
                  {file.bg ? (
                    <div className="aspect-[4/3] rounded-[0.8cqw] shadow" style={{ background: file.bg }} />
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center rounded-[0.8cqw] bg-zinc-100">
                      <FaFileAlt className="text-[4cqw] text-zinc-300" />
                    </div>
                  )}
                  <p className="mt-[1cqw] break-words text-[1.3cqw] font-semibold text-black/80">{file.name}</p>
                  <p className="text-[1.1cqw] text-black/40">{file.size}</p>
                  {text && (
                    <pre className="mt-[1cqw] max-h-[9cqw] overflow-hidden whitespace-pre-wrap break-words font-mono text-[1cqw] leading-snug text-black/60">
                      {text.slice(0, 260)}
                    </pre>
                  )}
                  {opens && opener && (
                    <button
                      onClick={() => openApp(opens)}
                      className="mt-[1.2cqw] w-full rounded-[0.7cqw] bg-blue-500 py-[0.7cqw] text-[1.2cqw] font-medium text-white"
                    >
                      Open in {opener.name}
                    </button>
                  )}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
