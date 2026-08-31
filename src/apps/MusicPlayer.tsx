import { useState, useRef, useEffect } from 'react'
import { Music, Radio, Disc, Search, Sparkles, ExternalLink, Plus, Flame, Zap, Coffee, Globe, Sun, PanelLeft, PanelLeftClose } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface SpotifyPreset {
  id: string
  title: string
  category: string
  embedUrl: string
  spotifyUrl: string
  icon: LucideIcon
  color: string
}

const SPOTIFY_PRESETS: SpotifyPreset[] = [
  {
    id: 'nepali-old-classics',
    title: 'Nepali Old Classics & Evergreens',
    category: 'Nepali',
    embedUrl: 'https://open.spotify.com/embed/playlist/26kBEN704NPIhBZZO5bbvJ?utm_source=generator&theme=0',
    spotifyUrl: 'https://open.spotify.com/playlist/26kBEN704NPIhBZZO5bbvJ',
    icon: Globe,
    color: '#E8829B',
  },
  {
    id: 'bhajan-devotional',
    title: 'Bhajan & Devotional Hits',
    category: 'Bhajan',
    embedUrl: 'https://open.spotify.com/embed/playlist/4uOubJPlV5V9SlxxxsGZ8l?utm_source=generator&theme=0',
    spotifyUrl: 'https://open.spotify.com/playlist/4uOubJPlV5V9SlxxxsGZ8l',
    icon: Sun,
    color: '#F97316',
  },
  {
    id: 'phonk-funk-mix',
    title: 'Phonk & Funk Hits',
    category: 'Phonk & Funk',
    embedUrl: 'https://open.spotify.com/embed/playlist/0WCalGvZDUkccYzNMKlwtE?utm_source=generator&theme=0',
    spotifyUrl: 'https://open.spotify.com/playlist/0WCalGvZDUkccYzNMKlwtE',
    icon: Flame,
    color: '#C084FC',
  },
  {
    id: 'drift-phonk',
    title: 'Drift Phonk & Bass',
    category: 'Phonk & Funk',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWWY64wDtEPh0?utm_source=generator&theme=0',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWWY64wDtEPh0',
    icon: Zap,
    color: '#8B5CF6',
  },
  {
    id: 'brazilian-funk',
    title: 'Brazilian Funk & Baile',
    category: 'Phonk & Funk',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX10A2m6UttPz?utm_source=generator&theme=0',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX10A2m6UttPz',
    icon: Radio,
    color: '#7EDDD6',
  },
  {
    id: 'lofi-beats',
    title: 'Lofi Beats & Chill',
    category: 'Study & Relax',
    embedUrl: 'https://open.spotify.com/embed/playlist/0ibYMGDoqlqhkQenMjyYEP?utm_source=generator&theme=0',
    spotifyUrl: 'https://open.spotify.com/playlist/0ibYMGDoqlqhkQenMjyYEP',
    icon: Coffee,
    color: '#86EFAC',
  },
  {
    id: 'anime-ost',
    title: 'Anime OST & Vocaloid',
    category: 'Anime',
    embedUrl: 'https://open.spotify.com/embed/playlist/6YpwUTgfdAkAnT1PwH6gPI?utm_source=generator&theme=0',
    spotifyUrl: 'https://open.spotify.com/playlist/6YpwUTgfdAkAnT1PwH6gPI',
    icon: Sparkles,
    color: '#EC4899',
  },
  {
    id: 'bhojpuri-hits',
    title: 'Bhojpuri Hits & Dhamaka',
    category: 'Bhojpuri',
    embedUrl: 'https://open.spotify.com/embed/playlist/21uXtiqS7ZonyEXgQwousm?utm_source=generator&theme=0',
    spotifyUrl: 'https://open.spotify.com/playlist/21uXtiqS7ZonyEXgQwousm',
    icon: Disc,
    color: '#F59E0B',
  },
]

