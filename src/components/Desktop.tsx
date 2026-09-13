import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, BookOpen, Terminal as TermIcon,
  FileText, Settings as SettingsIcon,
  Calendar, LayoutGrid, Image as ImageIcon, Plus,
  Calculator as CalcIcon, Upload
} from 'lucide-react'
import { useDesktopStore, useNotificationStore } from '../store/desktopStore'
import { useThemeStore } from '../store/themeStore'
import { useFileSystem } from '../store/fileSystem'
import { mediaUrl } from '../config'

export interface DesktopIconItem {
  id: string
  name: string
  appId?: string
  fileId?: string
  iconType: 'app' | 'file' | 'folder' | 'image'
  gridCol: number
  gridRow: number
  color?: string
}

const DEFAULT_DESKTOP_ICONS: DesktopIconItem[] = [
  { id: 'icon-nepali', name: 'पात्रो / Units', appId: 'nepali-converter', iconType: 'app', gridCol: 0, gridRow: 0, color: '#EF4444' },
  { id: 'icon-terminal', name: 'Terminal', appId: 'terminal', iconType: 'app', gridCol: 0, gridRow: 1, color: 'var(--color-miku)' },
  { id: 'icon-notes', name: 'Notes', appId: 'notes', iconType: 'app', gridCol: 0, gridRow: 2, color: 'var(--color-peach)' },
  { id: 'icon-calculator', name: 'Calculator', appId: 'calculator', iconType: 'app', gridCol: 0, gridRow: 3, color: 'var(--color-lavender)' },
  { id: 'icon-devlogs', name: 'Devlogs', appId: 'devlogs', iconType: 'app', gridCol: 0, gridRow: 4, color: 'var(--color-sakura)' },
  { id: 'icon-settings', name: 'Settings', appId: 'settings', iconType: 'app', gridCol: 1, gridRow: 0, color: 'var(--color-text-secondary)' },
  { id: 'icon-about', name: 'About Me', appId: 'about', iconType: 'app', gridCol: 1, gridRow: 1, color: 'var(--color-sakura)' },
]

const GRID_W = 86
const GRID_H = 94
const MARGIN_X = 20
const MARGIN_Y = 46

