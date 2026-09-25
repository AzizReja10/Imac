import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiArrowUpRight } from 'react-icons/fi'
import { getSearchSuggestions } from '@/services/searchService'

interface SearchSuggestionsProps {
  query: string
  visible: boolean
  onSelect: (text: string) => void
  onClose?: () => void
}

export default function SearchSuggestions({
  query,
  visible,
  onSelect,
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    if (!visible || !query || query.trim().length < 2) {
      setSuggestions([])
      return
    }

    let active = true
    const timer = setTimeout(() => {
      getSearchSuggestions(query).then((items) => {
        if (active) setSuggestions(items)
      })
    }, 150)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [query, visible])

  if (!visible || (suggestions.length === 0 && !query.trim())) {
    return null
  }

  const trimmed = query.trim()

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.15 }}
        className="absolute left-[1.2cqw] right-[1.2cqw] top-full z-50 mt-[0.5cqw] overflow-hidden rounded-[1.2cqw] border border-black/10 bg-white/95 p-[0.6cqw] shadow-2xl backdrop-blur-xl ring-1 ring-black/5"
      >
        <div className="space-y-[0.3cqw]">
          {/* Direct Search Option */}
          {trimmed && (
            <button
              onMouseDown={(e) => {
                e.preventDefault()
                onSelect(trimmed)
              }}
              className="flex w-full items-center justify-between rounded-[0.8cqw] px-[1cqw] py-[0.6cqw] text-left text-[1.3cqw] font-medium text-blue-600 transition-colors hover:bg-blue-50/80 active:bg-blue-100 cursor-pointer"
            >
              <div className="flex items-center gap-[0.7cqw]">
                <FiSearch className="h-[1.2cqw] w-[1.2cqw]" />
                <span>
                  Search internet for “<span className="font-semibold">{trimmed}</span>”
                </span>
              </div>
              <FiArrowUpRight className="h-[1.1cqw] w-[1.1cqw] text-blue-400" />
            </button>
          )}

          {/* Autocomplete Suggestions */}
          {suggestions.map((item, idx) => (
            <button
              key={`${item}-${idx}`}
              onMouseDown={(e) => {
                e.preventDefault()
                onSelect(item)
              }}
              className="flex w-full items-center justify-between rounded-[0.8cqw] px-[1cqw] py-[0.55cqw] text-left text-[1.25cqw] text-black/80 transition-colors hover:bg-black/[0.05] active:bg-black/10 cursor-pointer"
            >
              <div className="flex items-center gap-[0.7cqw]">
                <FiSearch className="h-[1.1cqw] w-[1.1cqw] text-black/40" />
                <span>{item}</span>
              </div>
              <span className="text-[1.05cqw] text-black/35 font-mono">Suggestion</span>
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
