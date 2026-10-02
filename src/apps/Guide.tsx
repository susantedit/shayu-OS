import { useState } from 'react'
import {
  Rocket, Layout, Palette,
  BookOpen, ChevronRight, ChevronDown, Shield
} from 'lucide-react'

const sections = [
  {
    title: 'Getting Started',
    icon: Rocket,
    items: [
      { label: 'Launching Apps', desc: 'Click any app icon in the bottom dock, double-click desktop icons, or use the top-left स्याउ menu.' },
      { label: 'Window Controls', desc: 'macOS-style traffic light buttons: Red = close, Yellow = minimize, Green = maximize. Double-click the header to toggle maximize.' },
      { label: 'Window Dragging & Snapping', desc: 'Drag windows by the title bar. Drag to the left or right edge for half-screen split; drag to the top edge to maximize.' },
      { label: 'Keyboard Shortcuts', desc: 'Press Cmd+K or Ctrl+K for Spotlight search. Press Ctrl+1 through Ctrl+4 to jump between workspaces.' },
      { label: 'Workspaces', desc: 'SyauOS supports 4 isolated virtual workspaces so you can organize your tasks.' },
    ],
  },
  {
    title: 'Nepali Cultural Applications',
    icon: Shield,
    items: [
      { label: 'बाघचाल (Bagh-Chal)', desc: 'Nepal\'s national traditional board game. 4 Tigers vs 20 Goats on a 5x5 board with diagonal connections. Features solo play vs computer or pass-and-play with procedural Web Audio chimes.' },
      { label: 'नेपाली पात्रो (Nepali Calendar & Converter)', desc: 'Full Bikram Sambat (BS) date engine from 2000 BS to 2090 BS. Supports AD to BS date conversion and traditional land units (Ropani, Aana, Paisa, Daam, Bigha, Kattha, Dhur) and gold units (Tola).' },
      { label: 'स्याउ टाइप (Syau Type)', desc: 'Real-time phonetic Romanized-to-Devanagari typing engine. Type words in English letters (e.g. "namaste") and get instant Nepali script with one-click export to Notes.' },
      { label: 'स्याउ साउन्ड (Focus Audio)', desc: 'Ambient focus audio deck synthesized client-side with the Web Audio API. Generates monsoon rain in Kathmandu, Himalayan campfire crackles, mountain river streams, and binaural focus frequencies.' },
    ],
  },
  {
    title: 'Productivity & System Apps',
    icon: Layout,
    items: [
      { label: 'Terminal (syau-sh)', desc: 'Interactive local shell with command parser. Type "help" to see commands including neofetch, baghchal, matrix, ps, kill, date, and whoami.' },
      { label: 'Notes', desc: 'Text editor with auto-save to localStorage, word count, character count, and persistent storage.' },
      { label: 'Calculator', desc: 'Desktop calculator supporting direct keyboard typing and arithmetic calculations.' },
      { label: 'Music Player', desc: 'Curated player hub featuring Nepali evergreen classics, bhajans, and focus playlists.' },
      { label: 'Gallery', desc: 'Wallpaper and photo viewer with interactive lightbox navigation.' },
      { label: 'Settings', desc: 'Desktop appearance controls: Dark/Light modes, accent colors, window blur, and dock positioning.' },
      { label: 'About Me', desc: 'Developer profile for Kantaraj Luitel (Susant), detailing Hack Club projects and achievements.' },
      { label: 'Devlogs', desc: 'Engineering logs documenting window dragging physics, Bikram Sambat date math, and pure CSS architecture.' },
    ],
  },
  {
    title: 'Architecture & Craftsmanship',
    icon: Palette,
    items: [
      { label: 'Modular Vanilla CSS', desc: 'Built with modular CSS files and custom properties (--color-*, --radius-*, --font-*). Zero Tailwind or external CSS frameworks.' },
      { label: 'Zero AI Chatbots & Zero API Keys', desc: 'Every application runs purely client-side in the browser with offline capability.' },
      { label: 'Strictly Vector Graphics', desc: 'Zero emojis across the interface. Clean vector iconography powered by Lucide React and custom SVG elements.' },
      { label: 'Audio Synthesis', desc: 'Procedural sound design powered by the browser\'s native Web Audio API oscillators and gain nodes.' },
    ],
  },
]

export default function Guide() {
  const [openSection, setOpenSection] = useState<number | null>(0)

  return (
    <div style={{ padding: 20, height: '100%', overflow: 'auto', background: 'var(--color-window-bg)' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOpen size={22} style={{ color: 'var(--color-sakura)' }} />
          <span>स्याउ OS User Guide</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          Comprehensive documentation for स्याउ OS (SyauOS) — features, cultural tools, and window management.
        </div>
      </div>

      {sections.map((section, si) => (
        <div key={si} style={{ marginBottom: 10 }}>
          <button
            onClick={() => setOpenSection(openSection === si ? null : si)}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 10,
              background: openSection === si ? 'rgba(225, 29, 72, 0.08)' : 'var(--color-glass-card)',
              border: '1px solid ' + (openSection === si ? 'var(--color-border-active)' : 'var(--color-border)'),
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              color: openSection === si ? 'var(--color-sakura)' : 'var(--color-text-primary)',
              fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-sans)',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <section.icon size={16} style={{ color: openSection === si ? 'var(--color-sakura)' : 'var(--color-text-secondary)' }} />
              <span>{section.title}</span>
            </div>
            {openSection === si ? <ChevronDown size={15} style={{ opacity: 0.7 }} /> : <ChevronRight size={15} style={{ opacity: 0.5 }} />}
          </button>

          {openSection === si && (
            <div style={{
              marginTop: 4, padding: '8px 10px',
              background: 'rgba(0, 0, 0, 0.12)', borderRadius: 10,
              border: '1px solid var(--color-border)',
            }}>
              {section.items.map((item, ii) => (
                <div key={ii} style={{
                  padding: '10px 12px', borderRadius: 8,
                  marginBottom: ii < section.items.length - 1 ? 4 : 0,
                  background: 'var(--color-glass-card)',
                  border: '1px solid var(--color-border)',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-sakura)', marginBottom: 3 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <div style={{
        marginTop: 20, padding: 14, borderRadius: 12,
        background: 'var(--color-glass-card)', border: '1px solid var(--color-border)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          Handcrafted with care by <strong style={{ color: 'var(--color-text-primary)' }}>Kantaraj Luitel (Susant)</strong> for Hack Club
        </div>
      </div>
    </div>
  )
}
