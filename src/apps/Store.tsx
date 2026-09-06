import { useState, useCallback } from 'react'
import {
  ShoppingBag, Download, Trash2, Check, Search, Star,
  CloudSun, CheckSquare, Timer, Keyboard, Palette, Image as ImageIcon,
  FileText, Calculator, Terminal, Music, Code2, ArrowLeft
} from 'lucide-react'
import { useDesktopStore } from '../store/desktopStore'

type AppCategory = 'all' | 'productivity' | 'creative' | 'utilities'

interface StoreApp {
  id: string
  name: string
  category: AppCategory
  desc: string
  rating: number
  downloads: string
  size: string
  installable: boolean
  opensApp?: string
  accentColor: string
  icon: typeof ShoppingBag
}

const STORE_APPS: StoreApp[] = [
  // --- Core Built-in Applications ---
  {
    id: 'studio',
    name: 'Syau Studio',
    category: 'creative',
    desc: 'Live HTML, CSS & JavaScript sandbox runner with preview',
    rating: 4.9,
    downloads: '18.4K',
    size: '0.4 MB',
    installable: false,
    opensApp: 'studio',
    accentColor: '#8B5CF6',
    icon: Code2,
  },
  {
    id: 'notes',
    name: 'Notes',
    category: 'productivity',
    desc: 'Lightweight notepad with instant local storage saving',
    rating: 4.8,
    downloads: '14.2K',
    size: '0.2 MB',
    installable: false,
    opensApp: 'notes',
    accentColor: '#FDBA74',
    icon: FileText,
  },
  {
    id: 'calculator',
    name: 'Calculator',
    category: 'utilities',
    desc: 'Responsive calculator with full keyboard shortcuts',
    rating: 4.7,
    downloads: '10.1K',
    size: '0.1 MB',
    installable: false,
    opensApp: 'calculator',
    accentColor: '#C4B5FD',
    icon: Calculator,
  },
  {
    id: 'terminal',
    name: 'Terminal',
    category: 'utilities',
    desc: 'Syau shell (syau-sh) with system info and utility commands',
    rating: 4.9,
    downloads: '16.5K',
    size: '0.2 MB',
    installable: false,
    opensApp: 'terminal',
    accentColor: '#7EDDD6',
    icon: Terminal,
  },
  {
    id: 'music',
    name: 'Music Player',
    category: 'creative',
    desc: 'Spotify player hub with curated Nepali and lofi playlists',
    rating: 4.8,
    downloads: '12.0K',
    size: '0.5 MB',
    installable: false,
    opensApp: 'music',
    accentColor: '#E8829B',
    icon: Music,
  },

  // --- Installable Store Apps ---
  {
    id: 'weather',
    name: 'Weather',
    category: 'utilities',
    desc: '7-day meteorological forecast and humidity tracker',
    rating: 4.7,
    downloads: '11.2K',
    size: '0.4 MB',
    installable: true,
    accentColor: '#93C5FD',
    icon: CloudSun,
  },
  {
    id: 'kanban',
    name: 'Kanban Board',
    category: 'productivity',
    desc: 'Task management board with Todo, In-Progress, and Done columns',
    rating: 4.8,
    downloads: '8.5K',
    size: '0.3 MB',
    installable: true,
    accentColor: '#86EFAC',
    icon: CheckSquare,
  },
  {
    id: 'timer',
    name: 'Focus Timer',
    category: 'productivity',
    desc: 'Pomodoro focus timer and productivity stopwatch',
    rating: 4.6,
    downloads: '6.1K',
    size: '0.2 MB',
    installable: true,
    accentColor: '#FDBA74',
    icon: Timer,
  },
  {
    id: 'typing-speed',
    name: 'Type Racer',
    category: 'productivity',
    desc: 'Typing speed challenge testing words-per-minute accuracy',
    rating: 4.7,
    downloads: '14.2K',
    size: '0.3 MB',
    installable: true,
    accentColor: '#C4B5FD',
    icon: Keyboard,
  },
  {
    id: 'paint-studio',
    name: 'Paint Studio',
    category: 'creative',
    desc: 'Canvas sketching app with brush size, colors, and save',
    rating: 4.5,
    downloads: '9.3K',
    size: '0.5 MB',
    installable: true,
    accentColor: '#86EFAC',
    icon: Palette,
  },
  {
    id: 'image-editor',
    name: 'Image Editor',
    category: 'creative',
    desc: 'Photo filters, contrast adjustments, and image processing',
    rating: 4.4,
    downloads: '5.7K',
    size: '0.4 MB',
    installable: true,
    accentColor: '#E8829B',
    icon: ImageIcon,
  },
]

const CATEGORIES: { id: AppCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'creative', label: 'Creative' },
  { id: 'utilities', label: 'Utilities' },
]

