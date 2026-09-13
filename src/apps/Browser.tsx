import { useState, useRef, useCallback } from 'react'
import {
  ExternalLink, RefreshCw, ChevronLeft, ChevronRight, ShieldAlert,
  Globe, Layers, Search, Sparkles, Home, BookOpen, Code, Video,
  Compass, Star, GitFork, Zap, Wifi
} from 'lucide-react'
import { useNetworkStore } from '../store/networkStore'

interface Preset {
  label: string
  url: string
  iconName: 'book' | 'github' | 'code' | 'zap' | 'reddit' | 'globe' | 'video'
  embeddable?: boolean
  badge?: string
}

const PRESETS: Preset[] = [
  { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Main_Page', iconName: 'book', embeddable: true },
  { label: 'GitHub', url: 'https://github.com', iconName: 'github', embeddable: false },
  { label: 'MDN Web Docs', url: 'https://developer.mozilla.org', iconName: 'code', embeddable: true },
  { label: 'Hacker News', url: 'https://news.ycombinator.com', iconName: 'zap', embeddable: true },
  { label: 'Reddit', url: 'https://old.reddit.com', iconName: 'reddit', embeddable: false },
  { label: 'W3Schools', url: 'https://www.w3schools.com', iconName: 'globe', embeddable: true },
  { label: 'YouTube Player', url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', iconName: 'video', embeddable: true },
]

interface SearchResult {
  title: string
  snippet: string
  url: string
  source: 'wiki' | 'hn' | 'ddg'
}

interface GithubRepo {
  name: string
  description: string
  stargazers_count: number
  forks_count: number
  html_url: string
  language: string
}

interface RedditPost {
  title: string
  author: string
  score: number
  num_comments: number
  url: string
  permalink: string
}

export default function Browser() {
  const { wifiEnabled, setWifiEnabled } = useNetworkStore()
  const [viewMode, setViewMode] = useState<'home' | 'search' | 'github' | 'reddit' | 'blocked_portal' | 'frame'>('home')
  const [url, setUrl] = useState('syau://start')
  const [inputUrl, setInputUrl] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchSummary, setSearchSummary] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(false)

  // GitHub hub state
  const [ghUser, setGhUser] = useState('susantedit')
  const [ghInputUser, setGhInputUser] = useState('susantedit')
  const [ghRepos, setGhRepos] = useState<GithubRepo[]>([])
  const [ghLoading, setGhLoading] = useState(false)

  // Reddit hub state
  const [redditSub, setRedditSub] = useState('programming')
  const [redditPosts, setRedditPosts] = useState<RedditPost[]>([])
  const [redditLoading, setRedditLoading] = useState(false)

  const iframeRef = useRef<HTMLIFrameElement>(null)

  const currentHost = (() => {
    try {
      if (url.startsWith('syau://')) return 'syau-os'
      return new URL(url).hostname.replace(/^www\./, '')
    } catch {
      return ''
    }
  })()

  // Fetch GitHub repos
  const fetchGithub = useCallback(async (user: string) => {
    setGhLoading(true)
    try {
      const res = await fetch(`https://api.github.com/users/${encodeURIComponent(user)}/repos?sort=updated&per_page=12`)
      if (res.ok) {
        const data = await res.json()
        setGhRepos(data)
      } else {
        // Fallback popular repos if user not found or rate limited
        setGhRepos([
          { name: 'shayu-OS', description: 'स्याउ OS — Web-based aesthetic anime operating system for Hack Club', stargazers_count: 42, forks_count: 8, html_url: 'https://github.com/susantedit/shayu-OS', language: 'TypeScript' },
          { name: 'hackclub-arcade', description: 'Open source arcade projects & game engine demos', stargazers_count: 128, forks_count: 14, html_url: 'https://github.com/hackclub', language: 'JavaScript' },
          { name: 'antigravity-ide', description: 'Advanced agentic pair-programming workspace', stargazers_count: 350, forks_count: 22, html_url: 'https://github.com', language: 'Rust' },
        ])
      }
    } catch {
      setGhRepos([
        { name: 'shayu-OS', description: 'स्याउ OS — Web-based aesthetic anime operating system for Hack Club', stargazers_count: 42, forks_count: 8, html_url: 'https://github.com/susantedit/shayu-OS', language: 'TypeScript' },
      ])
    }
    setGhLoading(false)
  }, [])

  // Fetch Reddit posts
  const fetchReddit = useCallback(async (sub: string) => {
    setRedditLoading(true)
    try {
      const res = await fetch(`https://www.reddit.com/r/${encodeURIComponent(sub)}/hot.json?limit=12`)
      if (res.ok) {
        const data = await res.json()
        const posts = data?.data?.children?.map((c: any) => ({
          title: c.data.title,
          author: c.data.author,
          score: c.data.score,
          num_comments: c.data.num_comments,
          url: c.data.url,
          permalink: `https://reddit.com${c.data.permalink}`,
        })) || []
        setRedditPosts(posts)
      } else {
        throw new Error('Fallback')
      }
    } catch {
      setRedditPosts([
        { title: 'Show HN / Reddit: स्याउ OS — A complete operating system experience in the browser', author: 'susantedit', score: 256, num_comments: 48, url: 'https://github.com/susantedit', permalink: 'https://reddit.com' },
        { title: 'Hack Club Arcade and WebOS showcases for summer 2026', author: 'hackclubber', score: 189, num_comments: 32, url: 'https://hackclub.com', permalink: 'https://reddit.com' },
      ])
    }
    setRedditLoading(false)
  }, [])

  // Perform search across public APIs
  const performSearch = useCallback(async (query: string) => {
    const q = query.trim()
    if (!q) return

    setSearchQuery(q)
    setViewMode('search')
    setUrl(`syau://search?q=${encodeURIComponent(q)}`)
    setInputUrl(q)
    setSearching(true)
    setSearchResults([])
    setSearchSummary(null)

    const results: SearchResult[] = []

    try {
      const wikiPromise = fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&utf8=&format=json&origin=*`)
        .then(r => r.json())
        .then(data => {
          if (data?.query?.search) {
            data.query.search.slice(0, 6).forEach((item: any) => {
              results.push({
                title: item.title,
                snippet: item.snippet.replace(/<\/?[^>]+(>|$)/g, ''),
                url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
                source: 'wiki',
              })
            })
            if (data.query.search[0]) {
              setSearchSummary(data.query.search[0].snippet.replace(/<\/?[^>]+(>|$)/g, ''))
            }
          }
        })
        .catch(() => {})

      const hnPromise = fetch(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&hitsPerPage=6`)
        .then(r => r.json())
        .then(data => {
          if (data?.hits) {
            data.hits.forEach((item: any) => {
              if (item.title && (item.url || item.story_text)) {
                results.push({
                  title: item.title,
                  snippet: item.story_text ? item.story_text.slice(0, 150) + '...' : `Posted by ${item.author} with ${item.points || 0} points and ${item.num_comments || 0} comments.`,
                  url: item.url || `https://news.ycombinator.com/item?id=${item.objectID}`,
                  source: 'hn',
                })
              }
            })
          }
        })
        .catch(() => {})

      await Promise.allSettled([wikiPromise, hnPromise])
    } catch {}

    setSearchResults(results)
    setSearching(false)
  }, [])

  // Smart URL navigator
  const navigate = useCallback((target: string) => {
    const raw = target.trim()
    if (!raw || raw === 'syau://start') {
      setViewMode('home')
      setUrl('syau://start')
      setInputUrl('')
      return
    }

    // Check if input is GitHub
    if (raw.includes('github.com') || raw === 'github' || raw === 'syau://github') {
      setViewMode('github')
      setUrl('https://github.com')
      setInputUrl('https://github.com')
      fetchGithub(ghUser)
      return
    }

    // Check if input is Reddit
    if (raw.includes('reddit.com') || raw === 'reddit' || raw === 'syau://reddit') {
      setViewMode('reddit')
      setUrl('https://reddit.com')
      setInputUrl('https://reddit.com')
      fetchReddit(redditSub)
      return
    }

    // Check search queries
    try {
      if (raw.includes('duckduckgo.com') || raw.includes('google.com') || raw.includes('bing.com')) {
        const testUrl = raw.startsWith('http') ? raw : 'https://' + raw
        const parsed = new URL(testUrl)
        const q = parsed.searchParams.get('q') || parsed.searchParams.get('query')
        if (q) {
          performSearch(q)
          return
        }
      }
    } catch {}

    // If typed as plain search term
    const isUrlLike = raw.startsWith('http://') || raw.startsWith('https://') || (raw.includes('.') && !raw.includes(' ') && raw.indexOf('.') < raw.length - 1)
    if (!isUrlLike) {
      performSearch(raw)
      return
    }

    let finalUrl = raw
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl
    }

    // YouTube watch URL conversion
    try {
      const parsed = new URL(finalUrl)
      const host = parsed.hostname.replace(/^www\./, '')

      if (host.includes('youtube.com') && parsed.searchParams.has('v')) {
        const videoId = parsed.searchParams.get('v')
        finalUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`
      } else if (host === 'youtu.be') {
        const videoId = parsed.pathname.replace('/', '')
        finalUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`
      } else if (['twitter.com', 'x.com', 'instagram.com', 'facebook.com', 'discord.com', 'netflix.com', 'spotify.com'].includes(host)) {
        setUrl(finalUrl)
        setInputUrl(finalUrl)
        setViewMode('blocked_portal')
        return
      }
    } catch {}

    setUrl(finalUrl)
    setInputUrl(finalUrl)
    setViewMode('frame')
    setLoading(true)
  }, [fetchGithub, fetchReddit, ghUser, performSearch, redditSub])

  const openInNewTab = useCallback((targetUrl?: string) => {
    const destination = targetUrl || url
    if (destination.startsWith('syau://')) {
      window.open(`https://duckduckgo.com/?q=${encodeURIComponent(searchQuery || 'susant')}`, '_blank')
    } else {
      window.open(destination, '_blank', 'noopener,noreferrer')
    }
  }, [searchQuery, url])

  const openPopout = useCallback((targetUrl?: string) => {
    const destination = targetUrl || url
    const w = 1000
    const h = 700
    const left = (window.innerWidth - w) / 2
    const top = (window.innerHeight - h) / 2
    const dest = destination.startsWith('syau://') ? `https://duckduckgo.com/?q=${encodeURIComponent(searchQuery || 'susant')}` : destination
    window.open(dest, 'syau_browser_popup', `width=${w},height=${h},top=${top},left=${left},resizable=yes,scrollbars=yes`)
  }, [searchQuery, url])

  // Helper to render preset SVG icons
  const renderPresetIcon = (name: Preset['iconName'], size = 15) => {
    switch (name) {
      case 'book': return <BookOpen size={size} />
      case 'github': return <GitFork size={size} />
      case 'code': return <Code size={size} />
      case 'zap': return <Zap size={size} />
      case 'reddit': return <Compass size={size} />
      case 'globe': return <Globe size={size} />
      case 'video': return <Video size={size} />
      default: return <Globe size={size} />
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0D0A0E', color: 'var(--color-text-primary)' }}>
      {/* Top Address & Navigation Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px',
        background: 'rgba(24,16,22,0.95)',
        borderBottom: '1px solid rgba(232,130,155,0.12)',
      }}>
        {/* Navigation controls */}
        <div style={{ display: 'flex', gap: 3 }}>
          <NavBtn title="Home" onClick={() => { setViewMode('home'); setUrl('syau://start'); setInputUrl('') }}>
            <Home size={13} />
          </NavBtn>
          <NavBtn title="Back" onClick={() => {
            if (viewMode === 'frame') iframeRef.current?.contentWindow?.history.back()
            else setViewMode('home')
          }}>
            <ChevronLeft size={14} />
          </NavBtn>
          <NavBtn title="Forward" onClick={() => {
            if (viewMode === 'frame') iframeRef.current?.contentWindow?.history.forward()
          }}>
            <ChevronRight size={14} />
          </NavBtn>
          <NavBtn title="Reload" onClick={() => {
            if (viewMode === 'search') performSearch(searchQuery)
            else if (viewMode === 'github') fetchGithub(ghUser)
            else if (viewMode === 'reddit') fetchReddit(redditSub)
            else if (viewMode === 'frame') {
              setLoading(true)
              navigate(url)
            }
          }}>
            <RefreshCw size={12} className={loading || searching || ghLoading || redditLoading ? 'animate-spin' : ''} />
          </NavBtn>
        </div>

        {/* Address Bar Input */}
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
          <input
            value={inputUrl}
            onChange={e => setInputUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') navigate(inputUrl) }}
            placeholder="Enter URL or search term (e.g. github, reddit, wikipedia, susant)..."
            style={{
              width: '100%', background: 'rgba(232,130,155,0.06)',
              border: '1px solid rgba(232,130,155,0.18)', borderRadius: 8,
              padding: '6px 12px 6px 30px', color: 'var(--color-text-primary)', fontSize: 12,
              fontFamily: 'var(--font-mono)', outline: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2) inset',
            }}
            spellCheck={false}
          />
        </div>

        <button
          onClick={() => openInNewTab()}
          title="Open currently viewed page in your native browser tab"
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '5px 10px', borderRadius: 6,
            background: 'var(--color-sakura)',
            border: 'none',
            color: 'white',
            fontSize: 11, fontWeight: 700, cursor: 'pointer',
          }}
        >
          <ExternalLink size={12} />
          <span>Open Tab</span>
        </button>

        {/* Action: Popout Window */}
        <button
          onClick={() => openPopout()}
          title="Open in dedicated popup window"
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '5px 8px', borderRadius: 6,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'var(--color-text-primary)',
            fontSize: 11, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Layers size={12} />
          <span className="topbar-hide-mobile">Popout</span>
        </button>
      </div>

      {/* Bookmarks bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px',
        background: 'rgba(10,7,9,0.75)',
        borderBottom: '1px solid rgba(232,130,155,0.06)',
        overflowX: 'auto',
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Bookmarks:
        </span>
        {PRESETS.map(p => (
          <button
            key={p.label}
            onClick={() => navigate(p.url)}
            style={{
              padding: '3px 8px', borderRadius: 5,
              border: url === p.url || (p.label === 'GitHub' && viewMode === 'github') || (p.label === 'Reddit' && viewMode === 'reddit') ? '1px solid var(--color-sakura)' : '1px solid rgba(232,130,155,0.08)',
              background: url === p.url || (p.label === 'GitHub' && viewMode === 'github') || (p.label === 'Reddit' && viewMode === 'reddit') ? 'rgba(232,130,155,0.15)' : 'rgba(232,130,155,0.04)',
              color: url === p.url || (p.label === 'GitHub' && viewMode === 'github') || (p.label === 'Reddit' && viewMode === 'reddit') ? 'var(--color-sakura)' : 'var(--color-text-secondary)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            {renderPresetIcon(p.iconName, 13)}
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Main Viewport */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Offline Overlay */}
        {!wifiEnabled && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 30,
            background: '#0D0A0E', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-text-muted)', marginBottom: 16,
            }}>
              <ShieldAlert size={28} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 6 }}>
              You Are Offline
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', maxWidth: 360, lineHeight: 1.5, marginBottom: 20 }}>
              Wi-Fi is currently turned off. Turn Wi-Fi back on in the TopBar Control Center or Settings to browse online.
            </div>
            <button
              onClick={() => setWifiEnabled(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                borderRadius: 10, background: 'var(--color-sakura)', color: 'white',
                border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                boxShadow: '0 4px 20px rgba(232,130,155,0.3)',
              }}
            >
              <Wifi size={15} />
              <span>Turn On Wi-Fi</span>
            </button>
          </div>
        )}

        {/* Loading Bar */}
        {(loading || searching || ghLoading || redditLoading) && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: 'linear-gradient(90deg, var(--color-sakura), var(--color-miku))',
            animation: 'loading-bar 1s ease-in-out infinite', zIndex: 25,
          }} />
        )}

        {/* 1. START PAGE VIEW */}
        {viewMode === 'home' && (
          <div style={{
            height: '100%', overflowY: 'auto', padding: '30px 20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            background: 'radial-gradient(ellipse at top, rgba(232,130,155,0.08) 0%, #0D0A0E 70%)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <img src="/syauOS.png" alt="Logo" style={{ width: 44, height: 44, objectFit: 'contain' }} />
              <div>
                <span className="font-syau" style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text-primary)' }}>स्याउ</span>
                <span className="font-os" style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-sakura)', marginLeft: 4 }}>Web</span>
              </div>
            </div>

            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 24, textAlign: 'center', maxWidth: 440 }}>
              Search across the web with real-time results or browse embed-safe web pages without "refused to connect" blocks.
            </div>

            {/* Central Search Box */}
            <div style={{ width: '100%', maxWidth: 520, position: 'relative', marginBottom: 28 }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--color-sakura)' }} />
              <input
                autoFocus
                placeholder="Search anything (e.g. Susant, React, Hack Club, Nepal)..."
                onKeyDown={e => { if (e.key === 'Enter') performSearch((e.target as HTMLInputElement).value) }}
                style={{
                  width: '100%', padding: '12px 16px 12px 42px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(232,130,155,0.3)',
                  borderRadius: 14, color: 'var(--color-text-primary)',
                  fontSize: 14, fontFamily: 'var(--font-sans)', outline: 'none',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.currentTarget.previousSibling as HTMLInputElement)
                  if (input?.value) performSearch(input.value)
                }}
                style={{
                  position: 'absolute', right: 8, top: 8, bottom: 8,
                  padding: '0 14px', borderRadius: 8, background: 'var(--color-sakura)',
                  border: 'none', color: 'white', fontWeight: 600, fontSize: 12, cursor: 'pointer',
                }}
              >
                Search
              </button>
            </div>

            {/* Quick Destinations Grid */}
            <div style={{ width: '100%', maxWidth: 520 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: 1, marginBottom: 12 }}>
                Quick Destinations:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))', gap: 10 }}>
                {PRESETS.map(p => (
                  <div
                    key={p.label}
                    onClick={() => navigate(p.url)}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 10, padding: '12px 10px', textAlign: 'center',
                      cursor: 'pointer', transition: 'all 0.15s',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(232,130,155,0.08)'
                      e.currentTarget.style.borderColor = 'rgba(232,130,155,0.25)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                    }}
                  >
                    <div style={{ color: 'var(--color-sakura)' }}>{renderPresetIcon(p.iconName, 22)}</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{p.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. GITHUB HUB VIEW (Never refuses connection!) */}
        {viewMode === 'github' && (
          <div style={{ height: '100%', overflowY: 'auto', padding: '20px 24px', background: '#0D1117' }}>
            <div style={{ maxWidth: 740, margin: '0 auto' }}>
              {/* GitHub Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(88,166,255,0.12)', border: '1px solid rgba(88,166,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#58A6FF' }}>
                    <GitFork size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                      GitHub Explorer
                      <span style={{ fontSize: 11, background: 'rgba(56,139,253,0.15)', color: '#58A6FF', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>
                        Live API
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: '#8B949E', marginTop: 2 }}>
                      Viewing @{ghUser} public repositories
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => openInNewTab(`https://github.com/${ghUser}`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '7px 14px', borderRadius: 8, background: '#238636',
                      color: 'white', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    <ExternalLink size={13} />
                    Open on GitHub.com
                  </button>
                </div>
              </div>

              {/* Switch GitHub user */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <input
                  value={ghInputUser}
                  onChange={e => setGhInputUser(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { setGhUser(ghInputUser); fetchGithub(ghInputUser) } }}
                  placeholder="Enter GitHub username (e.g. susantedit, torvalds)..."
                  style={{
                    flex: 1, padding: '8px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.05)',
                    border: '1px solid #30363D', color: 'white', fontSize: 12, fontFamily: 'var(--font-mono)',
                  }}
                />
                <button
                  onClick={() => { setGhUser(ghInputUser); fetchGithub(ghInputUser) }}
                  style={{
                    padding: '8px 16px', borderRadius: 8, background: '#21262D',
                    border: '1px solid #30363D', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Load Profile
                </button>
              </div>

              {/* Repositories Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
                {ghRepos.map((repo) => (
                  <div
                    key={repo.name}
                    style={{
                      background: '#161B22', border: '1px solid #30363D', borderRadius: 10,
                      padding: 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <a
                          href={repo.html_url} target="_blank" rel="noreferrer"
                          style={{ fontSize: 14, fontWeight: 700, color: '#58A6FF', textDecoration: 'none' }}
                        >
                          {repo.name}
                        </a>
                        <span style={{ fontSize: 10, color: '#8B949E', background: '#21262D', padding: '1px 6px', borderRadius: 10 }}>
                          Public
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#8B949E', lineHeight: 1.4, marginBottom: 12 }}>
                        {repo.description || 'No description provided.'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #21262D', paddingTop: 10, fontSize: 11, color: '#8B949E' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {repo.language && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3178C6' }} />
                            {repo.language}
                          </span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Star size={11} /> {repo.stargazers_count}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <GitFork size={11} /> {repo.forks_count}
                        </span>
                      </div>

                      <button
                        onClick={() => openInNewTab(repo.html_url)}
                        style={{
                          background: 'none', border: 'none', color: '#58A6FF', fontSize: 11,
                          fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                        }}
                      >
                        <span>View</span>
                        <ExternalLink size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. REDDIT HUB VIEW (Never refuses connection!) */}
        {viewMode === 'reddit' && (
          <div style={{ height: '100%', overflowY: 'auto', padding: '20px 24px', background: '#0E1113' }}>
            <div style={{ maxWidth: 700, margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,69,0,0.15)', border: '1px solid rgba(255,69,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF4500' }}>
                    <Compass size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#FF4500' }}>
                      r/{redditSub}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      Reddit Live Feed Viewer
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  {['programming', 'webdev', 'hackclub', 'technology'].map(sub => (
                    <button
                      key={sub}
                      onClick={() => { setRedditSub(sub); fetchReddit(sub) }}
                      style={{
                        padding: '4px 10px', borderRadius: 6,
                        background: redditSub === sub ? '#FF4500' : 'rgba(255,255,255,0.05)',
                        border: 'none', color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      r/{sub}
                    </button>
                  ))}
                  <button
                    onClick={() => openInNewTab(`https://reddit.com/r/${redditSub}`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    <span>Open Tab</span>
                    <ExternalLink size={10} />
                  </button>
                </div>
              </div>

              {/* Reddit Posts List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {redditPosts.map((post, idx) => (
                  <div
                    key={idx}
                    onClick={() => openInNewTab(post.permalink)}
                    style={{
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 10, padding: 14, cursor: 'pointer', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  >
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                      Posted by u/{post.author}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8, lineHeight: 1.4 }}>
                      {post.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--color-text-secondary)' }}>
                      <span>Score: {post.score}</span>
                      <span>Comments: {post.num_comments}</span>
                      <span style={{ marginLeft: 'auto', color: 'var(--color-sakura)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <span>Read</span>
                        <ExternalLink size={10} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. BLOCKED SITE SMART GATEWAY PORTAL */}
        {viewMode === 'blocked_portal' && (
          <div style={{
            height: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center',
            background: 'radial-gradient(ellipse at top, rgba(232,130,155,0.12) 0%, #0D0A0E 70%)',
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: 18,
              background: 'rgba(232,130,155,0.1)', border: '1px solid rgba(232,130,155,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-sakura)', marginBottom: 16,
            }}>
              <Globe size={32} />
            </div>

            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 6 }}>
              {currentHost}
            </div>

            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', maxWidth: 420, lineHeight: 1.5, marginBottom: 24 }}>
              This service enforces strict security headers (<code>X-Frame-Options: SAMEORIGIN / DENY</code>) that prevent running inside embedded windows. Launch directly in your browser or popup:
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={() => openInNewTab()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px',
                  borderRadius: 10, background: 'var(--color-sakura)', color: 'white',
                  border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  boxShadow: '0 4px 20px rgba(232,130,155,0.3)',
                }}
              >
                <ExternalLink size={15} />
                Open in Native Tab
              </button>

              <button
                onClick={() => openPopout()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px',
                  borderRadius: 10, background: 'rgba(255,255,255,0.06)', color: 'white',
                  border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                }}
              >
                <Layers size={15} />
                Popout Window
              </button>
            </div>
          </div>
        )}

        {/* 5. SEARCH RESULTS VIEW */}
        {viewMode === 'search' && (
          <div style={{ height: '100%', overflowY: 'auto', padding: '20px 24px', background: '#0D0A0E' }}>
            <div style={{ maxWidth: 700, margin: '0 auto' }}>
              {/* Search Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Results for <span style={{ color: 'var(--color-sakura)' }}>"{searchQuery}"</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                    Found {searchResults.length} live results from Wikipedia & Hacker News
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => window.open(`https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}`, '_blank')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '4px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-text-secondary)',
                      fontSize: 11, cursor: 'pointer',
                    }}
                  >
                    <span>DuckDuckGo</span>
                    <ExternalLink size={10} />
                  </button>
                  <button
                    onClick={() => window.open(`https://google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '4px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-text-secondary)',
                      fontSize: 11, cursor: 'pointer',
                    }}
                  >
                    <span>Google</span>
                    <ExternalLink size={10} />
                  </button>
                </div>
              </div>

              {/* Summary Box */}
              {searchSummary && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(232,130,155,0.08) 0%, rgba(126,221,214,0.08) 100%)',
                  border: '1px solid rgba(232,130,155,0.2)', borderRadius: 12,
                  padding: 14, marginBottom: 20,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--color-sakura)', marginBottom: 4 }}>
                    <Sparkles size={14} />
                    <span>Quick Summary</span>
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--color-text-primary)' }}>
                    {searchSummary}
                  </div>
                </div>
              )}

              {/* Results List */}
              {searching ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)', fontSize: 13 }}>
                  Fetching live search results...
                </div>
              ) : searchResults.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {searchResults.map((res, i) => (
                    <div
                      key={i}
                      style={{
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 10, padding: 14, transition: 'border-color 0.15s, background 0.15s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                        e.currentTarget.style.borderColor = 'rgba(232,130,155,0.2)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                          color: res.source === 'wiki' ? 'var(--color-miku)' : '#FB923C',
                          background: res.source === 'wiki' ? 'rgba(126,221,214,0.1)' : 'rgba(251,146,60,0.1)',
                          padding: '1px 6px', borderRadius: 4,
                        }}>
                          {res.source === 'wiki' ? 'Wikipedia' : 'Hacker News'}
                        </span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => navigate(res.url)}
                            style={{
                              padding: '2px 8px', borderRadius: 4, background: 'rgba(232,130,155,0.1)',
                              border: '1px solid rgba(232,130,155,0.2)', color: 'var(--color-sakura)',
                              fontSize: 10, fontWeight: 600, cursor: 'pointer',
                            }}
                          >
                            Open in Frame
                          </button>
                          <button
                            onClick={() => window.open(res.url, '_blank')}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text-secondary)',
                              fontSize: 10, fontWeight: 600, cursor: 'pointer',
                            }}
                          >
                            <span>New Tab</span>
                            <ExternalLink size={10} />
                          </button>
                        </div>
                      </div>

                      <div
                        onClick={() => navigate(res.url)}
                        style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-sakura)', cursor: 'pointer', marginBottom: 4 }}
                      >
                        {res.title}
                      </div>

                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6, wordBreak: 'break-all' }}>
                        {res.url}
                      </div>

                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                        {res.snippet}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 30,
                  textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>No local matches found</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 16 }}>
                    Search on external engines:
                  </div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <button
                      onClick={() => window.open(`https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}`, '_blank')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 14px', borderRadius: 8, background: 'var(--color-sakura)',
                        color: 'white', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      <span>Search DuckDuckGo</span>
                      <ExternalLink size={12} />
                    </button>
                    <button
                      onClick={() => window.open(`https://google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.06)',
                        color: 'white', border: '1px solid rgba(255,255,255,0.1)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      <span>Search Google</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. EMBEDDABLE IFRAME VIEW */}
        {viewMode === 'frame' && (
          <iframe
            ref={iframeRef}
            key={url}
            src={url}
            onLoad={() => setLoading(false)}
            style={{ width: '100%', height: '100%', border: 'none', background: 'white' }}
            sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-same-origin allow-modals allow-presentation"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          />
        )}
      </div>
    </div>
  )
}

function NavBtn({ onClick, children, title }: { onClick: () => void; children: React.ReactNode; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 26, height: 26, borderRadius: 6, border: 'none',
        background: 'rgba(232,130,155,0.08)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-text-secondary)', transition: 'background 0.15s, color 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(232,130,155,0.18)'
        e.currentTarget.style.color = 'var(--color-sakura)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(232,130,155,0.08)'
        e.currentTarget.style.color = 'var(--color-text-secondary)'
      }}
    >
      {children}
    </button>
  )
}

