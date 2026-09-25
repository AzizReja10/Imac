import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiExternalLink, FiBookOpen, FiCopy, FiCheck } from 'react-icons/fi'
import { FaMagic } from 'react-icons/fa'
import { fetchArticle, type ArticleData } from '@/services/searchService'

interface ArticleReaderProps {
  title: string
  url: string
  go: (url: string) => void
}

export default function ArticleReader({ title, url, go }: ArticleReaderProps) {
  const [loading, setLoading] = useState(true)
  const [article, setArticle] = useState<ArticleData | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)

    fetchArticle(title || url).then((data) => {
      if (active) {
        setArticle(data)
        setLoading(false)
      }
    })

    return () => {
      active = false
    }
  }, [title, url])

  const copyLink = () => {
    if (article?.url || url) {
      navigator.clipboard?.writeText(article?.url || url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }
  }

  return (
    <div className="min-h-full bg-[#fbfbfa] text-zinc-900 select-text">
      {/* Reader Sub-Navigation Bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/10 bg-[#fbfbfa]/90 px-[3cqw] py-[0.8cqw] backdrop-blur-md">
        <button
          onClick={() => {
            go(`desk://search?q=${encodeURIComponent(title || 'search')}`)
          }}
          className="flex items-center gap-[0.5cqw] rounded-[0.6cqw] bg-black/[0.05] px-[1cqw] py-[0.4cqw] text-[1.2cqw] font-medium text-black/75 transition-colors hover:bg-black/10 active:scale-95 cursor-pointer"
        >
          <FiArrowLeft className="h-[1.2cqw] w-[1.2cqw]" />
          <span>Back to Search</span>
        </button>

        <div className="flex items-center gap-[0.6cqw] text-[1.15cqw] text-black/50">
          <FiBookOpen className="h-[1.2cqw] w-[1.2cqw] text-blue-600" />
          <span className="font-medium text-black/70">Safari Reader Mode</span>
        </div>

        <div className="flex items-center gap-[0.6cqw]">
          <button
            onClick={copyLink}
            className="flex items-center gap-[0.4cqw] rounded-[0.6cqw] px-[0.8cqw] py-[0.4cqw] text-[1.15cqw] text-black/60 transition-colors hover:bg-black/5 hover:text-black/80 cursor-pointer"
          >
            {copied ? (
              <>
                <FiCheck className="h-[1.1cqw] w-[1.1cqw] text-emerald-600" />
                <span className="text-emerald-600 font-medium">Copied</span>
              </>
            ) : (
              <>
                <FiCopy className="h-[1.1cqw] w-[1.1cqw]" />
                <span>Copy</span>
              </>
            )}
          </button>

          {(article?.url || url) && (
            <button
              onClick={() => window.open(article?.url || url, '_blank', 'noopener,noreferrer')}
              className="flex items-center gap-[0.4cqw] rounded-[0.6cqw] bg-blue-600 px-[1.2cqw] py-[0.4cqw] text-[1.15cqw] font-medium text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 cursor-pointer"
            >
              <FiExternalLink className="h-[1.1cqw] w-[1.1cqw]" />
              <span>Open on Wikipedia</span>
            </button>
          )}
        </div>
      </div>

      {/* Reader Article Body */}
      <div className="mx-auto max-w-[50cqw] px-[3cqw] py-[3.5cqw]">
        {loading ? (
          <div className="animate-pulse space-y-[2cqw]">
            <div className="h-[3.5cqw] w-3/4 rounded bg-black/10" />
            <div className="h-[1.5cqw] w-1/3 rounded bg-black/10" />
            <div className="h-[14cqw] w-full rounded-[1.2cqw] bg-black/10" />
            <div className="space-y-[0.8cqw]">
              <div className="h-[1.4cqw] w-full rounded bg-black/10" />
              <div className="h-[1.4cqw] w-5/6 rounded bg-black/10" />
              <div className="h-[1.4cqw] w-4/5 rounded bg-black/10" />
            </div>
          </div>
        ) : article ? (
          <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-[2.4cqw]"
          >
            {/* Header */}
            <div>
              <h1 className="text-[3.4cqw] font-serif font-bold tracking-tight text-black/90">
                {article.title}
              </h1>
              {article.description && (
                <p className="mt-[0.6cqw] text-[1.6cqw] text-black/60 italic font-serif">
                  {article.description}
                </p>
              )}
            </div>

            {/* Hero Image */}
            {article.thumbnail && (
              <div className="overflow-hidden rounded-[1.4cqw] border border-black/10 bg-white p-[1cqw] shadow-md">
                <img
                  src={article.thumbnail}
                  alt={article.title}
                  className="max-h-[22cqw] w-full object-contain"
                />
              </div>
            )}

            {/* Main Extract Paragraphs */}
            <div className="space-y-[1.4cqw] font-serif text-[1.55cqw] leading-[1.8] text-black/85">
              {article.extract.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Sections Overview */}
            {article.sections && article.sections.length > 0 && (
              <div className="mt-[3cqw] rounded-[1.2cqw] border border-black/10 bg-white p-[2cqw] shadow-sm">
                <h3 className="flex items-center gap-[0.6cqw] text-[1.4cqw] font-bold font-sans text-black/80">
                  <FaMagic className="h-[1.1cqw] w-[1.1cqw] text-blue-600" />
                  Key Article Sections
                </h3>
                <ul className="mt-[1cqw] grid grid-cols-2 gap-[0.8cqw]">
                  {article.sections.map((sec, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-[0.5cqw] text-[1.25cqw] text-blue-600 hover:underline"
                    >
                      <span className="text-black/30">#</span>
                      <span>{sec.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer */}
            <div className="mt-[3cqw] flex items-center justify-between border-t border-black/10 pt-[2cqw] font-sans">
              <span className="text-[1.2cqw] text-black/45">
                Read online via Wikipedia Encyclopedia
              </span>
              <button
                onClick={() => window.open(article.url, '_blank', 'noopener,noreferrer')}
                className="flex items-center gap-[0.4cqw] text-[1.2cqw] font-medium text-blue-600 hover:underline cursor-pointer"
              >
                <span>Full Article on Web</span>
                <FiExternalLink className="h-[1.1cqw] w-[1.1cqw]" />
              </button>
            </div>
          </motion.article>
        ) : (
          <div className="py-[6cqw] text-center">
            <h2 className="text-[2.2cqw] font-semibold text-black/80">
              Unable to load article
            </h2>
            <p className="mt-[0.6cqw] text-[1.4cqw] text-black/50">
              Could not retrieve reader content for this page.
            </p>
            <button
              onClick={() => go(`desk://search?q=${encodeURIComponent(title)}`)}
              className="mt-[2cqw] rounded-[0.8cqw] bg-blue-600 px-[1.8cqw] py-[0.8cqw] text-[1.3cqw] font-medium text-white shadow-sm cursor-pointer"
            >
              Back to Search
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
