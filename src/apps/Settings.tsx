import { useState, useEffect } from 'react'
import { Wifi, WifiOff, Lock, Battery, BatteryCharging, Zap, Sun } from 'lucide-react'
import { mediaUrl } from '../config'
import { useThemeStore } from '../store/themeStore'
import { useNetworkStore } from '../store/networkStore'
import { useBatteryStore } from '../store/batteryStore'

const ACCENTS: Record<string, { primary: string; dark: string }> = {
  sakura: { primary: '#E8829B', dark: '#C45A7C' },
  miku: { primary: '#7EDDD6', dark: '#39C5BB' },
  lavender: { primary: '#C4B5FD', dark: '#A78BFA' },
  mint: { primary: '#86EFAC', dark: '#4ADE80' },
  peach: { primary: '#FDBA74', dark: '#FB923C' },
  rose: { primary: '#E8829B', dark: '#8B2252' },
}

const WALLPAPERS = [
  { id: 'wall-1', src: mediaUrl('/images/wallpapers/wall-1.jpg') },
  { id: 'wall-2', src: mediaUrl('/images/wallpapers/wall-2.jpg') },
  { id: 'wall-3', src: mediaUrl('/images/wallpapers/wall-3.jpg') },
  { id: 'wall-4', src: mediaUrl('/images/wallpapers/wall-4.jpg') },
  { id: 'wall-5', src: mediaUrl('/images/wallpapers/wall-5.jpg') },
  { id: 'wall-6', src: mediaUrl('/images/wallpapers/wall-6.jpg') },
]

const LIVE_WALLS = [
  { id: 'live-1', label: 'Galaxy', src: mediaUrl('/video/live-1.mp4') },
  { id: 'live-2', label: 'Neon', src: mediaUrl('/video/live-2.mp4') },
  { id: 'live-3', label: 'Aesthetic', src: mediaUrl('/video/live-3.mp4') },
]

