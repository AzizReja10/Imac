import { useEffect, useRef, useState, type ComponentProps } from 'react'
import { motion } from 'framer-motion'
import {
  FaChevronLeft,
  FaChevronRight,
  FaRedoAlt,
  FaLock,
  FaSearch,
  FaCompass,
  FaMagic,
} from 'react-icons/fa'
import { FiTrendingUp } from 'react-icons/fi'
import { useSetup, selectFocused } from '@/store/useSetup'
import { monitorSkins } from '@/data/skins'
import { pages, type Card } from '@/data/pages'
import SearchResults from './safari/SearchResults'
import ArticleReader from './safari/ArticleReader'
import WebPreview from './safari/WebPreview'
import SearchSuggestions from './safari/SearchSuggestions'

const START = 'desk://start'
const SEARCH = 'desk://search'
const READER = 'desk://reader'

const tileColors = [
  'linear-gradient(#60a5fa, #2563eb)',
  'linear-gradient(#f472b6, #db2777)',
  'linear-gradient(#34d399, #059669)',
  'linear-gradient(#a78bfa, #7c3aed)',
]

const trendingTopics = [
  'React 19',
  'Apple Silicon M3',
  'SpaceX Starship',
  'TypeScript',
  'Artificial Intelligence',
  'Quantum Computing',
]

// Turns whatever was typed into a URL or search query
function resolveInput(raw: string): string {
  const t = raw.trim()
  if (!t) return START
  if (t.startsWith('desk://')) return t
  const local = pages.find((p) => p.url === `desk://${t.toLowerCase()}`)
  if (local) return local.url
  if (t.includes(' ')) return `${SEARCH}?q=${encodeURIComponent(t)}`
  if (/^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(t)) {
    return /^https?:\/\//i.test(t) ? t : `https://${t}`
  }
  return `${SEARCH}?q=${encodeURIComponent(t)}`
}