export default function Store() {
  const [activeCategory, setActiveCategory] = useState<AppCategory>('all')
  const [search, setSearch] = useState('')
  const [selectedApp, setSelectedApp] = useState<StoreApp | null>(null)
  const [installingId, setInstallingId] = useState<string | null>(null)

  const openWindow = useDesktopStore(s => s.openWindow)
  const installedStoreApps = useDesktopStore(s => s.installedStoreApps)
  const installStoreApp = useDesktopStore(s => s.installStoreApp)
  const uninstallStoreApp = useDesktopStore(s => s.uninstallStoreApp)

  const isInstalled = useCallback((appId: string) => {
    return installedStoreApps.includes(appId)
  }, [installedStoreApps])

  const handleInstall = (app: StoreApp) => {
    if (installingId) return
    setInstallingId(app.id)

    setTimeout(() => {
      installStoreApp(app.id)
      setInstallingId(null)
    }, 1200)
  }

  const handleUninstall = (appId: string) => {
    uninstallStoreApp(appId)
  }

  const filteredApps = STORE_APPS.filter(app => {
    const matchCat = activeCategory === 'all' || app.category === activeCategory
    const matchSearch = !search || app.name.toLowerCase().includes(search.toLowerCase()) || app.desc.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--color-window-bg)', color: 'var(--color-text-primary)',
      fontFamily: 'var(--font-sans)', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid var(--color-glass-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.02)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {selectedApp ? (
            <button
              onClick={() => setSelectedApp(null)}
              style={{
                background: 'rgba(255,255,255,0.06)', border: 'none', color: 'var(--color-text-primary)',
                borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={16} />
            </button>
          ) : (
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'linear-gradient(135deg, var(--color-sakura) 0%, #C45A7C 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
            }}>
              <ShoppingBag size={15} />
            </div>
          )}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>
              {selectedApp ? selectedApp.name : 'स्याउ Store'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>
              {selectedApp ? selectedApp.category : `${STORE_APPS.length} apps available`}
            </div>
          </div>
        </div>

        {/* Search */}
        {!selectedApp && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-glass-border)',
            borderRadius: 8, padding: '4px 8px', width: 160,
          }}>
            <Search size={12} style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search store..."
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--color-text-primary)', fontSize: 11, width: '100%',
              }}
            />
          </div>
        )}
      </div>

      {/* Category Pills */}
      {!selectedApp && (
        <div style={{ display: 'flex', gap: 6, padding: '8px 16px', borderBottom: '1px solid var(--color-glass-border)', flexShrink: 0 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '4px 10px', borderRadius: 14, fontSize: 11, fontWeight: 600,
                background: activeCategory === cat.id ? 'var(--color-sakura)' : 'rgba(255,255,255,0.04)',
                color: activeCategory === cat.id ? 'white' : 'var(--color-text-secondary)',
                border: 'none', cursor: 'pointer', transition: 'all 0.15s ease',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {selectedApp ? (
          <div style={{ maxWidth: 460, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: `linear-gradient(135deg, ${selectedApp.accentColor} 0%, rgba(255,255,255,0.1) 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                boxShadow: `0 8px 24px ${selectedApp.accentColor}33`,
              }}>
                <selectedApp.icon size={32} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>{selectedApp.name}</h3>
                <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '0 0 6px' }}>{selectedApp.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: 'var(--color-text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#FDBA74' }}>
                    <Star size={12} fill="currentColor" /> {selectedApp.rating}
                  </span>
                  <span>•</span>
                  <span>{selectedApp.downloads} installs</span>
                  <span>•</span>
                  <span>{selectedApp.size}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              {!selectedApp.installable ? (
                <button
                  onClick={() => selectedApp.opensApp && openWindow(selectedApp.opensApp, selectedApp.name)}
                  style={{
                    flex: 1, padding: '10px 16px', borderRadius: 8, background: 'var(--color-sakura)',
                    color: 'white', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer',
                  }}
                >
                  Open App
                </button>
              ) : isInstalled(selectedApp.id) ? (
                <>
                  <button
                    onClick={() => openWindow(selectedApp.id, selectedApp.name)}
                    style={{
                      flex: 1, padding: '10px 16px', borderRadius: 8, background: 'var(--color-sakura)',
                      color: 'white', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer',
                    }}
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleUninstall(selectedApp.id)}
                    style={{
                      padding: '10px 14px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.15)',
                      color: '#EF4444', fontWeight: 600, fontSize: 12, border: '1px solid rgba(239, 68, 68, 0.3)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    <Trash2 size={14} /> Uninstall
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleInstall(selectedApp)}
                  disabled={installingId === selectedApp.id}
                  style={{
                    flex: 1, padding: '10px 16px', borderRadius: 8, background: 'var(--color-sakura)',
                    color: 'white', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  {installingId === selectedApp.id ? (
                    <span>Installing...</span>
                  ) : (
                    <>
                      <Download size={14} /> Get App
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {filteredApps.map(app => {
              const AppIcon = app.icon
              const installed = !app.installable || isInstalled(app.id)
              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  style={{
                    padding: 12, borderRadius: 12, background: 'var(--color-glass-card)',
                    border: '1px solid var(--color-glass-border)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-sakura)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-glass-border)'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `linear-gradient(135deg, ${app.accentColor} 0%, rgba(255,255,255,0.05) 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                    flexShrink: 0,
                  }}>
                    <AppIcon size={22} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{app.name}</span>
                      {installed && (
                        <span style={{ fontSize: 10, color: 'var(--color-mint)', display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Check size={11} /> Installed
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {app.desc}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
