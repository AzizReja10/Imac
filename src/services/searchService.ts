// Live Internet Search Service for Safari in Desk Sim
// Fetches real results from DuckDuckGo, Wikipedia, and tech discussions

export interface SearchResultItem {
  id: string
  title: string
  url: string
  snippet: string
  domain: string
  source: 'web' | 'wikipedia' | 'instant' | 'hackernews'
  thumbnail?: string
  date?: string
}

export interface InstantKnowledge {
  title: string
  subtitle?: string
  description?: string
  thumbnail?: string
  url?: string
  sourceName?: string
}

export interface SearchResponse {
  query: string
  instant?: InstantKnowledge
  items: SearchResultItem[]
  totalCount: number
  durationMs: number
}

export interface ArticleData {
  title: string
  description?: string
  extract: string
  thumbnail?: string
  url: string
  sections?: { title: string; content: string }[]
}

function cleanHtml(raw: string): string {
  if (!raw) return ''
  return raw
    .replace(/<[^>]+>/g, '')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&middot;/g, '·')
    .replace(/\s+/g, ' ')
    .trim()
}

function getDomain(urlStr: string): string {
  try {
    const parsed = new URL(urlStr)
    return parsed.hostname.replace(/^www\./, '')
  } catch {
    return 'web'
  }
}

// 1. Fetch DuckDuckGo Web Results from dev proxy
async function fetchWebProxy(query: string, signal: AbortSignal): Promise<SearchResultItem[]> {
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal })
    if (!res.ok) return []
    const data = await res.json()
    if (!Array.isArray(data.results)) return []
    return data.results.map((r: any, idx: number) => ({
      id: `web-${idx}-${encodeURIComponent(r.url)}`,
      title: cleanHtml(r.title),
      url: r.url,
      snippet: cleanHtml(r.snippet),
      domain: getDomain(r.url),
      source: 'web' as const,
    }))
  } catch {
    return []
  }
}

// 2. Fetch Wikipedia Generator Search (always works directly in browser via CORS origin=*)
async function fetchWikipediaSearch(
  query: string,
  signal: AbortSignal,
): Promise<{ items: SearchResultItem[]; instant?: InstantKnowledge }> {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      query,
    )}&gsrlimit=10&prop=pageimages|extracts|info&inprop=url&exintro=1&explaintext=1&exsentences=3&piprop=thumbnail&pithumbsize=320&format=json&origin=*`
    const res = await fetch(url, { signal })
    if (!res.ok) return { items: [] }
    const data = await res.json()
    const pages = Object.values(data.query?.pages || {}) as any[]
    pages.sort((a, b) => (a.index ?? 0) - (b.index ?? 0))

    const items: SearchResultItem[] = pages.map((p) => ({
      id: `wiki-${p.pageid || p.title}`,
      title: p.title,
      url: p.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(p.title.replace(/ /g, '_'))}`,
      snippet: p.extract || '',
      domain: 'en.wikipedia.org',
      thumbnail: p.thumbnail?.source,
      source: 'wikipedia' as const,
    }))

    let instant: InstantKnowledge | undefined
    if (pages.length > 0 && pages[0].extract && pages[0].extract.length > 40) {
      const top = pages[0]
      instant = {
        title: top.title,
        subtitle: 'Wikipedia Overview',
        description: top.extract,
        thumbnail: top.thumbnail?.source,
        url: top.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(top.title.replace(/ /g, '_'))}`,
        sourceName: 'Wikipedia',
      }
    }

    return { items, instant }
  } catch {
    return { items: [] }
  }
}

// 3. Fetch DuckDuckGo Instant Answer API (CORS enabled)
async function fetchDuckDuckGoInstant(
  query: string,
  signal: AbortSignal,
): Promise<{ items: SearchResultItem[]; instant?: InstantKnowledge }> {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`
    const res = await fetch(url, { signal })
    if (!res.ok) return { items: [] }
    const data = await res.json()

    let instant: InstantKnowledge | undefined
    if (data.Heading && (data.AbstractText || data.AbstractURL)) {
      const img = data.Image ? (data.Image.startsWith('http') ? data.Image : `https://duckduckgo.com${data.Image}`) : undefined
      instant = {
        title: data.Heading,
        subtitle: data.AbstractSource || 'Quick Fact',
        description: data.AbstractText || '',
        thumbnail: img,
        url: data.AbstractURL,
        sourceName: data.AbstractSource || 'DuckDuckGo',
      }
    }

    const items: SearchResultItem[] = []
    if (Array.isArray(data.RelatedTopics)) {
      for (const t of data.RelatedTopics.slice(0, 6)) {
        if (t.Text && t.FirstURL) {
          items.push({
            id: `ddg-${encodeURIComponent(t.FirstURL)}`,
            title: cleanHtml(t.Text.split(' - ')[0] || t.Text),
            url: t.FirstURL,
            snippet: cleanHtml(t.Text),
            domain: getDomain(t.FirstURL),
            thumbnail: t.Icon?.URL ? (t.Icon.URL.startsWith('http') ? t.Icon.URL : `https://duckduckgo.com${t.Icon.URL}`) : undefined,
            source: 'instant' as const,
          })
        }
      }
    }

    return { items, instant }
  } catch {
    return { items: [] }
  }
}

