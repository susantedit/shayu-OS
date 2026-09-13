import { useState, useRef, useEffect } from 'react'
import {
  Video, Camera, Scissors, Mic, Play, Pause, Square, Download,
  Save, Copy, Sparkles, Undo2, Eraser,
  Pencil, Highlighter, MoveRight, Square as RectIcon, Type,
  VolumeX, Radio
} from 'lucide-react'
import { useFileSystem } from '../store/fileSystem'
import { useNotificationStore } from '../store/desktopStore'

type TabMode = 'record' | 'snip' | 'camera' | 'voice'
type DrawTool = 'pen' | 'highlighter' | 'arrow' | 'rect' | 'text' | 'eraser'
type CameraFilter = 'none' | 'sakura' | 'cyberpunk' | 'noir' | 'vintage' | 'bloom'

const FILTERS: { id: CameraFilter; label: string; css: string }[] = [
  { id: 'none', label: 'Natural', css: 'none' },
  { id: 'sakura', label: 'Sakura Glow', css: 'contrast(1.1) saturate(1.3) hue-rotate(-10deg) brightness(1.05)' },
  { id: 'cyberpunk', label: 'Cyberpunk', css: 'contrast(1.4) saturate(1.8) hue-rotate(180deg)' },
  { id: 'noir', label: 'Classic Noir', css: 'grayscale(1) contrast(1.3)' },
  { id: 'vintage', label: 'Vintage Warm', css: 'sepia(0.4) contrast(1.1) brightness(0.95)' },
  { id: 'bloom', label: 'Dream Bloom', css: 'brightness(1.15) contrast(1.05) saturate(1.2)' },
]

