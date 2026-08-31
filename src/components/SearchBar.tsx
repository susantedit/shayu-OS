import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Terminal, FileText, Calculator, Music, Image, Globe,
  BookOpen, Settings, Folder, ShoppingBag, CloudSun, CheckSquare,
  Timer, Keyboard, Palette, X, Search
} from 'lucide-react'
import { useDesktopStore } from '../store/desktopStore'

const APPS = [
  { id: 'about', title: 'About Me', kw: 'about profile susant creator kantaraj', Icon: User, color: 'var(--color-sakura)' },
  { id: 'terminal', title: 'Terminal', kw: 'terminal shell console command', Icon: Terminal, color: 'var(--color-miku)' },
  { id: 'notes', title: 'Notes', kw: 'notes text write memo', Icon: FileText, color: 'var(--color-peach)' },
  { id: 'calculator', title: 'Calculator', kw: 'calculator math calc', Icon: Calculator, color: 'var(--color-lavender)' },
  { id: 'music', title: 'Music Player', kw: 'music player songs nepali phonk', Icon: Music, color: 'var(--color-sakura)' },
  { id: 'gallery', title: 'Gallery', kw: 'gallery images photos pictures', Icon: Image, color: 'var(--color-miku)' },
  { id: 'browser', title: 'Browser', kw: 'browser web internet search', Icon: Globe, color: 'var(--color-sky)' },
  { id: 'guide', title: 'Guide', kw: 'guide help features manual', Icon: BookOpen, color: 'var(--color-mint)' },
  { id: 'settings', title: 'Settings', kw: 'settings preferences accent theme', Icon: Settings, color: 'var(--color-text-secondary)' },
  { id: 'files', title: 'Files', kw: 'files file manager explorer folders', Icon: Folder, color: 'var(--color-sky)' },
  { id: 'store', title: 'App Store', kw: 'store apps install market', Icon: ShoppingBag, color: 'var(--color-sakura)' },
  { id: 'weather', title: 'Weather', kw: 'weather forecast temperature climate', Icon: CloudSun, color: '#93C5FD' },
  { id: 'kanban', title: 'Kanban', kw: 'kanban board tasks agile', Icon: CheckSquare, color: '#86EFAC' },
  { id: 'timer', title: 'Timer', kw: 'timer stopwatch countdown focus', Icon: Timer, color: '#FDBA74' },
  { id: 'typing-speed', title: 'Typing Speed', kw: 'typing speed wpm test keyboard', Icon: Keyboard, color: '#C4B5FD' },
  { id: 'paint-studio', title: 'Paint', kw: 'paint draw art canvas studio', Icon: Palette, color: '#86EFAC' },
  { id: 'image-editor', title: 'Image Editor', kw: 'image editor photo canvas filters', Icon: Image, color: '#E8829B' },
]

export default function SearchBar() {
  const openWindow = useDesktopStore(s => s.openWindow)
  const windows = useDesktopStore(s => s.windows)
  const currentWorkspace = useDesktopStore(s => s.currentWorkspace)
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const hasActiveWindow = windows.some(w => w.workspace === currentWorkspace && !w.minimized)

  const filtered = query.trim()
    ? APPS.filter(a => `${a.title} ${a.kw}`.toLowerCase().includes(query.toLowerCase()))
    : APPS

  // Close on outside click
  useEffect(() => {
    if (!focused) return
    const handler = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [focused])

  // Global shortcut to focus
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setFocused(true)
      }
      if (e.key === 'Escape') { setFocused(false); setQuery(''); inputRef.current?.blur() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && filtered[selectedIdx]) {
      openWindow(filtered[selectedIdx].id, filtered[selectedIdx].title)
      setFocused(false); setQuery('')
    }
  }

  // Hide search bar on mobile when an app window is open to avoid blocking window controls
  if (isMobile && hasActiveWindow && !focused) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className="syau-search-bar"
      style={{
        position: 'fixed',
        top: isMobile ? 38 : 46,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 110,
        width: focused
          ? 'min(600px, calc(100vw - 20px))'
          : 'min(420px, calc(100vw - 28px))',
        transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* Search input */}
      <div style={{
        background: focused
          ? 'linear-gradient(135deg, rgba(8,10,20,0.85) 0%, rgba(4,5,12,0.92) 50%, rgba(10,12,22,0.85) 100%)'
          : 'linear-gradient(135deg, rgba(8,10,20,0.55) 0%, rgba(4,5,12,0.6) 50%, rgba(10,12,22,0.55) 100%)',
        backdropFilter: focused ? 'blur(40px) saturate(2) brightness(1.2)' : 'blur(24px) saturate(1.5) brightness(1.1)',
        borderRadius: focused ? 14 : 18,
        border: focused ? '1px solid rgba(232,130,155,0.25)' : '1px solid rgba(255,255,255,0.08)',
        boxShadow: focused
          ? '0 12px 48px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.08) inset, 0 0 40px rgba(232,130,155,0.08)'
          : '0 4px 20px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.05) inset',
        transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Shimmer sweep */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.02) 42%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.02) 58%, transparent 65%)',
          animation: 'shimmer-sweep 20s ease-in-out infinite',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', padding: isMobile ? '8px 12px' : '10px 14px', gap: 8 }}>
          <Search size={14} style={{ color: focused ? 'var(--color-sakura)' : 'var(--color-text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIdx(0) }}
            onFocus={() => setFocused(true)}
            onKeyDown={handleKey}
            placeholder="Search apps or launch..."
            spellCheck={false}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--color-text-primary)', fontSize: isMobile ? 12 : 13, fontWeight: 500,
              fontFamily: 'var(--font-sans)', caretColor: 'var(--color-sakura)', minWidth: 0,
            }}
          />
          {focused || query ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setQuery('')
                setFocused(false)
                inputRef.current?.blur()
              }}
              title="Close search"
              style={{
                background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%',
                width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--color-text-secondary)', padding: 0, flexShrink: 0,
              }}
            >
              <X size={12} />
            </button>
          ) : (
            <span style={{
              fontSize: 9, fontWeight: 700, color: 'var(--color-text-muted)',
              background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.06)', letterSpacing: 0.5, flexShrink: 0,
            }}>
              ⌘K
            </span>
          )}
        </div>

        {/* Results dropdown */}
        <AnimatePresence>
          {focused && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '4px', maxHeight: isMobile ? 220 : 280, overflowY: 'auto' }}>
                {filtered.map((a, i) => {
                  const ItemIcon = a.Icon
                  return (
                    <div
                      key={a.id}
                      onClick={() => { openWindow(a.id, a.title); setFocused(false); setQuery('') }}
                      onMouseEnter={() => setSelectedIdx(i)}
                      style={{
                        padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                        background: i === selectedIdx ? 'rgba(232,130,155,0.12)' : 'transparent',
                        display: 'flex', alignItems: 'center', gap: 10,
                        transition: 'background 0.1s',
                      }}
                    >
                      <div style={{
                        width: 24, height: 24, borderRadius: 6,
                        background: 'rgba(255,255,255,0.06)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <ItemIcon size={14} style={{ color: a.color }} />
                      </div>
                      <span style={{
                        fontSize: 13, fontWeight: i === selectedIdx ? 600 : 400,
                        color: i === selectedIdx ? 'var(--color-sakura)' : 'var(--color-text-secondary)',
                      }}>{a.title}</span>
                    </div>
                  )
                })}
                {filtered.length === 0 && (
                  <div style={{ padding: '12px', color: 'var(--color-text-muted)', fontSize: 12, textAlign: 'center' }}>
                    No apps found
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

