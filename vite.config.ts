import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

function searchProxyPlugin(): Plugin {
  return {
    name: 'safari-search-proxy',
    configureServer(server) {
      server.middlewares.use('/api/search', async (req, res) => {
        try {
          const url = new URL(req.url || '', 'http://localhost')
          const query = url.searchParams.get('q') || ''
          if (!query.trim()) {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ query: '', results: [] }))
            return
          }

          const ddgRes = await fetch('https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query), {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              Accept: 'text/html,application/xhtml+xml,application/xml',
            },
          })
          const html = await ddgRes.text()
          const results: Array<{ title: string; url: string; snippet: string }> = []
          const blocks = html.split('<div class="result results_links')

          for (let i = 1; i < blocks.length && results.length < 15; i++) {
            const b = blocks[i]
            const titleM = b.match(/<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/)
            const snipM = b.match(/<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/)
            if (titleM) {
              let targetUrl = titleM[1]
              const uddg = targetUrl.match(/[?&]uddg=([^&]+)/)
              if (uddg) {
                try {
                  targetUrl = decodeURIComponent(uddg[1])
                } catch (_) {}
              }
              const title = titleM[2]
                .replace(/<[^>]+>/g, '')
                .replace(/&#x27;/g, "'")
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .trim()
              const snippet = snipM
                ? snipM[1]
                    .replace(/<[^>]+>/g, '')
                    .replace(/&#x27;/g, "'")
                    .replace(/&amp;/g, '&')
                    .replace(/&quot;/g, '"')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .trim()
                : ''
              if (
                targetUrl &&
                title &&
                !targetUrl.includes('duckduckgo.com/y.js') &&
                !targetUrl.includes('bing.com/aclick') &&
                !targetUrl.includes('ad_domain=')
              ) {
                results.push({ title, url: targetUrl, snippet })
              }
            }
          }

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ query, results }))
        } catch (err: any) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err?.message || 'Search failed', results: [] }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), searchProxyPlugin()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
})