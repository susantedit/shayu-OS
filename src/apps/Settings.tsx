import { useState } from 'react'
import {
  Sun, Moon, Palette, Sliders, Monitor, Info, Check, RotateCcw
} from 'lucide-react'
import { useThemeStore, type DockSize } from '../store/themeStore'

const ACCENTS = [
  { name: 'Sakura Pink', primary: '#E8829B', dark: '#C45A7C' },
  { name: 'Cyber Miku', primary: '#7EDDD6', dark: '#39C5BB' },
  { name: 'Lavender Neon', primary: '#C4B5FD', dark: '#A78BFA' },
  { name: 'Mint Leaf', primary: '#86EFAC', dark: '#4ADE80' },
  { name: 'Warm Peach', primary: '#FDBA74', dark: '#FB923C' },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'appearance' | 'dock' | 'info'>('appearance')
  const mode = useThemeStore(s => s.mode)
  const setMode = useThemeStore(s => s.setMode)
  const setCustomAccent = useThemeStore(s => s.setCustomAccent)
  const dockSize = useThemeStore(s => s.dockSize)
  const setDockConfig = useThemeStore(s => s.setDockConfig)
  const dockPosition = useThemeStore(s => s.dockPosition)
  const windowBlur = useThemeStore(s => s.windowBlur)
  const windowOpacity = useThemeStore(s => s.windowOpacity)
  const setWindowOptics = useThemeStore(s => s.setWindowOptics)
  const resetDefaults = useThemeStore(s => s.resetThemeDefaults)

  const [widgetsEnabled, setWidgetsEnabled] = useState(() => localStorage.getItem('syau-os-widgets') !== 'off')

  const toggleWidgets = () => {
    const next = !widgetsEnabled
    setWidgetsEnabled(next)
    localStorage.setItem('syau-os-widgets', next ? 'on' : 'off')
    window.dispatchEvent(new Event('syau-widgets-toggle'))
  }

  return (
    <div style={{ display: 'flex', height: '100%', color: 'var(--color-text-primary)', userSelect: 'none' }}>
  
      <div style={{
        width: 170,
        borderRight: '1px solid var(--color-border)',
        padding: '16px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <button
          onClick={() => setActiveTab('appearance')}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8,
            border: 'none', background: activeTab === 'appearance' ? 'var(--color-bg-hover)' : 'transparent',
            color: activeTab === 'appearance' ? 'var(--color-sakura)' : 'inherit',
            fontWeight: activeTab === 'appearance' ? 600 : 400, cursor: 'pointer', textAlign: 'left'
          }}
        >
          <Palette size={16} /> Appearance
        </button>

        <button
          onClick={() => setActiveTab('dock')}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8,
            border: 'none', background: activeTab === 'dock' ? 'var(--color-bg-hover)' : 'transparent',
            color: activeTab === 'dock' ? 'var(--color-sakura)' : 'inherit',
            fontWeight: activeTab === 'dock' ? 600 : 400, cursor: 'pointer', textAlign: 'left'
          }}
        >
          <Sliders size={16} /> Desktop & Dock
        </button>

        <button
          onClick={() => setActiveTab('info')}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8,
            border: 'none', background: activeTab === 'info' ? 'var(--color-bg-hover)' : 'transparent',
            color: activeTab === 'info' ? 'var(--color-sakura)' : 'inherit',
            fontWeight: activeTab === 'info' ? 600 : 400, cursor: 'pointer', textAlign: 'left'
          }}
        >
          <Info size={16} /> About System
        </button>

        <div style={{ marginTop: 'auto', paddingTop: 16 }}>
          <button
            onClick={resetDefaults}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6,
              border: '1px solid var(--color-border)', background: 'transparent',
              color: 'var(--color-text-secondary)', fontSize: 12, cursor: 'pointer', width: '100%'
            }}
          >
            <RotateCcw size={13} /> Reset Defaults
          </button>
        </div>
      </div>

      
      <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
        {activeTab === 'appearance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600 }}>Theme Mode</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setMode('dark')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 8,
                    border: mode === 'dark' ? '2px solid var(--color-sakura)' : '1px solid var(--color-border)',
                    background: 'var(--color-bg-window)', color: 'inherit', cursor: 'pointer'
                  }}
                >
                  <Moon size={16} /> Dark Mode
                  {mode === 'dark' && <Check size={14} color="var(--color-sakura)" />}
                </button>
                <button
                  onClick={() => setMode('light')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 8,
                    border: mode === 'light' ? '2px solid var(--color-sakura)' : '1px solid var(--color-border)',
                    background: 'var(--color-bg-window)', color: 'inherit', cursor: 'pointer'
                  }}
                >
                  <Sun size={16} /> Light Mode
                  {mode === 'light' && <Check size={14} color="var(--color-sakura)" />}
                </button>
              </div>
            </div>

            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600 }}>Accent Color</h3>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {ACCENTS.map(acc => (
                  <button
                    key={acc.name}
                    onClick={() => setCustomAccent(acc.primary, acc.dark)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 8,
                      border: '1px solid var(--color-border)', background: 'var(--color-bg-window)',
                      color: 'inherit', cursor: 'pointer'
                    }}
                  >
                    <span style={{ width: 14, height: 14, borderRadius: '50%', background: acc.primary }} />
                    <span style={{ fontSize: 13 }}>{acc.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600 }}>Window Optics</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 360 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, color: 'var(--color-text-secondary)' }}>
                    <span>Window Blur</span>
                    <span>{windowBlur}px</span>
                  </div>
                  <input
                    type="range" min="0" max="40" value={windowBlur}
                    onChange={e => setWindowOptics(parseInt(e.target.value), windowOpacity)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, color: 'var(--color-text-secondary)' }}>
                    <span>Window Opacity</span>
                    <span>{windowOpacity}%</span>
                  </div>
                  <input
                    type="range" min="40" max="100" value={windowOpacity}
                    onChange={e => setWindowOptics(windowBlur, parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dock' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600 }}>Dock Size</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                {(['compact', 'default', 'large'] as DockSize[]).map(sz => (
                  <button
                    key={sz}
                    onClick={() => setDockConfig(dockPosition, sz)}
                    style={{
                      padding: '8px 16px', borderRadius: 8, textTransform: 'capitalize',
                      border: dockSize === sz ? '2px solid var(--color-sakura)' : '1px solid var(--color-border)',
                      background: 'var(--color-bg-window)', color: 'inherit', cursor: 'pointer'
                    }}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600 }}>Desktop Widgets</h3>
              <p style={{ margin: '0 0 12px 0', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                Analog desktop clock and calendar display on the right side of the workspace.
              </p>
              <button
                onClick={toggleWidgets}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8,
                  border: '1px solid var(--color-border)', background: 'var(--color-bg-window)',
                  color: 'inherit', cursor: 'pointer'
                }}
              >
                <Monitor size={15} />
                <span>Widgets: {widgetsEnabled ? 'Enabled' : 'Disabled'}</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 440 }}>
            <div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: 18, fontWeight: 700 }}>स्याउ OS (SyauOS)</h3>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                A client-side web desktop environment blending desktop windowing with Nepali cultural identity.
              </p>
            </div>

            <div style={{
              background: 'var(--color-bg-window)', border: '1px solid var(--color-border)',
              borderRadius: 8, padding: 14, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Version</span>
                <span>1.3.0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Core Stack</span>
                <span>React 19, TypeScript, Vite</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Calendar Engine</span>
                <span>Bikram Sambat (BS) Algorithmic</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Typography</span>
                <span>Noto Sans Devanagari, Space Grotesk</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Developer</span>
                <span>Kantaraj Luitel (Susant)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
