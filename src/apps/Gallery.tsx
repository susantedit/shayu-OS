import { useState, useEffect } from 'react'
import { ZoomIn, Image as ImageIcon, Search, X } from 'lucide-react'
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
  const [items] = useState<Array<{ id: string; img: string; name: string }>>(DEFAULT_GALLERY)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [zoomLevel, setZoomLevel] = useState<number>(1)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightbox === null) return
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight') setLightbox(prev => (prev !== null ? (prev + 1) % items.length : null))
      if (e.key === 'ArrowLeft') setLightbox(prev => (prev !== null ? (prev - 1 + items.length) % items.length : null))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightbox, items.length])

  useEffect(() => {
    setZoomLevel(1)
  }, [lightbox])

  const setAsWallpaper = (imgSrc: string) => {
    localStorage.setItem('syau-os-wallpaper-custom', imgSrc)
    localStorage.setItem('syau-os-bg', 'static')
    window.dispatchEvent(new Event('syau-wallpaper-change'))
  }

  return (
    <div style={{ padding: 16, height: '100%', overflow: 'auto', background: 'var(--color-window-bg)' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: 12,
      }}>
        {items.map((item, i) => (
          <div
            key={item.id}
            onClick={() => setLightbox(i)}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{
              position: 'relative',
              aspectRatio: '1',
              borderRadius: 10,
              overflow: 'hidden',
              cursor: 'pointer',
              border: '1px solid ' + (hoveredIdx === i ? 'var(--color-sakura)' : 'var(--color-glass-border)'),
              background: 'var(--color-glass-card)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: hoveredIdx === i ? 'scale(1.03) translateY(-2px)' : 'scale(1)',
              boxShadow: hoveredIdx === i ? '0 8px 24px rgba(0,0,0,0.35)' : 'none',
            }}
          >
            <img
              src={item.img}
              alt={item.name}
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />

            {hoveredIdx === i && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                padding: '6px 8px', fontSize: 10, fontWeight: 600,
                color: 'white', display: 'flex', alignItems: 'center', gap: 5,
                borderTop: '1px solid rgba(255,255,255,0.08)',
                transition: 'opacity 0.2s ease',
              }}>
                <Search size={11} />
                <span>{item.name}</span>
              </div>
            )}
          </div>
        ))}
      </div>

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

            <button
              onClick={() => setZoomLevel(prev => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1))}
              title="Toggle Zoom Level"
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 14, fontSize: 11, fontWeight: 600,
                background: zoomLevel > 1 ? 'var(--color-sakura)' : 'rgba(255,255,255,0.1)',
                color: 'white', border: 'none', cursor: 'pointer',
              }}
            >
              <ZoomIn size={12} />
              <span>{zoomLevel}x Zoom</span>
            </button>

            <button
              onClick={() => setAsWallpaper(items[lightbox].img)}
              title="Set image as desktop wallpaper"
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 14, fontSize: 11, fontWeight: 600,
                background: 'rgba(255,255,255,0.1)', color: 'var(--color-text-primary)',
                border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer',
              }}
            >
              <ImageIcon size={12} />
              <span>Wallpaper</span>
            </button>

            <button
              onClick={() => setLightbox(null)}
              title="Close viewer (or press Esc key)"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 26, height: 26, borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)', color: 'white',
                border: 'none', cursor: 'pointer',
              }}
            >
              <X size={13} />
            </button>
          </div>

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
