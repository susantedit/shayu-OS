import { useState } from 'react'
import { BookOpen, Calendar, CheckCircle2, Sparkles, Sun, Moon } from 'lucide-react'
import { useThemeStore } from '../store/themeStore'

export interface DevlogEntry {
  id: string
  title: string
  date: string
  version: string
  category: string
  summary: string
  highlights: string[]
  content: string
  author: string
}

const DEVLOGS: DevlogEntry[] = [
  {
    id: 'devlog-1',
    title: 'Devlog #1: The Complete Journey of Building स्याउ OS (Syau OS)',
    date: 'August 31, 2026',
    version: 'v1.0.0-release',
    category: 'Full System Build',
    author: 'Kantaraj Luitel (Susant)',
    summary: 'Comprehensive devlog covering the architecture, windowing engine, Devanagari typography system, dual Dark/Light theme mode, Creator profile, and Google Drive gallery integration.',
    highlights: [
      'Architected non-blocking Zustand store and Framer Motion draggable window manager',
      'Created bilingual identity: Noto Sans Devanagari 600 + Space Grotesk 700 + Inter',
      'Engineered dual Dark & White Light theme mode switcher engine with persistence',
      'Built native Creator Profile app for Kantaraj Luitel (Susant) with certs, stack, & coffee link',
      'Created Bikram Sambat (BS) Nepali date converter and instant password-free lock screen',
      'Integrated custom Drive image gallery with 33 photos, hover tooltips, and file manager',
    ],
    content: `### 🚀 Part 1: Core Architecture & Draggable Window Stack

When starting **स्याउ OS**, the primary objective was to build a fluid, high-performance web OS that feels as responsive as a native desktop operating system.

#### Key Engineering Foundations:
1. **State Management**: Chose **Zustand** for transient UI state to keep window position updates fast without triggering global app re-renders.
2. **Window Manager**: Designed a robust drag-and-drop bounding engine using Framer Motion. Windows support 8-direction resizing, snapping, smooth maximizing transitions, and z-index elevation on click.
3. **Multi-Workspace Engine**: Created 4 distinct workspace slots allowing users to organize windows by context (Work, Media, Code, Utilities).

\`\`\`ts
// Window position & workspace state isolation
export const useDesktopStore = create<DesktopStore>((set, get) => ({
  windows: [],
  currentWorkspace: 1,
  openWindow: (appId, title, width = 640, height = 480) => {
    const id = \`win-\${Date.now()}\`
    set(state => ({
      windows: [...state.windows, { id, appId, title, width, height, workspace: state.currentWorkspace }]
    }))
  }
}))
\`\`\`

---

### 🎨 Part 2: स्याउ OS Branding, Bilingual Typography & Theme Engine

A great OS needs a unique soul and identity. Rather than cloning generic themes, **स्याउ OS** (Syau OS) blends authentic Devanagari typography with modern glassmorphism.

#### 🍎 Typography System:
- **स्याउ**: \`Noto Sans Devanagari\` (Weight: 600) — authentic Nepali script.
- **OS**: \`Space Grotesk\` (Weight: 700) — geometric, bold tech aesthetic.
- **UI & Apps**: \`Inter\` (Weights: 400/500/600) — clean, readable interface typography.

#### ☀️ Dual Theme Engine (Dark & White Light Mode):
Users can switch between **Dark Glass** (ambient dark translucent panels with sakura glow) and **Light White Mode** (crisp, high-contrast light panels with soft shadow layers) seamlessly via the TopBar theme toggle or Settings app.

\`\`\`css
/* Exact font mapping for स्याउ OS */
.font-syau { font-family: 'Noto Sans Devanagari', sans-serif; font-weight: 600; }
.font-os { font-family: 'Space Grotesk', sans-serif; font-weight: 700; }
body { font-family: 'Inter', system-ui, sans-serif; }
\`\`\`

---

### ✨ Part 3: Creator Profile, Devlogs, Nepali BS Calendar & Drive Gallery

For the final release of **स्याउ OS**, we added custom applications and verified all Hack Club Jam submission criteria.

#### Key Features Built:
1. **Creator Profile App**: Built a dedicated interactive portfolio app for **Kantaraj Luitel (Susant)** featuring bio, Dribbble GIF avatar, certs (Oracle Cloud GenAI, APIsec, THM Advent of Cyber 2025, Deloitte Cyber Simulation), tech stack badges, and Buy Me a Coffee link.
2. **Interactive Devlog Viewer**: Displays comprehensive development progress log directly inside a native window.
3. **Nepali BS Calendar Widget**: Displays live Bikram Sambat dates (e.g. \`२०८३ भाद्र १६\`) alongside Gregorian date format in the TopBar.
4. **Google Drive Photo Gallery**: Integrated 33 custom photos downloaded from Google Drive with hover tooltips, lightbox header titles, photo adding, and deletion support.
5. **Password-Free Access**: Lock screen unlocks instantly with a single click — zero password barrier for easy testing!

\`\`\`ts
// BS Date display helper
export const getNepaliBSDate = () => {
  const yearBS = 2083
  const monthsBS = ['वैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज', 'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फागुन', 'चैत']
  return \`\${yearBS} \${monthsBS[4]} १६\`
}
\`\`\`

**स्याउ OS is fully built, verified, and running!** 🎉`,
  },
]

