import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Terminal, FileText, Calculator, Music, Image, Globe,
  BookOpen, Settings as SettingsIcon, Folder, ShoppingBag, CloudSun,
  Kanban, Timer, Keyboard, Palette, File, Video
} from 'lucide-react'
import { useDesktopStore } from '../store/desktopStore'

const renderAppIcon = (appId: string, size = 22) => {
  switch (appId) {
    case 'about': return <User size={size} style={{ color: 'var(--color-sakura)' }} />
    case 'capture':
    case 'recorder': return <Video size={size} style={{ color: '#E8829B' }} />
    case 'terminal': return <Terminal size={size} style={{ color: '#86EFAC' }} />
    case 'notes': return <FileText size={size} style={{ color: '#FDBA74' }} />
    case 'calculator': return <Calculator size={size} style={{ color: '#7EDDD6' }} />
    case 'music': return <Music size={size} style={{ color: '#C4B5FD' }} />
    case 'gallery': return <Image size={size} style={{ color: '#F472B6' }} />
    case 'browser': return <Globe size={size} style={{ color: '#38BDF8' }} />
    case 'guide': return <BookOpen size={size} style={{ color: '#FBBF24' }} />
    case 'settings': return <SettingsIcon size={size} style={{ color: '#94A3B8' }} />
    case 'files': return <Folder size={size} style={{ color: '#FBBF24' }} />
    case 'store': return <ShoppingBag size={size} style={{ color: '#EC4899' }} />
    case 'weather': return <CloudSun size={size} style={{ color: '#38BDF8' }} />
    case 'kanban': return <Kanban size={size} style={{ color: '#A78BFA' }} />
    case 'timer': return <Timer size={size} style={{ color: '#F87171' }} />
    case 'typing-speed': return <Keyboard size={size} style={{ color: '#34D399' }} />
    case 'paint-studio': return <Palette size={size} style={{ color: '#F43F5E' }} />
    case 'image-editor': return <Image size={size} style={{ color: '#06B6D4' }} />
    default: return <File size={size} style={{ color: 'var(--color-text-secondary)' }} />
  }
}

export default function WindowSwitcher() {
  const [active, setActive] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const windows = useDesktopStore(s => s.windows)
  const currentWorkspace = useDesktopStore(s => s.currentWorkspace)
  const focusWindow = useDesktopStore(s => s.focusWindow)

  const visibleWindows = windows.filter(w => w.workspace === currentWorkspace && !w.minimized)

  // Listen for external open trigger (from top bar button)
  useEffect(() => {
    const handler = () => {
      if (visibleWindows.length > 1) {
        setActive(true)
        setSelectedIdx(0)
      }
    }
    window.addEventListener('syau-switch-windows', handler)
    return () => window.removeEventListener('syau-switch-windows', handler)
  }, [visibleWindows.length])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ctrl+Shift+A to open, Tab to cycle
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      e.preventDefault()
      if (visibleWindows.length > 1) {
        setActive(true)
        setSelectedIdx(0)
      }
    }
    if (active && e.key === 'Tab') {
      e.preventDefault()
      const dir = e.shiftKey ? -1 : 1
      setSelectedIdx(i => (i + dir + visibleWindows.length) % visibleWindows.length)
    }
    if (active && e.key === 'Escape') {
      e.preventDefault()
      setActive(false)
      setSelectedIdx(0)
    }
  }, [active, visibleWindows.length])

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Shift' && active) {
      e.preventDefault()
      const win = visibleWindows[selectedIdx]
      if (win) focusWindow(win.id)
      setActive(false)
      setSelectedIdx(0)
    }
  }, [active, selectedIdx, visibleWindows, focusWindow])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  return (
    <AnimatePresence>
      {active && visibleWindows.length > 0 && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9000,
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(8px)',
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9001,
              display: 'flex', gap: 8, padding: 12,
              background: 'rgba(16, 18, 30, 0.92)',
              backdropFilter: 'blur(40px) saturate(1.8)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            {visibleWindows.map((win, i) => (
              <motion.div
                key={win.id}
                layout
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
                  background: i === selectedIdx ? 'rgba(232,130,155,0.12)' : 'transparent',
                  border: i === selectedIdx ? '1px solid rgba(232,130,155,0.25)' : '1px solid transparent',
                  transition: 'all 0.12s ease',
                  minWidth: 90,
                }}
                onClick={() => { focusWindow(win.id); setActive(false) }}
                onMouseEnter={() => setSelectedIdx(i)}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${i === selectedIdx ? 'rgba(232,130,155,0.2)' : 'rgba(255,255,255,0.05)'}`,
                  transition: 'all 0.12s ease',
                }}>
                  {renderAppIcon(win.appId, 22)}
                </div>
                <div style={{
                  fontSize: 11, color: i === selectedIdx ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
                  fontWeight: i === selectedIdx ? 600 : 400,
                  textAlign: 'center', maxWidth: 80,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  transition: 'color 0.12s ease',
                }}>
                  {win.title}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', bottom: 60, left: '50%', transform: 'translateX(-50%)',
              zIndex: 9001, fontSize: 11, color: 'rgba(255,255,255,0.3)',
              fontFamily: 'var(--font-mono)', pointerEvents: 'none',
            }}
          >
            Release Alt to switch · Tab to cycle
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