export default function MusicPlayer() {
  const [activePreset, setActivePreset] = useState<SpotifyPreset>(SPOTIFY_PRESETS[0])
  const [customUrl, setCustomUrl] = useState('')
  const [activeEmbed, setActiveEmbed] = useState<string>(SPOTIFY_PRESETS[0].embedUrl)
  const [showAddModal, setShowAddModal] = useState(false)
  const [search, setSearch] = useState('')

  const containerRef = useRef<HTMLDivElement>(null)
  const [isNarrow, setIsNarrow] = useState(false)
  const [userCollapsed, setUserCollapsed] = useState<boolean | null>(null)

  // Auto-detect narrow container (when window is resized small)
  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setIsNarrow(entry.contentRect.width < 540)
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const isCollapsed = userCollapsed !== null ? userCollapsed : isNarrow

  // Convert regular Spotify URL to Embed URL
  const convertToEmbedUrl = (url: string): string => {
    let cleanUrl = url.trim()
    if (cleanUrl.includes('spotify.com/embed/')) return cleanUrl
    
    cleanUrl = cleanUrl.replace('open.spotify.com/', 'open.spotify.com/embed/')
    if (!cleanUrl.includes('?')) {
      cleanUrl += '?utm_source=generator&theme=0'
    } else {
      cleanUrl += '&utm_source=generator&theme=0'
    }
    return cleanUrl
  }

  const handleCustomSubmit = () => {
    if (!customUrl.trim()) return
    const embed = convertToEmbedUrl(customUrl)
    setActiveEmbed(embed)
    setActivePreset({
      id: 'custom-' + Date.now(),
      title: 'Custom Spotify Track / Playlist',
      category: 'Custom',
      embedUrl: embed,
      spotifyUrl: customUrl.trim(),
      icon: Music,
      color: '#1DB954',
    })
    setCustomUrl('')
    setShowAddModal(false)
  }

  const filteredPresets = SPOTIFY_PRESETS.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const IconComponent = activePreset.icon

  return (
    <div
      ref={containerRef}
      style={{ display: 'flex', height: '100%', overflow: 'hidden', background: '#090A0F', color: 'white' }}
    >
      {/* Sidebar - Spotify Hub Menu */}
      <div style={{
        width: isCollapsed ? 56 : 230,
        minWidth: isCollapsed ? 56 : 230,
        borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', flexDirection: 'column', background: 'rgba(12, 14, 24, 0.7)',
        backdropFilter: 'blur(20px)',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: isCollapsed ? '12px 8px' : '14px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: '#1DB954', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(29,185,84,0.4)',
              }}>
                <Music size={15} color="white" />
              </div>
              {!isCollapsed && (
                <span style={{ fontSize: 14, fontWeight: 800, color: 'white', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
                  Spotify Hub
                </span>
              )}
            </div>

            <button
              onClick={() => setUserCollapsed(!isCollapsed)}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{
                background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 4, borderRadius: 6, transition: 'color 0.15s', flexShrink: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'white'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
            >
              {isCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
            </button>
          </div>

          {!isCollapsed && (
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Filter playlists..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '6px 10px 6px 28px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', fontSize: 11, outline: 'none',
                }}
              />
              <Search size={12} style={{ position: 'absolute', left: 9, top: 9, color: 'rgba(255,255,255,0.4)' }} />
            </div>
          )}
        </div>

        {/* Playlist List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isCollapsed ? 6 : 8 }}>
          {!isCollapsed && (
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.4)', padding: '6px 8px', marginBottom: 4 }}>
              Featured Playlists
            </div>
          )}

          {filteredPresets.map(preset => {
            const isActive = activePreset.id === preset.id
            const ItemIcon = preset.icon
            return (
              <div
                key={preset.id}
                title={preset.title}
                onClick={() => {
                  setActivePreset(preset)
                  setActiveEmbed(preset.embedUrl)
                }}
                style={{
                  padding: isCollapsed ? '8px 0' : '8px 10px',
                  borderRadius: 8, marginBottom: 4, cursor: 'pointer',
                  background: isActive ? 'rgba(29, 185, 84, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(29, 185, 84, 0.4)' : '1px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start',
                  gap: 10, transition: 'all 0.15s ease',
                }}
              >
                <ItemIcon size={isCollapsed ? 18 : 16} color={preset.color} style={{ flexShrink: 0 }} />
                {!isCollapsed && (
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 12, fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#1DB954' : 'rgba(255,255,255,0.9)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {preset.title}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                      {preset.category}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer Custom URL Button */}
        <div style={{ padding: isCollapsed ? 8 : 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => setShowAddModal(!showAddModal)}
            title="Paste Spotify URL"
            style={{
              width: '100%', padding: isCollapsed ? 8 : '8px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
              background: 'linear-gradient(135deg, #1DB954 0%, #179643 100%)', color: 'white', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              boxShadow: '0 4px 14px rgba(29,185,84,0.3)',
            }}
          >
            <Plus size={14} /> {!isCollapsed && 'Paste Spotify URL'}
          </button>
        </div>
      </div>

      {/* Main Player Display Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#05060A', minWidth: 0 }}>
        {/* Header Bar */}
        <div style={{
          padding: '10px 14px', background: 'rgba(18, 20, 32, 0.8)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 8, minWidth: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
            <IconComponent size={18} color={activePreset.color} style={{ flexShrink: 0 }} />
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{
                fontSize: 12, fontWeight: 700, color: 'white',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {activePreset.title}
              </div>
              {!isNarrow && (
                <div style={{ fontSize: 10, color: '#1DB954', fontWeight: 600 }}>Spotify Web Player</div>
              )}
            </div>
          </div>

          <a
            href={activePreset.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in Spotify App"
            style={{
              padding: '5px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
              background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, whiteSpace: 'nowrap',
            }}
          >
            {!isNarrow && 'Open in Spotify'} <ExternalLink size={10} />
          </a>
        </div>

        {/* Custom URL Input Popup Modal */}
        {showAddModal && (
          <div style={{
            margin: 12, padding: 12, borderRadius: 12, background: 'rgba(20, 24, 40, 0.95)',
            border: '1px solid #1DB954', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={13} color="#1DB954" /> Paste any Spotify Track, Album, or Playlist URL:
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="https://open.spotify.com/playlist/..."
                value={customUrl}
                onChange={e => setCustomUrl(e.target.value)}
                style={{
                  flex: 1, padding: '6px 10px', borderRadius: 8, fontSize: 11,
                  background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white', outline: 'none', minWidth: 0,
                }}
              />
              <button
                onClick={handleCustomSubmit}
                style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                  background: '#1DB954', color: 'white', border: 'none', cursor: 'pointer', flexShrink: 0,
                }}
              >
                Load
              </button>
            </div>
          </div>
        )}

        {/* Spotify iFrame Embed Container */}
        <div style={{ flex: 1, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0, overflow: 'hidden' }}>
          <iframe
            src={activeEmbed}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            style={{
              borderRadius: 10, border: 'none',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
              background: '#121212',
              width: '100%',
              height: '100%',
            }}
          />
        </div>
      </div>
    </div>
  )
}
