import { useState, useEffect, useRef } from 'react'
import { Wifi, Battery, Volume2, Sun, Moon, BookOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDesktopStore } from '../store/desktopStore'
import { useThemeStore } from '../store/themeStore'

export default function TopBar() {
  const [time, setTime] = useState(new Date())
  const [menuOpen, setMenuOpen] = useState<'logo' | 'app' | null>(null)
  const [logoClicks, setLogoClicks] = useState(0)
  const [rainbow, setRainbow] = useState(false)
  const activeWindowId = useDesktopStore(s => s.activeWindowId)
  const windows = useDesktopStore(s => s.windows)
  const openWindow = useDesktopStore(s => s.openWindow)
  const currentWorkspace = useDesktopStore(s => s.currentWorkspace)
  const maxWorkspaces = useDesktopStore(s => s.maxWorkspaces)
  const switchWorkspace = useDesktopStore(s => s.switchWorkspace)
  const { mode, toggleMode } = useThemeStore()

  const activeWin = windows.find(w => w.id === activeWindowId)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const appName = activeWin?.title || 'स्याउ OS'

  const logoMenuItems = [
    { label: 'Creator Profile (Susant)', action: () => { openWindow('creator', 'Kantaraj Luitel (Susant) - Creator Profile', 860, 580); setMenuOpen(null) } },
    { label: 'About स्याउ OS', action: () => { openWindow('about', 'About Me', 480, 540); setMenuOpen(null) } },
    { label: 'Devlogs (3 Entries)', action: () => { openWindow('devlogs', 'Devlogs', 840, 560); setMenuOpen(null) } },
    { label: 'Settings', action: () => { openWindow('settings', 'Settings', 460, 520); setMenuOpen(null) } },
    { divider: true },
    { label: 'Terminal', action: () => { openWindow('terminal', 'Terminal', 600, 400); setMenuOpen(null) } },
  ]

  return (
    <div className="top-bar" ref={menuRef} style={rainbow ? { background: 'linear-gradient(90deg, #ff0000, #ff7700, #ffff00, #00ff00, #0077ff, #7700ff, #ff0000)', backgroundSize: '400% 100%', animation: 'rainbow-slide 2s linear infinite' } : undefined}>
      <div className="top-bar-left" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div
          className="top-bar-logo"
          style={{
            cursor: 'pointer', padding: '2px 8px', borderRadius: 6, transition: 'background 0.15s',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
          onClick={() => {
            setMenuOpen(menuOpen === 'logo' ? null : 'logo')
            const next = logoClicks + 1
            setLogoClicks(next)
            if (next >= 10) {
              setRainbow(true)
              setLogoClicks(0)
              setTimeout(() => setRainbow(false), 5000)
            }
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(232,130,155,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <img src="/syauOS.png" alt="स्याउ OS" style={{ width: 18, height: 18, objectFit: 'contain' }} />
          <span className="font-syau" style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>स्याउ</span>
          <span className="font-os" style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-sakura)', letterSpacing: '0.08em' }}>OS</span>
        </div>

        {/* Logo dropdown */}
        <AnimatePresence>
          {menuOpen === 'logo' && (
            <motion.div
              className="topbar-dropdown"
              initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{ transformOrigin: 'top left' }}
            >
              {logoMenuItems.map((item, i) => {
                if ('divider' in item) return <div key={i} className="topbar-dropdown-divider" />
                return (
                  <div key={i} className="topbar-dropdown-item" onClick={item.action}>
                    {item.label}
                  </div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ position: 'relative', marginLeft: 6 }}>
          <span className="top-bar-menu font-body" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{appName}</span>
          {/* Active app underline */}
          <div style={{
            position: 'absolute', bottom: -2, left: 0, right: 0, height: 2,
            background: 'var(--color-sakura)', borderRadius: 1,
            boxShadow: '0 0 8px rgba(232,130,155,0.4)',
            transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
          }} />
        </div>
      </div>

      <div className="top-bar-right" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Devlogs shortcut button */}
        <button
          onClick={() => openWindow('devlogs', 'Devlogs', 840, 560)}
          title="Open स्याउ OS Devlogs"
          className="topbar-hide-mobile"
          style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 6,
            background: 'var(--color-glass-card)', border: '1px solid var(--color-glass-border)',
            color: 'var(--color-text-secondary)', fontSize: 11, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <BookOpen size={12} style={{ color: 'var(--color-sakura)' }} />
          <span>Devlogs</span>
        </button>

        {/* Dark / Light Theme Mode Toggle Button */}
        <button
          onClick={toggleMode}
          title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} Mode`}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 26, height: 24, borderRadius: 6, border: '1px solid var(--color-glass-border)',
            background: 'var(--color-glass-card)', cursor: 'pointer',
            color: 'var(--color-text-primary)', transition: 'all 0.2s ease',
          }}
        >
          {mode === 'dark' ? <Sun size={13} style={{ color: '#FDBA74' }} /> : <Moon size={13} style={{ color: '#7E57C2' }} />}
        </button>

        {/* Window switcher button */}
        {windows.filter(w => w.workspace === currentWorkspace && !w.minimized).length > 1 && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('syau-switch-windows'))}
            title="Switch windows"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 26, height: 24, borderRadius: 6, border: '1px solid var(--color-glass-border)',
              background: 'var(--color-glass-card)', cursor: 'pointer',
              color: 'var(--color-text-secondary)', fontSize: 11,
              transition: 'all 0.15s',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="8" height="8" rx="1"/><rect x="14" y="3" width="8" height="8" rx="1"/><rect x="2" y="13" width="8" height="8" rx="1"/><rect x="14" y="13" width="8" height="8" rx="1"/></svg>
          </button>
        )}

        {/* Workspace indicator */}
        <div className="topbar-hide-mobile" style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '0 2px' }}>
          {Array.from({ length: maxWorkspaces }, (_, i) => i + 1).map(ws => {
            const hasWindows = windows.some(w => w.workspace === ws)
            return (
              <button key={ws} onClick={() => switchWorkspace(ws)} title={`Workspace ${ws} (Ctrl+${ws})`} style={{
                width: ws === currentWorkspace ? 20 : 7,
                height: 7,
                borderRadius: 4,
                border: 'none',
                cursor: 'pointer',
                background: ws === currentWorkspace
                  ? 'var(--color-sakura)'
                  : hasWindows
                    ? 'rgba(232,130,155,0.35)'
                    : 'rgba(255,255,255,0.15)',
                boxShadow: ws === currentWorkspace ? '0 0 8px rgba(232,130,155,0.4)' : 'none',
                transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                padding: 0,
              }}
              />
            )
          })}
        </div>

        <motion.div className="topbar-hide-small-mobile" animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
          <Battery size={13} />
        </motion.div>
        <motion.div className="topbar-hide-small-mobile" animate={{ opacity: [0.8, 1, 0.8] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
          <Wifi size={13} />
        </motion.div>
        <div className="topbar-hide-small-mobile">
          <Volume2 size={13} />
        </div>

        {/* Nepali BS Date Badge */}
        <span className="font-syau topbar-hide-mobile" style={{ fontSize: 11, color: 'var(--color-sakura)', background: 'rgba(232,130,155,0.1)', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
          २०८३ भाद्र १६
        </span>

        <span className="topbar-hide-mobile">{formatDate(time)}</span>
        <motion.span
          key={time.getMinutes()}
          style={{ fontWeight: 600 }}
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {formatTime(time)}
        </motion.span>
      </div>
    </div>
  )
}