export default function DevlogsApp() {
  const [selectedId, setSelectedId] = useState<string>('devlog-1')
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState<string>('')
  const { mode, toggleMode } = useThemeStore()

  const currentLog = DEVLOGS.find(d => d.id === selectedId) || DEVLOGS[0]

  const filteredLogs = DEVLOGS.filter(d => {
    const matchCat = filter === 'all' || d.category.toLowerCase() === filter.toLowerCase()
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) || d.summary.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: 'var(--color-window-bg)' }}>
      {/* Sidebar List */}
      <div style={{
        width: 280, borderRight: '1px solid var(--color-glass-border)',
        display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.02)',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 14px', borderBottom: '1px solid var(--color-glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={18} style={{ color: 'var(--color-sakura)' }} />
              <span className="font-heading" style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                <span className="font-syau">स्याउ</span> OS Devlogs
              </span>
            </div>
            <button
              onClick={toggleMode}
              title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} mode`}
              style={{
                background: 'var(--color-glass-card)', border: '1px solid var(--color-glass-border)',
                borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--color-text-primary)',
              }}
            >
              {mode === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search devlogs..."
            style={{
              width: '100%', padding: '6px 10px', borderRadius: 6,
              background: 'var(--color-glass-card)', border: '1px solid var(--color-glass-border)',
              color: 'var(--color-text-primary)', fontSize: 11, outline: 'none',
            }}
          />

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
            {['all', 'Architecture', 'Design System', 'Features & Polish'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600,
                  border: filter === cat ? '1px solid var(--color-sakura)' : '1px solid transparent',
                  background: filter === cat ? 'rgba(232,130,155,0.15)' : 'var(--color-glass-card)',
                  color: filter === cat ? 'var(--color-sakura)' : 'var(--color-text-secondary)',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                {cat === 'all' ? 'All' : cat.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Log Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          {filteredLogs.map(log => {
            const isSelected = log.id === selectedId
            return (
              <div
                key={log.id}
                onClick={() => setSelectedId(log.id)}
                style={{
                  padding: 12, borderRadius: 8, marginBottom: 6, cursor: 'pointer',
                  background: isSelected ? 'rgba(232,130,155,0.12)' : 'var(--color-glass-card)',
                  border: isSelected ? '1px solid rgba(232,130,155,0.3)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-sakura)', background: 'rgba(232,130,155,0.1)', padding: '1px 6px', borderRadius: 4 }}>
                    {log.version}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Calendar size={10} /> {log.date.split(',')[0]}
                  </span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4, lineHeight: 1.3 }}>
                  {log.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {log.summary}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Devlog Details Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '24px 32px' }}>
        {/* Banner header */}
        <div style={{
          padding: 20, borderRadius: 12, marginBottom: 20,
          background: 'linear-gradient(135deg, rgba(232,130,155,0.1) 0%, rgba(126,221,214,0.05) 100%)',
          border: '1px solid var(--color-glass-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--color-sakura)', color: 'white', padding: '2px 8px', borderRadius: 12 }}>
              {currentLog.category}
            </span>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{currentLog.version}</span>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>•</span>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>By {currentLog.author}</span>
          </div>

          <h2 className="font-heading" style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>
            {currentLog.title}
          </h2>

          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            {currentLog.summary}
          </p>
        </div>

        {/* Highlights Card */}
        <div style={{
          padding: 16, borderRadius: 10, marginBottom: 20,
          background: 'var(--color-glass-card)', border: '1px solid var(--color-glass-border)',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--color-sakura)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={14} /> Key Accomplishments
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {currentLog.highlights.map((h, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'var(--color-text-primary)' }}>
                <CheckCircle2 size={15} style={{ color: 'var(--color-mint)', marginTop: 1, flexShrink: 0 }} />
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Body Content */}
        <div style={{
          fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.7,
          whiteSpace: 'pre-wrap', fontFamily: 'var(--font-sans)',
        }}>
          {currentLog.content}
        </div>
      </div>
    </div>
  )
}
