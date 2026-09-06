import { useState, useRef } from 'react'
import {
  Globe, ExternalLink, RefreshCw, ArrowLeft, ArrowRight,
  Search, ShieldAlert, BookOpen, Code, Zap, Video, Home
} from 'lucide-react'
import { useNetworkStore } from '../store/networkStore'

interface Bookmark {
  title: string
  url: string
  desc: string
  category: string
  embeddable: boolean
  icon: typeof Globe
}

const BOOKMARKS: Bookmark[] = [
  {
    title: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Nepal',
    desc: 'Free open encyclopedia',
    category: 'Reference',
    embeddable: true,
    icon: BookOpen,
  },
  {
    title: 'MDN Web Docs',
    url: 'https://developer.mozilla.org/en-US/',
    desc: 'Web standards and JavaScript documentation',
    category: 'Docs',
    embeddable: true,
    icon: Code,
  },
  {
    title: 'Hacker News',
    url: 'https://news.ycombinator.com/',
    desc: 'Computer science & developer news',
    category: 'News',
    embeddable: true,
    icon: Zap,
  },
  {
    title: 'W3Schools',
    url: 'https://www.w3schools.com/',
    desc: 'Web development tutorials & references',
    category: 'Learning',
    embeddable: true,
    icon: Globe,
  },
  {
    title: 'Lofi Music Lounge',
    url: 'https://www.youtube-nocookie.com/embed/jfKfPfyJRdk',
    desc: 'Chill beats to code & relax to',
    category: 'Media',
    embeddable: true,
    icon: Video,
  },
  {
    title: 'GitHub (susantedit)',
    url: 'https://github.com/susantedit',
    desc: 'Kantaraj Luitel repository hub',
    category: 'Social',
    embeddable: false,
    icon: Code,
  },
]

