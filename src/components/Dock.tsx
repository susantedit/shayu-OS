import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useDesktopStore, useNotificationStore } from '../store/desktopStore'
import { useThemeStore } from '../store/themeStore'

interface DockItem {
  id: string
  label: string
  color: string
  icon: string
}

const dockItems: DockItem[] = [
  { id: 'about', label: 'About Me', color: 'var(--color-sakura)', icon: 'about' },
  { id: 'nepali-converter', label: 'पात्रो / Units', color: '#EF4444', icon: 'nepali' },
  { id: 'terminal', label: 'Terminal', color: 'var(--color-miku)', icon: 'terminal' },
  { id: 'notes', label: 'Notes', color: 'var(--color-peach)', icon: 'notes' },
  { id: 'calculator', label: 'Calculator', color: 'var(--color-lavender)', icon: 'calc' },
  { id: 'devlogs', label: 'Devlogs', color: 'var(--color-sakura)', icon: 'devlogs' },
  { id: 'settings', label: 'Settings', color: 'var(--color-text-secondary)', icon: 'settings' },
]

const appTitles: Record<string, string> = {
  about: 'About Me',
  'nepali-converter': 'नेपाली पात्रो र एकाइ रूपान्तरण (Nepali Calendar & Units)',
  terminal: 'Terminal',
  notes: 'Notes',
  calculator: 'Calculator',
  devlogs: 'स्याउ OS Devlogs',
  settings: 'Settings',
}

const appSizes: Record<string, [number, number]> = {
  about: [480, 520],
  'nepali-converter': [780, 560],
  terminal: [600, 400],
  notes: [640, 480],
  calculator: [320, 460],
  devlogs: [800, 540],
  settings: [580, 480],
}

const ICONS: Record<string, string> = {
  about: `<svg viewBox="0 0 56 56"><defs><linearGradient id="g-about" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#E8829B"/><stop offset="100%" stop-color="#C45A7C"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#g-about)"/><circle cx="28" cy="21" r="8" fill="white" opacity="0.95"/><path d="M14 44c0-7.7 6.3-14 14-14s14 6.3 14 14" fill="white" opacity="0.95"/></svg>`,
  nepali: `<svg viewBox="0 0 56 56"><defs><linearGradient id="g-nepali" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#EF4444"/><stop offset="100%" stop-color="#991B1B"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#g-nepali)"/><rect x="14" y="14" width="28" height="28" rx="4" fill="white" opacity="0.95"/><path d="M14 22h28" stroke="#EF4444" stroke-width="2" stroke-linecap="round"/><line x1="20" y1="10" x2="20" y2="15" stroke="white" stroke-width="2.5" stroke-linecap="round"/><line x1="36" y1="10" x2="36" y2="15" stroke="white" stroke-width="2.5" stroke-linecap="round"/><circle cx="21" cy="28" r="2" fill="#EF4444"/><circle cx="28" cy="28" r="2" fill="#EF4444"/><circle cx="35" cy="28" r="2" fill="#EF4444"/><circle cx="21" cy="35" r="2" fill="#EF4444"/><circle cx="28" cy="35" r="2" fill="#EF4444"/></svg>`,
  terminal: `<svg viewBox="0 0 56 56"><defs><linearGradient id="g-term" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#1a1a2e"/><stop offset="100%" stop-color="#0d0d1a"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#g-term)"/><path d="M16 20l10 8-10 8" stroke="#7EDDD6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M30 38h12" stroke="#7EDDD6" stroke-width="3" stroke-linecap="round" fill="none"/></svg>`,
  notes: `<svg viewBox="0 0 56 56"><defs><linearGradient id="g-notes" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FDBA74"/><stop offset="100%" stop-color="#FB923C"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#g-notes)"/><rect x="15" y="10" width="26" height="36" rx="3" fill="white" opacity="0.95"/><line x1="21" y1="20" x2="35" y2="20" stroke="#FB923C" stroke-width="2" stroke-linecap="round"/><line x1="21" y1="26" x2="35" y2="26" stroke="#FB923C" stroke-width="2" stroke-linecap="round"/><line x1="21" y1="32" x2="30" y2="32" stroke="#FB923C" stroke-width="2" stroke-linecap="round"/></svg>`,
  calc: `<svg viewBox="0 0 56 56"><defs><linearGradient id="g-calc" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#C4B5FD"/><stop offset="100%" stop-color="#A78BFA"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#g-calc)"/><rect x="14" y="10" width="28" height="8" rx="2" fill="white" opacity="0.9"/><rect x="14" y="22" width="6" height="6" rx="1.5" fill="white" opacity="0.7"/><rect x="25" y="22" width="6" height="6" rx="1.5" fill="white" opacity="0.7"/><rect x="36" y="22" width="6" height="6" rx="1.5" fill="white" opacity="0.7"/><rect x="14" y="32" width="6" height="6" rx="1.5" fill="white" opacity="0.7"/><rect x="25" y="32" width="6" height="6" rx="1.5" fill="white" opacity="0.7"/><rect x="36" y="32" width="6" height="6" rx="1.5" fill="white" opacity="0.7"/><rect x="14" y="42" width="6" height="4" rx="1.5" fill="white" opacity="0.7"/><rect x="25" y="42" width="17" height="4" rx="1.5" fill="white" opacity="0.9"/></svg>`,
  devlogs: `<svg viewBox="0 0 56 56"><defs><linearGradient id="g-devlogs" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#E8829B"/><stop offset="100%" stop-color="#C45A7C"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#g-devlogs)"/><path d="M16 12h24a2 2 0 012 2v28a2 2 0 01-2 2H16a2 2 0 01-2-2V14a2 2 0 012-2z" fill="white" opacity="0.9"/><path d="M20 20h16M20 26h16M20 32h10" stroke="#C45A7C" stroke-width="2" stroke-linecap="round"/><circle cx="36" cy="34" r="6" fill="#C45A7C"/><path d="M34 34l1.5 1.5 3-3" stroke="white" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg>`,
  settings: `<svg viewBox="0 0 56 56"><defs><linearGradient id="g-settings" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#6B7280"/><stop offset="100%" stop-color="#374151"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#g-settings)"/><circle cx="28" cy="28" r="6" fill="none" stroke="white" stroke-width="2.5" opacity="0.9"/><path d="M28 14v4M28 38v4M14 28h4M38 28h4M18.2 18.2l2.8 2.8M35 35l2.8 2.8M37.8 18.2l-2.8 2.8M21 35l-2.8 2.8" stroke="white" stroke-width="2.5" stroke-linecap="round" opacity="0.9"/></svg>`,
}

