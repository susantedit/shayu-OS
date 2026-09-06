import { useState, useEffect, useRef, useCallback } from 'react'
import { Heart, Mic, Volume2, VolumeX } from 'lucide-react'
import { useDesktopStore } from '../store/desktopStore'

const P: Record<number, string> = {
  0: 'transparent',
  1: '#1a1a24',
  2: '#B8C4D0',
  3: '#d0dae6',
  4: '#1a1a24',
  5: '#8899AA',
  6: '#e8c8d4',
  7: '#6B7B8D',
  8: '#dde4ec',
  9: '#4a5568',
}

const isMusicPlaying = () => {
  try {
    const windows = useDesktopStore.getState().windows
    return windows.some(w => (w.appId === 'music' || w.title.toLowerCase().includes('spotify') || w.title.toLowerCase().includes('music')) && !w.minimized)
  } catch {
    return false
  }
}

const isMutedGlobally = () => {
  try {
    return localStorage.getItem('syau-meo-muted') === 'true'
  } catch {
    return false
  }
}

const playFirstMeow = () => {
  if (isMutedGlobally() || isMusicPlaying()) return
  try {
    const audio = new Audio('/meow-first.mp3')
    audio.volume = 0.85
    audio.play().catch(() => {})
  } catch {}
}

const playPetSound = () => {
  if (isMutedGlobally() || isMusicPlaying()) return
  try {
    const audio = new Audio('/meow.mp3')
    audio.volume = 0.9
    audio.play().catch(() => {
      playMeowSound()
    })
  } catch {
    playMeowSound()
  }
}

const playMeowSound = () => {
  if (isMutedGlobally() || isMusicPlaying()) return
  try {
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(460, now)
    osc.frequency.linearRampToValueAtTime(860, now + 0.14)
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.46)
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.2, now + 0.08)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(920, now)
    osc2.frequency.linearRampToValueAtTime(1720, now + 0.14)
    osc2.frequency.exponentialRampToValueAtTime(1040, now + 0.46)
    gain2.gain.setValueAtTime(0, now)
    gain2.gain.linearRampToValueAtTime(0.08, now + 0.08)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.48)
    osc.connect(gain); gain.connect(ctx.destination)
    osc2.connect(gain2); gain2.connect(ctx.destination)
    osc.start(now); osc2.start(now)
    osc.stop(now + 0.5); osc2.stop(now + 0.5)
  } catch {}
}