export default function Browser() {
  const { wifiEnabled } = useNetworkStore()
  const [currentUrl, setCurrentUrl] = useState<string>('syau://start')
  const [inputUrl, setInputUrl] = useState<string>('')
  const [history, setHistory] = useState<string[]>(['syau://start'])
  const [historyIdx, setHistoryIdx] = useState<number>(0)
  const [isBlocked, setIsBlocked] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const navigateTo = (target: string) => {
    let cleanUrl = target.trim()
    if (!cleanUrl) return

    if (cleanUrl === 'syau://start') {
      setCurrentUrl('syau://start')
      setInputUrl('')
      setIsBlocked(false)
      return
    }

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://') && !cleanUrl.startsWith('syau://')) {
      // If it looks like a domain, prepend https://, otherwise search Wikipedia
      if (cleanUrl.includes('.')) {
        cleanUrl = `https://${cleanUrl}`
      } else {
        cleanUrl = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(cleanUrl)}`
      }
    }

    const checkBookmark = BOOKMARKS.find(b => b.url === cleanUrl)
    if (checkBookmark && !checkBookmark.embeddable) {
      setIsBlocked(true)
    } else {
      setIsBlocked(false)
    }

    setCurrentUrl(cleanUrl)
    setInputUrl(cleanUrl)

    const nextHist = history.slice(0, historyIdx + 1).concat(cleanUrl)
    setHistory(nextHist)
    setHistoryIdx(nextHist.length - 1)
  }

  const goBack = () => {
    if (historyIdx > 0) {
      const prev = history[historyIdx - 1]
      setHistoryIdx(historyIdx - 1)
      setCurrentUrl(prev)
      setInputUrl(prev === 'syau://start' ? '' : prev)
    }
  }

  const goForward = () => {
    if (historyIdx < history.length - 1) {
      const next = history[historyIdx + 1]
      setHistoryIdx(historyIdx + 1)
      setCurrentUrl(next)
      setInputUrl(next === 'syau://start' ? '' : next)
    }
  }

  const refresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = currentUrl
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--color-window-bg)', color: 'var(--color-text-primary)',
      fontFamily: 'var(--font-sans)', overflow: 'hidden'
    }}>
      {/* Navigation Bar */}
      <div style={{
        padding: '8px 12px', background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid var(--color-glass-border)',
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={goBack}
            disabled={historyIdx <= 0}
            title="Back"
            style={{
              background: 'transparent', border: 'none',
              color: historyIdx > 0 ? 'var(--color-text-primary)' : 'rgba(255,255,255,0.2)',
              cursor: historyIdx > 0 ? 'pointer' : 'default', padding: 4, display: 'flex'
            }}
          >
            <ArrowLeft size={16} />
          </button>
          <button
            onClick={goForward}
            disabled={historyIdx >= history.length - 1}
            title="Forward"
            style={{
              background: 'transparent', border: 'none',
              color: historyIdx < history.length - 1 ? 'var(--color-text-primary)' : 'rgba(255,255,255,0.2)',
              cursor: historyIdx < history.length - 1 ? 'pointer' : 'default', padding: 4, display: 'flex'
            }}
          >
            <ArrowRight size={16} />
          </button>
          <button
            onClick={refresh}
            title="Refresh"
            style={{ background: 'transparent', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', padding: 4, display: 'flex' }}
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => navigateTo('syau://start')}
            title="Start Page"
            style={{ background: 'transparent', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', padding: 4, display: 'flex' }}
          >
            <Home size={15} />
          </button>
        </div>

        {/* Address & Search Input */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-glass-border)',
          borderRadius: 8, padding: '4px 10px',
        }}>
          <Search size={14} style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            value={inputUrl}
            onChange={e => setInputUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && navigateTo(inputUrl)}
            placeholder="Type a web address or search term..."
            style={{
              flex: 1, background: 'transparent', border: 'none',
              outline: 'none', color: 'var(--color-text-primary)', fontSize: 12,
            }}
          />
        </div>

        {currentUrl !== 'syau://start' && (
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open externally in system browser"
            style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6,
              background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-secondary)',
              textDecoration: 'none', fontSize: 11, fontWeight: 600,
            }}
          >
            <ExternalLink size={12} />
            <span>Open Tab</span>
          </a>
        )}
      </div>

      {/* Main View Area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {currentUrl === 'syau://start' ? (
          <div style={{ height: '100%', overflowY: 'auto', padding: '32px 24px', maxWidth: 760, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, margin: '0 auto 12px',
                background: 'linear-gradient(135deg, var(--color-sky) 0%, #3B82F6 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
              }}>
                <Globe size={26} />
              </div>
              <h2 className="font-heading" style={{ fontSize: 20, fontWeight: 700, margin: '0 0 6px' }}>
                स्याउ Web Portal
              </h2>
              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>
                Explore embeddable developer docs, references, and web resources
              </p>
            </div>

            {/* Bookmarks Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {BOOKMARKS.map(bm => {
                const IconComponent = bm.icon
                return (
                  <div
                    key={bm.title}
                    onClick={() => navigateTo(bm.url)}
                    style={{
                      padding: 14, borderRadius: 12, cursor: 'pointer',
                      background: 'var(--color-glass-card)', border: '1px solid var(--color-glass-border)',
                      transition: 'all 0.15s ease', display: 'flex', flexDirection: 'column', gap: 6,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-sky)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-glass-border)'; e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ color: 'var(--color-sky)' }}><IconComponent size={16} /></div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{bm.title}</span>
                      </div>
                      <span style={{ fontSize: 9, background: 'rgba(147,197,253,0.15)', color: 'var(--color-sky)', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                        {bm.category}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                      {bm.desc}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : !wifiEnabled ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
            <Globe size={36} style={{ color: '#F87171', marginBottom: 12 }} />
            <h3 style={{ fontSize: 16, margin: '0 0 6px' }}>Network Offline</h3>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', maxWidth: 420, margin: '0 0 16px', lineHeight: 1.5 }}>
              Wi-Fi is currently disabled in SyauOS system settings. Enable Wi-Fi from the top bar or settings to browse external web pages.
            </p>
            <button
              onClick={() => navigateTo('syau://start')}
              style={{
                padding: '6px 14px', borderRadius: 8, background: 'var(--color-sky)',
                color: '#000', border: 'none', fontWeight: 600, fontSize: 12, cursor: 'pointer',
              }}
            >
              Return to Start Page
            </button>
          </div>
        ) : isBlocked ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
            <ShieldAlert size={36} style={{ color: '#F87171', marginBottom: 12 }} />
            <h3 style={{ fontSize: 16, margin: '0 0 6px' }}>Site Protected by Security Policy</h3>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', maxWidth: 420, margin: '0 0 16px', lineHeight: 1.5 }}>
              This website ({currentUrl}) blocks embedding inside client iframes via the <code>X-Frame-Options</code> HTTP security header.
            </p>
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                borderRadius: 8, background: 'var(--color-sky)', color: '#090B14',
                fontWeight: 700, fontSize: 12, textDecoration: 'none',
              }}
            >
              <ExternalLink size={14} />
              <span>Open in New Browser Window</span>
            </a>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={currentUrl}
            title="Browser"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            style={{ width: '100%', height: '100%', border: 'none', background: '#FFFFFF' }}
          />
        )}
      </div>
    </div>
  )
}
