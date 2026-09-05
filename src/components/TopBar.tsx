import { useState, useEffect, useRef } from 'react'
import {
  Wifi, WifiOff, Battery, BatteryCharging, BatteryFull, BatteryMedium, BatteryLow, BatteryWarning,
  Volume2, BookOpen, Sun, Moon, Sliders, Check, Lock, Radio, Zap, RotateCw, Video
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDesktopStore } from '../store/desktopStore'
import { useThemeStore } from '../store/themeStore'
import { useNetworkStore } from '../store/networkStore'
import { useBatteryStore } from '../store/batteryStore'

export default function TopBar() {
  const [time, setTime] = useState(new Date())
  const [menuOpen, setMenuOpen] = useState<'logo' | 'app' | 'control' | null>(null)
  const [showNetworkList, setShowNetworkList] = useState(false)
  const [logoClicks, setLogoClicks] = useState(0)
  const [rainbow, setRainbow] = useState(false)
  const activeWindowId = useDesktopStore(s => s.activeWindowId)
  const windows = useDesktopStore(s => s.windows)
  const openWindow = useDesktopStore(s => s.openWindow)
  const currentWorkspace = useDesktopStore(s => s.currentWorkspace)
  const maxWorkspaces = useDesktopStore(s => s.maxWorkspaces)
  const switchWorkspace = useDesktopStore(s => s.switchWorkspace)

  const { mode, toggleMode, brightness, setBrightness } = useThemeStore()
  const {
    wifiEnabled, toggleWifi, connectedSsid, availableNetworks, connectToNetwork,
    isDeviceOnline, livePing, isPinging, runPingTest, isScanning, scanNetworks
  } = useNetworkStore()

  const {
    level: batteryLevel, charging: isCharging, powerMode, setPowerMode,
    toggleCharging, initBattery
  } = useBatteryStore()

  const activeWin = windows.find(w => w.id === activeWindowId)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    initBattery()
    return () => clearInterval(interval)
  }, [initBattery])

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const appName = activeWin?.title || 'स्याउ OS'

  // Dynamic Battery Icon Helper
  const renderBatteryIcon = (size = 12) => {
    if (isCharging) {
      return <BatteryCharging size={size} style={{ color: '#4ADE80' }} />
    }
    if (batteryLevel > 75) {
      return <BatteryFull size={size} style={{ color: 'var(--color-sakura)' }} />
    }
    if (batteryLevel > 30) {
      return <BatteryMedium size={size} style={{ color: 'var(--color-text-secondary)' }} />
    }
    if (batteryLevel > 15) {
      return <BatteryLow size={size} style={{ color: '#FB923C' }} />
    }
    return <BatteryWarning size={size} style={{ color: '#EF4444', animation: 'pulse 1s infinite' }} />
  }

  const logoMenuItems = [
    { label: 'Creator Profile (Susant)', action: () => { openWindow('creator', 'Kantaraj Luitel (Susant) - Creator Profile', 860, 580); setMenuOpen(null) } },
    { label: 'About स्याउ OS', action: () => { openWindow('about', 'About Me', 480, 540); setMenuOpen(null) } },
    { label: 'स्याउ OS Devlogs', action: () => { openWindow('devlogs', 'स्याउ OS Devlogs', 840, 560); setMenuOpen(null) } },
    { label: 'Settings', action: () => { openWindow('settings', 'Settings', 460, 560); setMenuOpen(null) } },
    { divider: true },
    { label: 'Terminal', action: () => { openWindow('terminal', 'Terminal', 600, 400); setMenuOpen(null) } },
  ]

  return (
    <div className="top-bar" ref={menuRef} style={rainbow ? { background: 'linear-gradient(90deg, #ff0000, #ff7700, #ffff00, #00ff00, #0077ff, #7700ff, #ff0000)', backgroundSize: '400% 100%', animation: 'rainbow-slide 2s linear infinite' } : undefined}>
      <div className="top-bar-left" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div
          className="top-bar-logo"
          style={{
            cursor: 'pointer', padding: '2px 8px', borderRadius: 6, transition: 'background 0.15s',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
          onClick={() => {
            setMenuOpen(menuOpen === 'logo' ? null : 'logo')
            const next = logoClicks + 1
            setLogoClicks(next)
            if (next >= 10) {
              setRainbow(true)
              setLogoClicks(0)
              setTimeout(() => setRainbow(false), 5000)
            }
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(232,130,155,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <img src="/syauOS.png" alt="स्याउ OS" style={{ width: 18, height: 18, objectFit: 'contain' }} />
          <span className="font-syau" style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>स्याउ</span>
          <span className="font-os" style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-sakura)', letterSpacing: '0.08em' }}>OS</span>
        </div>

        <AnimatePresence>
          {menuOpen === 'logo' && (
            <motion.div
              className="topbar-dropdown"
              initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{ transformOrigin: 'top left' }}
            >
              {logoMenuItems.map((item, i) => {
                if ('divider' in item) return <div key={i} className="topbar-dropdown-divider" />
                return (
                  <div key={i} className="topbar-dropdown-item" onClick={item.action}>
                    {item.label}
                  </div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ position: 'relative', marginLeft: 6 }}>
          <span className="top-bar-menu font-body" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{appName}</span>
          <div style={{
            position: 'absolute', bottom: -2, left: 0, right: 0, height: 2,
            background: 'var(--color-sakura)', borderRadius: 1,
            boxShadow: '0 0 8px rgba(232,130,155,0.4)',
            transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
          }} />
        </div>
      </div>

      <div className="top-bar-right" style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
        <button
          onClick={() => openWindow('devlogs', 'Devlogs', 840, 560)}
          title="Open स्याउ OS Devlogs"
          className="topbar-hide-mobile"
          style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 6,
            background: 'var(--color-glass-card)', border: '1px solid var(--color-glass-border)',
            color: 'var(--color-text-secondary)', fontSize: 11, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <BookOpen size={12} style={{ color: 'var(--color-sakura)' }} />
          <span>Devlogs</span>
        </button>

        {windows.filter(w => w.workspace === currentWorkspace && !w.minimized).length > 1 && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('syau-switch-windows'))}
            title="Switch windows"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 26, height: 24, borderRadius: 6, border: '1px solid var(--color-glass-border)',
              background: 'var(--color-glass-card)', cursor: 'pointer',
              color: 'var(--color-text-secondary)', fontSize: 11,
              transition: 'all 0.15s',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="8" height="8" rx="1"/><rect x="14" y="3" width="8" height="8" rx="1"/><rect x="2" y="13" width="8" height="8" rx="1"/><rect x="14" y="13" width="8" height="8" rx="1"/></svg>
          </button>
        )}

        <div className="topbar-hide-mobile" style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '0 2px' }}>
          {Array.from({ length: maxWorkspaces }, (_, i) => i + 1).map(ws => {
            const hasWindows = windows.some(w => w.workspace === ws)
            return (
              <button key={ws} onClick={() => switchWorkspace(ws)} title={`Workspace ${ws} (Ctrl+${ws})`} style={{
                width: ws === currentWorkspace ? 20 : 7,
                height: 7,
                borderRadius: 4,
                border: 'none',
                cursor: 'pointer',
                background: ws === currentWorkspace
                  ? 'var(--color-sakura)'
                  : hasWindows
                    ? 'rgba(232,130,155,0.35)'
                    : 'rgba(255,255,255,0.15)',
                boxShadow: ws === currentWorkspace ? '0 0 8px rgba(232,130,155,0.4)' : 'none',
                transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                padding: 0,
              }}
              />
            )
          })}
        </div>

        <div
          onClick={() => setMenuOpen(menuOpen === 'control' ? null : 'control')}
          title="Control Center & System Settings"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '2px 8px', borderRadius: 6,
            background: menuOpen === 'control' ? 'rgba(232,130,155,0.18)' : 'var(--color-glass-card)',
            border: '1px solid ' + (menuOpen === 'control' ? 'var(--color-sakura)' : 'var(--color-glass-border)'),
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          <Sun size={12} style={{ color: brightness < 70 ? 'var(--color-text-muted)' : 'var(--color-sakura)' }} />

          <div className="topbar-hide-small-mobile" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {renderBatteryIcon(13)}
            <span style={{
              fontSize: 10, fontWeight: 700,
              color: isCharging ? '#4ADE80' : batteryLevel <= 20 ? '#EF4444' : 'var(--color-text-secondary)',
              fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 2,
            }}>
              <span>{batteryLevel}%</span>
              {isCharging && <Zap size={9} style={{ color: '#4ADE80' }} />}
            </span>
          </div>

          <div className="topbar-hide-small-mobile" style={{ display: 'flex', alignItems: 'center' }}>
            {wifiEnabled ? (
              <motion.div animate={{ opacity: [0.85, 1, 0.85] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                <Wifi size={12} style={{ color: 'var(--color-sakura)' }} />
              </motion.div>
            ) : (
              <WifiOff size={12} style={{ color: 'var(--color-text-muted)', opacity: 0.6 }} />
            )}
          </div>

          <div className="topbar-hide-small-mobile">
            <Volume2 size={12} />
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {brightness}%
          </span>
        </div>

        <AnimatePresence>
          {menuOpen === 'control' && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{
                position: 'absolute', top: 32, right: 0,
                width: 320,
                background: 'linear-gradient(145deg, rgba(20,15,22,0.96) 0%, rgba(12,8,14,0.98) 100%)',
                backdropFilter: 'blur(30px)',
                borderRadius: 14,
                border: '1px solid rgba(232,130,155,0.2)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.2) inset',
                padding: 14, zIndex: 1000,
                color: 'var(--color-text-primary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                  Control Center
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-sakura)' }}>
                  स्याउ OS
                </span>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 10, padding: '10px 12px',
                border: '1px solid rgba(255,255,255,0.06)',
                marginBottom: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: isCharging ? 'rgba(74,222,128,0.15)' : 'rgba(232,130,155,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {renderBatteryIcon(16)}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>Battery {batteryLevel}%</span>
                        {isCharging && (
                          <span style={{ fontSize: 10, color: '#4ADE80', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Zap size={10} /> Charging
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                        {isCharging ? 'Plugged into AC Adapter' : `Est. ${Math.round((batteryLevel / 100) * 8)} hours remaining`}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={toggleCharging}
                    title="Toggle Charger Cable Simulation"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '3px 8px', borderRadius: 6,
                      background: isCharging ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.06)',
                      border: '1px solid ' + (isCharging ? '#4ADE80' : 'rgba(255,255,255,0.1)'),
                      color: isCharging ? '#4ADE80' : 'var(--color-text-secondary)',
                      fontSize: 10, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    {isCharging ? <Zap size={10} /> : <Battery size={10} />}
                    <span>{isCharging ? 'AC Cable' : 'Battery'}</span>
                  </button>
                </div>

                <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                  <motion.div
                    style={{
                      height: '100%',
                      background: isCharging
                        ? 'linear-gradient(90deg, #4ADE80, #39C5BB)'
                        : batteryLevel > 30
                          ? 'linear-gradient(90deg, var(--color-sakura), var(--color-miku))'
                          : '#EF4444',
                      borderRadius: 3,
                    }}
                    animate={{ width: `${batteryLevel}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 4 }}>
                  {[
                    { id: 'saver', label: 'Saver' },
                    { id: 'balanced', label: 'Balanced' },
                    { id: 'performance', label: 'Perf' },
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setPowerMode(m.id as any)}
                      style={{
                        flex: 1, padding: '3px 0', borderRadius: 4,
                        background: powerMode === m.id ? 'var(--color-sakura)' : 'rgba(255,255,255,0.04)',
                        border: '1px solid ' + (powerMode === m.id ? 'var(--color-sakura)' : 'rgba(255,255,255,0.06)'),
                        color: powerMode === m.id ? 'white' : 'var(--color-text-secondary)',
                        fontSize: 10, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{
                background: wifiEnabled ? 'rgba(232,130,155,0.08)' : 'rgba(255,255,255,0.03)',
                borderRadius: 10, padding: '10px 12px',
                border: wifiEnabled ? '1px solid rgba(232,130,155,0.2)' : '1px solid rgba(255,255,255,0.05)',
                marginBottom: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: wifiEnabled ? 'var(--color-sakura)' : 'rgba(255,255,255,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: wifiEnabled ? 'white' : 'var(--color-text-muted)',
                    }}>
                      {wifiEnabled ? <Wifi size={15} /> : <WifiOff size={15} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>
                        {wifiEnabled ? 'Wi-Fi Wireless' : 'Wi-Fi Turned Off'}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                        {wifiEnabled ? (connectedSsid || 'Connected') : 'Disconnected'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={toggleWifi}
                    title={wifiEnabled ? 'Turn Wi-Fi Off' : 'Turn Wi-Fi On'}
                    style={{
                      width: 40, height: 22, borderRadius: 11, border: 'none',
                      background: wifiEnabled ? 'var(--color-sakura)' : 'rgba(255,255,255,0.15)',
                      cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                    }}
                  >
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%', background: 'white',
                      position: 'absolute', top: 3, left: wifiEnabled ? 21 : 3,
                      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    }} />
                  </button>
                </div>

                {wifiEnabled && (
                  <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 0' }}>
                      <div
                        onClick={() => setShowNetworkList(l => !l)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          fontSize: 10, color: 'var(--color-sakura)', fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        <span>{showNetworkList ? 'Hide Networks' : `Available Networks (${availableNetworks.length})`}</span>
                        <Radio size={10} />
                      </div>

                      <button
                        onClick={() => scanNetworks()}
                        disabled={isScanning}
                        title="Scan for nearby Wi-Fi broadcast signals"
                        style={{
                          background: 'none', border: 'none', color: 'var(--color-text-muted)',
                          fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3,
                        }}
                      >
                        <RotateCw size={10} className={isScanning ? 'animate-spin' : ''} />
                        <span>{isScanning ? 'Scanning...' : 'Scan'}</span>
                      </button>
                    </div>

                    {showNetworkList && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6, maxHeight: 140, overflowY: 'auto' }}>
                        {availableNetworks.map(net => (
                          <div
                            key={net.ssid}
                            onClick={() => connectToNetwork(net.ssid)}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '5px 8px', borderRadius: 6, cursor: 'pointer',
                              background: connectedSsid === net.ssid ? 'rgba(232,130,155,0.15)' : 'rgba(255,255,255,0.02)',
                              border: connectedSsid === net.ssid ? '1px solid var(--color-sakura)' : '1px solid transparent',
                              fontSize: 11,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Wifi size={11} style={{ color: connectedSsid === net.ssid ? 'var(--color-sakura)' : 'var(--color-text-muted)' }} />
                              <span style={{ fontWeight: connectedSsid === net.ssid ? 700 : 500 }}>{net.ssid}</span>
                              {net.isDevice && <span style={{ fontSize: 8, background: 'rgba(126,221,214,0.2)', color: 'var(--color-miku)', padding: '1px 4px', borderRadius: 3 }}>Host</span>}
                              {net.secured && <Lock size={9} style={{ opacity: 0.5 }} />}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              {net.speed && <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>{net.speed}</span>}
                              {connectedSsid === net.ssid && <Check size={12} style={{ color: 'var(--color-sakura)' }} />}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: 10,
                padding: '10px 12px', border: '1px solid rgba(255,255,255,0.05)',
                marginBottom: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600 }}>
                    <Sun size={14} style={{ color: 'var(--color-sakura)' }} />
                    <span>Display Brightness</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-sakura)' }}>
                    {brightness}%
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sun size={12} style={{ opacity: 0.6 }} />
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
                      height: 5,
                      borderRadius: 3,
                    }}
                  />
                  <Sun size={16} style={{ opacity: 0.9, color: 'var(--color-sakura)' }} />
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                  {[50, 75, 100, 125].map(val => (
                    <button
                      key={val}
                      onClick={() => setBrightness(val)}
                      style={{
                        flex: 1, padding: '3px 0', borderRadius: 4,
                        background: brightness === val ? 'var(--color-sakura)' : 'rgba(255,255,255,0.04)',
                        border: '1px solid ' + (brightness === val ? 'var(--color-sakura)' : 'rgba(255,255,255,0.06)'),
                        color: brightness === val ? 'white' : 'var(--color-text-secondary)',
                        fontSize: 10, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                <button
                  onClick={toggleMode}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                    borderRadius: 8, background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer', color: 'var(--color-text-primary)', textAlign: 'left',
                  }}
                >
                  {mode === 'dark' ? <Moon size={14} style={{ color: '#C4B5FD' }} /> : <Sun size={14} style={{ color: '#FB923C' }} />}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600 }}>{mode === 'dark' ? 'Dark Mode' : 'Light Mode'}</div>
                    <div style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>Theme</div>
                  </div>
                </button>

                <button
                  onClick={() => { openWindow('capture', 'Capture & Record', 780, 560); setMenuOpen(null) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                    borderRadius: 8, background: 'rgba(232,130,155,0.08)',
                    border: '1px solid rgba(232,130,155,0.2)',
                    cursor: 'pointer', color: 'var(--color-text-primary)', textAlign: 'left',
                  }}
                >
                  <Video size={14} style={{ color: 'var(--color-sakura)' }} />
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-sakura)' }}>Capture</div>
                    <div style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>Record & Snip</div>
                  </div>
                </button>

                <button
                  onClick={() => { openWindow('settings', 'Settings', 460, 560); setMenuOpen(null) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                    borderRadius: 8, background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer', color: 'var(--color-text-primary)', textAlign: 'left',
                  }}
                >
                  <Sliders size={14} style={{ color: 'var(--color-miku)' }} />
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600 }}>Settings</div>
                    <div style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>Preferences</div>
                  </div>
                </button>

                <button
                  onClick={() => { openWindow('devlogs', 'Devlogs', 840, 560); setMenuOpen(null) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                    borderRadius: 8, background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer', color: 'var(--color-text-primary)', textAlign: 'left',
                  }}
                >
                  <BookOpen size={14} style={{ color: 'var(--color-peach)' }} />
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600 }}>Devlogs</div>
                    <div style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>Updates</div>
                  </div>
                </button>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '6px 10px', borderRadius: 8, background: 'rgba(232,130,155,0.05)',
                fontSize: 10, color: 'var(--color-text-muted)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: isDeviceOnline && wifiEnabled ? '#4ADE80' : '#EF4444',
                  }} />
                  <span>Device: {isDeviceOnline ? 'Online' : 'Offline'}</span>
                </div>

                <button
                  onClick={() => runPingTest()}
                  disabled={isPinging}
                  title="Run live latency ping test to Cloudflare DNS"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '2px 6px', borderRadius: 4,
                    background: 'rgba(232,130,155,0.12)', border: '1px solid rgba(232,130,155,0.25)',
                    color: 'var(--color-sakura)', fontSize: 9, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  <Zap size={9} />
                  <span>{isPinging ? 'Pinging...' : livePing ? `${livePing}ms` : 'Test Ping'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <span className="font-syau topbar-hide-mobile" style={{ fontSize: 11, color: 'var(--color-sakura)', background: 'rgba(232,130,155,0.1)', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
          २०८३ भाद्र १६
        </span>

        <span className="topbar-hide-mobile">{formatDate(time)}</span>
        <motion.span
          key={time.getMinutes()}
          style={{ fontWeight: 600 }}
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {formatTime(time)}
        </motion.span>
      </div>
    </div>
  )
}