// 4. Fetch HackerNews Algolia Search for tech & dev topics
async function fetchHackerNews(query: string, signal: AbortSignal): Promise<SearchResultItem[]> {
  try {
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&hitsPerPage=5`
    const res = await fetch(url, { signal })
    if (!res.ok) return []
    const data = await res.json()
    if (!Array.isArray(data.hits)) return []

    return data.hits
      .filter((h: any) => h.title && (h.url || h.objectID))
      .map((h: any) => {
        const postUrl = h.url || `https://news.ycombinator.com/item?id=${h.objectID}`
        return {
          id: `hn-${h.objectID}`,
          title: cleanHtml(h.title),
          url: postUrl,
          snippet: `${h.points || 0} points by ${h.author || 'user'} · ${h.num_comments || 0} comments`,
          domain: getDomain(postUrl),
          source: 'hackernews' as const,
        }
      })
  } catch {
    return []
  }
}

// Master Search function
export async function searchInternet(query: string): Promise<SearchResponse> {
  const q = query.trim()
  if (!q) {
    return { query: '', items: [], totalCount: 0, durationMs: 0 }
  }

  const startTime = performance.now()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 6500)

  try {
    const [webRes, wikiRes, ddgRes, hnRes] = await Promise.allSettled([
      fetchWebProxy(q, controller.signal),
      fetchWikipediaSearch(q, controller.signal),
      fetchDuckDuckGoInstant(q, controller.signal),
      fetchHackerNews(q, controller.signal),
    ])

    clearTimeout(timeoutId)

    const webItems = webRes.status === 'fulfilled' ? webRes.value : []
    const wikiData = wikiRes.status === 'fulfilled' ? wikiRes.value : { items: [] }
    const ddgData = ddgRes.status === 'fulfilled' ? ddgRes.value : { items: [] }
    const hnItems = hnRes.status === 'fulfilled' ? hnRes.value : []

    // Determine Best Instant Knowledge Card
    let instant = ddgData.instant?.description ? ddgData.instant : wikiData.instant
    if (!instant?.thumbnail && wikiData.instant?.thumbnail) {
      if (instant) instant.thumbnail = wikiData.instant.thumbnail
    }

    // Combine & Rank Results
    const combined: SearchResultItem[] = []
    const seenUrls = new Set<string>()

    const addUnique = (item: SearchResultItem) => {
      const norm = item.url.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase()
      if (!seenUrls.has(norm)) {
        seenUrls.add(norm)
        combined.push(item)
      }
    }

    // Interleave top web results, wikipedia results, and community results
    const maxLen = Math.max(webItems.length, wikiData.items.length, ddgData.items.length, hnItems.length)
    for (let i = 0; i < maxLen; i++) {
      if (webItems[i]) addUnique(webItems[i])
      if (wikiData.items[i]) addUnique(wikiData.items[i])
      if (ddgData.items[i]) addUnique(ddgData.items[i])
      if (hnItems[i]) addUnique(hnItems[i])
    }

    const durationMs = Math.round(performance.now() - startTime)
    return {
      query: q,
      instant,
      items: combined,
      totalCount: combined.length,
      durationMs,
    }
  } catch (e) {
    clearTimeout(timeoutId)
    const durationMs = Math.round(performance.now() - startTime)
    return { query: q, items: [], totalCount: 0, durationMs }
  }
}

// Real-time Autocomplete Suggestions (Wikipedia OpenSearch)
export async function getSearchSuggestions(query: string): Promise<string[]> {
  const q = query.trim()
  if (!q || q.length < 2) return []

  try {
    const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
      q,
    )}&limit=6&format=json&origin=*`
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    if (Array.isArray(data[1])) {
      return data[1].filter((s: any) => typeof s === 'string')
    }
    return []
  } catch {
    return []
  }
}

// Fetch Full Article for Safari In-App Reader
export async function fetchArticle(titleOrUrl: string): Promise<ArticleData | null> {
  try {
    let cleanTitle = titleOrUrl
    if (cleanTitle.includes('wikipedia.org/wiki/')) {
      cleanTitle = cleanTitle.split('wikipedia.org/wiki/')[1]?.split('?')[0]?.split('#')[0] || cleanTitle
    }
    cleanTitle = decodeURIComponent(cleanTitle).replace(/_/g, ' ')

    // 1. Fetch REST summary
    const summaryRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanTitle.replace(/ /g, '_'))}`,
    )
    if (!summaryRes.ok) return null
    const summary = await summaryRes.json()

    // 2. Fetch sections/paragraphs
    const parseRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(
        summary.title || cleanTitle,
      )}&prop=sections|text&format=json&origin=*&redirects=1`,
    )
    const parseData = parseRes.ok ? await parseRes.json() : null

    const sections: { title: string; content: string }[] = []
    if (parseData?.parse?.sections) {
      // Pick first 4 interesting sections
      for (const s of parseData.parse.sections.slice(0, 5)) {
        if (s.line && s.line.length < 50 && !['See also', 'References', 'External links', 'Further reading'].includes(s.line)) {
          sections.push({ title: s.line, content: '' })
        }
      }
    }

    return {
      title: summary.title || cleanTitle,
      description: summary.description,
      extract: summary.extract || '',
      thumbnail: summary.thumbnail?.source,
      url: summary.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(cleanTitle)}`,
      sections: sections.length ? sections : undefined,
    }
  } catch {
    return null
  }
}