export default function Dock() {
  const openWindow = useDesktopStore(s => s.openWindow)
  const openApps = useDesktopStore(s => s.openApps)
  const addNotif = useNotificationStore(s => s.add)
  const dockPosition = useThemeStore(s => s.dockPosition)
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const [bouncing, setBouncing] = useState<string | null>(null)
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null)
  const [isMagnifying, setIsMagnifying] = useState(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (!isMagnifying) setIsMagnifying(true)
    const isVertical = dockPosition === 'left' || dockPosition === 'right'
    const mouseCoord = isVertical ? e.clientY : e.clientX
    const maxDist = 135
    const maxScale = 0.35
    const maxTranslate = 12

    itemRefs.current.forEach((el) => {
      if (!el) return
      const rect = el.getBoundingClientRect()
      const itemCenter = isVertical ? (rect.top + rect.height / 2) : (rect.left + rect.width / 2)
      const dist = Math.abs(mouseCoord - itemCenter)

      if (dist < maxDist) {
        const norm = dist / maxDist
        const factor = Math.cos((norm * Math.PI) / 2) ** 2
        const scale = 1 + maxScale * factor
        if (dockPosition === 'left') {
          const x = maxTranslate * factor
          el.style.transform = `translate3d(${x}px, 0, 0) scale(${scale})`
        } else if (dockPosition === 'right') {
          const x = -maxTranslate * factor
          el.style.transform = `translate3d(${x}px, 0, 0) scale(${scale})`
        } else {
          const y = -maxTranslate * factor
          el.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`
        }
      } else {
        el.style.transform = 'translate3d(0, 0, 0) scale(1)'
      }
    })
  }

  const handleMouseLeave = () => {
    setIsMagnifying(false)
    itemRefs.current.forEach(el => {
      if (el) el.style.transform = 'translate3d(0, 0, 0) scale(1)'
    })
  }

  const handleClick = (item: DockItem, e: React.MouseEvent) => {
    const [w, h] = appSizes[item.id] || [600, 400]
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    openWindow(item.id, appTitles[item.id] || item.label, w, h, origin)
    setBouncing(item.id)
    setTimeout(() => setBouncing(null), 650)
    setRipple({ x: origin.x, y: origin.y })
    setTimeout(() => setRipple(null), 800)
    try { (window as any).__syauPlayClick?.('open') } catch {}
    addNotif(`${item.label} launched`, 'rocket', 1800)
  }

  return (
    <>
      <div className="dock-wrapper">
        <motion.div
          ref={containerRef}
          className={`dock-container ${isMagnifying ? 'is-magnifying' : ''}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          initial={dockPosition === 'left' ? { x: -80, opacity: 0 } : dockPosition === 'right' ? { x: 80, opacity: 0 } : { y: 80, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {dockItems.map((item, i) => (
            <motion.div
              key={item.id}
              ref={el => { itemRefs.current[i] = el }}
              className="dock-item cursor-pointer"
              data-clickable="true"
              style={{
                background: 'transparent',
                border: 'none',
                backdropFilter: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
              onClick={(e) => handleClick(item, e)}
              animate={bouncing === item.id ? {
                y: [0, -16, 0, -8, 0, -2, 0],
                transition: { duration: 0.6, ease: 'easeOut' }
              } : {}}
              layout
              transition={{ layout: { type: 'spring', stiffness: 400, damping: 30 } }}
            >
              <div
                className="dock-icon-wrapper"
                dangerouslySetInnerHTML={{ __html: ICONS[item.icon] }}
              />
              <div className="dock-tooltip">
                {item.label}
              </div>
              {openApps.includes(item.id) && (
                <motion.div
                  className="dock-item-dot"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {ripple && (
        <div style={{
          position: 'fixed', left: ripple.x, top: ripple.y,
          width: 20, height: 20, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,130,155,0.3) 0%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
          animation: 'launch-ripple 0.8s ease-out forwards',
          pointerEvents: 'none', zIndex: 95,
        }} />
      )}
    </>
  )
}
