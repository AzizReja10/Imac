import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FiSearch,
  FiExternalLink,
  FiBookOpen,
  FiCopy,
  FiCheck,
  FiRefreshCw,
  FiTrendingUp,
} from 'react-icons/fi'
import { FaMagic } from 'react-icons/fa'
import {
  searchInternet,
  type SearchResponse,
} from '@/services/searchService'

interface SearchResultsProps {
  query: string
  go: (url: string) => void
}

type FilterTab = 'all' | 'web' | 'wiki' | 'discussion'

export default function SearchResults({ query, go }: SearchResultsProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<SearchResponse | null>(null)
  const [tab, setTab] = useState<FilterTab>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)

    searchInternet(query).then((res) => {
      if (active) {
        setData(res)
        setLoading(false)
      }
    })

    return () => {
      active = false
    }
  }, [query])

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard?.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1800)
  }

  // Filter items based on active tab
  const filteredItems = (data?.items || []).filter((item) => {
    if (tab === 'all') return true
    if (tab === 'web') return item.source === 'web' || item.source === 'instant'
    if (tab === 'wiki') return item.source === 'wikipedia'
    if (tab === 'discussion') return item.source === 'hackernews'
    return true
  })

  const isWikiUrl = (url: string) => url.includes('wikipedia.org')

  return (
    <div className="min-h-full px-[3.5cqw] py-[2.5cqw] text-zinc-900 select-text">
      {/* Search Header Bar */}
      <div className="mb-[2cqw] border-b border-black/10 pb-[1.6cqw]">
        <div className="flex flex-wrap items-center justify-between gap-[1cqw]">
          <div>
            <div className="flex items-center gap-[0.8cqw] text-[1.2cqw] text-black/50">
              <FiSearch className="h-[1.3cqw] w-[1.3cqw]" />
              <span>Internet Search Results</span>
              {data && !loading && (
                <>
                  <span>·</span>
                  <span>{data.totalCount} results</span>
                  <span>·</span>
                  <span>{data.durationMs}ms</span>
                </>
              )}
            </div>
            <h1 className="mt-[0.3cqw] text-[2.8cqw] font-semibold text-black/90">
              {query}
            </h1>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={() => {
              setLoading(true)
              searchInternet(query).then((res) => {
                setData(res)
                setLoading(false)
              })
            }}
            className="flex items-center gap-[0.6cqw] rounded-[0.8cqw] bg-black/[0.05] px-[1.2cqw] py-[0.6cqw] text-[1.2cqw] font-medium text-black/70 transition-colors hover:bg-black/10 active:scale-95 cursor-pointer"
            title="Refresh search results"
          >
            <FiRefreshCw className={`h-[1.2cqw] w-[1.2cqw] ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>{loading ? 'Searching...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="mt-[1.6cqw] flex items-center gap-[0.8cqw]">
          {(
            [
              { id: 'all', label: 'All Results' },
              { id: 'web', label: 'Web Pages' },
              { id: 'wiki', label: 'Wikipedia & Articles' },
              { id: 'discussion', label: 'Tech Discussions' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-[1.4cqw] py-[0.45cqw] text-[1.2cqw] font-medium transition-all cursor-pointer ${
                tab === t.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-black/[0.05] text-black/65 hover:bg-black/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-[1.8cqw]">
          <div className="animate-pulse rounded-[1.2cqw] border border-black/10 bg-zinc-50 p-[2cqw]">
            <div className="h-[2cqw] w-1/4 rounded bg-black/10" />
            <div className="mt-[1cqw] h-[1.5cqw] w-3/4 rounded bg-black/10" />
            <div className="mt-[0.6cqw] h-[1.5cqw] w-1/2 rounded bg-black/10" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse space-y-[0.8cqw] py-[1cqw]">
              <div className="h-[1.2cqw] w-1/5 rounded bg-black/10" />
              <div className="h-[1.8cqw] w-2/3 rounded bg-black/10" />
              <div className="h-[1.4cqw] w-5/6 rounded bg-black/10" />
            </div>
          ))}
        </div>
      )}

      {/* Results Content */}
      {!loading && data && (
        <div className="space-y-[2cqw]">
          {/* Instant Knowledge Card */}
          {data.instant && (tab === 'all' || tab === 'wiki') && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-[1.4cqw] border border-blue-500/20 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white p-[2cqw] shadow-sm ring-1 ring-blue-500/10"
            >
              <div className="flex gap-[2cqw]">
                {data.instant.thumbnail && (
                  <div className="shrink-0 overflow-hidden rounded-[1cqw] border border-black/10 bg-white shadow-sm">
                    <img
                      src={data.instant.thumbnail}
                      alt={data.instant.title}
                      className="h-[10cqw] w-[10cqw] object-contain p-[0.6cqw]"
                      onError={(e) => {
                        ;(e.currentTarget as HTMLElement).style.display = 'none'
                      }}
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-[0.8cqw]">
                    <span className="flex items-center gap-[0.4cqw] rounded-full bg-blue-600/10 px-[0.9cqw] py-[0.2cqw] text-[1.1cqw] font-medium text-blue-700">
                      <FaMagic className="h-[1cqw] w-[1cqw]" />
                      {data.instant.subtitle || 'Instant Knowledge'}
                    </span>
                    {data.instant.sourceName && (
                      <span className="text-[1.1cqw] text-black/45">
                        Source: {data.instant.sourceName}
                      </span>
                    )}
                  </div>

                  <h2 className="mt-[0.6cqw] text-[2.2cqw] font-bold text-black/90">
                    {data.instant.title}
                  </h2>

                  <p className="mt-[0.6cqw] text-[1.35cqw] leading-relaxed text-black/75">
                    {data.instant.description}
                  </p>

                  <div className="mt-[1.4cqw] flex flex-wrap items-center gap-[0.9cqw]">
                    {data.instant.title && (
                      <button
                        onClick={() =>
                          go(`desk://reader?title=${encodeURIComponent(data.instant?.title || '')}&url=${encodeURIComponent(data.instant?.url || '')}`)
                        }
                        className="flex items-center gap-[0.5cqw] rounded-[0.8cqw] bg-blue-600 px-[1.4cqw] py-[0.6cqw] text-[1.2cqw] font-medium text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 cursor-pointer"
                      >
                        <FiBookOpen className="h-[1.2cqw] w-[1.2cqw]" />
                        <span>Read in Safari</span>
                      </button>
                    )}

                    {data.instant.url && (
                      <button
                        onClick={() => window.open(data.instant?.url, '_blank', 'noopener,noreferrer')}
                        className="flex items-center gap-[0.5cqw] rounded-[0.8cqw] bg-black/[0.06] px-[1.2cqw] py-[0.6cqw] text-[1.2cqw] font-medium text-black/75 transition-colors hover:bg-black/10 active:scale-95 cursor-pointer"
                      >
                        <FiExternalLink className="h-[1.2cqw] w-[1.2cqw]" />
                        <span>Open Source Site</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Results List */}
          {filteredItems.length > 0 ? (
            <div className="space-y-[1.6cqw]">
              {filteredItems.map((item, index) => {
                const isWiki = isWikiUrl(item.url)
                const isHN = item.source === 'hackernews'

                return (
                  <motion.div
                    key={item.id || item.url || index}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.04, 0.3) }}
                    className="group rounded-[1.2cqw] border border-black/5 bg-white p-[1.6cqw] shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all hover:border-black/15 hover:shadow-md"
                  >
                    {/* Top Row: Favicon + Domain Breadcrumb + Source Badge */}
                    <div className="flex items-center justify-between gap-[1cqw]">
                      <div className="flex items-center gap-[0.8cqw] text-[1.15cqw] text-black/55">
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${item.domain}&sz=32`}
                          alt=""
                          className="h-[1.4cqw] w-[1.4cqw] rounded-sm"
                          onError={(e) => {
                            ;(e.currentTarget as HTMLElement).style.display = 'none'
                          }}
                        />
                        <span className="font-mono text-[1.1cqw] text-black/60">
                          {item.domain}
                        </span>
                        <span>›</span>
                        <span className="max-w-[28cqw] truncate text-black/45">
                          {item.url.replace(/^https?:\/\/[^/]+\/?/, '') || 'home'}
                        </span>
                      </div>

                      <div className="flex items-center gap-[0.6cqw]">
                        {isWiki && (
                          <span className="rounded bg-emerald-500/10 px-[0.7cqw] py-[0.15cqw] text-[1cqw] font-semibold text-emerald-700">
                            Wikipedia
                          </span>
                        )}
                        {isHN && (
                          <span className="rounded bg-orange-500/10 px-[0.7cqw] py-[0.15cqw] text-[1cqw] font-semibold text-orange-700">
                            Discussion
                          </span>
                        )}
                        {item.source === 'web' && (
                          <span className="rounded bg-blue-500/10 px-[0.7cqw] py-[0.15cqw] text-[1cqw] font-semibold text-blue-700">
                            Web
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title with hover effect */}
                    <div className="mt-[0.6cqw] flex items-start gap-[1.2cqw]">
                      <div className="min-w-0 flex-1">
                        <h3
                          onClick={() => {
                            if (isWiki) {
                              go(`desk://reader?title=${encodeURIComponent(item.title)}&url=${encodeURIComponent(item.url)}`)
                            } else {
                              go(item.url)
                            }
                          }}
                          className="cursor-pointer text-[1.7cqw] font-semibold leading-tight text-blue-600 transition-colors hover:text-blue-800 hover:underline"
                        >
                          {item.title}
                        </h3>

                        {/* Snippet Description */}
                        <p className="mt-[0.5cqw] text-[1.3cqw] leading-relaxed text-black/65">
                          {item.snippet}
                        </p>
                      </div>

                      {/* Optional Thumbnail */}
                      {item.thumbnail && (
                        <div className="shrink-0 overflow-hidden rounded-[0.8cqw] border border-black/10 bg-zinc-50 shadow-sm">
                          <img
                            src={item.thumbnail}
                            alt=""
                            className="h-[6.5cqw] w-[6.5cqw] object-cover"
                            onError={(e) => {
                              ;(e.currentTarget as HTMLElement).style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="mt-[1.2cqw] flex flex-wrap items-center gap-[0.8cqw] border-t border-black/[0.04] pt-[0.8cqw]">
                      {isWiki && (
                        <button
                          onClick={() =>
                            go(`desk://reader?title=${encodeURIComponent(item.title)}&url=${encodeURIComponent(item.url)}`)
                          }
                          className="flex items-center gap-[0.4cqw] rounded-[0.6cqw] bg-blue-500/10 px-[1cqw] py-[0.4cqw] text-[1.15cqw] font-medium text-blue-600 transition-colors hover:bg-blue-500/20 active:scale-95 cursor-pointer"
                        >
                          <FiBookOpen className="h-[1.1cqw] w-[1.1cqw]" />
                          <span>Read in Safari</span>
                        </button>
                      )}

                      <button
                        onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
                        className="flex items-center gap-[0.4cqw] rounded-[0.6cqw] bg-black/[0.04] px-[1cqw] py-[0.4cqw] text-[1.15cqw] font-medium text-black/65 transition-colors hover:bg-black/10 active:scale-95 cursor-pointer"
                      >
                        <FiExternalLink className="h-[1.1cqw] w-[1.1cqw]" />
                        <span>Open in Browser</span>
                      </button>

                      <button
                        onClick={() => copyUrl(item.id, item.url)}
                        className="flex items-center gap-[0.4cqw] rounded-[0.6cqw] px-[0.8cqw] py-[0.4cqw] text-[1.15cqw] text-black/50 transition-colors hover:bg-black/5 hover:text-black/80 cursor-pointer"
                      >
                        {copiedId === item.id ? (
                          <>
                            <FiCheck className="h-[1.1cqw] w-[1.1cqw] text-emerald-600" />
                            <span className="text-emerald-600 font-medium">Copied!</span>
                          </>
                        ) : (
                          <>
                            <FiCopy className="h-[1.1cqw] w-[1.1cqw]" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="rounded-[1.4cqw] border border-black/10 bg-zinc-50 p-[4cqw] text-center">
              <FiSearch className="mx-auto h-[3cqw] w-[3cqw] text-black/30" />
              <h2 className="mt-[1cqw] text-[2cqw] font-semibold text-black/75">
                No matching results found for “{query}”
              </h2>
              <p className="mt-[0.5cqw] text-[1.3cqw] text-black/50">
                Try checking for typos or searching for general keywords.
              </p>

              <div className="mt-[2.4cqw]">
                <span className="text-[1.2cqw] font-medium text-black/40 uppercase tracking-wider">
                  Try searching for:
                </span>
                <div className="mt-[1cqw] flex flex-wrap justify-center gap-[0.8cqw]">
                  {['React 19', 'Apple Silicon M3', 'SpaceX Starship', 'TypeScript Guide', 'Artificial Intelligence'].map(
                    (s) => (
                      <button
                        key={s}
                        onClick={() => go(`desk://search?q=${encodeURIComponent(s)}`)}
                        className="flex items-center gap-[0.4cqw] rounded-full bg-white px-[1.2cqw] py-[0.5cqw] text-[1.2cqw] font-medium text-black/75 shadow-sm ring-1 ring-black/10 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <FiTrendingUp className="h-[1.1cqw] w-[1.1cqw] text-blue-500" />
                        <span>{s}</span>
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
