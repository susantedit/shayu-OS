import { useState, useEffect, useRef } from 'react'
import { useDesktopStore } from '../store/desktopStore'

export default function Widgets() {
  const [enabled, setEnabled] = useState(() => localStorage.getItem('syau-os-widgets') !== 'off')
  const [time, setTime] = useState(new Date())
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const windows = useDesktopStore(s => s.windows)
  const currentWorkspace = useDesktopStore(s => s.currentWorkspace)
  const isAnyMaximized = windows.some(w => w.workspace === currentWorkspace && !w.minimized && w.maximized)

  useEffect(() => {
    const syncWidgetState = () => setEnabled(localStorage.getItem('syau-os-widgets') !== 'off')
    window.addEventListener('storage', syncWidgetState)
    const interval = setInterval(syncWidgetState, 500)
    return () => { window.removeEventListener('storage', syncWidgetState); clearInterval(interval) }
  }, [])

  useEffect(() => {
    if (!enabled) return
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [enabled])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !enabled) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = 140
    canvas.width = size
    canvas.height = size
    const cx = size / 2
    const cy = size / 2
    const r = size / 2 - 8

    let frame: number
    const draw = () => {
      const now = new Date()
      const h = now.getHours() % 12
      const m = now.getMinutes()
      const s = now.getSeconds()
      ctx.clearRect(0, 0, size, size)

      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 2
      ctx.stroke()

      for (let i = 0; i < 12; i++) {
        const angle = (i * 30 - 90) * Math.PI / 180
        const inner = i % 3 === 0 ? r - 14 : r - 10
        const outer = r - 4
        ctx.beginPath()
        ctx.moveTo(cx + inner * Math.cos(angle), cy + inner * Math.sin(angle))
        ctx.lineTo(cx + outer * Math.cos(angle), cy + outer * Math.sin(angle))
        ctx.strokeStyle = i % 3 === 0 ? 'rgba(232, 130, 155, 0.6)' : 'rgba(255, 255, 255, 0.15)'
        ctx.lineWidth = i % 3 === 0 ? 2.5 : 1.5
        ctx.stroke()
      }

      const hAngle = ((h + m / 60) * 30 - 90) * Math.PI / 180
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + (r - 30) * Math.cos(hAngle), cy + (r - 30) * Math.sin(hAngle))
      ctx.strokeStyle = 'var(--color-text-primary)'
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.stroke()

      const mAngle = ((m + s / 60) * 6 - 90) * Math.PI / 180
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + (r - 18) * Math.cos(mAngle), cy + (r - 18) * Math.sin(mAngle))
      ctx.strokeStyle = 'var(--color-text-primary)'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.stroke()

      const sAngle = (s * 6 - 90) * Math.PI / 180
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + (r - 12) * Math.cos(sAngle), cy + (r - 12) * Math.sin(sAngle))
      ctx.strokeStyle = 'var(--color-sakura)'
      ctx.lineWidth = 1
      ctx.lineCap = 'round'
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(cx, cy, 3, 0, Math.PI * 2)
      ctx.fillStyle = 'var(--color-sakura)'
      ctx.fill()

      frame = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(frame)
  }, [enabled])

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  if (!enabled || isAnyMaximized || isMobile) return null

  const today = new Date()
  const isCurrentMonth = calMonth === today.getMonth() && calYear === today.getFullYear()
  const firstDay = new Date(calYear, calMonth, 1).getDay()
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const monthName = new Date(calYear, calMonth).toLocaleDateString('en-US', { month: 'long' })
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  const calendarDays: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) calendarDays.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d)

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11)
      setCalYear(y => y - 1)
    } else {
      setCalMonth(m => m - 1)
    }
  }

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0)
      setCalYear(y => y + 1)
    } else {
      setCalMonth(m => m + 1)
    }
  }

  const glassStyle: React.CSSProperties = {
    background: 'var(--color-window-bg)',
    backdropFilter: 'blur(20px)',
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    boxShadow: '0 8px 32px var(--color-shadow)',
    padding: 16,
    position: 'relative',
  }

  return (
    <div className="desktop-widgets" style={{ position: 'fixed', top: 80, right: 16, zIndex: 2, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'auto', transition: 'opacity 0.2s ease' }}>
      <div style={{ ...glassStyle, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <canvas ref={canvasRef} style={{ width: 140, height: 140 }} />
        <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>
          {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
        </div>
      </div>

      <div style={{ ...glassStyle, minWidth: 220 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 14, padding: '0 4px' }}>‹</button>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {monthName} {calYear}
          </div>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 14, padding: '0 4px' }}>›</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 4 }}>
          {days.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 9, fontWeight: 700, color: 'var(--color-text-muted)', padding: '2px 0' }}>{d}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
          {calendarDays.map((d, i) => {
            const isToday = d === today.getDate() && isCurrentMonth
            return (
              <div key={i} style={{
                textAlign: 'center', fontSize: 11, fontWeight: isToday ? 700 : 400,
                color: isToday ? 'white' : d ? 'var(--color-text-secondary)' : 'transparent',
                background: isToday ? 'var(--color-sakura)' : 'transparent',
                borderRadius: 6, width: 26, height: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto', cursor: 'default',
              }}>
                {d || ''}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
