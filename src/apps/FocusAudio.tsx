import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX, CloudRain, Flame, Waves, Radio, Keyboard, Play, Pause } from 'lucide-react'
import './FocusAudio.css'

interface SoundTrack {
  id: string
  name: string
  nepaliName: string
  icon: typeof CloudRain
  volume: number
  active: boolean
}

export default function FocusAudio() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [masterVolume, setMasterVolume] = useState(0.8)
  const [tracks, setTracks] = useState<SoundTrack[]>([
    { id: 'rain', name: 'Gentle Rain', nepaliName: 'झमझम पानी', icon: CloudRain, volume: 0.6, active: true },
    { id: 'fire', name: 'Campfire Crackle', nepaliName: 'दाउराको आगो', icon: Flame, volume: 0.4, active: false },
    { id: 'stream', name: 'River Stream', nepaliName: 'खोलाको सुसेली', icon: Waves, volume: 0.3, active: false },
    { id: 'drone', name: 'Binaural Focus', nepaliName: 'ध्यान तरङ्ग', icon: Radio, volume: 0.5, active: true },
    { id: 'keys', name: 'Mechanical Keys', nepaliName: 'किबोर्ड क्लिक', icon: Keyboard, volume: 0.3, active: false },
  ])

  const audioCtxRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<Record<string, { gain: GainNode; cleanup: () => void }>>({})
  const masterGainRef = useRef<GainNode | null>(null)

  // Initialize Web Audio Context
  const ensureAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new AudioCtx()
      const master = ctx.createGain()
      master.gain.setValueAtTime(masterVolume, ctx.currentTime)
      master.connect(ctx.destination)
      audioCtxRef.current = ctx
      masterGainRef.current = master
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
  }

  // Create ambient audio synthesizers
  const startTrackSound = (trackId: string, gainValue: number) => {
    const ctx = audioCtxRef.current
    const master = masterGainRef.current
    if (!ctx || !master) return

    // Clean up existing
    if (nodesRef.current[trackId]) {
      nodesRef.current[trackId].cleanup()
      delete nodesRef.current[trackId]
    }

    const trackGain = ctx.createGain()
    trackGain.gain.setValueAtTime(gainValue, ctx.currentTime)
    trackGain.connect(master)

    let cleanup = () => {}

    if (trackId === 'rain') {
      // Pink/White noise through low-pass filter
      const bufferSize = ctx.sampleRate * 2
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.4
      }
      const noise = ctx.createBufferSource()
      noise.buffer = buffer
      noise.loop = true

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(800, ctx.currentTime)

      noise.connect(filter)
      filter.connect(trackGain)
      noise.start()

      cleanup = () => {
        try { noise.stop(); noise.disconnect() } catch {}
      }
    } else if (trackId === 'fire') {
      // Crackle buffer with random impulse clicks
      const bufferSize = ctx.sampleRate * 3
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() < 0.003 ? (Math.random() * 2 - 1) * 0.9 : 0
      }
      const crackle = ctx.createBufferSource()
      crackle.buffer = buffer
      crackle.loop = true

      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(1400, ctx.currentTime)
      filter.Q.setValueAtTime(1.8, ctx.currentTime)

      crackle.connect(filter)
      filter.connect(trackGain)
      crackle.start()

      cleanup = () => {
        try { crackle.stop(); crackle.disconnect() } catch {}
      }
    } else if (trackId === 'stream') {
      // Flowing water noise
      const bufferSize = ctx.sampleRate * 2
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3
      }
      const water = ctx.createBufferSource()
      water.buffer = buffer
      water.loop = true

      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(450, ctx.currentTime)

      water.connect(filter)
      filter.connect(trackGain)
      water.start()

      cleanup = () => {
        try { water.stop(); water.disconnect() } catch {}
      }
    } else if (trackId === 'drone') {
      // Binaural theta beat (216 Hz & 220 Hz = 4 Hz theta focus pulse)
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      osc1.type = 'sine'
      osc2.type = 'sine'
      osc1.frequency.setValueAtTime(216, ctx.currentTime)
      osc2.frequency.setValueAtTime(220, ctx.currentTime)

      const subGain = ctx.createGain()
      subGain.gain.setValueAtTime(0.08, ctx.currentTime)

      osc1.connect(subGain)
      osc2.connect(subGain)
      subGain.connect(trackGain)
      osc1.start()
      osc2.start()

      cleanup = () => {
        try { osc1.stop(); osc2.stop(); osc1.disconnect(); osc2.disconnect() } catch {}
      }
    } else if (trackId === 'keys') {
      // Periodic gentle click rhythm
      const interval = setInterval(() => {
        if (!audioCtxRef.current || !isPlaying) return
        const now = audioCtxRef.current.currentTime
        const clickOsc = audioCtxRef.current.createOscillator()
        const clickGain = audioCtxRef.current.createGain()
        clickOsc.type = 'triangle'
        clickOsc.frequency.setValueAtTime(1800, now)
        clickOsc.frequency.exponentialRampToValueAtTime(120, now + 0.03)

        clickGain.gain.setValueAtTime(0.06, now)
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03)

        clickOsc.connect(clickGain)
        clickGain.connect(trackGain)
        clickOsc.start(now)
        clickOsc.stop(now + 0.03)
      }, 350 + Math.random() * 200)

      cleanup = () => clearInterval(interval)
    }

    nodesRef.current[trackId] = { gain: trackGain, cleanup }
  }

  // Toggle master play/pause
  const togglePlay = () => {
    ensureAudio()
    if (isPlaying) {
      // Pause all
      Object.values(nodesRef.current).forEach(n => n.cleanup())
      nodesRef.current = {}
      setIsPlaying(false)
    } else {
      setIsPlaying(true)
      tracks.forEach(t => {
        if (t.active) {
          startTrackSound(t.id, t.volume)
        }
      })
    }
  }

  // Handle individual track toggle
  const toggleTrack = (id: string) => {
    setTracks(prev => prev.map(t => {
      if (t.id !== id) return t
      const nextActive = !t.active
      if (isPlaying) {
        if (nextActive) {
          startTrackSound(t.id, t.volume)
        } else if (nodesRef.current[t.id]) {
          nodesRef.current[t.id].cleanup()
          delete nodesRef.current[t.id]
        }
      }
      return { ...t, active: nextActive }
    }))
  }

  // Handle individual volume change
  const handleTrackVolume = (id: string, vol: number) => {
    setTracks(prev => prev.map(t => {
      if (t.id !== id) return t
      if (nodesRef.current[id] && audioCtxRef.current) {
        nodesRef.current[id].gain.gain.setValueAtTime(vol, audioCtxRef.current.currentTime)
      }
      return { ...t, volume: vol }
    }))
  }

  // Handle master volume change
  const handleMasterVolume = (val: number) => {
    setMasterVolume(val)
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(val, audioCtxRef.current.currentTime)
    }
  }

  // Presets
  const applyPreset = (presetName: string) => {
    ensureAudio()
    let config: Record<string, { active: boolean; volume: number }> = {}

    if (presetName === 'monsoon') {
      config = {
        rain: { active: true, volume: 0.75 },
        fire: { active: false, volume: 0 },
        stream: { active: true, volume: 0.35 },
        drone: { active: false, volume: 0 },
        keys: { active: false, volume: 0 },
      }
    } else if (presetName === 'campfire') {
      config = {
        rain: { active: false, volume: 0 },
        fire: { active: true, volume: 0.8 },
        stream: { active: false, volume: 0 },
        drone: { active: true, volume: 0.3 },
        keys: { active: false, volume: 0 },
      }
    } else if (presetName === 'deepwork') {
      config = {
        rain: { active: true, volume: 0.4 },
        fire: { active: false, volume: 0 },
        stream: { active: false, volume: 0 },
        drone: { active: true, volume: 0.65 },
        keys: { active: true, volume: 0.4 },
      }
    }

    setTracks(prev => prev.map(t => {
      const c = config[t.id]
      if (!c) return t
      if (isPlaying) {
        if (c.active) {
          startTrackSound(t.id, c.volume)
        } else if (nodesRef.current[t.id]) {
          nodesRef.current[t.id].cleanup()
          delete nodesRef.current[t.id]
        }
      }
      return { ...t, active: c.active, volume: c.volume }
    }))

    if (!isPlaying) {
      setIsPlaying(true)
      Object.keys(config).forEach(id => {
        if (config[id].active) {
          startTrackSound(id, config[id].volume)
        }
      })
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(nodesRef.current).forEach(n => n.cleanup())
      nodesRef.current = {}
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {})
      }
    }
  }, [])

  return (
    <div className="focus-audio-container">
      {/* Header Banner */}
      <div className="focus-audio-hero">
        <div className="focus-audio-title">
          <div className="focus-badge font-syau">स्याउ साउन्ड</div>
          <h2>Focus Soundscapes & Ambient Deck</h2>
          <p>Handcrafted client-side audio synthesis using the Web Audio API. 100% offline.</p>
        </div>

        <button
          className={`focus-main-toggle ${isPlaying ? 'playing' : ''}`}
          onClick={togglePlay}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          <span>{isPlaying ? 'Pause Audio' : 'Start Focus Audio'}</span>
        </button>
      </div>

      {/* Preset Buttons */}
      <div className="focus-presets">
        <span className="focus-presets-label">Atmosphere Presets:</span>
        <button className="focus-preset-btn" onClick={() => applyPreset('monsoon')}>
          Monsoon in Kathmandu
        </button>
        <button className="focus-preset-btn" onClick={() => applyPreset('campfire')}>
          Himalayan Fireplace
        </button>
        <button className="focus-preset-btn" onClick={() => applyPreset('deepwork')}>
          Deep Focus Flow
        </button>
      </div>

      {/* Master Volume Bar */}
      <div className="focus-master-bar">
        <div className="focus-master-label">
          {masterVolume > 0 ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span>Master Volume</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={masterVolume}
          onChange={(e) => handleMasterVolume(parseFloat(e.target.value))}
          className="focus-slider master"
        />
        <span className="focus-vol-percent">{Math.round(masterVolume * 100)}%</span>
      </div>

      {/* Sound Cards Grid */}
      <div className="focus-tracks-grid">
        {tracks.map(track => {
          const Icon = track.icon
          const isTrackOn = isPlaying && track.active

          return (
            <div
              key={track.id}
              className={`focus-track-card ${isTrackOn ? 'active' : ''}`}
            >
              <div className="focus-card-top">
                <button
                  className={`focus-card-icon-btn ${track.active ? 'on' : 'off'}`}
                  onClick={() => toggleTrack(track.id)}
                  title={track.active ? 'Mute track' : 'Enable track'}
                >
                  <Icon size={18} />
                </button>

                <div className="focus-card-info">
                  <div className="focus-card-name">{track.name}</div>
                  <div className="focus-card-nepali font-syau">{track.nepaliName}</div>
                </div>

                <div className={`focus-status-indicator ${isTrackOn ? 'pulse' : ''}`} />
              </div>

              <div className="focus-slider-row">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={track.volume}
                  disabled={!track.active}
                  onChange={(e) => handleTrackVolume(track.id, parseFloat(e.target.value))}
                  className="focus-slider"
                />
                <span className="focus-track-vol">
                  {track.active ? `${Math.round(track.volume * 100)}%` : 'OFF'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