export default function Settings() {
  const { mode, setMode, brightness, setBrightness } = useThemeStore()
  const {
    wifiEnabled, setWifiEnabled, connectedSsid, availableNetworks,
    connectToNetwork, disconnect, isDeviceOnline, livePing, isPinging,
    runPingTest, deviceDownlink, deviceEffectiveType
  } = useNetworkStore()
  const {
    level: batteryLevel, charging: isCharging, powerMode, setPowerMode,
    toggleCharging
  } = useBatteryStore()
  const [accent, setAccent] = useState(() => localStorage.getItem('syau-os-accent') || 'sakura')
  const [bgMode, setBgMode] = useState<'dark' | 'static' | 'live'>(() => (localStorage.getItem('syau-os-bg') as any) || 'dark')
  const [selectedWallpaper, setSelectedWallpaper] = useState(() => localStorage.getItem('syau-os-wallpaper') || 'wall-1')
  const [selectedLiveWall, setSelectedLiveWall] = useState(() => localStorage.getItem('syau-os-live-wall') || 'live-1')
  const [widgets, setWidgets] = useState(() => localStorage.getItem('syau-os-widgets') !== 'off')

  useEffect(() => {
    localStorage.setItem('syau-os-accent', accent)
    const colors = ACCENTS[accent]
    if (colors) {
      document.body.classList.add('accent-transition')
      document.documentElement.style.setProperty('--color-sakura', colors.primary)
      document.documentElement.style.setProperty('--color-sakura-deep', colors.dark)
      setTimeout(() => document.body.classList.remove('accent-transition'), 600)
    }
  }, [accent])

  useEffect(() => {
    localStorage.setItem('syau-os-bg', bgMode)
    window.dispatchEvent(new CustomEvent('syau-os-bg-change', { detail: { mode: bgMode, wallpaper: selectedWallpaper, liveWall: selectedLiveWall } }))
  }, [bgMode, selectedWallpaper, selectedLiveWall])

  useEffect(() => { localStorage.setItem('syau-os-wallpaper', selectedWallpaper) }, [selectedWallpaper])
  useEffect(() => { localStorage.setItem('syau-os-live-wall', selectedLiveWall) }, [selectedLiveWall])
  useEffect(() => { localStorage.setItem('syau-os-widgets', widgets ? 'on' : 'off') }, [widgets])

  return (
    <div style={{ padding: 20, overflow: 'auto', height: '100%' }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="font-syau">स्याउ</span> <span className="font-os" style={{ color: 'var(--color-sakura)' }}>OS</span> Settings
      </div>

      {/* Wi-Fi & Network */}
      <Section title="Wi-Fi & Network">
        <div style={{
          background: 'var(--color-glass-card)', border: '1px solid var(--color-glass-border)',
          borderRadius: 12, padding: '14px 16px', marginBottom: 10,
        }}>
          {/* Main Wi-Fi Switch Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: wifiEnabled ? 'var(--color-sakura)' : 'rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: wifiEnabled ? 'white' : 'var(--color-text-muted)',
              }}>
                {wifiEnabled ? <Wifi size={17} /> : <WifiOff size={17} />}
              </div>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Wi-Fi Wireless Networking</span>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 1 }}>
                  {wifiEnabled ? (connectedSsid ? `Connected to ${connectedSsid}` : 'Searching for networks...') : 'Wi-Fi is currently turned off'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setWifiEnabled(!wifiEnabled)}
              style={{
                width: 44, height: 24, borderRadius: 12, border: 'none',
                background: wifiEnabled ? 'var(--color-sakura)' : 'rgba(255,255,255,0.12)',
                cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: '50%', background: 'white',
                position: 'absolute', top: 3, left: wifiEnabled ? 23 : 3,
                transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            </button>
          </div>

          {/* Physical Device Connection Status */}
          <div style={{
            marginTop: 12, padding: '10px 12px', borderRadius: 8,
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: isDeviceOnline ? '#4ADE80' : '#EF4444',
                boxShadow: isDeviceOnline ? '0 0 8px #4ADE80' : 'none',
              }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Physical Device Status: {isDeviceOnline ? 'Connected (Online)' : 'Disconnected (Offline)'}
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 1 }}>
                  Bandwidth: {deviceDownlink ? `~${deviceDownlink} Mbps` : 'High Speed'} · Network Mode: {deviceEffectiveType?.toUpperCase() || '4G/Wi-Fi'}
                </div>
              </div>
            </div>

            <button
              onClick={() => runPingTest()}
              disabled={isPinging}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 12px', borderRadius: 6,
                background: 'rgba(232,130,155,0.15)', border: '1px solid rgba(232,130,155,0.3)',
                color: 'var(--color-sakura)', fontSize: 11, fontWeight: 700, cursor: 'pointer',
              }}
            >
              <Zap size={11} />
              <span>{isPinging ? 'Testing Ping...' : livePing ? `Ping: ${livePing}ms` : 'Test Live Ping'}</span>
            </button>
          </div>

          {/* Available Networks List */}
          {wifiEnabled && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: 0.5, marginBottom: 8 }}>
                Available Networks
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {availableNetworks.map(net => {
                  const isConnected = connectedSsid === net.ssid
                  return (
                    <div
                      key={net.ssid}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 12px', borderRadius: 8,
                        background: isConnected ? 'rgba(232,130,155,0.1)' : 'rgba(255,255,255,0.02)',
                        border: isConnected ? '1px solid rgba(232,130,155,0.3)' : '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Wifi size={14} style={{ color: isConnected ? 'var(--color-sakura)' : 'var(--color-text-muted)' }} />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: isConnected ? 700 : 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>{net.ssid}</span>
                            {net.isDevice && (
                              <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-miku)', background: 'rgba(126,221,214,0.15)', padding: '1px 5px', borderRadius: 4 }}>
                                Hardware Host
                              </span>
                            )}
                            {net.secured && <Lock size={10} style={{ opacity: 0.5 }} />}
                            {isConnected && (
                              <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-sakura)', background: 'rgba(232,130,155,0.15)', padding: '1px 5px', borderRadius: 4 }}>
                                Connected
                              </span>
                            )}
                          </div>
                          {net.speed && <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 1 }}>{net.speed} · Security: {net.securityType || 'WPA2/WPA3'}</div>}
                        </div>
                      </div>

                      <div>
                        {isConnected ? (
                          <button
                            onClick={disconnect}
                            style={{
                              padding: '4px 10px', borderRadius: 6,
                              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                              color: 'var(--color-text-secondary)', fontSize: 11, cursor: 'pointer',
                            }}
                          >
                            Disconnect
                          </button>
                        ) : (
                          <button
                            onClick={() => connectToNetwork(net.ssid)}
                            style={{
                              padding: '4px 10px', borderRadius: 6,
                              background: 'var(--color-sakura)', border: 'none',
                              color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                            }}
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Battery & Power Management */}
      <Section title="Battery & Power Management">
        <div style={{
          background: 'var(--color-glass-card)', border: '1px solid var(--color-glass-border)',
          borderRadius: 12, padding: '14px 16px', marginBottom: 10,
        }}>
          {/* Main Status Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: isCharging ? 'rgba(74,222,128,0.15)' : 'rgba(232,130,155,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isCharging ? '#4ADE80' : 'var(--color-sakura)',
              }}>
                {isCharging ? <BatteryCharging size={20} /> : <Battery size={20} />}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>Battery Level: {batteryLevel}%</span>
                  {isCharging && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#4ADE80', background: 'rgba(74,222,128,0.15)', padding: '1px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Zap size={9} /> AC Connected
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 1 }}>
                  {isCharging ? 'Device is connected to power and charging' : `Estimated runtime: ~${Math.round((batteryLevel / 100) * 8)}h on battery`}
                </div>
              </div>
            </div>

            <button
              onClick={toggleCharging}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '5px 12px', borderRadius: 6,
                background: isCharging ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.06)',
                border: '1px solid ' + (isCharging ? '#4ADE80' : 'rgba(255,255,255,0.1)'),
                color: isCharging ? '#4ADE80' : 'var(--color-text-secondary)',
                fontSize: 11, fontWeight: 700, cursor: 'pointer',
              }}
            >
              {isCharging ? <Zap size={12} /> : <Battery size={12} />}
              <span>{isCharging ? 'AC Plugged' : 'On Battery'}</span>
            </button>
          </div>

          {/* Fill Gauge */}
          <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', marginBottom: 14 }}>
            <div
              style={{
                width: `${batteryLevel}%`,
                height: '100%',
                background: isCharging
                  ? 'linear-gradient(90deg, #4ADE80, #39C5BB)'
                  : batteryLevel > 30
                    ? 'linear-gradient(90deg, var(--color-sakura), var(--color-miku))'
                    : '#EF4444',
                borderRadius: 4,
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          {/* Power Modes */}
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: 0.5, marginBottom: 8 }}>
            Power Mode
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { id: 'saver', label: 'Power Saver', desc: 'Saves battery life' },
              { id: 'balanced', label: 'Balanced', desc: 'Optimal performance' },
              { id: 'performance', label: 'Performance', desc: 'Maximum responsiveness' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setPowerMode(m.id as any)}
                style={{
                  padding: '8px 10px', borderRadius: 8, textAlign: 'left',
                  background: powerMode === m.id ? 'rgba(232,130,155,0.15)' : 'rgba(255,255,255,0.02)',
                  border: '1px solid ' + (powerMode === m.id ? 'var(--color-sakura)' : 'rgba(255,255,255,0.06)'),
                  cursor: 'pointer', color: 'var(--color-text-primary)',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: powerMode === m.id ? 'var(--color-sakura)' : 'inherit' }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {m.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Display & Brightness */}
      <Section title="Display & Brightness">
        <div style={{
          background: 'var(--color-glass-card)', border: '1px solid var(--color-glass-border)',
          borderRadius: 12, padding: '14px 16px', marginBottom: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sun size={14} style={{ color: 'var(--color-sakura)' }} />
              <span>System Brightness</span>
            </span>
            <span style={{
              fontSize: 12, fontWeight: 700, color: 'var(--color-sakura)',
              fontFamily: 'var(--font-mono)', background: 'rgba(232,130,155,0.1)',
              padding: '2px 8px', borderRadius: 6,
            }}>
              {brightness}%
            </span>
          </div>

          {/* Slider with Min/Max Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Sun size={13} style={{ opacity: 0.6 }} />
            <input
              type="range"
              min={30}
              max={150}
              step={1}
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              style={{
                flex: 1,
                accentColor: 'var(--color-sakura)',
                cursor: 'pointer',
                height: 6,
                borderRadius: 3,
              }}
            />
            <Sun size={16} style={{ opacity: 0.9, color: 'var(--color-sakura)' }} />
          </div>

          {/* Quick Brightness Presets */}
          <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'Night (50%)', val: 50 },
              { label: 'Dim (75%)', val: 75 },
              { label: 'Normal (100%)', val: 100 },
              { label: 'Bright (125%)', val: 125 },
              { label: 'Max (150%)', val: 150 },
            ].map(p => (
              <button
                key={p.val}
                onClick={() => setBrightness(p.val)}
                style={{
                  padding: '4px 9px', borderRadius: 6,
                  background: brightness === p.val ? 'var(--color-sakura)' : 'rgba(255,255,255,0.05)',
                  border: '1px solid ' + (brightness === p.val ? 'var(--color-sakura)' : 'rgba(255,255,255,0.08)'),
                  color: brightness === p.val ? 'white' : 'var(--color-text-secondary)',
                  fontSize: 11, fontWeight: brightness === p.val ? 700 : 500,
                  cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 0.15s',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Theme Mode */}
      <Section title="Theme Mode">
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { id: 'dark', label: 'Dark Mode' },
            { id: 'light', label: 'Light White Mode' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setMode(t.id as any)}
              style={{
                padding: '8px 16px', borderRadius: 8,
                background: mode === t.id ? 'rgba(232,130,155,0.15)' : 'var(--color-glass-card)',
                border: mode === t.id ? '1px solid var(--color-sakura)' : '1px solid var(--color-glass-border)',
                cursor: 'pointer', color: 'var(--color-text-primary)', fontSize: 12,
                fontWeight: mode === t.id ? 700 : 500, fontFamily: 'var(--font-sans)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Background Mode */}
      <Section title="Background">
        <div style={{ display: 'flex', gap: 6 }}>
          {[{ id: 'dark', label: 'Solid' }, { id: 'static', label: 'Static' }, { id: 'live', label: 'Live' }].map(m => (
            <button key={m.id} onClick={() => setBgMode(m.id as any)} style={{
              padding: '7px 14px', borderRadius: 8,
              background: bgMode === m.id ? 'rgba(232,130,155,0.12)' : 'rgba(255,255,255,0.03)',
              border: bgMode === m.id ? '1px solid rgba(232,130,155,0.2)' : '1px solid rgba(255,255,255,0.05)',
              cursor: 'pointer', color: 'var(--color-text-primary)', fontSize: 12,
              fontWeight: bgMode === m.id ? 700 : 500, fontFamily: 'var(--font-sans)',
            }}>{m.label}</button>
          ))}
        </div>
      </Section>

      {/* Static wallpaper picker */}
      {bgMode === 'static' && (
        <Section title="Choose Wallpaper">
          <div style={{ display: 'flex', gap: 8 }}>
            {WALLPAPERS.map(w => (
              <div key={w.id} onClick={() => setSelectedWallpaper(w.id)} style={{
                width: 80, height: 50, borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                border: selectedWallpaper === w.id ? '2px solid var(--color-sakura)' : '2px solid rgba(255,255,255,0.05)',
              }}>
                <img src={w.src} alt={w.id} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Live wallpaper picker */}
      {bgMode === 'live' && (
        <Section title="Choose Live Wallpaper">
          <div style={{ display: 'flex', gap: 8 }}>
            {LIVE_WALLS.map(l => (
              <div key={l.id} onClick={() => setSelectedLiveWall(l.id)} style={{
                width: 80, height: 50, borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                border: selectedLiveWall === l.id ? '2px solid var(--color-sakura)' : '2px solid rgba(255,255,255,0.05)',
                position: 'relative',
              }}>
                <video src={l.src} muted loop autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute', bottom: 2, left: 2, right: 2,
                  fontSize: 8, color: 'white', fontWeight: 700,
                  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                  textAlign: 'center',
                }}>{l.label}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Accent Color */}
      <Section title="Accent Color">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(ACCENTS).map(([id, c]) => (
            <button key={id} onClick={() => setAccent(id)} style={{
              width: 32, height: 32, borderRadius: '50%', background: c.primary,
              border: accent === id ? '3px solid var(--color-text-primary)' : '3px solid transparent',
              cursor: 'pointer', transition: 'all 0.15s',
            }} title={id} />
          ))}
        </div>
      </Section>

      <Section title="Widgets">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>Desktop Widgets</span>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>Clock & Calendar</div>
          </div>
          <button onClick={() => setWidgets(w => !w)} style={{
            width: 44, height: 24, borderRadius: 12, border: 'none',
            background: widgets ? 'var(--color-sakura)' : 'rgba(255,255,255,0.08)',
            cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%', background: 'white',
              position: 'absolute', top: 3, left: widgets ? 23 : 3,
              transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }} />
          </button>
        </div>
      </Section>

      <Section title="Meo Assistant">
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>Gemini API Key</span>
          <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>Required for Meo AI responses. Get one at aistudio.google.com</div>
        </div>
        <input
          type="password"
          defaultValue={localStorage.getItem('syau-gemini-key') || 'AIzaSyDxvt3A5saNeoG9FeAFqNcQmL-wmqXokJ0'}
          onBlur={(e) => localStorage.setItem('syau-gemini-key', e.target.value)}
          placeholder="Paste your Gemini API key..."
          style={{
            width: '100%', padding: '8px 12px', borderRadius: 8,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--color-text-primary)', fontSize: 12,
            fontFamily: 'var(--font-mono)', outline: 'none',
          }}
        />
        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--color-text-muted)' }}>
          Ctrl+M to toggle Meo · Click the orb to talk
        </div>
      </Section>

      <Section title="About">
        <InfoRow label="OS Version" value="स्याउ OS 1.0.0" />
        <InfoRow label="Creator" value="Kantaraj Luitel (Susant)" />
        <InfoRow label="Location" value="Nepal 🇳🇵" />
      </Section>

      <div style={{
        marginTop: 16, padding: 12,
        background: 'rgba(232,130,155,0.03)', backdropFilter: 'blur(12px)',
        borderRadius: 10, fontSize: 11, color: 'var(--color-text-muted)',
        textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)',
      }}>Designed & Built by Kantaraj Luitel (Susant) for Hack Club</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--color-text-muted)', marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{value}</span>
    </div>
  )
}
