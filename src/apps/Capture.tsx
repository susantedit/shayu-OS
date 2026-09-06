import { useState, useRef, useEffect } from 'react'
import {
  Video, Camera, Square, Download, Mic, MicOff,
  Play, Pause
} from 'lucide-react'
import { useNotificationStore } from '../store/desktopStore'

type TabMode = 'record' | 'camera'

export default function CaptureApp() {
  const [tab, setTab] = useState<TabMode>('record')
  const addNotif = useNotificationStore(s => s.add)

  // Screen recording state
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [recordMic, setRecordMic] = useState(false)
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const screenStreamRef = useRef<MediaStream | null>(null)
  const timerIntervalRef = useRef<number | null>(null)

  // Camera state
  const [cameraActive, setCameraActive] = useState(false)
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([])
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null)
  const cameraStreamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      stopAllStreams()
    }
  }, [])

  const stopAllStreams = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop())
      screenStreamRef.current = null
    }
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop())
      cameraStreamRef.current = null
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }
  }

  // --- SCREEN RECORDING ---
  const startScreenRecording = async () => {
    try {
      recordedChunksRef.current = []
      setRecordedVideoUrl(null)

      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'monitor' } as any,
        audio: true,
      })

      let finalStream = displayStream
      if (recordMic) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
          finalStream = new MediaStream([
            ...displayStream.getVideoTracks(),
            ...micStream.getAudioTracks(),
          ])
        } catch {
          // Continue with display audio only
        }
      }

      screenStreamRef.current = finalStream

      displayStream.getVideoTracks()[0].onended = () => {
        stopScreenRecording()
      }

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm'

      const recorder = new MediaRecorder(finalStream, { mimeType })
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        setRecordedVideoUrl(url)
        setIsRecording(false)
        setIsPaused(false)
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
        addNotif('Screen recording finished! Preview ready.', 'check')
      }

      recorder.start(1000)
      setIsRecording(true)
      setRecordSeconds(0)

      timerIntervalRef.current = window.setInterval(() => {
        setRecordSeconds(s => s + 1)
      }, 1000)

      addNotif('Recording started...', 'video')
    } catch {
      addNotif('Screen recording permission was cancelled', 'alert')
    }
  }

  const stopScreenRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop())
      screenStreamRef.current = null
    }
  }

  const togglePauseRecording = () => {
    if (!mediaRecorderRef.current) return
    if (isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
    } else {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
    }
  }

  // --- CAMERA PHOTO BOOTH ---
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      })
      cameraStreamRef.current = stream
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream
      }
      setCameraActive(true)
    } catch {
      addNotif('Camera permission denied or camera not found', 'alert')
    }
  }

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop())
      cameraStreamRef.current = null
    }
    setCameraActive(false)
  }

  const snapPhoto = () => {
    if (!cameraVideoRef.current) return
    const video = cameraVideoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/png')
    setCapturedPhotos(prev => [dataUrl, ...prev])
    addNotif('Photo captured!', 'check')
  }

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--color-window-bg)', color: 'var(--color-text-primary)',
      fontFamily: 'var(--font-sans)', overflow: 'hidden'
    }}>
      {/* Tab Header */}
      <div style={{
        padding: '10px 16px', background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid var(--color-glass-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { setTab('record'); stopCamera() }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8,
              background: tab === 'record' ? 'rgba(232,130,155,0.18)' : 'transparent',
              border: '1px solid ' + (tab === 'record' ? 'var(--color-sakura)' : 'transparent'),
              color: tab === 'record' ? 'var(--color-sakura)' : 'var(--color-text-secondary)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Video size={14} /> Screen Recorder
          </button>
          <button
            onClick={() => setTab('camera')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8,
              background: tab === 'camera' ? 'rgba(232,130,155,0.18)' : 'transparent',
              border: '1px solid ' + (tab === 'camera' ? 'var(--color-sakura)' : 'transparent'),
              color: tab === 'camera' ? 'var(--color-sakura)' : 'var(--color-text-secondary)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Camera size={14} /> Photo Booth
          </button>
        </div>

        {tab === 'record' && isRecording && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', animation: 'pulse 1s infinite' }} />
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#EF4444' }}>
              REC {formatTimer(recordSeconds)}
            </span>
          </div>
        )}
      </div>

      {/* Tab Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {tab === 'record' ? (
          <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: 'var(--color-glass-card)', border: '1px solid var(--color-glass-border)',
              borderRadius: 14, padding: 24, textAlign: 'center',
            }}>
              <h3 className="font-heading" style={{ fontSize: 18, margin: '0 0 8px' }}>
                Desktop Screen & Audio Recording
              </h3>
              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '0 0 20px', lineHeight: 1.5 }}>
                Record your full screen, window, or browser tab with audio directly in स्याउ OS.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <button
                  onClick={() => setRecordMic(m => !m)}
                  disabled={isRecording}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
                    background: recordMic ? 'rgba(134,239,172,0.15)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid ' + (recordMic ? '#86EFAC' : 'rgba(255,255,255,0.1)'),
                    color: recordMic ? '#86EFAC' : 'var(--color-text-secondary)',
                    fontSize: 12, fontWeight: 600, cursor: isRecording ? 'not-allowed' : 'pointer',
                  }}
                >
                  {recordMic ? <Mic size={14} /> : <MicOff size={14} />}
                  <span>{recordMic ? 'Microphone Included' : 'Mic Muted'}</span>
                </button>
              </div>

              {!isRecording ? (
                <button
                  onClick={startScreenRecording}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px',
                    borderRadius: 10, background: 'linear-gradient(135deg, var(--color-sakura) 0%, #C45A7C 100%)',
                    color: 'white', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(232,130,155,0.3)',
                  }}
                >
                  <Video size={16} />
                  <span>Start Screen Recording</span>
                </button>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                  <button
                    onClick={togglePauseRecording}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px',
                      borderRadius: 10, background: 'rgba(255,255,255,0.1)', color: 'white',
                      fontWeight: 600, fontSize: 12, border: 'none', cursor: 'pointer',
                    }}
                  >
                    {isPaused ? <Play size={14} /> : <Pause size={14} />}
                    <span>{isPaused ? 'Resume' : 'Pause'}</span>
                  </button>
                  <button
                    onClick={stopScreenRecording}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px',
                      borderRadius: 10, background: '#EF4444', color: 'white',
                      fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer',
                    }}
                  >
                    <Square size={14} fill="currentColor" />
                    <span>Stop Recording</span>
                  </button>
                </div>
              )}
            </div>

            {/* Recorded Preview */}
            {recordedVideoUrl && (
              <div style={{
                background: 'var(--color-glass-card)', border: '1px solid var(--color-glass-border)',
                borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Recording Preview</span>
                  <a
                    href={recordedVideoUrl}
                    download={`syau-recording-${Date.now()}.webm`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                      borderRadius: 6, background: 'var(--color-sakura)', color: 'white',
                      textDecoration: 'none', fontSize: 12, fontWeight: 700,
                    }}
                  >
                    <Download size={13} />
                    <span>Download WebM</span>
                  </a>
                </div>
                <video
                  src={recordedVideoUrl}
                  controls
                  style={{ width: '100%', borderRadius: 8, maxHeight: 340, background: '#000' }}
                />
              </div>
            )}
          </div>
        ) : (
          <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: 'var(--color-glass-card)', border: '1px solid var(--color-glass-border)',
              borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            }}>
              {!cameraActive ? (
                <div style={{ padding: '36px 0', textAlign: 'center' }}>
                  <Camera size={42} style={{ color: 'var(--color-sakura)', marginBottom: 12 }} />
                  <h3 style={{ fontSize: 16, margin: '0 0 6px' }}>Camera Inactive</h3>
                  <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '0 0 16px' }}>
                    Click below to connect your webcam and snap photos.
                  </p>
                  <button
                    onClick={startCamera}
                    style={{
                      padding: '8px 20px', borderRadius: 8, background: 'var(--color-sakura)',
                      color: 'white', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer',
                    }}
                  >
                    Enable Camera
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={cameraVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', borderRadius: 10, maxHeight: 360, background: '#000', objectFit: 'cover' }}
                  />
                  <div style={{ display: 'flex', gap: 10, width: '100%', justifyContent: 'center' }}>
                    <button
                      onClick={snapPhoto}
                      style={{
                        padding: '10px 24px', borderRadius: 10, background: 'var(--color-sakura)',
                        color: 'white', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      <Camera size={16} /> Take Photo
                    </button>
                    <button
                      onClick={stopCamera}
                      style={{
                        padding: '10px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.06)',
                        color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: 12, border: 'none', cursor: 'pointer',
                      }}
                    >
                      Turn Off
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Gallery of captured photos */}
            {capturedPhotos.length > 0 && (
              <div style={{
                background: 'var(--color-glass-card)', border: '1px solid var(--color-glass-border)',
                borderRadius: 14, padding: 14,
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Captured Photos ({capturedPhotos.length})
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8, marginTop: 10 }}>
                  {capturedPhotos.map((photo, i) => (
                    <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--color-glass-border)' }}>
                      <img src={photo} alt={`Snap ${i}`} style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block' }} />
                      <a
                        href={photo}
                        download={`syau-photo-${Date.now()}-${i}.png`}
                        style={{
                          position: 'absolute', bottom: 4, right: 4, padding: 4,
                          background: 'rgba(0,0,0,0.7)', borderRadius: 4, color: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Download size={11} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
