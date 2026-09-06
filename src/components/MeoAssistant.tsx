import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Compass, Send, X, Minimize2,
  Check, Sparkles
} from 'lucide-react'
import { useDesktopStore } from '../store/desktopStore'
import { useThemeStore } from '../store/themeStore'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  actionTriggered?: string
}

const APP_TITLES: Record<string, { title: string; w: number; h: number }> = {
  calculator: { title: 'Calculator', w: 320, h: 460 },
  notes: { title: 'Notes', w: 500, h: 450 },
  music: { title: 'Music Player', w: 720, h: 500 },
  terminal: { title: 'Terminal', w: 600, h: 400 },
  gallery: { title: 'Gallery', w: 600, h: 480 },
  browser: { title: 'Browser', w: 800, h: 560 },
  about: { title: 'About Me', w: 480, h: 520 },
  guide: { title: 'Guide', w: 500, h: 560 },
  settings: { title: 'Settings', w: 460, h: 520 },
  files: { title: 'Files', w: 640, h: 480 },
  capture: { title: 'Capture & Record', w: 820, h: 580 },
  creator: { title: 'Kantaraj Luitel (Susant) - Creator Profile', w: 860, h: 580 },
  devlogs: { title: 'स्याउ OS Devlogs', w: 840, h: 560 },
  store: { title: 'स्याउ Store', w: 420, h: 580 },
  studio: { title: 'Syau Studio', w: 920, h: 600 },
}

