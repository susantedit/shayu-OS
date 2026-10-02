import { useState, useMemo } from 'react'
import { Copy, Check, FileText, Trash2, Sparkles, BookOpen } from 'lucide-react'
import { transliterateText } from '../utils/nepaliTranslit'
import { useDesktopStore, useNotificationStore } from '../store/desktopStore'
import './SyauType.css'

const QUICK_PHRASES = [
  { label: 'नमस्ते', roman: 'namaste sathi, k cha khabar?' },
  { label: 'परिचय', roman: 'mero naam susant ho. ma nepali hu.' },
  { label: 'स्याउ OS', roman: 'syau os nepali bhasha ra sanskriti sanga jodiyeko cha.' },
  { label: 'धन्यवाद', roman: 'dherai dherai dhanyabad!' },
]

export default function SyauType() {
  const [inputText, setInputText] = useState('namaste sathi! syau os ma swaagatam cha.')
  const [copied, setCopied] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const openWindow = useDesktopStore(s => s.openWindow)
  const addNotif = useNotificationStore(s => s.add)

  const devanagariText = useMemo(() => {
    return transliterateText(inputText)
  }, [inputText])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(devanagariText)
      setCopied(true)
      addNotif('Devanagari text copied to clipboard', 'info', 2000)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      addNotif('Failed to copy text', 'alert', 2000)
    }
  }

  const handleSendToNotes = () => {
    const existing = localStorage.getItem('syau-os-notes-content') || ''
    const updated = existing ? `${existing}\n\n---\n${devanagariText}` : devanagariText
    localStorage.setItem('syau-os-notes-content', updated)
    openWindow('notes', 'Notes', 640, 480)
    addNotif('Sent to Notes app', 'info', 2500)
  }

  return (
    <div className="syautype-container">
      {/* Top Header Controls */}
      <div className="syautype-header">
        <div className="syautype-title">
          <span className="syautype-badge font-syau">स्याउ टाइप</span>
          <span className="syautype-sub">Phonetic Romanized to Nepali Transliteration</span>
        </div>

        <div className="syautype-actions">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="syautype-btn"
            title="Typing Guide & Rules"
          >
            <BookOpen size={14} />
            <span>{showGuide ? 'Hide Guide' : 'Typing Rules'}</span>
          </button>
          <button
            onClick={handleCopy}
            className="syautype-btn primary"
            title="Copy Devanagari text"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          <button
            onClick={handleSendToNotes}
            className="syautype-btn"
            title="Send to Notes app"
          >
            <FileText size={14} />
            <span>Open in Notes</span>
          </button>
          <button
            onClick={() => setInputText('')}
            className="syautype-btn danger"
            title="Clear text"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Guide Drawer */}
      {showGuide && (
        <div className="syautype-guide">
          <div className="syautype-guide-title">
            <Sparkles size={13} style={{ color: 'var(--color-sakura)' }} />
            <span>How to Type Phonetically</span>
          </div>
          <div className="syautype-guide-grid">
            <div><code>k, kh, g, gh</code> &rarr; क, ख, ग, घ</div>
            <div><code>ch, chh, j, jh</code> &rarr; च, छ, ज, झ</div>
            <div><code>t, th, d, dh, n</code> &rarr; त, थ, द, ध, न</div>
            <div><code>p, ph, b, bh, m</code> &rarr; प, फ, ब, भ, म</div>
            <div><code>y, r, l, w, s, h</code> &rarr; य, र, ल, व, स, ह</div>
            <div><code>aa, ee, oo, ai, au</code> &rarr; आ, ई, ऊ, ऐ, औ</div>
          </div>
        </div>
      )}

      {/* Quick Phrase Chips */}
      <div className="syautype-chips">
        <span className="syautype-chips-label">Quick Phrases:</span>
        {QUICK_PHRASES.map((p, idx) => (
          <button
            key={idx}
            className="syautype-chip"
            onClick={() => setInputText(p.roman)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Main Dual Editor Area */}
      <div className="syautype-editors">
        {/* Roman Input */}
        <div className="syautype-box">
          <div className="syautype-box-header">
            <span>English (Romanized Input)</span>
            <span className="syautype-count">{inputText.length} chars</span>
          </div>
          <textarea
            className="syautype-textarea"
            placeholder="Type in Romanized English (e.g. namaste sathi k cha...)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            autoFocus
          />
        </div>

        {/* Devanagari Output */}
        <div className="syautype-box output">
          <div className="syautype-box-header">
            <span>नेपाली (Devanagari Live Preview)</span>
            <span className="syautype-count font-syau">{devanagariText.split(/\s+/).filter(Boolean).length} शब्द</span>
          </div>
          <div className="syautype-output font-syau">
            {devanagariText || (
              <span className="syautype-placeholder">नेपाली अनुवाद यहाँ देखा पर्नेछ...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
