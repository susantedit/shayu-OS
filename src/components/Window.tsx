import { useRef, useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDesktopStore } from '../store/desktopStore'
import type { WindowState } from '../store/desktopStore'

interface WindowProps {
  window: WindowState
  children: React.ReactNode
}

const APP_SHADOW_COLORS: Record<string, string> = {
  about: 'rgba(232,130,155,0.18)',
  terminal: 'rgba(126,221,214,0.18)',
  notes: 'rgba(253,186,116,0.16)',
  calculator: 'rgba(196,181,253,0.18)',
  music: 'rgba(232,130,155,0.22)',
  gallery: 'rgba(126,221,214,0.16)',
  browser: 'rgba(147,197,253,0.18)',
  files: 'rgba(147,197,253,0.18)',
  settings: 'rgba(155,136,158,0.16)',
  weather: 'rgba(147,197,253,0.18)',
  kanban: 'rgba(134,239,172,0.16)',
  timer: 'rgba(253,186,116,0.18)',
  'typing-speed': 'rgba(196,181,253,0.18)',
  'paint-studio': 'rgba(134,239,172,0.18)',
  'image-editor': 'rgba(232,130,155,0.18)',
  sysmon: 'rgba(74,222,128,0.18)',
  'nepali-converter': 'rgba(239,68,68,0.18)',
  'ambient-synth': 'rgba(99,102,241,0.18)',
  'generative-studio': 'rgba(244,114,182,0.22)',
}

type SnapZone = 'left' | 'right' | 'maximize' | null

