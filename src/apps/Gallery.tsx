import { useState, useEffect } from 'react'
import { mediaUrl } from '../config'

const DEFAULT_GALLERY = Array.from({ length: 33 }, (_, i) => {
  const num = i + 1
  const exts: Record<number, string> = {
    1: 'png', 17: 'png', 18: 'png', 19: 'png', 20: 'png', 25: 'png', 26: 'gif'
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
        if (Array.isArray(parsed) && parsed.length > 0 && !JSON.stringify(parsed).includes('Gallery Item') && !JSON.stringify(parsed).includes('gallery-1.jpg')) {
          return parsed
        }
      } catch {}
    }
    return DEFAULT_GALLERY
  })

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    localStorage.setItem('syau-os-gallery', JSON.stringify(items))
  }, [items])

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
    if (selected === index) setSelected(null)
    if (lightbox === index) setLightbox(null)
  }

  const handleReset = () => {
    if (confirm('Reset gallery to default images?')) {
      setItems(DEFAULT_GALLERY)
      localStorage.removeItem('syau-os-gallery')
    }
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
            title={item.name}
            onClick={() => setSelected(selected === i ? null : i)}
            onDoubleClick={() => setLightbox(i)}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{
              aspectRatio: '1', borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
              position: 'relative', transition: 'all 0.15s ease',
              border: selected === i ? '2px solid var(--color-sakura)' : '2px solid transparent',
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
            {(hoveredIdx === i || selected === i) && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: '6px 8px', background: 'rgba(5, 5, 12, 0.85)',
                backdropFilter: 'blur(10px)', color: 'var(--color-text-primary)',
                fontSize: 10, fontWeight: 600, textAlign: 'center',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                transition: 'opacity 0.2s ease',
              }}>
                {item.name}
              </div>
            )}

            {/* Delete button overlay on selection */}
            {selected === i && (
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(item.id, i) }}
                title="Delete this photo"
                style={{
                  position: 'absolute', top: 4, right: 4, width: 22, height: 22,
                  borderRadius: '50%', background: 'rgba(239, 68, 68, 0.9)', color: 'white',
                  border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Selected Preview Bar */}
      {selected !== null && items[selected] && (
        <div style={{
          marginTop: 16, padding: 12, background: 'rgba(12,10,18,0.7)', backdropFilter: 'blur(16px)',
          borderRadius: 12, textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {items[selected].name}
          </div>
          <img
            src={items[selected].img}
            alt=""
            style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 8 }}
            onDoubleClick={() => setLightbox(selected)}
          />
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Double-click to expand</span>
            <button
              onClick={() => handleDelete(items[selected].id, selected)}
              style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)',
                cursor: 'pointer',
              }}
            >
              🗑 Delete Photo
            </button>
          </div>
        </div>
      )}

      {/* Lightbox overlay */}
      {lightbox !== null && items[lightbox] && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 500,
            background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', padding: 20,
          }}
        >
          <div style={{
            position: 'absolute', top: 20, fontSize: 14, fontWeight: 700,
            color: 'var(--color-text-primary)', background: 'rgba(255,255,255,0.1)',
            padding: '6px 16px', borderRadius: 20, backdropFilter: 'blur(10px)',
          }}>
            {items[lightbox].name} ({lightbox + 1} / {items.length})
          </div>

          <img
            src={items[lightbox].img}
            alt=""
            style={{
              maxWidth: '90%', maxHeight: '85%', objectFit: 'contain',
              borderRadius: 8, boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            }}
          />

          {/* Nav arrows */}
          <div
            onClick={e => { e.stopPropagation(); setLightbox((lightbox - 1 + items.length) % items.length) }}
            style={{
              position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', fontSize: 32,
              color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 10, userSelect: 'none',
            }}
          >
            ‹
          </div>
          <div
            onClick={e => { e.stopPropagation(); setLightbox((lightbox + 1) % items.length) }}
            style={{
              position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', fontSize: 32,
              color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 10, userSelect: 'none',
            }}
          >
            ›
          </div>
        </div>
      )}
    </div>
  )
}