export default function MeoAssistant() {
  const [active, setActive] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      text: 'Namaste! I am Meo (स्याउ साथी), your offline desktop navigation companion. Type a command like "open terminal", "switch theme", or "shortcuts" to get started.',
    },
  ])
  const [inputText, setInputText] = useState('')

  const openWindow = useDesktopStore(s => s.openWindow)
  const closeWindow = useDesktopStore(s => s.closeWindow)
  const windows = useDesktopStore(s => s.windows)
  const switchWorkspace = useDesktopStore(s => s.switchWorkspace)
  const toggleTheme = useThemeStore(s => s.toggleMode)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Keyboard shortcut (Ctrl+M) & custom event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'm') {
        e.preventDefault()
        setActive(prev => !prev)
        setMinimized(false)
      }
      if (e.key === 'Escape' && active) {
        setActive(false)
      }
    }
    const handleToggleEvent = () => {
      setActive(prev => !prev)
      setMinimized(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('meo-toggle', handleToggleEvent)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('meo-toggle', handleToggleEvent)
    }
  }, [active])

  // Execute OS action tags
  const executeAction = useCallback((action: string): string | null => {
    const match = action.match(/\[ACTION:([^:]+)(?::([^\]]+))?\]/)
    if (!match) return null
    const [, verb, param] = match

    if (verb === 'open' && param && APP_TITLES[param]) {
      const meta = APP_TITLES[param]
      openWindow(param, meta.title, meta.w, meta.h)
      return `Opened ${meta.title}`
    }
    if (verb === 'close' && param) {
      const win = windows.find(w => w.appId === param)
      if (win) {
        closeWindow(win.id)
        return `Closed ${param}`
      }
    }
    if (verb === 'theme') {
      toggleTheme()
      return 'Toggled system theme mode'
    }
    if (verb === 'workspace' && param) {
      const ws = parseInt(param, 10)
      if (!isNaN(ws)) {
        switchWorkspace(ws)
        return `Switched to Workspace ${ws}`
      }
    }
    return null
  }, [openWindow, closeWindow, windows, toggleTheme, switchWorkspace])

  // 100% Client-Side Command Parser & OS Helper
  const processQuery = (query: string): { reply: string; action?: string } => {
    const q = query.toLowerCase().trim()

    // 1. Direct App Commands
    for (const [appId, meta] of Object.entries(APP_TITLES)) {
      if (q.includes(`open ${appId}`) || q.includes(`launch ${appId}`) || q.includes(`start ${appId}`) || q === appId) {
        return {
          reply: `Opening ${meta.title} on your active workspace.`,
          action: `[ACTION:open:${appId}]`,
        }
      }
    }

    if (q.includes('terminal') || q.includes('shell') || q.includes('bash')) {
      return { reply: 'Launching syau-sh terminal.', action: '[ACTION:open:terminal]' }
    }
    if (q.includes('music') || q.includes('song') || q.includes('spotify') || q.includes('playlist')) {
      return { reply: 'Launching Music Player Spotify Hub.', action: '[ACTION:open:music]' }
    }
    if (q.includes('note') || q.includes('write')) {
      return { reply: 'Opening Notes scratchpad.', action: '[ACTION:open:notes]' }
    }
    if (q.includes('calc') || q.includes('math')) {
      return { reply: 'Launching Calculator.', action: '[ACTION:open:calculator]' }
    }
    if (q.includes('code') || q.includes('studio') || q.includes('ide')) {
      return { reply: 'Opening Syau Studio code playground.', action: '[ACTION:open:studio]' }
    }
    if (q.includes('devlog') || q.includes('log') || q.includes('bug')) {
      return { reply: 'Opening SyauOS Devlogs and engineering notes.', action: '[ACTION:open:devlogs]' }
    }
    if (q.includes('theme') || q.includes('dark mode') || q.includes('light mode')) {
      return { reply: 'Switching system color theme.', action: '[ACTION:theme]' }
    }

    // Workspace switching
    const wsMatch = q.match(/workspace\s*([1-4])/)
    if (wsMatch) {
      return { reply: `Switching to virtual desktop workspace ${wsMatch[1]}.`, action: `[ACTION:workspace:${wsMatch[1]}]` }
    }

    // Shortcuts & Help
    if (q.includes('shortcut') || q.includes('key')) {
      return {
        reply: 'System Shortcuts:\n- Ctrl+K: Spotlight Search\n- Ctrl+M: Toggle Meo Companion\n- Drag window titlebar: Move window\n- TopBar date: Shows live Bikram Sambat date',
      }
    }
    if (q.includes('nepali') || q.includes('calendar') || q.includes('bikram') || q.includes('bs')) {
      return {
        reply: 'SyauOS features a custom client-side Bikram Sambat (BS) calendar engine with Devanagari numerals. Check the TopBar for today\'s date!',
      }
    }
    if (q.includes('who are you') || q.includes('what are you') || q.includes('meo')) {
      return {
        reply: 'I am Meo (स्याउ साथी), the native companion of स्याउ OS. I run 100% locally on your machine without external cloud dependencies or API keys.',
      }
    }
    if (q.includes('who made') || q.includes('creator') || q.includes('susant') || q.includes('kantaraj')) {
      return {
        reply: 'स्याउ OS was created by Kantaraj Luitel (Susant) — student developer from Nepal for the Hack Club Stardance showcase. Opening creator profile!',
        action: '[ACTION:open:creator]',
      }
    }
    if (q.includes('help') || q.includes('what can you do')) {
      return {
        reply: 'I can launch any app ("open terminal", "open devlogs", "open calculator"), toggle themes ("switch theme"), switch workspaces ("workspace 2"), or show system shortcuts ("shortcuts").',
      }
    }

    return {
      reply: `Command not recognized. Type "help" for a list of commands, or "open [app]" to launch apps directly.`,
    }
  }

  const handleSend = () => {
    const text = inputText.trim()
    if (!text) return

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setInputText('')

    const { reply, action } = processQuery(text)
    let actionResult: string | null = null
    if (action) {
      actionResult = executeAction(action)
    }

    const assistantMsg: Message = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      text: reply,
      actionTriggered: actionResult || undefined,
    }
    setMessages(prev => [...prev, assistantMsg])
  }

  if (!active) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        style={{
          position: 'fixed',
          bottom: 80,
          right: 24,
          width: minimized ? 260 : 380,
          height: minimized ? 52 : 520,
          background: 'rgba(16, 18, 28, 0.95)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(232, 130, 155, 0.25)',
          borderRadius: 16,
          boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 20px rgba(232,130,155,0.15)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '10px 14px',
          background: 'rgba(255,255,255,0.03)',
          borderBottom: minimized ? 'none' : '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 8,
              background: 'linear-gradient(135deg, var(--color-sakura) 0%, #C45A7C 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white',
            }}>
              <Compass size={15} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Meo <span style={{ fontSize: 11, color: 'var(--color-sakura)', fontWeight: 500 }}>(स्याउ साथी)</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => setMinimized(m => !m)}
              title={minimized ? 'Expand' : 'Minimize'}
              style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 4 }}
            >
              <Minimize2 size={14} />
            </button>
            <button
              onClick={() => setActive(false)}
              title="Close"
              style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 4 }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {!minimized && (
          <>
            {/* Status Indicator */}
            <div style={{ padding: '6px 14px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={11} style={{ color: 'var(--color-sakura)' }} />
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                Offline Desktop Companion · Zero API Keys Needed
              </span>
            </div>

            {/* Message History */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map(msg => {
                const isUser = msg.role === 'user'
                return (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '85%', padding: '8px 12px', borderRadius: 12, fontSize: 12.5, lineHeight: 1.5,
                      whiteSpace: 'pre-line',
                      background: isUser ? 'linear-gradient(135deg, var(--color-sakura) 0%, #C45A7C 100%)' : 'rgba(255,255,255,0.05)',
                      color: isUser ? 'white' : 'var(--color-text-primary)',
                      border: isUser ? 'none' : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: isUser ? '0 2px 10px rgba(232,130,155,0.3)' : 'none',
                    }}>
                      {msg.text}
                    </div>
                    {msg.actionTriggered && (
                      <div style={{ fontSize: 10, color: 'var(--color-mint)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Check size={10} /> {msg.actionTriggered}
                      </div>
                    )}
                  </div>
                )
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Action Chips */}
            <div style={{ display: 'flex', gap: 6, padding: '4px 14px', overflowX: 'auto', flexShrink: 0 }}>
              {[
                { label: 'Terminal', cmd: 'open terminal' },
                { label: 'Devlogs', cmd: 'open devlogs' },
                { label: 'Notes', cmd: 'open notes' },
                { label: 'Calculator', cmd: 'open calculator' },
                { label: 'Shortcuts', cmd: 'shortcuts' },
                { label: 'Theme', cmd: 'switch theme' },
              ].map(chip => (
                <button
                  key={chip.label}
                  onClick={() => {
                    setInputText(chip.cmd)
                    setTimeout(() => {
                      const text = chip.cmd
                      const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text }
                      setMessages(prev => [...prev, userMsg])
                      setInputText('')
                      const { reply, action } = processQuery(text)
                      let actionResult: string | null = null
                      if (action) {
                        actionResult = executeAction(action)
                      }
                      const assistantMsg: Message = {
                        id: `a-${Date.now()}`,
                        role: 'assistant',
                        text: reply,
                        actionTriggered: actionResult || undefined,
                      }
                      setMessages(prev => [...prev, assistantMsg])
                      speak(reply)
                    }, 50)
                  }}
                  style={{
                    padding: '3px 8px', borderRadius: 12,
                    background: 'rgba(232,130,155,0.1)', border: '1px solid rgba(232,130,155,0.2)',
                    color: 'var(--color-sakura)', fontSize: 10, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Type a command (e.g. 'open terminal', 'shortcuts')..."
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white', fontSize: 12, outline: 'none',
                }}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim()}
                style={{
                  padding: '8px 12px', borderRadius: 10,
                  background: inputText.trim() ? 'var(--color-sakura)' : 'rgba(255,255,255,0.05)',
                  border: 'none', color: 'white', cursor: inputText.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Send size={14} />
              </button>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
