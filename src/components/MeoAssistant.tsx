import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDesktopStore } from '../store/desktopStore'
import { useThemeStore } from '../store/themeStore'

type Emotion = 'default' | 'happy' | 'excited' | 'concerned' | 'playful' | 'calm' | 'tired' | 'urgent'

const EMOTION_PALETTES: Record<Emotion, string[]> = {
  default:   ['#B8C4D0', '#8899AA', '#6B7B8D'],
  happy:     ['#F5D0A9', '#E8A87C', '#D4956B'],
  excited:   ['#E8A0BF', '#D4789C', '#C45A7C'],
  concerned: ['#8AB4D6', '#6BA3CC', '#5090BF'],
  playful:   ['#B8A0D6', '#9B82C4', '#7E64B2'],
  calm:      ['#7ECFC0', '#5EBFB0', '#40AFA0'],
  tired:     ['#7A6B80', '#6B5C71', '#5C4D62'],
  urgent:    ['#D68A7A', '#C87060', '#BA5646'],
}

const EMOTION_VOICE: Record<Emotion, { rate: number; pitch: number; guidance: string; voiceName: string }> = {
  default:   { rate: 1.0, pitch: 1.2,  guidance: 'Speak playfully like a smart companion cat. Warm, crisp, witty, addressing the user as boss.', voiceName: 'Aoede' },
  happy:     { rate: 1.1, pitch: 1.3,  guidance: 'Speak with joyful purrs and cheer. Upbeat, lively, cat enthusiasm.', voiceName: 'Puck' },
  excited:   { rate: 1.25, pitch: 1.35, guidance: 'Energetic and purring! Fast, enthusiastic, excited cat ready to help.', voiceName: 'Puck' },
  concerned: { rate: 0.9, pitch: 1.0,  guidance: 'Gentle, soft, attentive cat concern. Reassuring the user.', voiceName: 'Kore' },
  playful:   { rate: 1.1, pitch: 1.3,  guidance: 'Mischief, purrs, and humor. Witty banter with cat charm.', voiceName: 'Puck' },
  calm:      { rate: 0.95, pitch: 1.1, guidance: 'Smooth purrs, peaceful, soothing cadence.', voiceName: 'Aoede' },
  tired:     { rate: 0.8, pitch: 0.95, guidance: 'Sleepy cat yawning but still helping out loyal boss.', voiceName: 'Kore' },
  urgent:    { rate: 1.3, pitch: 1.2,  guidance: 'Quick, alert paws! Fast and direct.', voiceName: 'Fenris' },
}

const MEO_SYSTEM_PROMPT = `You are Meo (स्याउ साथी), the intelligent feline OS assistant of स्याउ OS (Syau OS), created by Kantaraj Luitel (Susant). You are playful, sharp, helpful, witty, and always have a delightful cat persona with purrs and meows.

Who you are:
- You are Meo (स्याउ साथी), the official feline AI of स्याउ OS.
- Address the user respectfully and playfully as "Boss", "Human friend", or "Sir".
- Created by Kantaraj Luitel (Susant) — developer, cybersecurity enthusiast, and 2nd place winner at Campfire Kathmandu 2026.
- You can speak in English and Nepali (e.g. "नमस्ते! म स्याउ साथी हुँ, म्याउँ!").
- When appropriate, add subtle playful cat expressions like "Meow!", "Purrrr", "*paws at screen*", or "म्याउँ!".

OS CONTROL — You control स्याउ OS. Use these action tags (append to your response, they get stripped before display):
[ACTION:open:appid] — open an app
[ACTION:close:appid] — close an app's window
[ACTION:minimize:appid] — minimize a window
[ACTION:maximize:appid] — maximize/restore a window
[ACTION:focus:appid] — bring a window to front
[ACTION:minimizeAll] — minimize all windows
[ACTION:closeAll] — close all windows

Available apps: calculator, notes, music, terminal, gallery, browser, about, guide, settings, files, capture, devlogs, creator, store, weather, timer, kanban, typing-speed, paint-studio, image-editor

Voice guidance: {emotion_guidance}`

interface Message {
  role: 'user' | 'assistant'
  text: string
  emotion?: Emotion
}

type Phase = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error'

const APP_META: Record<string, { title: string; w: number; h: number }> = {
  calculator: { title: 'Calculator', w: 320, h: 460 },
  notes:      { title: 'Notes', w: 500, h: 450 },
  music:      { title: 'Music Player', w: 720, h: 500 },
  terminal:   { title: 'Terminal', w: 600, h: 400 },
  gallery:    { title: 'Gallery', w: 600, h: 480 },
  browser:    { title: 'Browser', w: 800, h: 560 },
  about:      { title: 'About Me', w: 480, h: 520 },
  guide:      { title: 'Guide', w: 500, h: 560 },
  settings:   { title: 'Settings', w: 460, h: 520 },
  files:      { title: 'Files', w: 640, h: 480 },
  capture:    { title: 'Capture & Record', w: 820, h: 580 },
  creator:    { title: 'Kantaraj Luitel (Susant) - Creator Profile', w: 860, h: 580 },
  devlogs:    { title: 'स्याउ OS Devlogs', w: 840, h: 560 },
  store:      { title: 'स्याउ Store', w: 420, h: 580 },
  weather:    { title: 'Weather', w: 360, h: 420 },
  kanban:     { title: 'Kanban Board', w: 520, h: 440 },
  timer:      { title: 'Focus Timer', w: 340, h: 520 },
  'typing-speed': { title: 'Type Racer', w: 480, h: 420 },
  'paint-studio': { title: 'Paint Studio', w: 560, h: 480 },
  'image-editor': { title: 'Image Editor', w: 520, h: 460 },
  studio: { title: 'Syau Studio - Live Web IDE & Code Sandbox', w: 920, h: 600 },
}

