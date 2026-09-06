import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, Wifi, WifiOff, Globe, AlertTriangle, Battery,
  BatteryWarning, Zap, Trash2, Radio, CheckCircle2, Cpu
} from 'lucide-react'
import { useNotificationStore } from '../store/desktopStore'

function renderNotificationIcon(icon?: string) {
  switch (icon) {
    case 'wifi': return <Wifi size={16} style={{ color: 'var(--color-sakura)' }} />
    case 'wifi-off': return <WifiOff size={16} style={{ color: '#EF4444' }} />
    case 'globe': return <Globe size={16} style={{ color: 'var(--color-miku)' }} />
    case 'alert': return <AlertTriangle size={16} style={{ color: '#FBBF24' }} />
    case 'battery': return <Battery size={16} style={{ color: 'var(--color-sakura)' }} />
    case 'battery-charging': return <Zap size={16} style={{ color: '#4ADE80' }} />
    case 'battery-low': return <BatteryWarning size={16} style={{ color: '#EF4444' }} />
    case 'trash': return <Trash2 size={16} style={{ color: '#F87171' }} />
    case 'radar': return <Radio size={16} style={{ color: 'var(--color-miku)' }} />
    case 'rocket': return <Cpu size={16} style={{ color: 'var(--color-sakura)' }} />
    case 'check': return <CheckCircle2 size={16} style={{ color: '#4ADE80' }} />
    default: return <Bell size={16} style={{ color: 'var(--color-sakura)' }} />
  }
}

// === Click Sounds (Web Audio API Synthesizer) ===
let audioCtx: AudioContext | null = null

function playClick(type: 'click' | 'open' | 'close' = 'click') {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const ctx = audioCtx
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    if (type === 'click') {
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08)
      gain.gain.setValueAtTime(0.06, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.08)
    } else if (type === 'open') {
      osc.frequency.setValueAtTime(400, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.12)
      gain.gain.setValueAtTime(0.05, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.15)
    } else {
      osc.frequency.setValueAtTime(600, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1)
      gain.gain.setValueAtTime(0.05, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.1)
    }
  } catch {
    // Audio Context not supported or permission denied
  }
}

// Make click sounds globally available
(window as any).__syauPlayClick = playClick

// === Konami Code Easter Egg ===
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

function ConfettiCanvas({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const colors = ['#E8829B', '#7EDDD6', '#C4B5FD', '#FDBA74', '#86EFAC', '#93C5FD', '#FFD93D']
    const particles = Array.from({ length: 140 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 4 + 2,
      r: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 10,
    }))

    let frame: number
    let ticks = 0

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rot * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6)
        ctx.restore()
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.08
        p.rot += p.rotV
      })
      ticks++
      if (ticks < 180) {
        frame = requestAnimationFrame(draw)
      } else {
        onDone()
      }
    }
    draw()
    return () => cancelAnimationFrame(frame)
  }, [onDone])

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 99999, pointerEvents: 'none' }} />
}

export default function SystemUI() {
  const notifications = useNotificationStore(s => s.notifications)
  const removeNotif = useNotificationStore(s => s.remove)
  const [konamiActive, setKonamiActive] = useState(false)
  const konamiBuffer = useRef<string[]>([])

  // Konami code listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      konamiBuffer.current.push(e.key)
      if (konamiBuffer.current.length > 10) konamiBuffer.current.shift()
      if (konamiBuffer.current.join(',') === KONAMI.join(',')) {
        setKonamiActive(true)
        konamiBuffer.current = []
        playClick('open')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Global UI click audio feedback
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        target.closest('button') ||
        target.closest('.dock-item') ||
        target.closest('.context-menu-item') ||
        target.closest('.top-bar-menu') ||
        target.closest('.top-bar-logo')
      ) {
        playClick('click')
      }
    }
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [])

  return (
    <>
      {/* Notifications Toaster */}
      <div className="syau-toast-container" style={{
        position: 'fixed',
        top: 42,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
      }}>
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => removeNotif(n.id)}
              style={{
                pointerEvents: 'auto',
                cursor: 'pointer',
                background: 'rgba(20, 16, 24, 0.92)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(232, 130, 155, 0.25)',
                borderRadius: 10,
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                fontSize: 12,
                color: 'var(--color-text-primary)',
                maxWidth: 320,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {renderNotificationIcon(n.icon)}
              </div>
              <span style={{ fontWeight: 500, lineHeight: 1.4 }}>{n.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {konamiActive && <ConfettiCanvas onDone={() => setKonamiActive(false)} />}
    </>
  )
}
