import { useState, useEffect } from 'react'
import { useDesktopStore } from '../store/desktopStore'
import { mediaUrl } from '../config'

function playBootChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()
    const master = ctx.createGain()
    master.gain.setValueAtTime(0.08, ctx.currentTime)
    master.connect(ctx.destination)

    // Warm macOS-style major chord: C4, E4, G4, C5
    const freqs = [261.63, 329.63, 392.00, 523.25]
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime)

      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8)

      osc.connect(gain)
      gain.connect(master)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 2.0)
    })
  } catch {}
}

export default function BootScreen() {
  const setBootDone = useDesktopStore(s => s.setBootDone)
  const [progress, setProgress] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    // Play subtle startup chime
    playBootChime()

    // Smoothly animate loading progress bar
    const start = Date.now()
    const duration = 1400

    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const nextProgress = Math.min(100, Math.floor((elapsed / duration) * 100))
      setProgress(nextProgress)

      if (elapsed >= duration) {
        clearInterval(interval)
        setFading(true)
        setTimeout(() => {
          setBootDone(true)
        }, 350)
      }
    }, 20)

    return () => clearInterval(interval)
  }, [setBootDone])

  const handleSkip = () => {
    setFading(true)
    setTimeout(() => {
      setBootDone(true)
    }, 150)
  }

  return (
    <div
      onClick={handleSkip}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#09090b',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.35s ease-out',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
        }}
      >
        {/* Syau Logo */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12,
          }}
        >
          <img
            src={mediaUrl('/syauOS.png')}
            alt="स्याउ OS"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>

        {/* Syau OS Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            className="font-syau"
            style={{
              fontSize: 26,
              fontWeight: 600,
              color: '#f4f4f5',
              letterSpacing: '0.02em',
            }}
          >
            स्याउ
          </span>
          <span
            className="font-os"
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: 'var(--color-sakura, #e11d48)',
              letterSpacing: '0.08em',
            }}
          >
            OS
          </span>
        </div>

        {/* Apple-style minimalist progress bar */}
        <div
          style={{
            width: 180,
            height: 4,
            background: 'rgba(255, 255, 255, 0.12)',
            borderRadius: 999,
            overflow: 'hidden',
            marginTop: 8,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: '#f4f4f5',
              borderRadius: 999,
              transition: 'width 0.05s linear',
            }}
          />
        </div>

        <div
          style={{
            fontSize: 11,
            color: '#71717a',
            marginTop: 4,
            letterSpacing: '0.05em',
          }}
        >
          Click anywhere to skip
        </div>
      </div>
    </div>
  )
}