export default function Desktop() {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [bgMode, setBgMode] = useState<'dark' | 'static' | 'live' | 'custom' | 'generative'>(() => (localStorage.getItem('syau-os-bg') as any) || 'dark')
  const [wallpaper, setWallpaper] = useState(() => localStorage.getItem('syau-os-wallpaper') || 'wall-1')
  const [liveWall, setLiveWall] = useState(() => localStorage.getItem('syau-os-live-wall') || 'live-1')
  const customWallpaper = useThemeStore(s => s.customWallpaper)
  const wallpaperBlur = useThemeStore(s => s.wallpaperBlur)
  const wallpaperDim = useThemeStore(s => s.wallpaperDim)
  const openWindow = useDesktopStore(s => s.openWindow)
  const addNotif = useNotificationStore(s => s.add)

  const desktopRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const genCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const mousePosRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 })
  const orb1Ref = useRef<HTMLDivElement>(null)
  const orb2Ref = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const [icons, setIcons] = useState<DesktopIconItem[]>(() => {
    try {
      const saved = localStorage.getItem('syau-desktop-icons')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return DEFAULT_DESKTOP_ICONS
  })

  const [selectedIconId, setSelectedIconId] = useState<string | null>(null)
  const [draggingIconId, setDraggingIconId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [ghostSlot, setGhostSlot] = useState<{ col: number; row: number } | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  const dragStartRef = useRef<{ clientX: number; clientY: number; initialX: number; initialY: number } | null>(null)

  const saveIcons = useCallback((newIcons: DesktopIconItem[]) => {
    setIcons(newIcons)
    localStorage.setItem('syau-desktop-icons', JSON.stringify(newIcons))
  }, [])

  const fsNodes = useFileSystem(s => s.nodes)
  useEffect(() => {
    const desktopFiles = fsNodes.filter(n => n.parentId === 'fs-desktop')
    if (desktopFiles.length === 0) return

    setIcons(prev => {
      let changed = false
      const maxRows = Math.max(1, Math.floor((window.innerHeight - MARGIN_Y - 90) / GRID_H))
      const occupied = new Set(prev.map(i => `${i.gridCol},${i.gridRow}`))
      const next = [...prev]

      for (const node of desktopFiles) {
        if (!next.some(i => i.fileId === node.id)) {
          let col = 0, row = 0
          while (occupied.has(`${col},${row}`)) {
            row++
            if (row >= maxRows) {
              row = 0
              col++
            }
          }
          occupied.add(`${col},${row}`)
          const isImg = node.mimeType?.startsWith('image/')
          next.push({
            id: `file-${node.id}`,
            name: node.name,
            fileId: node.id,
            iconType: isImg ? 'image' : 'file',
            gridCol: col,
            gridRow: row,
            color: isImg ? '#E8829B' : 'var(--color-peach)',
          })
          changed = true
        }
      }

      if (changed) {
        localStorage.setItem('syau-desktop-icons', JSON.stringify(next))
        return next
      }
      return prev
    })
  }, [fsNodes])

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.mode) setBgMode(detail.mode)
      if (detail?.wallpaper) setWallpaper(detail.wallpaper)
      if (detail?.liveWall) setLiveWall(detail.liveWall)
    }
    window.addEventListener('syau-os-bg-change', handler)
    return () => window.removeEventListener('syau-os-bg-change', handler)
  }, [])

  useEffect(() => {
    const el = desktopRef.current
    if (!el) return
    let raf = 0
    const onMove = (e: MouseEvent) => {
      mousePosRef.current.x = e.clientX
      mousePosRef.current.y = e.clientY
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        const nx = ((e.clientX - rect.left) / rect.width - 0.5) * -10
        const ny = ((e.clientY - rect.top) / rect.height - 0.5) * -10
        if (bgRef.current) bgRef.current.style.transform = `translate(${nx}px, ${ny}px)`
        if (orb1Ref.current) orb1Ref.current.style.transform = `translate(${nx * 2}px, ${ny * 2}px)`
        if (orb2Ref.current) orb2Ref.current.style.transform = `translate(${nx * 1.5}px, ${ny * 1.5}px)`
        if (glowRef.current) {
          glowRef.current.style.transform = `translate3d(${e.clientX - 200}px, ${e.clientY - 200}px, 0)`
        }
      })
    }
    el.addEventListener('mousemove', onMove, { passive: true })
    return () => { el.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])

  useEffect(() => {
    if (bgMode !== 'generative') return
    const canvas = genCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let time = 0
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const colors = ['#E8829B', '#F472B6', '#FB7185', '#FDA4AF', '#E11D48']
    const count = 1200
    const pts: Array<{ x: number; y: number; vx: number; vy: number; color: string }> = []
    for (let i = 0; i < count; i++) {
      pts.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    const onResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    const loop = () => {
      raf = requestAnimationFrame(loop)
      time += 0.008

      ctx.fillStyle = 'rgba(9, 7, 11, 0.07)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const mx = mousePosRef.current.x
      const my = mousePosRef.current.y
      const scale = 0.003

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]
        const X = Math.floor(p.x * scale + time * 0.15) & 255
        const Y = Math.floor(p.y * scale) & 255
        const s = Math.sin(X * 12.9898 + Y * 78.233) * 43758.5453
        const angle = (s - Math.floor(s)) * Math.PI * 2 + Math.sin(time) * 0.2

        p.vx += Math.cos(angle) * 0.28
        p.vy += Math.sin(angle) * 0.28

        if (mx > 0 && my > 0) {
          const dx = mx - p.x
          const dy = my - p.y
          const dist = Math.hypot(dx, dy)
          if (dist < 220 && dist > 5) {
            const force = (1 - dist / 220) * 0.8
            p.vx += (-dy / dist) * force * 3
            p.vy += (dx / dist) * force * 3
          }
        }

        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.94
        p.vy *= 0.94

        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    loop()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [bgMode])

  const handleCleanUpIcons = useCallback(() => {
    const maxRows = Math.max(1, Math.floor((window.innerHeight - MARGIN_Y - 90) / GRID_H))
    const arranged = icons.map((item, idx) => ({
      ...item,
      gridCol: Math.floor(idx / maxRows),
      gridRow: idx % maxRows,
    }))
    saveIcons(arranged)
    addNotif('Cleaned up and organized desktop icons', 'grid', 2200)
    setContextMenu(null)
  }, [icons, saveIcons, addNotif])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDraggingOver) setIsDraggingOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget.contains(e.relatedTarget as Node)) return
    setIsDraggingOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    const fs = useFileSystem.getState()
    const maxRows = Math.max(1, Math.floor((window.innerHeight - MARGIN_Y - 90) / GRID_H))

    for (const file of files) {
      let content = ''
      const isImg = file.type.startsWith('image/')

      try {
        if (isImg) {
          content = await new Promise((res, rej) => {
            const reader = new FileReader()
            reader.onload = () => res(String(reader.result))
            reader.onerror = rej
            reader.readAsDataURL(file)
          })
        } else {
          content = await new Promise((res, rej) => {
            const reader = new FileReader()
            reader.onload = () => res(String(reader.result))
            reader.onerror = rej
            reader.readAsText(file)
          })
        }

        const node = await fs.createFile(file.name, 'fs-desktop', content, file.type || 'text/plain')

        setIcons(prev => {
          const occupied = new Set(prev.map(i => `${i.gridCol},${i.gridRow}`))
          let col = 0, row = 0
          while (occupied.has(`${col},${row}`)) {
            row++
            if (row >= maxRows) {
              row = 0
              col++
            }
          }
          const newIcon: DesktopIconItem = {
            id: `file-${node.id}`,
            name: node.name,
            fileId: node.id,
            iconType: isImg ? 'image' : 'file',
            gridCol: col,
            gridRow: row,
            color: isImg ? '#E8829B' : 'var(--color-peach)',
          }
          const next = [...prev, newIcon]
          localStorage.setItem('syau-desktop-icons', JSON.stringify(next))
          return next
        })

        addNotif(`Imported "${file.name}" to Desktop`, 'file', 3000)
      } catch (err) {
        addNotif(`Failed to import "${file.name}"`, 'alert', 3000)
      }
    }
  }

  const handleIconPointerDown = (e: React.PointerEvent, icon: DesktopIconItem) => {
    e.stopPropagation()
    setSelectedIconId(icon.id)
    setDraggingIconId(icon.id)

    const initialX = MARGIN_X + icon.gridCol * GRID_W
    const initialY = MARGIN_Y + icon.gridRow * GRID_H

    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialX,
      initialY,
    }
    setDragOffset({ x: 0, y: 0 })
    setGhostSlot({ col: icon.gridCol, row: icon.gridRow })

    const targetEl = e.currentTarget as HTMLElement
    try { targetEl.setPointerCapture(e.pointerId) } catch {}
  }

  const handleIconPointerMove = (e: React.PointerEvent) => {
    if (!draggingIconId || !dragStartRef.current) return
    const dx = e.clientX - dragStartRef.current.clientX
    const dy = e.clientY - dragStartRef.current.clientY
    setDragOffset({ x: dx, y: dy })

    const targetX = dragStartRef.current.initialX + dx
    const targetY = dragStartRef.current.initialY + dy

    const col = Math.max(0, Math.round((targetX - MARGIN_X) / GRID_W))
    const maxRows = Math.max(1, Math.floor((window.innerHeight - MARGIN_Y - 90) / GRID_H))
    const row = Math.max(0, Math.min(maxRows - 1, Math.round((targetY - MARGIN_Y) / GRID_H)))

    setGhostSlot({ col, row })
  }

  const handleIconPointerUp = (e: React.PointerEvent, icon: DesktopIconItem) => {
    if (!draggingIconId || !dragStartRef.current) return
    const dx = e.clientX - dragStartRef.current.clientX
    const dy = e.clientY - dragStartRef.current.clientY

    const targetEl = e.currentTarget as HTMLElement
    try { targetEl.releasePointerCapture(e.pointerId) } catch {}

    const dist = Math.hypot(dx, dy)
    if (dist < 5) {
      setDraggingIconId(null)
      setGhostSlot(null)
      return
    }

    if (ghostSlot) {
      const nextIcons = icons.map(item => {
        if (item.id === icon.id) {
          return { ...item, gridCol: ghostSlot.col, gridRow: ghostSlot.row }
        }
        if (item.gridCol === ghostSlot.col && item.gridRow === ghostSlot.row) {
          return { ...item, gridCol: icon.gridCol, gridRow: icon.gridRow }
        }
        return item
      })
      saveIcons(nextIcons)
    }

    setDraggingIconId(null)
    setDragOffset({ x: 0, y: 0 })
    setGhostSlot(null)
    dragStartRef.current = null
  }

  const handleOpenIcon = (icon: DesktopIconItem) => {
    if (icon.appId) {
      const appConfigs: Record<string, { title: string; w: number; h: number }> = {
        'nepali-converter': { title: 'नेपाली पात्रो र एकाइ रूपान्तरण (Nepali Calendar & Units)', w: 780, h: 560 },
        terminal: { title: 'Terminal', w: 600, h: 400 },
        notes: { title: 'Notes', w: 640, h: 480 },
        calculator: { title: 'Calculator', w: 320, h: 460 },
        devlogs: { title: 'स्याउ OS Devlogs', w: 800, h: 540 },
        about: { title: 'About Me', w: 480, h: 520 },
        settings: { title: 'Settings', w: 580, h: 480 },
      }
      const cfg = appConfigs[icon.appId] || { title: icon.name, w: 640, h: 480 }
      openWindow(icon.appId, cfg.title, cfg.w, cfg.h)
    } else if (icon.fileId) {
      const node = useFileSystem.getState().getNode(icon.fileId)
      if (node) {
        openWindow('notes', 'Notes - ' + node.name, 640, 480)
      }
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    const menuWidth = 220
    const menuHeight = 320
    const pad = 12
    const x = Math.min(e.clientX, Math.max(pad, window.innerWidth - menuWidth - pad))
    const y = Math.min(e.clientY, Math.max(pad, window.innerHeight - menuHeight - pad))
    setContextMenu({ x, y })
  }

  const handleClick = () => {
    setContextMenu(null)
    setSelectedIconId(null)
  }

  const menuItems = [
    { label: 'Appearance & Settings', icon: SettingsIcon, shortcut: 'Cmd+,', action: () => openWindow('settings', 'Settings', 580, 480) },
    { label: 'New Note', icon: Plus, shortcut: 'Cmd+N', action: () => openWindow('notes', 'Notes', 640, 480) },
    { label: 'Open Terminal', icon: TermIcon, shortcut: 'Cmd+T', action: () => openWindow('terminal', 'Terminal', 600, 400) },
    { label: 'Clean Up Icons', icon: LayoutGrid, action: handleCleanUpIcons },
    { divider: true },
    { label: 'Nepali Calendar & Units', icon: Calendar, action: () => openWindow('nepali-converter', 'नेपाली पात्रो र एकाइ रूपान्तरण (Nepali Calendar & Units)', 780, 560) },
    { label: 'Calculator', icon: CalcIcon, action: () => openWindow('calculator', 'Calculator', 320, 460) },
    { label: 'Devlogs', icon: BookOpen, action: () => openWindow('devlogs', 'स्याउ OS Devlogs', 800, 540) },
    { divider: true },
    { label: 'About स्याउ OS', icon: User, action: () => openWindow('about', 'About Me', 480, 520) },
  ]

  const renderIconGraphic = (icon: DesktopIconItem) => {
    if (icon.iconType === 'image') return <ImageIcon size={28} style={{ color: icon.color }} />
    if (icon.iconType === 'file') return <FileText size={28} style={{ color: icon.color }} />
    if (icon.appId === 'terminal') return <TermIcon size={28} style={{ color: icon.color }} />
    if (icon.appId === 'notes') return <FileText size={28} style={{ color: icon.color }} />
    if (icon.appId === 'nepali-converter') return <Calendar size={28} style={{ color: icon.color }} />
    if (icon.appId === 'calculator') return <CalcIcon size={28} style={{ color: icon.color }} />
    if (icon.appId === 'devlogs') return <BookOpen size={28} style={{ color: icon.color }} />
    if (icon.appId === 'about') return <User size={28} style={{ color: icon.color }} />
    return <SettingsIcon size={28} style={{ color: icon.color }} />
  }

  return (
    <div
      ref={desktopRef}
      className="desktop"
      onContextMenu={handleContextMenu}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}
    >
      {bgMode === 'generative' && (
        <canvas
          ref={genCanvasRef}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            zIndex: 0, background: '#09070B',
          }}
        />
      )}

      {(bgMode === 'custom' || (!['static', 'live', 'generative'].includes(bgMode) && customWallpaper)) && customWallpaper && (
        <div ref={bgRef} style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          zIndex: 0,
          backgroundImage: `url(${customWallpaper})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: `blur(${wallpaperBlur}px)`,
          transform: 'scale(1.04)',
          transition: 'transform 0.3s ease-out, filter 0.2s ease',
        }} />
      )}

      {bgMode === 'live' && (
        <video key={liveWall} autoPlay loop muted playsInline ref={bgRef as any} style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', zIndex: 0, opacity: 0.75, transition: 'transform 0.3s ease-out',
        }}>
          <source src={mediaUrl(`/video/${liveWall}.mp4`)} type="video/mp4" />
        </video>
      )}

      {bgMode === 'static' && (
        <div ref={bgRef} style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          zIndex: 0,
          backgroundImage: `url(${mediaUrl(`/images/wallpapers/${wallpaper}.jpg`)})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.7, transition: 'transform 0.3s ease-out',
        }} />
      )}

      {(bgMode === 'live' || bgMode === 'static' || (customWallpaper && bgMode === 'custom')) && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: `rgba(5, 5, 8, var(--os-wallpaper-dim, ${wallpaperDim / 100}))`,
          pointerEvents: 'none',
          transition: 'background 0.2s ease',
        }} />
      )}

      <div className="desktop-pattern" />

      <div ref={orb1Ref} style={{
        position: 'absolute', top: '10%', right: '15%', width: 350, height: 350,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,130,155,0.04) 0%, rgba(107,63,160,0.02) 40%, transparent 70%)',
        pointerEvents: 'none', filter: 'blur(40px)', transition: 'transform 0.4s ease-out',
      }} />
      <div ref={orb2Ref} style={{
        position: 'absolute', bottom: '20%', left: '10%', width: 300, height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(126,221,214,0.02) 0%, rgba(107,63,160,0.01) 40%, transparent 70%)',
        pointerEvents: 'none', filter: 'blur(50px)', transition: 'transform 0.5s ease-out',
      }} />

      <div ref={glowRef} style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 1,
        top: 0, left: 0,
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,130,155,0.015) 0%, transparent 60%)',
        transform: 'translate3d(-500px, -500px, 0)',
        willChange: 'transform',
      }} />

      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(232,130,155,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(232,130,155,0.018) 1px, transparent 1px)',
        backgroundSize: `${GRID_W}px ${GRID_H}px`,
        backgroundPosition: `${MARGIN_X}px ${MARGIN_Y}px`,
        pointerEvents: 'none',
      }} />

      <div className="desktop-greeting" style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center', pointerEvents: 'none', userSelect: 'none',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        zIndex: 1,
      }}>
        <div style={{
          width: 'clamp(56px, 16vw, 96px)', height: 'clamp(56px, 16vw, 96px)', borderRadius: 24,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px) saturate(1.8)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 12px 40px rgba(232,130,155,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 12, marginBottom: 4,
        }}>
          <img
            src={mediaUrl('/syauOS.png')}
            alt="स्याउ OS Logo"
            style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}
          />
        </div>

        <div style={{
          fontSize: 'clamp(32px, 10vw, 64px)', fontWeight: 800, color: 'var(--color-text-primary)',
          letterSpacing: '-1px', lineHeight: 1,
          textShadow: '0 0 60px rgba(232,130,155,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
        }}>
          <span className="font-syau" style={{ fontWeight: 600 }}>स्याउ</span>
          <span className="font-os" style={{ fontWeight: 700, color: 'var(--color-sakura)', letterSpacing: '0.08em' }}>OS</span>
        </div>
        <div style={{ fontSize: 'clamp(11px, 3.2vw, 13px)', color: 'var(--color-text-secondary)', marginTop: 4, fontWeight: 500 }}>
          Created by <strong style={{ color: 'var(--color-text-primary)' }}>Kantaraj Luitel (Susant)</strong>
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2, letterSpacing: 2 }}>
          drag files onto desktop or double click icons
        </div>
      </div>

      {ghostSlot && (
        <div style={{
          position: 'absolute',
          left: MARGIN_X + ghostSlot.col * GRID_W,
          top: MARGIN_Y + ghostSlot.row * GRID_H,
          width: GRID_W - 8,
          height: GRID_H - 8,
          borderRadius: 12,
          border: '2px dashed var(--color-sakura)',
          background: 'rgba(232,130,155,0.08)',
          pointerEvents: 'none',
          zIndex: 2,
          transition: 'all 0.1s ease-out',
        }} />
      )}

      <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}>
        {icons.map(icon => {
          const isSelected = selectedIconId === icon.id
          const isDragging = draggingIconId === icon.id

          const posX = MARGIN_X + icon.gridCol * GRID_W + (isDragging ? dragOffset.x : 0)
          const posY = MARGIN_Y + icon.gridRow * GRID_H + (isDragging ? dragOffset.y : 0)

          return (
            <div
              key={icon.id}
              onPointerDown={e => handleIconPointerDown(e, icon)}
              onPointerMove={handleIconPointerMove}
              onPointerUp={e => handleIconPointerUp(e, icon)}
              onDoubleClick={() => handleOpenIcon(icon)}
              style={{
                position: 'absolute',
                left: posX,
                top: posY,
                width: GRID_W - 8,
                height: GRID_H - 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 4px',
                borderRadius: 12,
                cursor: isDragging ? 'grabbing' : 'grab',
                pointerEvents: 'auto',
                userSelect: 'none',
                touchAction: 'none',
                zIndex: isDragging ? 100 : (isSelected ? 10 : 4),
                background: isSelected
                  ? 'rgba(232,130,155,0.18)'
                  : (isDragging ? 'rgba(255,255,255,0.08)' : 'transparent'),
                border: isSelected
                  ? '1px solid var(--color-sakura)'
                  : '1px solid transparent',
                boxShadow: isDragging ? '0 12px 28px rgba(0,0,0,0.5)' : 'none',
                transform: isDragging ? 'scale(1.06)' : 'scale(1)',
                transition: isDragging ? 'box-shadow 0.15s' : 'transform 0.15s, background 0.15s',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}>
                {renderIconGraphic(icon)}
              </div>

              <span style={{
                marginTop: 6,
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                textAlign: 'center',
                maxWidth: GRID_W - 12,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                padding: '1px 4px',
                borderRadius: 4,
                background: isSelected ? 'rgba(0,0,0,0.4)' : 'transparent',
              }}>
                {icon.name}
              </span>
            </div>
          )
        })}
      </div>

      <AnimatePresence>
        {isDraggingOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            style={{
              position: 'absolute', inset: 16, zIndex: 1000,
              borderRadius: 20, border: '3px dashed var(--color-sakura)',
              background: 'rgba(13, 10, 14, 0.85)', backdropFilter: 'blur(16px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(232,130,155,0.15)', border: '1px solid var(--color-sakura)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-sakura)', marginBottom: 16,
            }}>
              <Upload size={36} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-primary)' }}>
              Drop files to import to स्याउ OS Desktop
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 6 }}>
              Files will be saved into the virtual file system and pinned to the desktop grid.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {contextMenu && (
          <motion.div
            className="context-menu"
            style={{ left: contextMenu.x, top: contextMenu.y, zIndex: 2000 }}
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -6 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            {menuItems.map((item, i) => {
              if ('divider' in item && item.divider) {
                return <div key={`div-${i}`} className="context-menu-divider" />
              }
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  type="button"
                  className="context-menu-item"
                  onClick={() => { item.action?.(); setContextMenu(null) }}
                >
                  <span className="context-menu-item-left">
                    {Icon && <Icon size={14} className="context-menu-icon" />}
                    <span>{item.label}</span>
                  </span>
                  {item.shortcut && (
                    <span className="context-menu-shortcut">{item.shortcut}</span>
                  )}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