const F = {
  idle1: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,7,1,0,0,1,7,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,3,2,2,1,1,2,2,3,1,0,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,2,2,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,8,4,2,2,2,2,4,8,3,1,0,0,0,0],
    [0,0,0,0,1,3,6,4,4,2,2,4,4,6,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,5,5,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,3,3,2,2,3,3,1,0,0,0,0],
    [0,0,0,1,2,3,3,8,8,8,8,8,8,3,3,2,1,0,0,0],
    [0,0,0,1,2,3,8,8,8,8,8,8,8,8,3,2,1,0,0,0],
    [0,0,0,1,2,3,3,8,8,8,8,8,8,3,3,2,1,0,0,0],
    [0,0,0,1,2,3,3,3,8,8,8,8,3,3,3,2,1,7,0,0],
    [0,0,0,1,2,2,3,3,3,3,3,3,3,3,2,2,1,7,7,0],
    [0,0,0,0,1,2,2,2,3,3,3,3,2,2,2,2,1,7,0,0],
    [0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,1,0,0,0,0],
    [0,0,0,0,0,1,1,2,2,2,2,2,2,1,1,0,0,0,0,0],
    [0,0,0,0,0,1,0,1,1,1,1,1,1,0,1,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  idle2: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,7,1,0,0,1,7,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,3,2,2,1,1,2,2,3,1,0,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,2,2,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,8,4,2,2,2,2,4,8,3,1,0,0,0,0],
    [0,0,0,0,1,3,6,4,4,2,2,4,4,6,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,5,5,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,3,3,2,2,3,3,1,0,0,0,0],
    [0,0,0,1,2,3,3,8,8,8,8,8,8,3,3,2,1,0,0,0],
    [0,0,0,1,2,3,8,8,8,8,8,8,8,8,3,2,1,0,0,0],
    [0,0,0,1,2,3,3,8,8,8,8,8,8,3,3,2,1,0,0,0],
    [0,0,0,1,2,3,3,3,8,8,8,8,3,3,3,2,1,0,7,0],
    [0,0,0,1,2,2,3,3,3,3,3,3,3,3,2,2,7,7,0,0],
    [0,0,0,0,1,2,2,2,3,3,3,3,2,2,2,2,1,0,0,0],
    [0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,1,0,0,0,0],
    [0,0,0,0,0,1,1,2,2,2,2,2,2,1,1,0,0,0,0,0],
    [0,0,0,0,0,1,0,1,1,1,1,1,1,0,1,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  walk1: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,7,1,0,0,1,7,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,3,2,2,1,1,2,2,3,1,0,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,2,2,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,8,4,2,2,2,2,4,8,3,1,0,0,0,0],
    [0,0,0,0,1,3,6,4,4,2,2,4,4,6,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,5,5,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,3,3,2,2,3,3,1,0,0,0,0],
    [0,0,0,1,2,3,3,8,8,8,8,8,8,3,3,2,1,0,7,0],
    [0,0,0,1,2,3,8,8,8,8,8,8,8,8,3,2,1,7,7,0],
    [0,0,0,1,2,3,3,8,8,8,8,8,8,3,3,2,1,0,0,0],
    [0,0,0,1,2,3,3,3,8,8,8,8,3,3,3,2,1,0,0,0],
    [0,0,0,0,1,2,2,3,3,3,3,3,3,2,2,1,0,0,0,0],
    [0,0,0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,1,2,2,2,2,2,2,1,1,0,0,0,0,0],
    [0,0,0,0,1,0,1,0,1,1,1,1,0,1,0,1,0,0,0,0],
    [0,0,0,1,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  walk2: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,7,1,0,0,1,7,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,3,2,2,1,1,2,2,3,1,0,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,2,2,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,8,4,2,2,2,2,4,8,3,1,0,0,0,0],
    [0,0,0,0,1,3,6,4,4,2,2,4,4,6,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,5,5,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,3,3,2,2,3,3,1,0,0,0,0],
    [0,0,0,1,2,3,3,8,8,8,8,8,8,3,3,2,1,0,7,0],
    [0,0,0,1,2,3,8,8,8,8,8,8,8,8,3,2,7,7,0,0],
    [0,0,0,1,2,3,3,8,8,8,8,8,8,3,3,2,1,0,0,0],
    [0,0,0,1,2,3,3,3,8,8,8,8,3,3,3,2,1,0,0,0],
    [0,0,0,0,1,2,2,3,3,3,3,3,3,2,2,1,0,0,0,0],
    [0,0,0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,1,2,2,2,2,2,2,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,1,1,1,1,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  sleep1: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,7,1,0,0,1,7,2,1,0,0,0,0,0],
    [0,0,0,0,1,3,2,2,1,1,2,2,3,1,0,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,2,2,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,8,1,1,2,2,1,1,8,3,1,0,0,0,0],
    [0,0,0,0,1,3,6,1,1,2,2,1,1,6,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,5,5,2,2,3,3,1,0,0,0,0],
    [0,0,0,1,2,3,3,2,2,3,3,2,2,3,3,2,1,0,0,0],
    [0,0,1,2,3,3,8,8,8,8,8,8,8,8,3,3,2,1,0,0],
    [0,0,1,2,3,8,8,8,8,8,8,8,8,8,8,3,2,1,7,0],
    [0,0,1,2,3,3,3,8,8,8,8,8,8,3,3,3,2,1,7,7],
    [0,0,0,1,2,2,3,3,3,3,3,3,3,3,2,2,1,0,7,0],
    [0,0,0,0,1,2,2,2,3,3,3,3,2,2,2,1,0,0,0,0],
    [0,0,0,0,0,1,1,2,2,2,2,2,2,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  sleep2: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,7,1,0,0,1,7,2,1,0,0,0,0,0],
    [0,0,0,0,1,3,2,2,1,1,2,2,3,1,0,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,2,2,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,8,1,1,2,2,1,1,8,3,1,0,0,0,0],
    [0,0,0,0,1,3,6,1,1,2,2,1,1,6,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,5,5,2,2,3,3,1,0,0,0,0],
    [0,0,0,1,2,3,3,2,2,3,3,2,2,3,3,2,1,0,0,0],
    [0,0,1,2,3,3,8,8,8,8,8,8,8,8,3,3,2,1,0,0],
    [0,0,1,2,3,8,8,8,8,8,8,8,8,8,8,3,2,1,0,7],
    [0,0,1,2,3,3,3,8,8,8,8,8,8,3,3,3,2,1,7,7],
    [0,0,0,1,2,2,3,3,3,3,3,3,3,3,2,2,1,7,0,0],
    [0,0,0,0,1,2,2,2,3,3,3,3,2,2,2,1,0,0,0,0],
    [0,0,0,0,0,1,1,2,2,2,2,2,2,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  happy: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,7,1,0,0,1,7,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,3,2,2,1,1,2,2,3,1,0,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,2,2,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,7,4,2,2,2,2,4,7,3,1,0,0,0,0],
    [0,0,0,0,1,3,4,0,4,2,2,4,0,4,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,5,5,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,6,3,3,6,2,3,3,1,0,0,0,0],
    [0,0,0,1,2,3,3,8,8,8,8,8,8,3,3,2,1,0,0,0],
    [0,0,0,1,2,3,8,8,8,8,8,8,8,8,3,2,1,0,0,0],
    [0,0,0,1,2,3,3,8,8,8,8,8,8,3,3,2,1,0,0,0],
    [0,0,0,1,2,3,3,3,8,8,8,8,3,3,3,2,1,7,0,0],
    [0,0,0,1,2,2,3,3,3,3,3,3,3,3,2,2,1,7,7,0],
    [0,0,0,0,1,2,2,2,3,3,3,3,2,2,2,2,1,0,0,0],
    [0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,1,0,0,0,0],
    [0,0,0,0,0,1,1,2,2,2,2,2,2,1,1,0,0,0,0,0],
    [0,0,0,0,0,1,0,1,1,1,1,1,1,0,1,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  blink: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,7,1,0,0,1,7,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,3,2,2,1,1,2,2,3,1,0,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,2,2,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,8,1,1,1,1,1,1,8,3,1,0,0,0,0],
    [0,0,0,0,1,3,6,2,2,2,2,2,2,6,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,5,5,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,3,3,2,2,3,3,1,0,0,0,0],
    [0,0,0,1,2,3,3,8,8,8,8,8,8,3,3,2,1,0,0,0],
    [0,0,0,1,2,3,8,8,8,8,8,8,8,8,3,2,1,7,0,0],
    [0,0,0,1,2,3,3,8,8,8,8,8,8,3,3,2,1,7,7,0],
    [0,0,0,1,2,3,3,3,8,8,8,8,3,3,3,2,1,0,0,0],
    [0,0,0,1,2,2,3,3,3,3,3,3,3,3,2,2,1,0,0,0],
    [0,0,0,0,1,2,2,2,3,3,3,3,2,2,2,2,1,0,0,0],
    [0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,1,0,0,0,0],
    [0,0,0,0,0,1,1,2,2,2,2,2,2,1,1,0,0,0,0,0],
    [0,0,0,0,0,1,0,1,1,1,1,1,1,0,1,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '')
  const num = parseInt(clean, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

type Mood = 'idle' | 'walk' | 'sleep' | 'happy' | 'blink'
interface Particle { x: number; y: number; vx: number; vy: number; life: number; type: 'zz' | 'sparkle' | 'heart' }

export default function DesktopPet() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pos = useRef({ x: typeof window !== 'undefined' ? window.innerWidth - 180 : 600, y: typeof window !== 'undefined' ? window.innerHeight - 200 : 400 })
  const target = useRef({ x: pos.current.x, y: pos.current.y })
  const facing = useRef<'left' | 'right'>('left')
  const mood = useRef<Mood>('idle')
  const pinned = useRef(false)
  const tick = useRef(0)
  const lastMouseMove = useRef(Date.now())
  const lastPetTime = useRef<number>(0)
  const particles = useRef<Particle[]>([])
  const frameCache = useRef<Map<string, ImageData>>(new Map())
  const idleBounce = useRef(0)
  const moodTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const petUntilRef = useRef<number>(0)
  const [showMenu, setShowMenu] = useState(false)
  const [petFeedback, setPetFeedback] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem('syau-meo-muted') === 'true'
    } catch {
      return false
    }
  })

  // Play meow-first.mp3 on initial user interaction/load
  useEffect(() => {
    let played = false
    const tryPlayFirst = () => {
      if (!played) {
        played = true
        playFirstMeow()
        window.removeEventListener('pointerdown', tryPlayFirst)
        window.removeEventListener('keydown', tryPlayFirst)
      }
    }
    window.addEventListener('pointerdown', tryPlayFirst, { once: true })
    window.addEventListener('keydown', tryPlayFirst, { once: true })
    const t = setTimeout(() => { tryPlayFirst() }, 800)
    return () => {
      clearTimeout(t)
      window.removeEventListener('pointerdown', tryPlayFirst)
      window.removeEventListener('keydown', tryPlayFirst)
    }
  }, [])

  // Close menu on click outside with safe delayed attachment
  useEffect(() => {
    if (!showMenu) return
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.meo-pet-container')) {
        setShowMenu(false)
      }
    }
    const timer = setTimeout(() => {
      window.addEventListener('click', handleOutside)
    }, 100)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('click', handleOutside)
    }
  }, [showMenu])

  const renderFrame = useCallback((frameName: string): ImageData => {
    if (frameCache.current.has(frameName)) return frameCache.current.get(frameName)!
    const frameData = (F as any)[frameName] || F.idle1
    const size = 3
    const cols = frameData[0].length
    const rows = frameData.length
    const w = cols * size
    const h = rows * size
    const imgData = new ImageData(w, h)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const colorIdx = frameData[r][c]
        const hex = P[colorIdx] || 'transparent'
        if (hex === 'transparent') continue
        const rgb = hexToRgb(hex)
        for (let dy = 0; dy < size; dy++) {
          for (let dx = 0; dx < size; dx++) {
            const px = ((r * size + dy) * w + (c * size + dx)) * 4
            imgData.data[px] = rgb.r
            imgData.data[px + 1] = rgb.g
            imgData.data[px + 2] = rgb.b
            imgData.data[px + 3] = 255
          }
        }
      }
    }
    frameCache.current.set(frameName, imgData)
    return imgData
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = 80, H = 80
    canvas.width = W
    canvas.height = H

    const onMove = (e: MouseEvent) => {
      // Stay still if pinned or in 1-min petting session
      const isPetting = Date.now() < petUntilRef.current
      if (pinned.current || isPetting) return
      target.current = { x: e.clientX - W / 2, y: e.clientY - H / 2 }
      lastMouseMove.current = Date.now()
      if (mood.current === 'sleep') mood.current = 'idle'
    }
    window.addEventListener('mousemove', onMove)

    let frame: number
    const draw = () => {
      tick.current++
      ctx.clearRect(0, 0, W, H)
      const dx = target.current.x - pos.current.x
      const dy = target.current.y - pos.current.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const isPetting = Date.now() < petUntilRef.current

      // Only move if not in pet session and not pinned
      if (dist > 3 && !pinned.current && !isPetting) {
        pos.current.x += (dx / dist) * 2
        pos.current.y += (dy / dist) * 2
        facing.current = dx > 0 ? 'right' : 'left'
        mood.current = 'walk'
      } else if (mood.current === 'walk') mood.current = 'idle'

      if (!pinned.current && !isPetting && Date.now() - lastMouseMove.current > 15000 && mood.current !== 'happy') mood.current = 'sleep'
      if (mood.current === 'idle' && tick.current % 180 < 8) mood.current = 'blink'
      else if (mood.current === 'blink' && tick.current % 180 >= 8) mood.current = 'idle'

      const animTick = Math.floor(tick.current / 12) % 2
      let frameName = mood.current === 'walk' ? (animTick === 0 ? 'walk1' : 'walk2') : 
                      mood.current === 'sleep' ? (animTick === 0 ? 'sleep1' : 'sleep2') :
                      mood.current === 'happy' ? 'happy' : mood.current === 'blink' ? 'blink' : (animTick === 0 ? 'idle1' : 'idle2')

      idleBounce.current = (mood.current === 'idle' || mood.current === 'blink') ? Math.sin(tick.current * 0.04) * 1.5 : idleBounce.current * 0.9

      const imgData = renderFrame(frameName)
      ctx.save()
      if (facing.current === 'left') { ctx.translate(W, 0); ctx.scale(-1, 1) }
      ctx.putImageData(imgData, 10, 10 + idleBounce.current)
      ctx.restore()

      particles.current = particles.current.filter(p => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.012
        ctx.fillStyle = p.type === 'zz' ? '#C4B5FD' : p.type === 'heart' ? '#FF6B8B' : '#F5D0A9'
        if (p.type === 'zz') {
          ctx.fillText('z', p.x, p.y)
        } else {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.type === 'heart' ? 2.5 : 1.5, 0, Math.PI * 2)
          ctx.fill()
        }
        return p.life > 0
      })

      const container = canvas.parentElement
      if (container) {
        container.style.left = pos.current.x + 'px'
        container.style.top = pos.current.y + 'px'
      }
      frame = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(frame); window.removeEventListener('mousemove', onMove) }
  }, [renderFrame])

  // Pet Meo with 2s rate limit on sound & 1-minute popup-free still session
  const handlePetCat = (e: React.MouseEvent) => {
    e.stopPropagation()
    const now = Date.now()
    mood.current = 'happy'
    setShowMenu(false)

    // Lock still in petting mode for 1 minute (60 seconds)
    petUntilRef.current = now + 60000
    pinned.current = true

    // Burst of hearts and sparkles
    for (let i = 0; i < 8; i++) {
      particles.current.push({
        x: 40 + (Math.random() - 0.5) * 24,
        y: 26 + (Math.random() - 0.5) * 14,
        vx: (Math.random() - 0.5) * 1.8,
        vy: -1.2 - Math.random() * 1.0,
        life: 1,
        type: i % 2 === 0 ? 'heart' : 'sparkle'
      })
    }

    if (now - lastPetTime.current >= 2000) {
      lastPetTime.current = now
      playPetSound()
      setPetFeedback('Purrrr~ Meow!')
    } else {
      setPetFeedback('*Purrs happily*')
    }

    setTimeout(() => setPetFeedback(null), 1800)
    if (moodTimer.current) clearTimeout(moodTimer.current)
    moodTimer.current = setTimeout(() => { mood.current = 'idle' }, 1600)
  }

  const handleOpenAI = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMenu(false)
    window.dispatchEvent(new CustomEvent('meo-toggle'))
  }

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    const next = !isMuted
    setIsMuted(next)
    localStorage.setItem('syau-meo-muted', String(next))
    setPetFeedback(next ? 'Meo Sounds Muted' : 'Meo Sounds Unmuted')
    setTimeout(() => setPetFeedback(null), 1600)
    setShowMenu(false)
  }

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    const now = Date.now()

    if (now < petUntilRef.current) {
      handlePetCat(e)
      return
    }

    setShowMenu(prev => !prev)
  }, [])

  return (
    <div
      className="meo-pet-container"
      onClick={handleClick}
      style={{
        position: 'fixed',
        left: pos.current.x, top: pos.current.y, zIndex: 80,
        cursor: 'pointer', userSelect: 'none',
        filter: 'drop-shadow(0 4px 12px rgba(232,130,155,0.35))',
        transition: 'transform 0.15s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)' }}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      title="Meo (स्याउ साथी) — Click to pet!"
    >
      {petFeedback && (
        <div style={{
          position: 'absolute', bottom: '90%', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(232,130,155,0.95)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.4)', padding: '4px 10px', borderRadius: 12,
          color: '#FFFFFF', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', pointerEvents: 'none',
          boxShadow: '0 6px 16px rgba(232,130,155,0.5)',
          animation: 'bounce 0.4s ease',
          display: 'flex', alignItems: 'center', gap: 6
        }}>
          <Heart size={12} fill="#FFF" color="#FFF" />
          <span>{petFeedback}</span>
        </div>
      )}

      {showMenu && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: 8,
            background: 'rgba(18,20,32,0.92)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 16,
            padding: '8px',
            boxShadow: '0 16px 36px rgba(0,0,0,0.65), 0 0 0 1px rgba(232,130,155,0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            minWidth: 170,
            zIndex: 100
          }}
        >
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', textAlign: 'center', fontWeight: 600, paddingBottom: 2 }}>
            Meo (स्याउ साथी)
          </div>

          <button
            onClick={handlePetCat}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(232,130,155,0.25), rgba(212,120,156,0.15))',
              border: '1px solid rgba(232,130,155,0.4)',
              color: '#FFFFFF',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textAlign: 'left'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(232,130,155,0.45), rgba(212,120,156,0.3))'}
            onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(232,130,155,0.25), rgba(212,120,156,0.15))'}
          >
            <Heart size={14} color="#E8829B" fill="#E8829B" />
            <span>Pet Meo (म्याउँ!)</span>
          </button>

          <button
            onClick={handleOpenAI}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#FFFFFF',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textAlign: 'left'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.16)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >
            <Mic size={14} color="#7EDDD6" />
            <span>Meo AI Copilot</span>
          </button>

          <button
            onClick={handleToggleMute}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 10,
              background: isMuted ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.05)',
              border: isMuted ? '1px solid rgba(248,113,113,0.3)' : '1px solid rgba(255,255,255,0.1)',
              color: isMuted ? '#FCA5A5' : 'rgba(255,255,255,0.7)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textAlign: 'left'
            }}
            onMouseEnter={e => e.currentTarget.style.background = isMuted ? 'rgba(248,113,113,0.25)' : 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = isMuted ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.05)'}
          >
            {isMuted ? <VolumeX size={14} color="#F87171" /> : <Volume2 size={14} color="#34D399" />}
            <span>{isMuted ? 'Unmute Sounds' : 'Mute Sounds'}</span>
          </button>
        </div>
      )}

      {!showMenu && !petFeedback && (
        <div style={{
          position: 'absolute', bottom: '80%', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(16,18,30,0.85)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(232,130,155,0.4)', padding: '3px 8px', borderRadius: 12,
          color: '#FFFFFF', fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap', pointerEvents: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', gap: 4
        }}>
          <Heart size={10} color="#E8829B" />
          <span>Click to pet</span>
        </div>
      )}

      <canvas ref={canvasRef} style={{ width: 80, height: 80, imageRendering: 'pixelated' }} />
    </div>
  )
}
