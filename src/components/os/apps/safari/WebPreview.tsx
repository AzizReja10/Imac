import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiExternalLink, FiArrowLeft, FiCopy, FiCheck, FiMonitor } from 'react-icons/fi'

interface WebPreviewProps {
  url: string
  go: (url: string) => void
}

export default function WebPreview({ url, go }: WebPreviewProps) {
  const [copied, setCopied] = useState(false)
  const [embedMode, setEmbedMode] = useState(false)

  let domain = 'Website'
  try {
    domain = new URL(url).hostname.replace(/^www\./, '')
  } catch {}

  const copyUrl = () => {
    navigator.clipboard?.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  if (embedMode) {
    return (
      <div className="flex h-full flex-col bg-white">
        <div className="flex items-center justify-between border-b border-black/10 bg-zinc-100 px-[1.5cqw] py-[0.6cqw] text-[1.15cqw]">
          <div className="flex items-center gap-[0.8cqw]">
            <button
              onClick={() => setEmbedMode(false)}
              className="flex items-center gap-[0.4cqw] rounded-[0.5cqw] bg-black/5 px-[0.8cqw] py-[0.3cqw] font-medium text-black/70 hover:bg-black/10 cursor-pointer"
            >
              <FiArrowLeft className="h-[1.1cqw] w-[1.1cqw]" />
              <span>Back</span>
            </button>
            <span className="font-mono text-black/60 truncate max-w-[30cqw]">{url}</span>
          </div>

          <div className="flex items-center gap-[0.6cqw]">
            <button
              onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
              className="flex items-center gap-[0.4cqw] rounded-[0.5cqw] bg-blue-600 px-[1cqw] py-[0.3cqw] font-medium text-white hover:bg-blue-700 cursor-pointer"
            >
              <FiExternalLink className="h-[1cqw] w-[1cqw]" />
              <span>Open in Real Browser</span>
            </button>
          </div>
        </div>

        <div className="relative flex-1 bg-white">
          <iframe
            src={url}
            title={domain}
            className="h-full w-full border-none"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onError={() => setEmbedMode(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-[6cqw] py-[4cqw] text-center select-text">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-[42cqw] rounded-[1.8cqw] border border-black/10 bg-white p-[3cqw] shadow-xl ring-1 ring-black/5"
      >
        {/* Favicon & Domain */}
        <div className="mx-auto flex h-[5cqw] w-[5cqw] items-center justify-center rounded-[1.2cqw] bg-zinc-100 shadow-sm ring-1 ring-black/5">
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
            alt=""
            className="h-[3cqw] w-[3cqw] rounded-sm"
            onError={(e) => {
              ;(e.currentTarget as HTMLElement).style.display = 'none'
            }}
          />
        </div>

        <h2 className="mt-[1.4cqw] text-[2.4cqw] font-bold text-black/85">
          {domain}
        </h2>

        <p className="mt-[0.6cqw] font-mono text-[1.15cqw] text-blue-600 break-all">
          {url}
        </p>

        <p className="mt-[1.2cqw] text-[1.35cqw] leading-relaxed text-black/60">
          This site is live on the internet. You can open the full web page in your own browser, or try the simulated embedded view.
        </p>

        {/* Buttons */}
        <div className="mt-[2.2cqw] flex flex-col gap-[0.8cqw]">
          <button
            onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
            className="flex items-center justify-center gap-[0.6cqw] rounded-[0.9cqw] bg-blue-600 px-[2cqw] py-[0.9cqw] text-[1.3cqw] font-medium text-white shadow-md transition-all hover:bg-blue-700 active:scale-95 cursor-pointer"
          >
            <FiExternalLink className="h-[1.3cqw] w-[1.3cqw]" />
            <span>Open {domain} in your browser</span>
          </button>

          <div className="flex items-center justify-center gap-[0.8cqw]">
            <button
              onClick={() => setEmbedMode(true)}
              className="flex items-center gap-[0.4cqw] rounded-[0.8cqw] bg-black/[0.05] px-[1.2cqw] py-[0.6cqw] text-[1.2cqw] font-medium text-black/75 hover:bg-black/10 active:scale-95 cursor-pointer"
            >
              <FiMonitor className="h-[1.1cqw] w-[1.1cqw]" />
              <span>Try Live Embed</span>
            </button>

            <button
              onClick={copyUrl}
              className="flex items-center gap-[0.4cqw] rounded-[0.8cqw] bg-black/[0.05] px-[1.2cqw] py-[0.6cqw] text-[1.2cqw] font-medium text-black/75 hover:bg-black/10 active:scale-95 cursor-pointer"
            >
              {copied ? (
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
        </div>

        {/* Back to start */}
        <div className="mt-[2cqw] border-t border-black/10 pt-[1.2cqw]">
          <button
            onClick={() => go('desk://start')}
            className="text-[1.2cqw] font-medium text-black/45 hover:text-black/75 hover:underline cursor-pointer"
          >
            ← Back to Safari Start Page
          </button>
        </div>
      </motion.div>
    </div>
  )
}