export default function Window({ window: win, children }: WindowProps) {
  const {
    closeWindow, focusWindow, minimizeWindow, toggleMaximize,
    updateWindowPosition, updateWindowSize, snapWindow, restoreAndMoveWindow
  } = useDesktopStore()
  const activeWindowId = useDesktopStore(s => s.activeWindowId)
  const isActive = activeWindowId === win.id

  const winRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const [resizing, setResizing] = useState<string | null>(null)
  const [activeSnapZone, setActiveSnapZone] = useState<SnapZone>(null)

  const dragOffset = useRef({ x: 0, y: 0 })
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0, wx: 0, wy: 0 })
  const dragPos = useRef({ x: win.x, y: win.y })

  const accentColor = APP_SHADOW_COLORS[win.appId] || 'rgba(232,130,155,0.12)'
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const getSnapZone = useCallback((clientX: number, clientY: number): SnapZone => {
    if (isMobile) return null
    const TOP_ZONE = 34
    const EDGE_ZONE = 24
    if (clientY <= TOP_ZONE) return 'maximize'
    if (clientX <= EDGE_ZONE) return 'left'
    if (clientX >= window.innerWidth - EDGE_ZONE) return 'right'
    return null
  }, [isMobile])

  const onHeaderMouseDown = useCallback((e: React.MouseEvent) => {
    if (isMobile) return
    if ((e.target as HTMLElement).closest('button')) return
    e.preventDefault()

    focusWindow(win.id)

    let startX = win.x
    let startY = win.y

    if (win.maximized) {
      const restoredWidth = win.prevBounds?.width || Math.min(window.innerWidth - 100, 780)
      const restoredX = Math.max(10, Math.min(window.innerWidth - restoredWidth - 10, e.clientX - restoredWidth / 2))
      const restoredY = 34
      restoreAndMoveWindow(win.id, restoredX, restoredY)
      startX = restoredX
      startY = restoredY
      dragOffset.current = { x: e.clientX - restoredX, y: e.clientY - restoredY }
      dragPos.current = { x: restoredX, y: restoredY }
    } else {
      dragOffset.current = { x: e.clientX - win.x, y: e.clientY - win.y }
      dragPos.current = { x: win.x, y: win.y }
    }

    setDragging(true)
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'

    const el = winRef.current
    if (el) {
      el.style.transition = 'none'
      el.style.left = `${startX}px`
      el.style.top = `${startY}px`
    }
  }, [win.maximized, win.x, win.y, win.id, win.prevBounds, isMobile, focusWindow, restoreAndMoveWindow])

  useEffect(() => {
    if (!dragging) return

    const el = winRef.current

    const onMouseMove = (e: MouseEvent) => {
      const currentX = Math.max(-win.width + 100, Math.min(window.innerWidth - 80, e.clientX - dragOffset.current.x))
      const currentY = Math.max(34, Math.min(window.innerHeight - 50, e.clientY - dragOffset.current.y))

      dragPos.current = { x: currentX, y: currentY }

      if (el) {
        el.style.left = `${currentX}px`
        el.style.top = `${currentY}px`
      }

      const zone = getSnapZone(e.clientX, e.clientY)
      setActiveSnapZone(zone)
    }

    const onMouseUp = (e: MouseEvent) => {
      setDragging(false)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''

      const finalZone = getSnapZone(e.clientX, e.clientY)
      setActiveSnapZone(null)

      if (finalZone) {
        snapWindow(win.id, finalZone)
      } else {
        updateWindowPosition(win.id, dragPos.current.x, dragPos.current.y)
      }

      if (el) {
        el.style.transition = ''
      }
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [dragging, win.id, win.width, getSnapZone, snapWindow, updateWindowPosition])

  const onResizeStart = useCallback((e: React.MouseEvent, handle: string) => {
    if (win.maximized || isMobile) return
    e.preventDefault()
    e.stopPropagation()

    focusWindow(win.id)
    setResizing(handle)
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      w: win.width,
      h: win.height,
      wx: win.x,
      wy: win.y,
    }

    document.body.style.userSelect = 'none'
  }, [win.maximized, win.width, win.height, win.x, win.y, win.id, isMobile, focusWindow])

  useEffect(() => {
    if (!resizing) return
    const el = winRef.current
    if (!el) return

    el.style.transition = 'none'

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - resizeStart.current.x
      const dy = e.clientY - resizeStart.current.y
      let newW = resizeStart.current.w
      let newH = resizeStart.current.h
      let newX = resizeStart.current.wx
      let newY = resizeStart.current.wy

      if (resizing.includes('e')) newW = Math.max(340, resizeStart.current.w + dx)
      if (resizing.includes('w')) {
        newW = Math.max(340, resizeStart.current.w - dx)
        newX = resizeStart.current.wx + dx
      }
      if (resizing.includes('s')) newH = Math.max(220, resizeStart.current.h + dy)
      if (resizing.includes('n')) {
        newH = Math.max(220, resizeStart.current.h - dy)
        newY = Math.max(34, resizeStart.current.wy + dy)
      }

      el.style.width = `${newW}px`
      el.style.height = `${newH}px`
      if (resizing.includes('w') || resizing.includes('n')) {
        el.style.left = `${newX}px`
        el.style.top = `${newY}px`
      }
    }

    const onMouseUp = () => {
      setResizing(null)
      document.body.style.userSelect = ''

      if (el) {
        const finalW = parseInt(el.style.width, 10) || win.width
        const finalH = parseInt(el.style.height, 10) || win.height
        const finalX = parseInt(el.style.left, 10) || win.x
        const finalY = parseInt(el.style.top, 10) || win.y

        updateWindowSize(win.id, finalW, finalH)
        updateWindowPosition(win.id, finalX, finalY)
        el.style.transition = ''
      }
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      document.body.style.userSelect = ''
    }
  }, [resizing, win.id, win.width, win.height, win.x, win.y, updateWindowSize, updateWindowPosition])

  useEffect(() => {
    if (!isActive || !win.maximized) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleMaximize(win.id)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isActive, win.maximized, win.id, toggleMaximize])

  if (win.minimized) return null

  const windowShadow = isActive
    ? '0 16px 40px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.12)'
    : '0 8px 24px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.06)'


  return (
    <>
      <motion.div
        ref={winRef}
        className={`window ${isActive ? 'active' : ''} ${win.maximized || isMobile ? 'maximized' : ''} ${dragging ? 'is-dragging' : ''}`}
        style={{
          left: (win.maximized || isMobile) ? 0 : Math.max(0, Math.min(window.innerWidth - 80, win.x)),
          top: (win.maximized || isMobile) ? 34 : win.y,
          width: (win.maximized || isMobile) ? '100vw' : win.width,
          maxWidth: '100vw',
          height: (win.maximized || isMobile) ? 'calc(100dvh - 34px)' : win.height,
          maxHeight: 'calc(100dvh - 34px)',
          zIndex: win.zIndex,
          boxShadow: windowShadow,
          opacity: isActive ? 1 : 0.96,
        }}
        initial={{
          opacity: 0,
          scale: 0.96,
          y: 8,
        }}
        animate={{
          opacity: isActive ? 1 : 0.96,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.95,
          y: 4,
          transition: { duration: 0.12, ease: [0.2, 0, 0, 1] },
        }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        onMouseDown={() => focusWindow(win.id)}
      >
        <div
          className="window-header"
          onMouseDown={onHeaderMouseDown}
          onDoubleClick={() => !isMobile && toggleMaximize(win.id)}
          style={{ cursor: dragging ? 'grabbing' : 'default' }}
        >
          <div className="window-traffic-lights">
            <button
              className="traffic-light close"
              onClick={(e) => { e.stopPropagation(); closeWindow(win.id) }}
              title="Close window"
              aria-label="Close window"
            >
              <svg viewBox="0 0 7 7"><path d="M1.5 1.5l4 4M5.5 1.5l-4 4" stroke="rgba(0,0,0,0.6)" strokeWidth="1.3" fill="none"/></svg>
            </button>
            <button
              className="traffic-light minimize"
              onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id) }}
              title="Minimize window"
              aria-label="Minimize window"
            >
              <svg viewBox="0 0 7 7"><path d="M1.5 3.5h4" stroke="rgba(0,0,0,0.6)" strokeWidth="1.3" fill="none"/></svg>
            </button>
            {!isMobile && (
              <button
                className="traffic-light maximize"
                onClick={(e) => { e.stopPropagation(); toggleMaximize(win.id) }}
                title={win.maximized ? 'Restore window' : 'Maximize window'}
                aria-label={win.maximized ? 'Restore window' : 'Maximize window'}
              >
                <svg viewBox="0 0 7 7"><path d="M1.5 1.5h4v4h-4z" stroke="rgba(0,0,0,0.6)" strokeWidth="1.3" fill="none"/></svg>
              </button>
            )}
          </div>
          <div className="window-title">{win.title}</div>
        </div>

        <div
          className="window-content"
          style={{ pointerEvents: (dragging || resizing) ? 'none' : 'auto' }}
        >
          {children}
        </div>

        {!win.maximized && !isMobile && (
          <>
            <div className="resize-handle resize-handle-e" onMouseDown={e => onResizeStart(e, 'e')} />
            <div className="resize-handle resize-handle-s" onMouseDown={e => onResizeStart(e, 's')} />
            <div className="resize-handle resize-handle-se" onMouseDown={e => onResizeStart(e, 'se')} />
            <div className="resize-handle resize-handle-w" onMouseDown={e => onResizeStart(e, 'w')} />
            <div className="resize-handle resize-handle-n" onMouseDown={e => onResizeStart(e, 'n')} />
            <div className="resize-handle resize-handle-sw" onMouseDown={e => onResizeStart(e, 'sw')} />
            <div className="resize-handle resize-handle-ne" onMouseDown={e => onResizeStart(e, 'ne')} />
            <div className="resize-handle resize-handle-nw" onMouseDown={e => onResizeStart(e, 'nw')} />
          </>
        )}
      </motion.div>

      {dragging && activeSnapZone && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          <motion.div
            key={activeSnapZone}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              zIndex: 9999,
              pointerEvents: 'none',
              borderRadius: 16,
              background: 'rgba(232, 130, 155, 0.10)',
              border: '2px solid rgba(232, 130, 155, 0.55)',
              boxShadow: '0 0 30px rgba(232, 130, 155, 0.25), inset 0 0 20px rgba(232, 130, 155, 0.1)',
              backdropFilter: 'blur(12px)',
              ...(activeSnapZone === 'maximize' && {
                top: 40,
                left: 10,
                width: 'calc(100vw - 20px)',
                height: 'calc(100vh - 54px)',
              }),
              ...(activeSnapZone === 'left' && {
                top: 40,
                left: 10,
                width: 'calc(50vw - 15px)',
                height: 'calc(100vh - 54px)',
              }),
              ...(activeSnapZone === 'right' && {
                top: 40,
                left: 'calc(50vw + 5px)',
                width: 'calc(50vw - 15px)',
                height: 'calc(100vh - 54px)',
              }),
            }}
          />
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