export default function CaptureApp() {
  const [tab, setTab] = useState<TabMode>('record')
  const { createFile, createFolder } = useFileSystem()
  const addNotif = useNotificationStore(s => s.add)

  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [recordMic, setRecordMic] = useState(true)
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerIntervalRef = useRef<number | null>(null)

  const [snipImage, setSnipImage] = useState<string | null>(null)
  const [drawTool, setDrawTool] = useState<DrawTool>('pen')
  const [drawColor, setDrawColor] = useState('#E8829B')
  const [drawSize] = useState(4)
  const [history, setHistory] = useState<ImageData[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  const [cameraActive, setCameraActive] = useState(false)
  const [cameraFilter, setCameraFilter] = useState<CameraFilter>('none')
  const [countdown, setCountdown] = useState<number | null>(null)
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([])
  const [flashActive, setFlashActive] = useState(false)
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null)
  const cameraStreamRef = useRef<MediaStream | null>(null)

  const [isVoiceRecording, setIsVoiceRecording] = useState(false)
  const [voiceSeconds, setVoiceSeconds] = useState(0)
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const voiceCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const voiceAnimRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      stopAllStreams()
    }
  }, [])

  const stopAllStreams = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop())
      cameraStreamRef.current = null
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }
    if (voiceAnimRef.current) {
      cancelAnimationFrame(voiceAnimRef.current)
    }
  }

  // SCREEN RECORDING LOGIC
  const startScreenRecording = async () => {
    try {
      recordedChunksRef.current = []
      setRecordedVideoUrl(null)
      setRecordedBlob(null)

      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
          frameRate: { ideal: 30, max: 60 }
        },
        audio: true
      })

      let finalStream = displayStream
      if (recordMic) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
          const audioCtx = new AudioContext()
          const dest = audioCtx.createMediaStreamDestination()

          if (displayStream.getAudioTracks().length > 0) {
            const screenSource = audioCtx.createMediaStreamSource(displayStream)
            screenSource.connect(dest)
          }

          const micSource = audioCtx.createMediaStreamSource(micStream)
          micSource.connect(dest)

          finalStream = new MediaStream([
            ...displayStream.getVideoTracks(),
            ...dest.stream.getAudioTracks()
          ])
        } catch {
          // Continue with display stream
        }
      }

      streamRef.current = finalStream

      displayStream.getVideoTracks()[0].onended = () => {
        stopScreenRecording()
      }

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
          ? 'video/webm;codecs=vp8,opus'
          : 'video/webm'

      const recorder = new MediaRecorder(finalStream, { mimeType })
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const fullBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
        const url = URL.createObjectURL(fullBlob)
        setRecordedBlob(fullBlob)
        setRecordedVideoUrl(url)
        setIsRecording(false)
        setIsPaused(false)
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
        addNotif('Screen recording finished! Preview ready.', 'rocket')
      }

      recorder.start(1000)
      setIsRecording(true)
      setIsPaused(false)
      setRecordSeconds(0)

      timerIntervalRef.current = window.setInterval(() => {
        setRecordSeconds(s => s + 1)
      }, 1000)

      addNotif('Screen recording started', 'radio')
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        addNotif('Recording error: ' + (err.message || 'Permission denied'), 'alert')
      }
    }
  }

  const pauseResumeRecording = () => {
    if (!mediaRecorderRef.current) return
    if (isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
    } else {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
    }
  }

  const stopScreenRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }
  }

  const saveVideoToFileSystem = async () => {
    if (!recordedBlob) return
    try {
      await createFolder('Videos', null)
      const fileName = `recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result as string
        await createFile(fileName, null, `data:video/webm;name=${fileName};length=${recordedBlob.size}\n${base64}`)
        addNotif(`Saved to Files as ${fileName}`, 'check')
      }
      reader.readAsDataURL(recordedBlob)
    } catch (err: any) {
      addNotif('Save failed: ' + err.message, 'alert')
    }
  }

  const downloadVideo = () => {
    if (!recordedVideoUrl) return
    const a = document.createElement('a')
    a.href = recordedVideoUrl
    a.download = `syau-recording-${Date.now()}.webm`
    a.click()
  }

  // SNIP / SCREENSHOT & CANVAS LOGIC
  const takeScreenSnip = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'monitor' },
        audio: false
      })

      const track = stream.getVideoTracks()[0]
      const imageCapture = new (window as any).ImageCapture(track)
      const bitmap = await imageCapture.grabFrame()
      track.stop()

      const canvas = document.createElement('canvas')
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(bitmap, 0, 0)
        const dataUrl = canvas.toDataURL('image/png')
        setSnipImage(dataUrl)
        setTab('snip')
        initCanvasWithImage(dataUrl)
        addNotif('Screenshot captured! Ready for markup.', 'check')
      }
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        fallbackMockupSnip()
      }
    }
  }

  const fallbackMockupSnip = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1280
    canvas.height = 720
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#0B0910'
      ctx.fillRect(0, 0, 1280, 720)
      ctx.fillStyle = '#E8829B'
      ctx.font = 'bold 36px "Space Grotesk", sans-serif'
      ctx.fillText('स्याउ OS Desktop Snapshot', 80, 120)
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.font = '18px "Inter", sans-serif'
      ctx.fillText(new Date().toLocaleString(), 80, 160)
      const dataUrl = canvas.toDataURL('image/png')
      setSnipImage(dataUrl)
      setTab('snip')
      initCanvasWithImage(dataUrl)
    }
  }

  const initCanvasWithImage = (imgSrc: string) => {
    const img = new Image()
    img.src = imgSrc
    img.onload = () => {
      const c = canvasRef.current
      if (!c) return
      c.width = img.naturalWidth || 800
      c.height = img.naturalHeight || 500
      const ctx = c.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0)
        saveHistoryState()
      }
    }
  }

  const saveHistoryState = () => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    const state = ctx.getImageData(0, 0, c.width, c.height)
    setHistory(prev => [...prev.slice(-15), state])
  }

  const handleUndo = () => {
    if (history.length <= 1) return
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    const nextHistory = [...history]
    nextHistory.pop()
    const lastState = nextHistory[nextHistory.length - 1]
    if (lastState) {
      ctx.putImageData(lastState, 0, 0)
      setHistory(nextHistory)
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current
    if (!c) return
    const rect = c.getBoundingClientRect()
    const scaleX = c.width / rect.width
    const scaleY = c.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    setIsDrawing(true)
    startPosRef.current = { x, y }

    const ctx = c.getContext('2d')
    if (!ctx) return

    ctx.lineWidth = drawSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (drawTool === 'pen') {
      ctx.strokeStyle = drawColor
      ctx.globalAlpha = 1
      ctx.beginPath()
      ctx.moveTo(x, y)
    } else if (drawTool === 'highlighter') {
      ctx.strokeStyle = drawColor
      ctx.globalAlpha = 0.35
      ctx.lineWidth = drawSize * 3
      ctx.beginPath()
      ctx.moveTo(x, y)
    } else if (drawTool === 'eraser') {
      ctx.strokeStyle = '#0B0910'
      ctx.globalAlpha = 1
      ctx.lineWidth = drawSize * 4
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  const drawMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const c = canvasRef.current
    if (!c) return
    const rect = c.getBoundingClientRect()
    const scaleX = c.width / rect.width
    const scaleY = c.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    const ctx = c.getContext('2d')
    if (!ctx) return

    if (drawTool === 'pen' || drawTool === 'highlighter' || drawTool === 'eraser') {
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    setIsDrawing(false)
    const c = canvasRef.current
    if (!c) return
    const rect = c.getBoundingClientRect()
    const scaleX = c.width / rect.width
    const scaleY = c.height / rect.height
    const endX = (e.clientX - rect.left) * scaleX
    const endY = (e.clientY - rect.top) * scaleY

    const ctx = c.getContext('2d')
    if (!ctx) return

    const { x: startX, y: startY } = startPosRef.current

    if (drawTool === 'rect') {
      ctx.globalAlpha = 1
      ctx.strokeStyle = drawColor
      ctx.lineWidth = drawSize
      ctx.strokeRect(startX, startY, endX - startX, endY - startY)
    } else if (drawTool === 'arrow') {
      ctx.globalAlpha = 1
      ctx.strokeStyle = drawColor
      ctx.fillStyle = drawColor
      ctx.lineWidth = drawSize

      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(endX, endY)
      ctx.stroke()

      const angle = Math.atan2(endY - startY, endX - startX)
      const headLen = 14
      ctx.beginPath()
      ctx.moveTo(endX, endY)
      ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI / 6), endY - headLen * Math.sin(angle - Math.PI / 6))
      ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI / 6), endY - headLen * Math.sin(angle + Math.PI / 6))
      ctx.closePath()
      ctx.fill()
    } else if (drawTool === 'text') {
      const text = prompt('Enter annotation text:')
      if (text) {
        ctx.globalAlpha = 1
        ctx.fillStyle = drawColor
        ctx.font = `bold ${Math.max(16, drawSize * 5)}px "Inter", sans-serif`
        ctx.fillText(text, startX, startY)
      }
    }

    ctx.globalAlpha = 1
    saveHistoryState()
  }

  const copySnipToClipboard = async () => {
    const c = canvasRef.current
    if (!c) return
    try {
      c.toBlob(async (blob) => {
        if (!blob) return
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        addNotif('Screenshot copied to clipboard!', 'check')
      })
    } catch {
      addNotif('Clipboard permission not supported on this browser', 'alert')
    }
  }

  const saveSnipToFileManager = async () => {
    const c = canvasRef.current
    if (!c) return
    try {
      await createFolder('Pictures', null)
      const dataUrl = c.toDataURL('image/png')
      const fileName = `snip-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`
      await createFile(fileName, null, dataUrl)
      addNotif(`Saved to Pictures as ${fileName}`, 'check')
    } catch (err: any) {
      addNotif('Save failed: ' + err.message, 'alert')
    }
  }

  const setSnipAsWallpaper = () => {
    const c = canvasRef.current
    if (!c) return
    const dataUrl = c.toDataURL('image/png')
    localStorage.setItem('syau-os-wallpaper-custom', dataUrl)
    localStorage.setItem('syau-os-bg', 'static')
    window.dispatchEvent(new Event('syau-wallpaper-change'))
    addNotif('Set as desktop wallpaper!', 'sparkles')
  }

  // CAMERA BOOTH LOGIC
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false
      })
      cameraStreamRef.current = stream
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream
        videoPreviewRef.current.play()
      }
      setCameraActive(true)
    } catch (err: any) {
      addNotif('Webcam access error: ' + err.message, 'alert')
    }
  }

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop())
      cameraStreamRef.current = null
    }
    setCameraActive(false)
  }

  const triggerPhotoCountdown = (seconds = 3) => {
    setCountdown(seconds)
    const int = window.setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(int)
          captureCameraSnapshot()
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  const captureCameraSnapshot = () => {
    const video = videoPreviewRef.current
    if (!video) return

    setFlashActive(true)
    setTimeout(() => setFlashActive(false), 200)

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const activeF = FILTERS.find(f => f.id === cameraFilter)
      if (activeF && activeF.css !== 'none') {
        ctx.filter = activeF.css
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/png')
      setCapturedPhotos(prev => [dataUrl, ...prev.slice(0, 11)])
      addNotif('Photo captured!', 'check')
    }
  }

  const startVoiceRecording = async () => {
    try {
      audioChunksRef.current = []
      setVoiceUrl(null)

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioCtx = new AudioContext()
      audioContextRef.current = audioCtx
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      const recorder = new MediaRecorder(stream)
      audioRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setVoiceUrl(url)
        setIsVoiceRecording(false)
        stream.getTracks().forEach(t => t.stop())
        if (voiceAnimRef.current) cancelAnimationFrame(voiceAnimRef.current)
        addNotif('Voice memo recorded!', 'check')
      }

      recorder.start()
      setIsVoiceRecording(true)
      setVoiceSeconds(0)

      timerIntervalRef.current = window.setInterval(() => {
        setVoiceSeconds(s => s + 1)
      }, 1000)

      drawVoiceWaveform()
    } catch (err: any) {
      addNotif('Microphone error: ' + err.message, 'alert')
    }
  }

  const drawVoiceWaveform = () => {
    const canvas = voiceCanvasRef.current
    const analyser = analyserRef.current
    if (!canvas || !analyser) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const render = () => {
      voiceAnimRef.current = requestAnimationFrame(render)
      analyser.getByteFrequencyData(dataArray)

      ctx.fillStyle = '#0E0C13'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const barWidth = (canvas.width / bufferLength) * 2.5
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * (canvas.height * 0.85)

        const grad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight)
        grad.addColorStop(0, '#E8829B')
        grad.addColorStop(1, '#7EDDD6')

        ctx.fillStyle = grad
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight)

        x += barWidth
      }
    }

    render()
  }

  const stopVoiceRecording = () => {
    if (audioRecorderRef.current && audioRecorderRef.current.state !== 'inactive') {
      audioRecorderRef.current.stop()
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }
  }

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
    const s = (totalSeconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--color-window-bg)', color: 'var(--color-text-primary)',
      fontFamily: 'var(--font-sans)', overflow: 'hidden'
    }}>
      {/* Top Header & Navigation */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', borderBottom: '1px solid var(--color-glass-border)',
        background: 'var(--color-window-header)', flexShrink: 0, gap: 8, flexWrap: 'wrap'
      }}>
        {/* Title & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #E8829B, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
          }}>
            <Video size={16} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1 }}>स्याउ Capture Studio</div>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>Screen, Snip, Camera & Voice Recorder</div>
          </div>
        </div>

        {/* Studio Modes Switcher */}
        <div style={{
          display: 'flex', gap: 4, background: 'rgba(0,0,0,0.25)',
          padding: 3, borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)'
        }}>
          {[
            { id: 'record', label: 'Screen Record', icon: Video },
            { id: 'snip', label: 'Snip & Markup', icon: Scissors },
            { id: 'camera', label: 'Photo Booth', icon: Camera },
            { id: 'voice', label: 'Voice Memo', icon: Mic },
          ].map(m => {
            const Icon = m.icon
            const active = tab === m.id
            return (
              <button
                key={m.id}
                onClick={() => {
                  setTab(m.id as any)
                  if (m.id === 'camera' && !cameraActive) startCamera()
                  if (m.id !== 'camera' && cameraActive) stopCamera()
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 6, border: 'none',
                  background: active ? 'var(--color-sakura)' : 'transparent',
                  color: active ? '#FFFFFF' : 'var(--color-text-secondary)',
                  fontSize: 11, fontWeight: active ? 700 : 500, cursor: 'pointer',
                  transition: 'all 0.15s ease', whiteSpace: 'nowrap'
                }}
              >
                <Icon size={13} />
                <span>{m.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column' }}>
        {tab === 'record' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
            <div style={{
              padding: 16, borderRadius: 12, background: 'var(--color-glass-card)',
              border: '1px solid var(--color-glass-border)', display: 'flex',
              alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {isRecording ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 12, height: 12, borderRadius: '50%', background: '#EF4444',
                      animation: 'pulse 1s infinite'
                    }} />
                    <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#EF4444' }}>
                      {formatTimer(recordSeconds)}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      {isPaused ? '(Paused)' : 'Recording Live'}
                    </span>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>Ready to Record</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                      Capture entire screen, window, or specific browser tab
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {!isRecording ? (
                  <>
                    <button
                      onClick={() => setRecordMic(!recordMic)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
                        borderRadius: 8, border: '1px solid var(--color-glass-border)',
                        background: recordMic ? 'rgba(232,130,155,0.15)' : 'rgba(255,255,255,0.04)',
                        color: recordMic ? 'var(--color-sakura)' : 'var(--color-text-muted)',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      {recordMic ? <Mic size={14} /> : <VolumeX size={14} />}
                      <span>{recordMic ? 'Mic On' : 'Muted'}</span>
                    </button>

                    <button
                      onClick={startScreenRecording}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px',
                        borderRadius: 8, border: 'none', background: 'var(--color-sakura)',
                        color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(232,130,155,0.35)'
                      }}
                    >
                      <Radio size={14} />
                      <span>Start Recording</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={pauseResumeRecording}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                        borderRadius: 8, border: '1px solid var(--color-glass-border)',
                        background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-primary)',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      {isPaused ? <Play size={14} /> : <Pause size={14} />}
                      <span>{isPaused ? 'Resume' : 'Pause'}</span>
                    </button>

                    <button
                      onClick={stopScreenRecording}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px',
                        borderRadius: 8, border: 'none', background: '#EF4444',
                        color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(239,68,68,0.35)'
                      }}
                    >
                      <Square size={14} />
                      <span>Stop & Save</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {recordedVideoUrl ? (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column', gap: 12,
                background: 'var(--color-glass-card)', border: '1px solid var(--color-glass-border)',
                borderRadius: 12, padding: 14, overflow: 'hidden'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Recorded Preview</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={saveVideoToFileSystem}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                        borderRadius: 6, border: '1px solid var(--color-glass-border)',
                        background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-primary)',
                        fontSize: 11, fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      <Save size={13} />
                      <span>Save to /Videos</span>
                    </button>
                    <button
                      onClick={downloadVideo}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                        borderRadius: 6, border: 'none', background: 'var(--color-sakura)',
                        color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      <Download size={13} />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                <div style={{
                  flex: 1, background: '#000', borderRadius: 8, overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <video src={recordedVideoUrl} controls style={{ maxWidth: '100%', maxHeight: '100%' }} />
                </div>
              </div>
            ) : (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', border: '2px dashed var(--color-glass-border)',
                borderRadius: 12, padding: 32, textAlign: 'center', color: 'var(--color-text-muted)'
              }}>
                <Video size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>No active recording</div>
                <div style={{ fontSize: 12, maxWidth: 360, marginTop: 4 }}>
                  Click "Start Recording" above to select a window or full screen to capture crisp high-fps video with audio.
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'snip' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', background: 'var(--color-glass-card)',
              border: '1px solid var(--color-glass-border)', borderRadius: 10, flexWrap: 'wrap', gap: 8
            }}>
              <button
                onClick={takeScreenSnip}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                  borderRadius: 6, border: 'none', background: 'var(--color-sakura)',
                  color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer'
                }}
              >
                <Scissors size={13} />
                <span>New Snip</span>
              </button>

              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {[
                  { id: 'pen', label: 'Pen', icon: Pencil },
                  { id: 'highlighter', label: 'Highlighter', icon: Highlighter },
                  { id: 'arrow', label: 'Arrow', icon: MoveRight },
                  { id: 'rect', label: 'Box', icon: RectIcon },
                  { id: 'text', label: 'Text', icon: Type },
                  { id: 'eraser', label: 'Eraser', icon: Eraser },
                ].map(t => {
                  const Icon = t.icon
                  const active = drawTool === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setDrawTool(t.id as any)}
                      title={t.label}
                      style={{
                        padding: '6px', borderRadius: 6, border: 'none',
                        background: active ? 'rgba(232,130,155,0.2)' : 'transparent',
                        color: active ? 'var(--color-sakura)' : 'var(--color-text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      <Icon size={14} />
                    </button>
                  )
                })}
              </div>

              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                {['#E8829B', '#7EDDD6', '#FBBF24', '#EF4444', '#FFFFFF'].map(c => (
                  <button
                    key={c}
                    onClick={() => setDrawColor(c)}
                    style={{
                      width: 18, height: 18, borderRadius: '50%', background: c,
                      border: drawColor === c ? '2px solid white' : '1px solid rgba(0,0,0,0.3)',
                      cursor: 'pointer', transform: drawColor === c ? 'scale(1.2)' : 'scale(1)'
                    }}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button
                  onClick={handleUndo}
                  title="Undo"
                  style={{
                    padding: '5px 8px', borderRadius: 6, border: '1px solid var(--color-glass-border)',
                    background: 'transparent', color: 'var(--color-text-secondary)', cursor: 'pointer'
                  }}
                >
                  <Undo2 size={13} />
                </button>

                <button
                  onClick={copySnipToClipboard}
                  title="Copy to Clipboard"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px',
                    borderRadius: 6, border: '1px solid var(--color-glass-border)',
                    background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-primary)',
                    fontSize: 11, fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  <Copy size={12} />
                  <span>Copy</span>
                </button>

                <button
                  onClick={saveSnipToFileManager}
                  title="Save to Virtual Files"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px',
                    borderRadius: 6, border: '1px solid rgba(232,130,155,0.3)',
                    background: 'rgba(232,130,155,0.15)', color: 'var(--color-sakura)',
                    fontSize: 11, fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  <Save size={12} />
                  <span>Save</span>
                </button>

                <button
                  onClick={setSnipAsWallpaper}
                  title="Set as Desktop Wallpaper"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px',
                    borderRadius: 6, border: 'none', background: 'var(--color-sakura)',
                    color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  <Sparkles size={12} />
                  <span>Set Wallpaper</span>
                </button>
              </div>
            </div>

            <div style={{
              flex: 1, overflow: 'auto', background: '#0B0910', borderRadius: 10,
              border: '1px solid var(--color-glass-border)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', position: 'relative'
            }}>
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={drawMove}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{
                  maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
                  cursor: 'crosshair'
                }}
              />
              {!snipImage && (
                <div style={{ position: 'absolute', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  <Scissors size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
                  <div style={{ fontSize: 13, fontWeight: 600 }}>No snapshot yet</div>
                  <div style={{ fontSize: 11, marginTop: 4 }}>Click "New Snip" above to capture a window or screen</div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'camera' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%' }}>
            <div style={{
              flex: 1, position: 'relative', background: '#000', borderRadius: 12,
              overflow: 'hidden', border: '1px solid var(--color-glass-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  filter: FILTERS.find(f => f.id === cameraFilter)?.css || 'none'
                }}
              />

              {flashActive && (
                <div style={{
                  position: 'absolute', inset: 0, background: 'white',
                  zIndex: 40
                }} />
              )}

              {countdown !== null && (
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30
                }}>
                  <span style={{ fontSize: 96, fontWeight: 800, color: 'white', textShadow: '0 4px 24px rgba(0,0,0,0.8)' }}>
                    {countdown}
                  </span>
                </div>
              )}

              <div style={{
                position: 'absolute', bottom: 16, display: 'flex', alignItems: 'center',
                gap: 12, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)',
                padding: '8px 18px', borderRadius: 30, border: '1px solid rgba(255,255,255,0.15)'
              }}>
                <button
                  onClick={() => triggerPhotoCountdown(3)}
                  style={{
                    padding: '6px 12px', borderRadius: 16, border: 'none',
                    background: 'rgba(255,255,255,0.15)', color: 'white',
                    fontSize: 11, fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  3s Timer
                </button>

                <button
                  onClick={() => captureCameraSnapshot()}
                  title="Snap Photo"
                  style={{
                    width: 48, height: 48, borderRadius: '50%', background: 'white',
                    border: '4px solid var(--color-sakura)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
                  }}
                >
                  <Camera size={20} style={{ color: '#E8829B' }} />
                </button>

                <button
                  onClick={() => triggerPhotoCountdown(5)}
                  style={{
                    padding: '6px 12px', borderRadius: 16, border: 'none',
                    background: 'rgba(255,255,255,0.15)', color: 'white',
                    fontSize: 11, fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  5s Timer
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
              {FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setCameraFilter(f.id)}
                  style={{
                    padding: '6px 12px', borderRadius: 8, border: 'none',
                    background: cameraFilter === f.id ? 'var(--color-sakura)' : 'rgba(255,255,255,0.05)',
                    color: cameraFilter === f.id ? 'white' : 'var(--color-text-secondary)',
                    fontSize: 11, fontWeight: cameraFilter === f.id ? 700 : 500,
                    cursor: 'pointer', whiteSpace: 'nowrap'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {capturedPhotos.length > 0 && (
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '8px 0' }}>
                {capturedPhotos.map((photo, i) => (
                  <div key={i} style={{
                    width: 72, height: 54, borderRadius: 6, overflow: 'hidden',
                    flexShrink: 0, border: '1px solid var(--color-glass-border)', position: 'relative'
                  }}>
                    <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'voice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%', justifyContent: 'center' }}>
            <div style={{
              padding: 24, borderRadius: 16, background: 'var(--color-glass-card)',
              border: '1px solid var(--color-glass-border)', display: 'flex',
              flexDirection: 'column', alignItems: 'center', gap: 18
            }}>
              <canvas
                ref={voiceCanvasRef}
                width={500}
                height={120}
                style={{
                  width: '100%', height: 120, borderRadius: 10,
                  background: '#0E0C13', border: '1px solid rgba(255,255,255,0.06)'
                }}
              />

              <div style={{
                fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-mono)',
                color: isVoiceRecording ? 'var(--color-sakura)' : 'var(--color-text-primary)'
              }}>
                {formatTimer(voiceSeconds)}
              </div>

              <div>
                {!isVoiceRecording ? (
                  <button
                    onClick={startVoiceRecording}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px',
                      borderRadius: 30, border: 'none', background: 'var(--color-sakura)',
                      color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      boxShadow: '0 4px 20px rgba(232,130,155,0.4)'
                    }}
                  >
                    <Mic size={16} />
                    <span>Record Voice Memo</span>
                  </button>
                ) : (
                  <button
                    onClick={stopVoiceRecording}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px',
                      borderRadius: 30, border: 'none', background: '#EF4444',
                      color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    <Square size={16} />
                    <span>Stop Recording</span>
                  </button>
                )}
              </div>

              {voiceUrl && (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  <audio src={voiceUrl} controls style={{ width: '100%' }} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