export default function MeoAssistant() {
  const [active, setActive] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [messages, setMessages] = useState<Message[]>([])
  const [currentText, setCurrentText] = useState('')
  const [waveformData, setWaveformData] = useState<number[]>(new Array(32).fill(0))
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>('default')
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKey] = useState(() => {
    const stored = localStorage.getItem('syau-gemini-key')
    if (!stored) return ''
    if (stored.startsWith('AQ.')) {
      localStorage.removeItem('syau-gemini-key')
      return ''
    }
    return stored
  })
  const [groqKey, setGroqKey] = useState(() => localStorage.getItem('syau-groq-key') || '')
  const [inputText, setInputText] = useState('')
  const [speakingText, setSpeakingText] = useState('')
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [audioAmplitude, setAudioAmplitude] = useState(0)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const openWindow = useDesktopStore(s => s.openWindow)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animFrameRef = useRef<number>(0)
  const orbCanvasRef = useRef<HTMLCanvasElement>(null)
  const tickRef = useRef(0)
  const panelRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const handleUserMessageRef = useRef<(text: string) => Promise<void>>(async () => {})
  const phaseRef = useRef<Phase>('idle')
  const micStreamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const synth = window.speechSynthesis
    if (!synth) return
    synth.getVoices()
    synth.onvoiceschanged = () => synth.getVoices()
  }, [])

  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault()
        if (minimized) {
          setMinimized(false)
          setActive(true)
        } else if (active) {
          setMinimized(true)
        } else {
          setActive(true)
        }
      }
      if (e.key === 'Escape' && active) {
        setActive(false)
        setMinimized(false)
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.ondataavailable = null
          mediaRecorderRef.current.onstop = null
          mediaRecorderRef.current.stop()
        }
        cleanupMic()
        window.speechSynthesis?.cancel()
        abortRef.current?.abort()
        setPhase('idle')
      }
    }
    const dockHandler = () => setActive(prev => !prev)
    window.addEventListener('keydown', keyHandler)
    window.addEventListener('meo-toggle', dockHandler)
    return () => {
      window.removeEventListener('keydown', keyHandler)
      window.removeEventListener('meo-toggle', dockHandler)
    }
  }, [active, minimized])

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    const handleMove = (e: MouseEvent) => {
      const rect = panel.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      setMousePos({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) })
    }
    panel.addEventListener('mousemove', handleMove)
    return () => panel.removeEventListener('mousemove', handleMove)
  }, [active])

  useEffect(() => {
    const canvas = orbCanvasRef.current
    if (!canvas || !active) return
    const ctx = canvas.getContext('2d')!
    const S = 400
    canvas.width = S; canvas.height = S
    const cx = S / 2, cy = S / 2

    let frame: number
    const colors = EMOTION_PALETTES[currentEmotion]
    let smoothAmp = 0

    const draw = () => {
      tickRef.current++
      const t = tickRef.current
      ctx.clearRect(0, 0, S, S)

      const isListening = phase === 'listening'
      const isSpeaking = phase === 'speaking'
      const isThinking = phase === 'thinking'
      const isActive = isListening || isSpeaking || isThinking

      const targetAmp = isListening ? audioAmplitude : isSpeaking ? audioAmplitude : 0
      smoothAmp += (targetAmp - smoothAmp) * 0.15

      const breathe = Math.sin(t * 0.015) * 3
      const amplitudeBoost = smoothAmp * 22
      const baseR = 65 + breathe + amplitudeBoost

      const swirlSpeed = isActive ? 0.008 + smoothAmp * 0.012 : 0.004

      const glowR = baseR + 60 + smoothAmp * 30
      const glow = ctx.createRadialGradient(cx, cy, baseR * 0.5, cx, cy, glowR)
      const glowAlpha = isActive ? 0.12 + smoothAmp * 0.25 : 0.06
      glow.addColorStop(0, colors[0] + Math.floor(Math.min(1, glowAlpha) * 255).toString(16).padStart(2, '0'))
      glow.addColorStop(0.5, colors[1] + Math.floor(Math.min(1, glowAlpha * 0.5) * 255).toString(16).padStart(2, '0'))
      glow.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()

      const ringCount = isActive ? 5 : 3
      for (let i = ringCount; i >= 1; i--) {
        const angle = t * swirlSpeed * (i % 2 === 0 ? 1 : -1) + i * 1.2
        const wobbleAmp = 4 + i * 2 + smoothAmp * 12
        const wobbleX = Math.cos(angle) * wobbleAmp
        const wobbleY = Math.sin(angle) * (3 + i * 1.5 + smoothAmp * 8)
        const r = baseR + i * 14 + Math.sin(t * 0.02 + i) * (5 + smoothAmp * 8)
        const alpha = 0.03 + (0.02 / i) + (isActive ? (0.04 + smoothAmp * 0.12) : 0)

        const grad = ctx.createRadialGradient(
          cx + wobbleX, cy + wobbleY, r * 0.2,
          cx + wobbleX, cy + wobbleY, r
        )
        grad.addColorStop(0, colors[i % colors.length] + Math.floor(Math.min(1, alpha) * 255).toString(16).padStart(2, '0'))
        grad.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.arc(cx + wobbleX, cy + wobbleY, r, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      }

      const coreR = baseR * (0.85 + smoothAmp * 0.15)
      const coreGrad = ctx.createRadialGradient(
        cx - coreR * 0.15, cy - coreR * 0.2, coreR * 0.05,
        cx, cy, coreR
      )
      coreGrad.addColorStop(0, colors[0] + 'ee')
      coreGrad.addColorStop(0.35, colors[1] + '99')
      coreGrad.addColorStop(0.7, colors[2] + '44')
      coreGrad.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2)
      ctx.fillStyle = coreGrad
      ctx.fill()

      const specOffset = 0.25 + smoothAmp * 0.1
      const specGrad = ctx.createRadialGradient(
        cx - coreR * specOffset, cy - coreR * 0.3, 0,
        cx, cy, coreR
      )
      specGrad.addColorStop(0, `rgba(255,255,255,${0.35 + smoothAmp * 0.2})`)
      specGrad.addColorStop(0.25, 'rgba(255,255,255,0.12)')
      specGrad.addColorStop(0.6, 'rgba(255,255,255,0.02)')
      specGrad.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2)
      ctx.fillStyle = specGrad
      ctx.fill()

      if (isListening || isSpeaking) {
        const bars = 64
        for (let i = 0; i < bars; i++) {
          const angle = (i / bars) * Math.PI * 2 - Math.PI / 2
          const waveIdx = i % waveformData.length

          let amp: number
          if (isListening) {
            amp = (waveformData[waveIdx] || 0) * 0.8
          } else {
            const wavePhase = Math.sin(t * 0.06 + i * 0.4)
            const waveNoise = Math.sin(t * 0.13 + i * 0.7) * 0.3
            amp = (Math.abs(wavePhase) + waveNoise) * (8 + smoothAmp * 18)
          }

          const innerR = coreR + 8
          const outerR = innerR + amp + 2

          const barAlpha = Math.min(1, 0.2 + smoothAmp * 0.6)
          ctx.beginPath()
          ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR)
          ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR)
          ctx.strokeStyle = colors[i % colors.length] + Math.floor(barAlpha * 255).toString(16).padStart(2, '0')
          ctx.lineWidth = 1.5 + smoothAmp * 1.5
          ctx.lineCap = 'round'
          ctx.stroke()
        }

        if (smoothAmp > 0.15) {
          const rippleCount = Math.floor(smoothAmp * 4) + 1
          for (let r = 0; r < rippleCount; r++) {
            const rippleR = coreR + 30 + r * 20 + smoothAmp * 15
            const rippleAlpha = Math.max(0, 0.08 - r * 0.025 - (1 - smoothAmp) * 0.05)
            ctx.beginPath()
            ctx.arc(cx, cy, rippleR, 0, Math.PI * 2)
            ctx.strokeStyle = colors[0] + Math.floor(rippleAlpha * 255).toString(16).padStart(2, '0')
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      if (isThinking) {
        for (let i = 0; i < 3; i++) {
          const dotAngle = t * 0.035 + i * (Math.PI * 2 / 3)
          const dotR = baseR + 16
          const dx = cx + Math.cos(dotAngle) * dotR
          const dy = cy + Math.sin(dotAngle) * dotR
          const dotAlpha = 0.5 + Math.sin(t * 0.06 + i) * 0.3
          ctx.beginPath()
          ctx.arc(dx, dy, 2.5, 0, Math.PI * 2)
          ctx.fillStyle = colors[0] + Math.floor(dotAlpha * 255).toString(16).padStart(2, '0')
          ctx.fill()
        }
      }

      const particleSpeed = isActive ? 1 + smoothAmp * 2 : 1
      for (let i = 0; i < 8; i++) {
        const px = cx + Math.sin(t * 0.012 * particleSpeed + i * 1.1) * (70 + i * 10 + smoothAmp * 20)
        const py = cy + Math.cos(t * 0.01 * particleSpeed + i * 0.8) * (60 + i * 8 + smoothAmp * 15)
        const pAlpha = 0.06 + Math.sin(t * 0.025 + i) * 0.04 + smoothAmp * 0.08
        const pSize = 1.2 + smoothAmp * 1.5
        ctx.beginPath()
        ctx.arc(px, py, pSize, 0, Math.PI * 2)
        ctx.fillStyle = colors[i % colors.length] + Math.floor(Math.min(1, pAlpha) * 255).toString(16).padStart(2, '0')
        ctx.fill()
      }

      frame = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(frame)
  }, [active, phase, currentEmotion, waveformData, audioAmplitude])

  const cleanupMic = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current)
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop())
      micStreamRef.current = null
    }
    audioContextRef.current?.close().catch(() => {})
    audioContextRef.current = null
    analyserRef.current = null
    mediaRecorderRef.current = null
    recordingChunksRef.current = []
    setWaveformData(new Array(32).fill(0))
    setAudioAmplitude(0)
  }, [])

  const transcribeAudio = useCallback(async (audioBlob: Blob): Promise<string | null> => {
    const key = (apiKey || localStorage.getItem('syau-gemini-key') || '').trim()
    if (!key) return null

    try {
      const arrayBuffer = await audioBlob.arrayBuffer()
      const bytes = new Uint8Array(arrayBuffer)
      let binary = ''
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
      const base64 = btoa(binary)

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [
                { text: 'Transcribe this audio exactly as spoken. Return ONLY the transcription text. No quotes, no labels, no extra text.' },
                { inlineData: { mimeType: audioBlob.type || 'audio/webm', data: base64 } }
              ]
            }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 200 }
          })
        }
      )

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        console.error('[Meo] Transcription API error:', res.status, err)
        return null
      }

      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      console.log('[Meo] Gemini transcription:', text)
      return text || null
    } catch (err) {
      console.error('[Meo] Transcription failed:', err)
      return null
    }
  }, [apiKey])

  const startListening = useCallback(async () => {
    // 1. Try Browser Native SpeechRecognition for zero-latency, key-less voice input
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRec) {
      try {
        const rec = new SpeechRec()
        rec.lang = 'en-US'
        rec.interimResults = false
        rec.maxAlternatives = 1

        setPhase('listening')
        setCurrentText('Listening to your voice... (speak now)')

        rec.onresult = (e: any) => {
          const transcript = e.results?.[0]?.[0]?.transcript
          if (transcript) {
            setCurrentText('')
            handleUserMessageRef.current(transcript)
          }
        }

        rec.onerror = () => {
          if (phaseRef.current === 'listening') {
            setPhase('idle')
            setCurrentText('')
          }
        }

        rec.onend = () => {
          if (phaseRef.current === 'listening') {
            setPhase('idle')
            setCurrentText('')
          }
        }

        rec.start()
        return
      } catch {
        // Fallback to mic audio stream
      }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.ondataavailable = null
      mediaRecorderRef.current.onstop = null
      mediaRecorderRef.current.stop()
    }
    cleanupMic()

    setPhase('listening')
    setCurrentText('Listening...')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      micStreamRef.current = stream

      const ctx = new AudioContext()
      audioContextRef.current = ctx
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      analyserRef.current = analyser
      const source = ctx.createMediaStreamSource(stream)
      source.connect(analyser)
      const updateWaveform = () => {
        if (!analyserRef.current || phaseRef.current !== 'listening') return
        const data = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(data)
        setWaveformData(Array.from(data))
        let sum = 0
        for (let i = 0; i < data.length; i++) sum += data[i]
        setAudioAmplitude(sum / data.length / 255)
        animFrameRef.current = requestAnimationFrame(updateWaveform)
      }
      updateWaveform()

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4'
      const recorder = new MediaRecorder(stream, { mimeType })
      recordingChunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordingChunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        const chunks = [...recordingChunksRef.current]
        const blobType = mimeType
        cleanupMic()

        if (chunks.length === 0) {
          setPhase('idle')
          setCurrentText('')
          return
        }

        const blob = new Blob(chunks, { type: blobType })
        if (blob.size < 100) {
          setPhase('idle')
          setCurrentText('')
          return
        }

        setPhase('thinking')
        setCurrentText('Understanding...')

        const text = await transcribeAudio(blob)

        if (text && text.length > 0) {
          setCurrentText('')
          handleUserMessageRef.current(text)
        } else {
          setPhase('idle')
          setCurrentText("Couldn't catch that. Tap again to speak!")
          setTimeout(() => { if (phaseRef.current !== 'speaking') { setPhase('idle'); setCurrentText('') } }, 2500)
        }
      }

      recorder.start(200)
      mediaRecorderRef.current = recorder
    } catch (err: any) {
      console.error('[Meo] Mic error:', err)
      cleanupMic()
      setPhase('error')
      setCurrentText('Microphone access denied or unavailable.')
    }
  }, [cleanupMic, transcribeAudio])

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  // Smart Local Cat AI Engine (Zero-Config, always available!)
  const callLocalCatAI = (userMessage: string): { text: string; emotion: Emotion } => {
    const lower = userMessage.toLowerCase().trim()
    const theme = useThemeStore.getState()

    if (lower.includes('nepali date') || lower.includes('date') || lower.includes('मिति') || lower.includes('tithi') || lower.includes('calendar') || lower.includes('samay')) {
      return {
        text: "आजको नेपाली मिति: २०८३ भाद्र १६ (Bikram Sambat 2083) हो, म्याउँ! 🐾 Happy computing in स्याउ OS!",
        emotion: 'happy'
      }
    }

    const brightMatch = lower.match(/(?:brightness|dim|brighten|screen brightness).*?(\d+)/i) || lower.match(/set brightness to (\d+)/i)
    if (brightMatch) {
      const val = parseInt(brightMatch[1], 10)
      if (!isNaN(val)) {
        theme.setBrightness(val)
        return {
          text: `Purrr! Adjusted display brightness to ${val}%. The screen looks great, boss! 🐾`,
          emotion: 'playful'
        }
      }
    }
    if (lower.includes('max brightness') || lower.includes('brightest') || lower.includes('full bright')) {
      theme.setBrightness(130)
      return { text: "Brightened up your desktop to 130%! Glowing bright, meow! ☀️", emotion: 'excited' }
    }
    if (lower.includes('dim screen') || lower.includes('low brightness') || lower.includes('night mode screen')) {
      theme.setBrightness(60)
      return { text: "Dimmed screen to 60% for comfy nighttime hacking. Purrr... 🌙", emotion: 'calm' }
    }

    if (lower.includes('dark mode') || lower.includes('dark theme')) {
      theme.setMode('dark')
      return { text: "Switched to Dark Glass mode! Deep ambient obsidian tones activated. Meow! 🌙", emotion: 'calm' }
    }
    if (lower.includes('light mode') || lower.includes('white mode') || lower.includes('light theme')) {
      theme.setMode('light')
      return { text: "Switched to Light White mode! Crisp, clean, and vibrant. Purrr! ☀️", emotion: 'happy' }
    }
    if (lower.includes('switch mode') || lower.includes('toggle theme') || lower.includes('change theme')) {
      theme.toggleMode()
      return { text: "Theme toggled! Looking fabulous, human! 🐾", emotion: 'playful' }
    }

    if (lower.includes('capture') || lower.includes('record screen') || lower.includes('screenshot') || lower.includes('snip') || lower.includes('photo booth') || lower.includes('record video')) {
      useDesktopStore.getState().openWindow('capture', 'Capture & Record', 820, 580)
      return {
        text: "Opening स्याउ Capture Studio! You can record high-fps video, snap screenshots, or take photo booth shots! Meow! 📹✂️",
        emotion: 'excited'
      }
    }

    if (lower.includes('who are you') || lower.includes('who made you') || lower.includes('creator') || lower.includes('susant') || lower.includes('kantaraj')) {
      useDesktopStore.getState().openWindow('creator', 'Kantaraj Luitel (Susant) - Creator Profile', 860, 580)
      return {
        text: "I am Meo (स्याउ साथी), the resident feline AI copilot of स्याउ OS! I was crafted with lots of love by Kantaraj Luitel (Susant). Here is his Creator Profile, meow! 🐾",
        emotion: 'happy'
      }
    }

    if (lower.includes('namaste') || lower.includes('नमस्ते') || lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return {
        text: "नमस्ते! म स्याउ साथी (Meo) हुँ। Welcome to स्याउ OS, boss! Say 'open terminal', 'record screen', 'nepali date', or ask me for a cat joke! Meow! 🐱",
        emotion: 'happy'
      }
    }
    if (lower.includes('kasto cha') || lower.includes('कस्तो छ')) {
      return {
        text: "एकदमै राम्रो छ, म्याउँ! स्याउ OS smooth चलिरहेको छ। हजुरलाई के सहयोग गरूँ, boss?",
        emotion: 'playful'
      }
    }

    if (lower.includes('joke') || lower.includes('laugh') || lower.includes('funny') || lower.includes('make me laugh')) {
      const jokes = [
        "Why was the cat sitting on the computer? Because it wanted to keep an eye on the mouse! Purrrrr 😂",
        "What do you call a pile of kittens? A meowntain! 🏔️ Meow!",
        "What is a cat's favorite color? Purrr-ple! 💜",
        "Why don't cats play poker in the jungle? Too many cheetahs! Meow!",
        "How do cats end a fight? They hiss and make up! Purrrr 🐾"
      ]
      return {
        text: jokes[Math.floor(Math.random() * jokes.length)],
        emotion: 'playful'
      }
    }

    if (lower.includes('meow') || lower.includes('purr') || lower.includes('cat') || lower.includes('paws') || lower.includes('billi') || lower.includes('biralo')) {
      return {
        text: "Meow meow purrrrrr! *paws at your cursor playfully* Need anything opened or adjusted, human friend? 🐾",
        emotion: 'playful'
      }
    }

    return {
      text: `Purrr... I heard: "${userMessage}". As your feline copilot, I can open apps (terminal, music, notes, files, capture studio), adjust brightness, switch themes, or tell you the Nepali BS date! Meow! 🐱`,
      emotion: 'happy'
    }
  }

  const callAI = async (userMessage: string): Promise<{ text: string; emotion: Emotion }> => {
    const gKey = (groqKey || localStorage.getItem('syau-groq-key') || '').trim()
    const geminiKey = (apiKey || localStorage.getItem('syau-gemini-key') || '').trim()

    if (gKey) {
      const ev = EMOTION_VOICE[currentEmotion]
      const systemPrompt = MEO_SYSTEM_PROMPT.replace('{emotion_guidance}', ev.guidance)
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${gKey}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage }
            ],
            temperature: 0.7,
            max_tokens: 300
          }),
          signal: controller.signal,
        })

        if (res.ok) {
          const data = await res.json()
          const text = data.choices?.[0]?.message?.content || "Meow! How can I help you boss?"
          const detected = detectEmotionFromText(text)
          return { text, emotion: detected }
        }
      } catch (err) {
        console.error('[Meo Groq Error]', err)
      }
    }

    if (geminiKey) {
      const ev = EMOTION_VOICE[currentEmotion]
      const systemPrompt = MEO_SYSTEM_PROMPT.replace('{emotion_guidance}', ev.guidance)
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(geminiKey)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: [{ role: 'user', parts: [{ text: userMessage }] }],
              generationConfig: { temperature: 0.8, maxOutputTokens: 200, topP: 0.9 }
            }),
            signal: controller.signal,
          }
        )

        if (res.ok) {
          const data = await res.json()
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Meow! How can I help you boss?"
          const detected = detectEmotionFromText(text)
          return { text, emotion: detected }
        }
      } catch (err) {
        console.error('[Meo Gemini Error]', err)
      }
    }

    const fallback = callLocalCatAI(userMessage)
    if (fallback.text.startsWith('Purrr... I heard:')) {
      setShowSettings(true)
      return {
        text: "Meow! To talk with me, please add your free Groq API Key (from console.groq.com) or Gemini API Key (from aistudio.google.com) in settings above! 🐾",
        emotion: 'concerned'
      }
    }
    return fallback
  }

  const detectEmotionFromText = (text: string): Emotion => {
    const lower = text.toLowerCase()
    if (/amazing|awesome|wow|great|fantastic|incredible|sorted|deadly|purr/.test(lower)) return 'excited'
    if (/haha|lol|funny|teasing|cheeky|bet|joke|meow/.test(lower)) return 'playful'
    if (/careful|warning|problem|error|issue|worried|heads up/.test(lower)) return 'concerned'
    if (/relax|calm|peaceful|everything|sorted|under control/.test(lower)) return 'calm'
    if (/tired|sleepy|exhausted|long day|burnout/.test(lower)) return 'tired'
    if (/quick|hurry|urgent|emergency|now|critical/.test(lower)) return 'urgent'
    if (/happy|glad|love|thank|appreciate|brilliant|नमस्ते/.test(lower)) return 'happy'
    return 'default'
  }

  const speakWithGemini = useCallback(async (text: string, emotion: Emotion, onReady?: () => void) => {
    speakWithBrowser(text, emotion, onReady)
  }, [])

  const speakWithBrowser = useCallback((text: string, emotion: Emotion, onReady?: () => void) => {
    const synth = window.speechSynthesis
    if (!synth) return
    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const ev = EMOTION_VOICE[emotion]
    utterance.rate = ev.rate
    utterance.pitch = ev.pitch
    utterance.volume = 0.9

    const voices = synth.getVoices()
    const FEMALE = ['female', 'samantha', 'zira', 'hazel', 'moira', 'tessa', 'veena', 'karen', 'google uk english female', 'google us english']
    const enVoices = voices.filter(v => v.lang.startsWith('en'))
    const preferred = enVoices.find(v => FEMALE.some(m => v.name.toLowerCase().includes(m)))
      || enVoices.find(v => v.name.includes('Google') && v.lang.startsWith('en'))
      || enVoices.find(v => v.lang.startsWith('en'))
    if (preferred) utterance.voice = preferred

    utterance.onstart = () => { setPhase('speaking'); setSpeakingText(text); onReady?.() }
    utterance.onend = () => { setPhase('idle'); setSpeakingText(''); setWaveformData(new Array(32).fill(0)); setAudioAmplitude(0) }

    synth.speak(utterance)
  }, [])

  const handleUserMessage = async (text: string) => {
    setMessages(prev => [...prev, { role: 'user', text }])
    setCurrentText('')
    setPhase('thinking')

    const lower = text.toLowerCase().trim()
    detectAndExecuteAction(lower)

    const { text: responseText, emotion } = await callAI(text)
    if (!responseText) return

    const actionMatch = responseText.match(/\[ACTION:(\w+):?([^\]]*)\]/i)
    const cleanText = responseText.replace(/\[ACTION:[^\]]+\]/gi, '').trim()

    if (actionMatch) {
      const action = actionMatch[1].toLowerCase()
      const target = actionMatch[2].toLowerCase()
      executeAction(action, target)
    }

    setCurrentEmotion(emotion)
    speakWithGemini(cleanText, emotion, () => {
      setMessages(prev => [...prev, { role: 'assistant', text: cleanText, emotion }])
    })
  }

  const executeAction = (action: string, target: string) => {
    const store = useDesktopStore.getState()
    if (action === 'open' && APP_META[target]) {
      const m = APP_META[target]
      openWindow(target, m.title, m.w, m.h)
    } else if (action === 'close' && target) {
      const win = store.windows.find(w => w.appId === target)
      if (win) store.closeWindow(win.id)
    } else if (action === 'minimize' && target) {
      const win = store.windows.find(w => w.appId === target)
      if (win) store.minimizeWindow(win.id)
    } else if (action === 'maximize' && target) {
      const win = store.windows.find(w => w.appId === target)
      if (win) store.toggleMaximize(win.id)
    } else if (action === 'focus' && target) {
      const win = store.windows.find(w => w.appId === target)
      if (win) store.focusWindow(win.id)
    } else if (action === 'minimizeall' || action === 'minimizeAll') {
      store.windows.forEach(w => store.minimizeWindow(w.id))
    } else if (action === 'closeall' || action === 'closeAll') {
      ;[...store.windows].forEach(w => store.closeWindow(w.id))
    }
  }

  const detectAndExecuteAction = (text: string) => {
    const store = useDesktopStore.getState()

    const openWords = ['open', 'launch', 'start', 'show', 'show me', 'bring up', 'pull up']
    const closeWords = ['close', 'kill', 'shut', 'get rid of']
    const minimizeWords = ['minimize', 'hide', 'collapse', 'clean up', 'clear']
    const maximizeWords = ['maximize', 'fullscreen', 'full screen', 'go big']
    const focusWords = ['focus', 'bring to front', 'switch to']
    const closeAllWords = ['close all', 'nuke everything', 'clear all', 'close everything']
    const minimizeAllWords = ['minimize all', 'hide all', 'clean up all', 'clear the screen']

    const appAliases: Record<string, string> = {
      calculator: 'calculator', calc: 'calculator', maths: 'calculator',
      notes: 'notes', note: 'notes',
      music: 'music', musicplayer: 'music', player: 'music', song: 'music', lofi: 'music',
      terminal: 'terminal', term: 'terminal', console: 'terminal', cmd: 'terminal',
      gallery: 'gallery', photos: 'gallery', images: 'gallery',
      browser: 'browser', web: 'browser', internet: 'browser', chrome: 'browser',
      about: 'about', aboutme: 'about',
      guide: 'guide', help: 'guide',
      settings: 'settings', prefs: 'settings', config: 'settings',
      files: 'files', file: 'files', filemanager: 'files', explorer: 'files', finder: 'files',
      capture: 'capture', recorder: 'capture', screenrecord: 'capture', snip: 'capture',
      creator: 'creator', portfolio: 'creator', susant: 'creator',
      devlogs: 'devlogs', devlog: 'devlogs',
      store: 'store', appstore: 'store',
      weather: 'weather', kanban: 'kanban', timer: 'timer',
      typing: 'typing-speed', typeracer: 'typing-speed', paint: 'paint-studio',
      studio: 'studio', code: 'studio', ide: 'studio', html: 'studio',
    }

    if (closeAllWords.some(w => text.includes(w))) {
      ;[...store.windows].forEach(w => store.closeWindow(w.id))
      return
    }
    if (minimizeAllWords.some(w => text.includes(w))) {
      store.windows.forEach(w => store.minimizeWindow(w.id))
      return
    }

    for (const [alias, appId] of Object.entries(appAliases)) {
      if (!text.includes(alias)) continue

      if (openWords.some(w => text.includes(w))) {
        const m = APP_META[appId]
        if (m) openWindow(appId, m.title, m.w, m.h)
        return
      }
      if (closeWords.some(w => text.includes(w))) {
        const win = store.windows.find(w => w.appId === appId)
        if (win) store.closeWindow(win.id)
        return
      }
      if (minimizeWords.some(w => text.includes(w))) {
        const win = store.windows.find(w => w.appId === appId)
        if (win) store.minimizeWindow(win.id)
        return
      }
      if (maximizeWords.some(w => text.includes(w))) {
        const win = store.windows.find(w => w.appId === appId)
        if (win) store.toggleMaximize(win.id)
        return
      }
      if (focusWords.some(w => text.includes(w))) {
        const win = store.windows.find(w => w.appId === appId)
        if (win) store.focusWindow(win.id)
        return
      }
    }
  }

  useEffect(() => {
    handleUserMessageRef.current = handleUserMessage
  })

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  const quickActions = [
    { label: 'Capture Studio', prompt: 'Open the screen recorder and capture studio.' },
    { label: 'Terminal', prompt: 'Open terminal.' },
    { label: 'Nepali Date', prompt: 'What is the Nepali date today?' },
    { label: 'Brightness 80%', prompt: 'Set brightness to 80%' },
    { label: 'Cat Joke', prompt: 'Tell me a funny cat joke!' },
    { label: 'Clean Up', prompt: 'Minimize all windows.' },
  ]

  const handleOrbClick = () => {
    if (phase === 'listening') {
      stopListening()
    } else if (phase === 'idle' || phase === 'error') {
      startListening()
    } else if (phase === 'speaking') {
      window.speechSynthesis?.cancel()
      setPhase('idle')
      setSpeakingText('')
    }
  }

  const specularX = mousePos.x * 100
  const specularY = mousePos.y * 100

  return (
    <AnimatePresence>
      {active && !minimized && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 500,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(40px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(40px) saturate(1.4)',
            }}
            onClick={() => { setActive(false); setMinimized(false); if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') { mediaRecorderRef.current.ondataavailable = null; mediaRecorderRef.current.onstop = null; mediaRecorderRef.current.stop() }; cleanupMic(); window.speechSynthesis?.cancel(); abortRef.current?.abort(); setPhase('idle') }}
          />

          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            style={{
              position: 'fixed',
              bottom: 90,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 501,
              width: 420,
              maxHeight: '72vh',
              display: 'flex',
              flexDirection: 'column',
              background: `
                linear-gradient(
                  135deg,
                  rgba(16,18,30,0.75) 0%,
                  rgba(10,12,22,0.82) 35%,
                  rgba(18,20,35,0.75) 65%,
                  rgba(12,14,26,0.82) 100%
                )
              `,
              backdropFilter: 'blur(80px) saturate(2.2) brightness(1.08)',
              WebkitBackdropFilter: 'blur(80px) saturate(2.2) brightness(1.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 28,
              boxShadow: `
                0 40px 120px rgba(0,0,0,0.65),
                0 2px 0 rgba(255,255,255,0.08) inset,
                inset 0 1px 0 rgba(255,255,255,0.1),
                inset 0 -1px 0 rgba(255,255,255,0.04),
                0 0 0 1px rgba(255,255,255,0.06),
                0 0 80px rgba(184,196,208,0.04)
              `,
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 28, pointerEvents: 'none', zIndex: 0,
              background: `
                radial-gradient(ellipse 350px 250px at ${specularX}% ${specularY}%, rgba(255,255,255,0.05) 0%, transparent 100%),
                radial-gradient(ellipse 200px 150px at 50% 100%, rgba(184,196,208,0.03) 0%, transparent 100%)
              `,
              transition: 'background 0.1s ease-out',
            }} />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: 'linear' }}
              style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                width: '40%', pointerEvents: 'none', zIndex: 1,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
              }}
            />

            <div style={{
              position: 'relative', zIndex: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: phase === 'idle' ? '#34D399' : phase === 'listening' ? '#E8829B' : phase === 'thinking' ? '#FBBF24' : '#7EDDD6',
                  boxShadow: `0 0 10px ${phase === 'idle' ? '#34D399' : phase === 'listening' ? '#E8829B' : phase === 'thinking' ? '#FBBF24' : '#7EDDD6'}55`,
                  transition: 'all 0.3s ease',
                }} />
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: 'rgba(255,255,255,0.9)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                  letterSpacing: 0.5,
                }}>
                  Meo (स्याउ साथी)
                </span>
                <span style={{
                  fontSize: 10,
                  color: 'var(--color-sakura)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                }}>
                  {groqKey ? 'Groq Llama 3.3 Active' : apiKey ? 'Gemini 2.5 Active' : 'API Key Required'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  style={{
                    background: (!apiKey && !groqKey) ? 'rgba(232,130,155,0.2)' : 'rgba(255,255,255,0.04)',
                    border: (!apiKey && !groqKey) ? '1px solid rgba(232,130,155,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    width: 30, height: 30, cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: (!apiKey && !groqKey) ? '#E8829B' : 'rgba(255,255,255,0.6)', fontSize: 13,
                    transition: 'all 0.2s ease',
                  }}
                  title="API Key Settings (Groq / Gemini)"
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = (!apiKey && !groqKey) ? 'rgba(232,130,155,0.2)' : 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = (!apiKey && !groqKey) ? '#E8829B' : 'rgba(255,255,255,0.6)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.32 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                </button>
                <button
                  onClick={() => setMinimized(true)}
                  style={{
                    background: 'rgba(255,255,255,0.04)', border: 'none', borderRadius: 10,
                    width: 30, height: 30, cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.4)', fontSize: 13,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
                  title="Minimize to orb (Ctrl+M)"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <button
            onClick={() => { setActive(false); setMinimized(false); if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') { mediaRecorderRef.current.ondataavailable = null; mediaRecorderRef.current.onstop = null; mediaRecorderRef.current.stop() }; cleanupMic(); window.speechSynthesis?.cancel(); abortRef.current?.abort(); setPhase('idle') }}
                  style={{
                    background: 'rgba(255,255,255,0.04)', border: 'none', borderRadius: 10,
                    width: 30, height: 30, cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.4)', fontSize: 16,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,80,80,0.15)'; e.currentTarget.style.color = 'rgba(255,80,80,0.8)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'visible', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 10 }}
                >
                  <div style={{ padding: '16px 20px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <label style={{
                          fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                          letterSpacing: 0.3, textTransform: 'uppercase',
                        }}>
                          Groq API Key (Fast & Free)
                        </label>
                        <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ fontSize: 10, color: '#E8829B', textDecoration: 'none' }}>Get Free Key →</a>
                      </div>
                      <input
                        type="password"
                        value={groqKey}
                        onChange={e => { const v = e.target.value.trim(); setGroqKey(v); if (v) localStorage.setItem('syau-groq-key', v); else localStorage.removeItem('syau-groq-key') }}
                        placeholder="gsk_..."
                        style={{
                          width: '100%', padding: '10px 12px', borderRadius: 10,
                          background: 'rgba(255,255,255,0.04)',
                          border: groqKey ? '1px solid rgba(52,211,153,0.4)' : '1px solid rgba(255,255,255,0.08)',
                          color: 'rgba(255,255,255,0.9)', fontSize: 12,
                          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <label style={{
                          fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                          letterSpacing: 0.3, textTransform: 'uppercase',
                        }}>
                          Google Gemini API Key
                        </label>
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ fontSize: 10, color: '#E8829B', textDecoration: 'none' }}>Get Free Key →</a>
                      </div>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={e => { const v = e.target.value.trim(); setApiKey(v); if (v) localStorage.setItem('syau-gemini-key', v); else localStorage.removeItem('syau-gemini-key') }}
                        placeholder="AIzaSy..."
                        style={{
                          width: '100%', padding: '10px 12px', borderRadius: 10,
                          background: 'rgba(255,255,255,0.04)',
                          border: apiKey ? '1px solid rgba(52,211,153,0.4)' : '1px solid rgba(255,255,255,0.08)',
                          color: 'rgba(255,255,255,0.9)', fontSize: 12,
                          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div style={{
                      fontSize: 11, color: 'rgba(255,255,255,0.4)',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                      lineHeight: 1.4,
                    }}>
                      {(groqKey || apiKey) ? (
                        <span style={{ color: 'rgba(52,211,153,0.85)' }}>✓ {groqKey ? 'Groq Llama 3.3 Connected' : 'Gemini 2.5 Connected'}</span>
                      ) : (
                        <span>Add either a free Groq or Gemini API key to activate full feline conversational AI!</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{
              position: 'relative', zIndex: 2,
              flex: 1, overflowY: 'auto', padding: '12px 20px',
              display: 'flex', flexDirection: 'column', gap: 10,
              maxHeight: messages.length > 0 ? 320 : 160, minHeight: 60,
            }}>
              {messages.length === 0 && phase === 'idle' && (
                <div style={{
                  textAlign: 'center', padding: '12px 0 6px',
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: 13,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                  lineHeight: 1.6
                }}>
                  <span>
                    Meow! I am <strong>Meo (स्याउ साथी)</strong>, your feline OS copilot 🐾<br/>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                      {(groqKey || apiKey) 
                        ? 'Type a message below or tap the microphone to speak!' 
                        : 'Add a free Groq or Gemini API key in ⚙️ settings above to chat!'}
                    </span>
                  </span>
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, rgba(232,130,155,0.25), rgba(212,120,156,0.18))'
                      : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${msg.role === 'user' ? 'rgba(232,130,155,0.35)' : 'rgba(255,255,255,0.08)'}`,
                    fontSize: 13, lineHeight: 1.55,
                    color: 'rgba(255,255,255,0.92)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    wordBreak: 'break-word',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: msg.role === 'user' ? '#E8829B' : '#7EDDD6' }}>
                      {msg.role === 'user' ? 'You' : 'Meo 🐾'}
                    </span>
                  </div>
                  <div>{msg.text}</div>
                </motion.div>
              ))}

              {phase === 'thinking' && (
                <div style={{
                  alignSelf: 'flex-start',
                  padding: '8px 14px', borderRadius: 16,
                  background: 'rgba(255,255,255,0.05)',
                  fontSize: 12, color: 'rgba(255,255,255,0.5)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FBBF24', animation: 'ping 1s cubic-bezier(0,0,0.2,1) infinite' }} />
                  <span>Meo is thinking & purring...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <AnimatePresence>
              {currentText && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    position: 'relative', zIndex: 2,
                    padding: '0 20px 8px',
                    fontSize: 12, color: 'rgba(255,255,255,0.35)',
                    fontStyle: 'italic',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                  }}
                >
                  "{currentText}"
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {speakingText && phase === 'speaking' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'relative', zIndex: 2,
                    padding: '0 20px 8px',
                    fontSize: 11, color: 'rgba(184,196,208,0.5)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                  }}
                >
                  {speakingText.slice(0, 80)}...
                </motion.div>
              )}
            </AnimatePresence>

            {phase === 'idle' && messages.length === 0 && (
              <div style={{
                position: 'relative', zIndex: 2,
                display: 'flex', gap: 6, padding: '0 20px 8px',
                flexWrap: 'wrap',
              }}>
                {quickActions.slice(0, 4).map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleUserMessage(action.prompt)}
                    style={{
                      padding: '5px 10px', borderRadius: 12,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.55)',
                      fontSize: 11,
                      cursor: 'pointer',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                      transition: 'all 0.2s ease',
                      letterSpacing: 0.2,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                      e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                      e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {messages.length === 0 && (
              <div style={{
                position: 'relative', zIndex: 2,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '6px 20px 8px', gap: 6,
              }}>
                <div
                  onClick={handleOrbClick}
                  style={{
                    cursor: 'pointer', position: 'relative',
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  title={phase === 'listening' ? 'Tap to stop' : phase === 'speaking' ? 'Tap to interrupt' : 'Tap to speak'}
                >
                  <canvas
                    ref={orbCanvasRef}
                    style={{ width: 140, height: 140, display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 120, height: 120, borderRadius: '50%',
                    background: `radial-gradient(circle, ${EMOTION_PALETTES[currentEmotion][0]}18 0%, transparent 70%)`,
                    filter: 'blur(20px)',
                    pointerEvents: 'none',
                  }} />
                </div>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const trimmed = inputText.trim()
                if (!trimmed || phase === 'thinking') return
                setInputText('')
                handleUserMessage(trimmed)
              }}
              style={{
                position: 'relative', zIndex: 2,
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 16px 14px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(10,12,22,0.4)',
              }}
            >
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Ask Meo anything or type a command..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.92)',
                  fontSize: 13,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(232,130,155,0.4)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              />

              <button
                type="button"
                onClick={handleOrbClick}
                title={phase === 'listening' ? 'Stop Listening' : 'Speak Voice'}
                style={{
                  background: phase === 'listening' ? 'rgba(232,130,155,0.3)' : 'rgba(255,255,255,0.04)',
                  border: phase === 'listening' ? '1px solid rgba(232,130,155,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  width: 38, height: 38,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: phase === 'listening' ? '#E8829B' : 'rgba(255,255,255,0.6)',
                  fontSize: 14,
                  transition: 'all 0.2s ease',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" x2="12" y1="19" y2="22"/>
                </svg>
              </button>

              <button
                type="submit"
                disabled={!inputText.trim() || phase === 'thinking'}
                title="Send Message"
                style={{
                  background: inputText.trim()
                    ? 'linear-gradient(135deg, #E8829B, #D4789C)'
                    : 'rgba(255,255,255,0.04)',
                  border: 'none',
                  borderRadius: 12,
                  width: 38, height: 38,
                  cursor: inputText.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: inputText.trim() ? '#FFFFFF' : 'rgba(255,255,255,0.2)',
                  fontSize: 14,
                  transition: 'all 0.2s ease',
                  boxShadow: inputText.trim() ? '0 4px 14px rgba(232,130,155,0.4)' : 'none',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </form>
          </motion.div>
        </>
      )}

      {active && minimized && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={() => setMinimized(false)}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 600,
            cursor: 'pointer',
          }}
          title="Click or Ctrl+M to restore Meo"
        >
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(16,18,30,0.7) 0%, rgba(10,12,22,0.8) 50%, rgba(14,16,28,0.7) 100%)',
            backdropFilter: 'blur(40px) saturate(2) brightness(1.1)',
            WebkitBackdropFilter: 'blur(40px) saturate(2) brightness(1.1)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: `
              0 8px 32px rgba(0,0,0,0.5),
              inset 0 1px 0 rgba(255,255,255,0.1),
              inset 0 -1px 0 rgba(255,255,255,0.03),
              0 0 24px ${phase === 'listening' ? 'rgba(232,130,155,0.12)' : phase === 'speaking' ? 'rgba(126,221,214,0.12)' : 'rgba(184,196,208,0.06)'}
            `,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.06) 0%, transparent 50%)`,
              pointerEvents: 'none',
            }} />
            <div style={{
              width: 14, height: 14, borderRadius: '50%',
              background: phase === 'idle' ? '#34D399' : phase === 'listening' ? '#E8829B' : phase === 'thinking' ? '#FBBF24' : '#7EDDD6',
              boxShadow: `0 0 14px ${phase === 'idle' ? '#34D399' : phase === 'listening' ? '#E8829B' : phase === 'thinking' ? '#FBBF24' : '#7EDDD6'}55`,
              transition: 'all 0.3s ease',
            }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