function Notice({
  title,
  text,
  action,
}: {
  title: string
  text: string
  action?: { label: string; run: () => void }
}) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-[1cqw] px-[6cqw] py-[6cqw] text-center select-text">
      <h1 className="text-[2.6cqw] font-semibold text-black/80">{title}</h1>
      <p className="max-w-[36cqw] text-[1.5cqw] text-black/50">{text}</p>
      {action && (
        <button
          onClick={action.run}
          className="mt-[1cqw] rounded-[0.8cqw] bg-blue-500 px-[2cqw] py-[0.9cqw] text-[1.4cqw] font-medium text-white shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

function LocalArticle({
  title,
  intro,
  cards,
  go,
}: {
  title: string
  intro: string
  cards: Card[]
  go: (u: string) => void
}) {
  return (
    <div className="px-[4cqw] py-[3cqw] select-text">
      <h1 className="text-[3.2cqw] font-semibold leading-tight text-black/85">{title}</h1>
      <p className="mt-[0.8cqw] max-w-[42cqw] text-[1.6cqw] text-black/55">{intro}</p>
      <div className="mt-[2.4cqw] grid grid-cols-2 gap-[1.4cqw]">
        {cards.map((c) => (
          <button
            key={c.title}
            disabled={!c.href}
            onClick={() => c.href && go(c.href)}
            className={`rounded-[1.2cqw] bg-zinc-50 p-[1.6cqw] text-left ring-1 ring-black/5 transition-all ${
              c.href ? 'cursor-pointer hover:shadow-lg hover:ring-black/15 active:scale-[0.99]' : ''
            }`}
          >
            {c.tag && (
              <span className="mb-[0.6cqw] inline-block rounded-full bg-blue-500/10 px-[0.9cqw] py-[0.2cqw] text-[1cqw] font-medium text-blue-600">
                {c.tag}
              </span>
            )}
            <h3 className="text-[1.6cqw] font-semibold text-black/80">{c.title}</h3>
            <p className="mt-[0.4cqw] text-[1.25cqw] leading-snug text-black/50">{c.text}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

function View({ url, go }: { url: string; go: (u: string) => void }) {
  const monitor = useSetup((s) => s.monitor)

  // 1. Safari Start Page / Favorites
  if (url === START) {
    return (
      <div
        className="min-h-full px-[4.5cqw] py-[3.5cqw] select-text"
        style={{ background: monitorSkins[monitor].wallpaper }}
      >
        <div className="mx-auto max-w-[55cqw]">
          {/* Header Banner */}
          <div className="flex items-center justify-between">
            <h1 className="text-[2.6cqw] font-semibold text-black/80">Favorites</h1>
            <span className="flex items-center gap-[0.4cqw] text-[1.15cqw] font-medium text-black/50">
              <FaCompass className="text-blue-500 text-[1.2cqw]" />
              Safari Home
            </span>
          </div>

          {/* Local Bookmark Tiles */}
          <div className="mt-[2cqw] grid grid-cols-4 gap-[2cqw]">
            {pages.map((p, i) => (
              <button
                key={p.url}
                onClick={() => go(p.url)}
                className="group flex flex-col items-center gap-[0.8cqw] cursor-pointer"
              >
                <motion.span
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  className="flex h-[7cqw] w-[7cqw] items-center justify-center rounded-[1.6cqw] text-[3cqw] font-semibold text-white shadow-lg transition-shadow group-hover:shadow-xl"
                  style={{ background: tileColors[i % tileColors.length] }}
                >
                  {p.title[0]}
                </motion.span>
                <span className="text-[1.3cqw] font-medium text-black/75 group-hover:text-black">
                  {p.title}
                </span>
              </button>
            ))}
          </div>

          {/* Live Web Search Box on Start Page */}
          <div className="mt-[3.5cqw] rounded-[1.6cqw] border border-black/10 bg-white/75 p-[2.2cqw] shadow-md backdrop-blur-md">
            <div className="flex items-center gap-[0.8cqw] text-black/75">
              <FaMagic className="h-[1.3cqw] w-[1.3cqw] text-blue-600" />
              <h2 className="text-[1.8cqw] font-bold text-black/85">
                Search the Live Internet
              </h2>
            </div>
            <p className="mt-[0.3cqw] text-[1.25cqw] text-black/55">
              Query real websites, read Wikipedia articles, or look up live topics.
            </p>

            {/* Trending Quick Search Pills */}
            <div className="mt-[1.6cqw]">
              <span className="text-[1.1cqw] font-medium text-black/40 uppercase tracking-wider">
                Trending Web Searches
              </span>
              <div className="mt-[0.8cqw] flex flex-wrap gap-[0.8cqw]">
                {trendingTopics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => go(`${SEARCH}?q=${encodeURIComponent(topic)}`)}
                    className="flex items-center gap-[0.5cqw] rounded-full bg-white px-[1.2cqw] py-[0.5cqw] text-[1.2cqw] font-medium text-black/75 shadow-sm ring-1 ring-black/10 transition-all hover:bg-blue-50 hover:text-blue-700 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <FiTrendingUp className="h-[1.1cqw] w-[1.1cqw] text-blue-500" />
                    <span>{topic}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 2. Real Internet Search Results
  if (url.startsWith(SEARCH)) {
    const q = new URLSearchParams(url.split('?')[1] ?? '').get('q') ?? ''
    return <SearchResults query={q} go={go} />
  }

  // 3. In-App Safari Article Reader (Wikipedia / Reader Mode)
  if (url.startsWith(READER)) {
    const params = new URLSearchParams(url.split('?')[1] ?? '')
    const title = params.get('title') ?? ''
    const rawUrl = params.get('url') ?? ''
    return <ArticleReader title={title} url={rawUrl} go={go} />
  }

  // 4. External Websites (e.g. https://...)
  if (/^https?:\/\//i.test(url)) {
    // If it's a Wikipedia page, open in reader view!
    if (url.includes('wikipedia.org/wiki/')) {
      const title = url.split('wikipedia.org/wiki/')[1]?.split('?')[0]?.split('#')[0] || ''
      return <ArticleReader title={decodeURIComponent(title)} url={url} go={go} />
    }
    // Otherwise show rich web preview card
    return <WebPreview url={url} go={go} />
  }

  // 5. Local desk:// pages (About, Projects, Shortcuts)
  const page = pages.find((p) => p.url === url)
  if (!page) {
    return (
      <Notice
        title="Page not found"
        text={`There is no page at ${url}.`}
        action={{ label: 'Go to Start Page', run: () => go(START) }}
      />
    )
  }

  return <LocalArticle title={page.title} intro={page.intro} cards={page.cards} go={go} />
}

const NavBtn = ({ children, ...p }: ComponentProps<'button'>) => (
  <button
    {...p}
    className="flex h-[2.8cqw] w-[2.8cqw] items-center justify-center rounded-[0.6cqw] text-[1.3cqw] text-black/55 enabled:hover:bg-black/5 disabled:opacity-30 cursor-pointer active:scale-95"
  >
    {children}
  </button>
)

export default function Safari() {
  const [nav, setNav] = useState({ hist: [START], i: 0 })
  const [reloads, setReloads] = useState(0)
  const [draft, setDraft] = useState<string | null>(null)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const focused = useSetup((s) => selectFocused(s) === 'safari')

  useEffect(() => {
    if (focused) input.current?.focus({ preventScroll: true })
    else input.current?.blur()
  }, [focused])

  const url = nav.hist[nav.i]
  const shown = url === START ? '' : url

  const go = (raw: string) => {
    const next = resolveInput(raw)
    setNav((n) => (next === n.hist[n.i] ? n : { hist: [...n.hist.slice(0, n.i + 1), next], i: n.i + 1 }))
    setReloads((r) => r + 1)
    setDraft(null)
    setIsInputFocused(false)
  }

  const step = (d: -1 | 1) => {
    setNav((n) => {
      const i = n.i + d
      return i < 0 || i >= n.hist.length ? n : { ...n, i }
    })
    setReloads((r) => r + 1)
    setDraft(null)
    setIsInputFocused(false)
  }

  const pageKey = `${url}-${reloads}`

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-white select-none">
      {/* Safari Navigation & Address Bar */}
      <div className="relative flex shrink-0 items-center gap-[0.6cqw] border-b border-black/10 bg-zinc-100/90 px-[1.2cqw] py-[0.8cqw] backdrop-blur-md">
        <NavBtn disabled={nav.i === 0} onClick={() => step(-1)} title="Back">
          <FaChevronLeft />
        </NavBtn>
        <NavBtn disabled={nav.i >= nav.hist.length - 1} onClick={() => step(1)} title="Forward">
          <FaChevronRight />
        </NavBtn>

        {/* Search / URL Address Bar */}
        <div className="relative mx-[0.8cqw] flex flex-1 items-center gap-[0.8cqw] rounded-[0.9cqw] bg-black/[0.06] px-[1.1cqw] py-[0.55cqw] text-[1.4cqw] transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:shadow-sm">
          {url.startsWith('https://') || url.startsWith('desk://') ? (
            <FaLock className="shrink-0 text-[1.05cqw] text-black/35" />
          ) : (
            <FaSearch className="shrink-0 text-[1.05cqw] text-black/35" />
          )}

          <input
            ref={input}
            value={draft ?? shown}
            onChange={(e) => setDraft(e.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => {
              setTimeout(() => setIsInputFocused(false), 200)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur()
                go(e.currentTarget.value)
              }
            }}
            placeholder="Search Google/Wikipedia or enter website name"
            spellCheck={false}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-black/85 outline-none placeholder:text-black/35 text-[1.3cqw]"
          />

          {/* Autocomplete Dropdown */}
          <SearchSuggestions
            query={draft ?? ''}
            visible={isInputFocused && Boolean(draft?.trim())}
            onSelect={(val) => {
              setDraft(val)
              go(val)
            }}
          />
        </div>

        {/* Reload / Go Button */}
        <NavBtn onClick={() => go(draft ?? url)} title="Reload page">
          <motion.span animate={{ rotate: reloads * 360 }} transition={{ duration: 0.5 }} className="flex">
            <FaRedoAlt />
          </motion.span>
        </NavBtn>

        {/* Loading Progress Bar */}
        <motion.div
          key={`bar-${pageKey}`}
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 0 }}
          transition={{ scaleX: { duration: 0.45, ease: 'easeOut' }, opacity: { delay: 0.45, duration: 0.2 } }}
          style={{ originX: 0 }}
          className="absolute inset-x-0 bottom-0 h-[0.25cqw] bg-blue-500"
        />
      </div>

      {/* Main Page View */}
      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]">
        <motion.div
          key={pageKey}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="min-h-full"
        >
          <View url={url} go={go} />
        </motion.div>
      </div>
    </div>
  )
}
