import { useState, useEffect } from 'react'
import { mediaUrl } from '../config'

const DEFAULT_GALLERY = Array.from({ length: 33 }, (_, i) => {
  const num = i + 1
  const exts: Record<number, string> = {
    1: 'png', 24: 'png', 25: 'png', 26: 'png', 27: 'png', 31: 'png', 32: 'gif'
  }
  const ext = exts[num] || 'jpg'
  return {
    id: `${num}`,
    img: mediaUrl(`/images/gallery-new/syau-photo-${num}.${ext}`),
    name: `Photo ${num}`
  }
})

export default function Gallery() {
  const [items, setItems] = useState<Array<{ id: string; img: string; name: string }>>(() => {
    const saved = localStorage.getItem('syau-os-gallery')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length === 33 && !JSON.stringify(parsed).includes('syau-photo-17.png')) {
          return parsed
        }
      } catch {}
    }
    localStorage.removeItem('syau-os-gallery')
    return DEFAULT_GALLERY
  })

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [zoomLevel, setZoomLevel] = useState<number>(1)
  const [urlInput, setUrlInput] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    localStorage.setItem('syau-os-gallery', JSON.stringify(items))
  }, [items])

  // Escape key & arrow navigation for Lightbox
  useEffect(() => {
    if (lightbox === null) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightbox(null)
      } else if (e.key === 'ArrowLeft') {
        setZoomLevel(1)
        setLightbox(prev => (prev !== null ? (prev - 1 + items.length) % items.length : null))
      } else if (e.key === 'ArrowRight') {
        setZoomLevel(1)
        setLightbox(prev => (prev !== null ? (prev + 1) % items.length : null))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightbox, items.length])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      if (dataUrl) {
        const newItem = { id: Date.now().toString(), img: dataUrl, name: file.name }
        setItems(prev => [newItem, ...prev])
        setShowAddModal(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleAddUrl = () => {
    if (!urlInput.trim()) return
    const newItem = { id: Date.now().toString(), img: urlInput.trim(), name: 'Custom Image' }
    setItems(prev => [newItem, ...prev])
    setUrlInput('')
    setShowAddModal(false)
  }

  const handleDelete = (id: string, index: number) => {
    setItems(prev => prev.filter(item => item.id !== id))
    if (lightbox === index) setLightbox(null)
  }

  const handleReset = () => {
    if (confirm('Reset gallery to default images?')) {
      setItems(DEFAULT_GALLERY)
      localStorage.removeItem('syau-os-gallery')
    }
  }

  const setAsWallpaper = (imgUrl: string) => {
    localStorage.setItem('syau-os-wallpaper', imgUrl)
    localStorage.setItem('syau-os-bg', 'image')
    window.dispatchEvent(new CustomEvent('syau-os-bg-change'))
    alert('Wallpaper updated successfully!')
  }

  return (
    <div style={{ padding: 16, height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-sakura)' }}>Gallery</span>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginLeft: 8 }}>{items.length} photos</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setShowAddModal(!showAddModal)}
            style={{
              padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600,
              background: 'var(--color-sakura)', color: 'white', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            ＋ Add Image
          </button>
          <button
            onClick={handleReset}
            title="Reset to default photos"
            style={{
              padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 500,
              background: 'var(--color-glass-card)', color: 'var(--color-text-muted)',
              border: '1px solid var(--color-glass-border)', cursor: 'pointer',
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Modal / Add Image Popup */}
      {showAddModal && (
        <div style={{
          marginBottom: 16, padding: 14, borderRadius: 12, background: 'var(--color-glass-card)',
          border: '1px solid var(--color-sakura)', display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>Upload your own photo:</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{
              padding: '6px 12px', background: 'rgba(255,255,255,0.08)', borderRadius: 8,
              fontSize: 11, fontWeight: 600, cursor: 'pointer', color: 'var(--color-text-primary)',
              border: '1px solid var(--color-glass-border)',
            }}>
              Choose File from PC...
              <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>or paste URL:</span>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="text"
              placeholder="https://example.com/photo.jpg"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              style={{
                flex: 1, padding: '6px 10px', borderRadius: 8, fontSize: 11,
                background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-glass-border)',
                color: 'var(--color-text-primary)', outline: 'none',
              }}
            />
            <button
              onClick={handleAddUrl}
              style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                background: 'var(--color-sakura)', color: 'white', border: 'none', cursor: 'pointer',
              }}
            >
              Add URL
            </button>
          </div>
        </div>
      )}

      {/* Image Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, flex: 1 }}>
        {items.map((item, i) => (
          <div
            key={item.id}
            title={`${item.name} - Click to view full image`}
            onClick={() => { setZoomLevel(1); setLightbox(i); }}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{
              aspectRatio: '1', borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
              position: 'relative', transition: 'transform 0.15s ease, border-color 0.15s ease',
              border: '2px solid transparent',
              boxShadow: '0 2px 12px rgba(0,0,0,0.3)', background: 'rgba(0,0,0,0.2)',
            }}
          >
            <img
              src={item.img}
              alt={item.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3' }}
            />

            {/* Hover Tooltip Overlay */}
            {hoveredIdx === i && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: '6px 8px', background: 'rgba(5, 5, 12, 0.85)',
                backdropFilter: 'blur(10px)', color: 'var(--color-text-primary)',
                fontSize: 10, fontWeight: 600, textAlign: 'center',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                transition: 'opacity 0.2s ease',
              }}>
                🔍 {item.name}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox overlay / Full-Screen Zoom Viewer */}
      {lightbox !== null && items[lightbox] && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 500,
            background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(24px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'default', padding: 20,
          }}
        >
          {/* Top Control Bar */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', top: 20, display: 'flex', alignItems: 'center', gap: 12,
              background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)',
              padding: '8px 18px', borderRadius: 30, border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 510,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {items[lightbox].name}
            </span>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              ({lightbox + 1} / {items.length})
            </span>

            <div style={{ height: 14, width: 1, background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />

            {/* Zoom Button */}
            <button
              onClick={() => setZoomLevel(prev => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1))}
              title="Toggle Zoom Level"
              style={{
                padding: '4px 10px', borderRadius: 14, fontSize: 11, fontWeight: 600,
                background: zoomLevel > 1 ? 'var(--color-sakura)' : 'rgba(255,255,255,0.1)',
                color: 'white', border: 'none', cursor: 'pointer',
              }}
            >
              🔍 {zoomLevel}x Zoom
            </button>

            {/* Set as Wallpaper Button */}
            <button
              onClick={() => setAsWallpaper(items[lightbox].img)}
              title="Set image as desktop wallpaper"
              style={{
                padding: '4px 10px', borderRadius: 14, fontSize: 11, fontWeight: 600,
                background: 'rgba(255,255,255,0.1)', color: 'var(--color-text-primary)',
                border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer',
              }}
            >
              🖼 Wallpaper
            </button>

            {/* Delete Button */}
            <button
              onClick={() => handleDelete(items[lightbox].id, lightbox)}
              title="Delete this photo"
              style={{
                padding: '4px 10px', borderRadius: 14, fontSize: 11, fontWeight: 600,
                background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444',
                border: '1px solid rgba(239, 68, 68, 0.3)', cursor: 'pointer',
              }}
            >
              🗑 Delete
            </button>

            {/* Close / Esc Exit Button */}
            <button
              onClick={() => setLightbox(null)}
              title="Close viewer (or press Esc key)"
              style={{
                padding: '4px 12px', borderRadius: 14, fontSize: 11, fontWeight: 700,
                background: 'rgba(239, 68, 68, 0.85)', color: 'white', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: '0 2px 10px rgba(239,68,68,0.4)',
              }}
            >
              <span style={{
                background: 'rgba(0,0,0,0.3)', padding: '1px 5px', borderRadius: 4,
                fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5,
              }}>ESC</span>
              Exit
            </button>
          </div>

          {/* Main Full Image View */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', height: '80%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'auto', padding: 20,
            }}
          >
            <img
              src={items[lightbox].img}
              alt={items[lightbox].name}
              onClick={() => setZoomLevel(prev => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1))}
              style={{
                maxWidth: zoomLevel === 1 ? '90%' : 'none',
                maxHeight: zoomLevel === 1 ? '85%' : 'none',
                transform: `scale(${zoomLevel})`,
                transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                objectFit: 'contain',
                borderRadius: 12,
                boxShadow: '0 16px 60px rgba(0,0,0,0.6)',
                cursor: zoomLevel > 1 ? 'zoom-out' : 'zoom-in',
              }}
            />
          </div>

          {/* Nav arrows */}
          <div
            onClick={e => { e.stopPropagation(); setZoomLevel(1); setLightbox((lightbox - 1 + items.length) % items.length) }}
            style={{
              position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', fontSize: 36,
              color: 'rgba(255,255,255,0.8)', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)',
              width: 50, height: 50, borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', userSelect: 'none',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            ‹
          </div>
          <div
            onClick={e => { e.stopPropagation(); setZoomLevel(1); setLightbox((lightbox + 1) % items.length) }}
            style={{
              position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', fontSize: 36,
              color: 'rgba(255,255,255,0.8)', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)',
              width: 50, height: 50, borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', userSelect: 'none',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            ›
          </div>
        </div>
      )}
    </div>
  )
}
