import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDesktopStore } from '../store/desktopStore'
import { mediaUrl } from '../config'

export default function Desktop() {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [bgMode, setBgMode] = useState<'dark' | 'static' | 'live'>(() => (localStorage.getItem('syau-os-bg') as any) || 'dark')
  const [wallpaper, setWallpaper] = useState(() => localStorage.getItem('syau-os-wallpaper') || 'wall-1')
  const [liveWall, setLiveWall] = useState(() => localStorage.getItem('syau-os-live-wall') || 'live-1')
  const openWindow = useDesktopStore(s => s.openWindow)
  const desktopRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const orb1Ref = useRef<HTMLDivElement>(null)
  const orb2Ref = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

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

  // Parallax via direct DOM manipulation (no React re-renders)
  useEffect(() => {
    const el = desktopRef.current
    if (!el) return
    let raf = 0
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        const nx = ((e.clientX - rect.left) / rect.width - 0.5) * -10
        const ny = ((e.clientY - rect.top) / rect.height - 0.5) * -10
        if (bgRef.current) bgRef.current.style.transform = `translate(${nx}px, ${ny}px)`
        if (orb1Ref.current) orb1Ref.current.style.transform = `translate(${nx * 2}px, ${ny * 2}px)`
        if (orb2Ref.current) orb2Ref.current.style.transform = `translate(${nx * 1.5}px, ${ny * 1.5}px)`
        if (glowRef.current) {
          glowRef.current.style.left = `${e.clientX}px`
          glowRef.current.style.top = `${e.clientY}px`
        }
      })
    }
    el.addEventListener('mousemove', onMove)
    return () => { el.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])

  const handleContextMenu = (e: React.MouseEvent) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY }) }
  const handleClick = () => setContextMenu(null)

  const menuItems = [
    { label: 'Creator Profile (Susant)', action: () => openWindow('creator', 'Kantaraj Luitel (Susant) - Creator Profile', 860, 580) },
    { label: 'About स्याउ OS', action: () => openWindow('about', 'About Me', 480, 540) },
    { label: 'Devlogs', action: () => openWindow('devlogs', 'Devlogs', 840, 560) },
    { label: 'Terminal', action: () => openWindow('terminal', 'Terminal', 600, 400) },
    { label: 'Notes', action: () => openWindow('notes', 'Notes', 500, 450) },
    { divider: true },
    { label: 'Settings', action: () => openWindow('settings', 'Settings', 460, 520) },
  ]

  return (
    <div ref={desktopRef} className="desktop" onContextMenu={handleContextMenu} onClick={handleClick}>
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

      {(bgMode === 'live' || bgMode === 'static') && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(180deg, rgba(5,5,8,0.2) 0%, rgba(5,5,8,0.35) 100%)',
          pointerEvents: 'none',
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
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,130,155,0.015) 0%, transparent 60%)',
        transform: 'translate(-50%, -50%)', transition: 'left 0.15s ease-out, top 0.15s ease-out',
      }} />

      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.008) 0%, transparent 50%)',
      }} />

      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(232,130,155,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(232,130,155,0.015) 1px, transparent 1px)',
        backgroundSize: '80px 80px', pointerEvents: 'none',
      }} />

      <div className="desktop-greeting" style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center', pointerEvents: 'none', userSelect: 'none',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
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
          tap the dock below to open apps
        </div>
      </div>

      <AnimatePresence>
        {contextMenu && (
          <motion.div
            className="context-menu"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {menuItems.map((item, i) => {
              if ('divider' in item) return <motion.div key={i} className="context-menu-divider" />
              return (
                <motion.div
                  key={i}
                  className="context-menu-item"
                  onClick={() => { item.action(); setContextMenu(null) }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.15 }}
                >
                  {item.label}
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
