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
    content: `### Part 1: Core Architecture & Draggable Window Stack

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

### Part 2: स्याउ OS Branding, Bilingual Typography & Theme Engine

A great OS needs a unique soul and identity. Rather than cloning generic themes, **स्याउ OS** (Syau OS) blends authentic Devanagari typography with modern glassmorphism.

#### Typography System:
- **स्याउ**: \`Noto Sans Devanagari\` (Weight: 600) — authentic Nepali script.
- **OS**: \`Space Grotesk\` (Weight: 700) — geometric, bold tech aesthetic.
- **UI & Apps**: \`Inter\` (Weights: 400/500/600) — clean, readable interface typography.

#### Dual Theme Engine (Dark & White Light Mode):
Users can switch between **Dark Glass** (ambient dark translucent panels with sakura glow) and **Light White Mode** (crisp, high-contrast light panels with soft shadow layers) seamlessly via the TopBar theme toggle or Settings app.

\`\`\`css
/* Exact font mapping for स्याउ OS */
.font-syau { font-family: 'Noto Sans Devanagari', sans-serif; font-weight: 600; }
.font-os { font-family: 'Space Grotesk', sans-serif; font-weight: 700; }
body { font-family: 'Inter', system-ui, sans-serif; }
\`\`\`

---

### Part 3: Creator Profile, Devlogs, Nepali BS Calendar & Drive Gallery

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

**स्याउ OS is fully built, verified, and running!**`,
  },
  {
    id: 'devlog-2',
    title: 'Devlog #2: Making स्याउ OS Fully Responsive Across Web, Mobile & Tablets',
    date: 'August 31, 2026',
    version: 'v1.1.0-responsive',
    category: 'Responsive & UI',
    author: 'Kantaraj Luitel (Susant)',
    summary: 'Comprehensive responsiveness overhaul: adaptive window viewport clamping, mobile dock collapsing, fluid typography, touch targets, and mobile-friendly layouts for all native apps.',
    highlights: [
      'Engineered viewport-aware window bounding & auto-maximize on mobile screens',
      'Optimized TopBar with smart truncation for Nepali BS calendar & clock on small viewports',
      'Refined Dock with responsive padding, horizontal scrolling, and touch haptics',
      'Enlarged touch targets for all window controls, modal buttons, and app nav bars',
      'Added fluid bento grid styling across Creator Profile, Gallery, Devlogs, and Settings apps',
    ],
    content: `### Part 1: The Challenge of Desktop UI on Mobile

Operating system simulation in a browser is inherently designed for high-resolution desktop screens with mouse pointers. However, modern users and hackathon judges often test web apps from phones, iPads, laptops, or narrow split screens.

Our goal for **v1.1.0-responsive** was to make **स्याउ OS** adapt gracefully without losing its signature desktop aesthetic and fluid glassmorphism.

---

### Part 2: What We Engineered

#### 1. Adaptive Viewport Clamping & Auto-Maximized Windows
On viewports narrower than 768px (smartphones and small tablets), new windows automatically adapt their width to fit the screen (\`calc(100vw - 16px)\`) and restrict minimum bounds so window titles and close buttons never overflow off-screen.

#### 2. Touch-Optimized Floating Dock
- Dock icons dynamically shrink and adjust spacing based on viewport width.
- Added smooth horizontal overflow scrolling with hidden scrollbars for compact mobile screens.
- Enlarged hitboxes to prevent accidental mis-taps.

#### 3. Responsive TopBar & Nepali BS Calendar
- TopBar elements use responsive flexbox layout. On smaller screens, low-priority badges collapse while preserving the core **स्याउ OS** brand logo, live **Bikram Sambat (BS)** date badge, and Dark/Light mode switcher.

#### 4. Fluid App Grids (Creator Profile, Gallery & Settings)
- Converted static multi-column layouts in the **Creator Profile**, **Google Drive Gallery**, and **Devlog Viewer** into fluid CSS grid columns (\`grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))\`).
- Touch-friendly action buttons (Buy Me a Coffee, certifications, photo lightbox controls).

\`\`\`css
/* Responsive window & dock clamping */
@media (max-width: 768px) {
  .syau-window {
    max-width: calc(100vw - 12px) !important;
    left: 6px !important;
  }
  .syau-dock {
    max-width: 96vw;
    padding: 6px 10px;
    gap: 8px;
  }
}
\`\`\`

---

### Conclusion
With these updates, anyone can test and experience **स्याउ OS** effortlessly on any device — whether on desktop, tablet, or smartphone!`,
  },
  {
    id: 'devlog-3',
    title: 'Devlog #3: Syau Studio (Web IDE), Meo AI Copilot, Capture Studio & Telemetry',
    date: 'September 1, 2026',
    version: 'v1.3.0',
    category: 'IDE, AI & Media Studio',
    author: 'Kantaraj Luitel (Susant)',
    summary: 'Major milestone merging Syau Studio (live in-browser Web IDE), Meo AI OS copilot & desktop pixel cat, स्याउ Capture Studio (screen recorder & audio memos), and hardware telemetry.',
    highlights: [
      'Built Syau Studio: Full HTML/CSS/JS sandbox with live hot-reloading, console capture, and retro arcade templates',
      'Integrated Meo AI Copilot with Groq (Llama 3.3) and Google Gemini (Gemini 2.5) APIs',
      'Created Interactive Desktop Pixel Cat with 1-minute uninterrupted petting mode and meow sound feedback',
      'Engineered multi-modal स्याउ Capture Studio: Screen Record, Snip & Markup, Photo Booth, Voice Memos with Web Audio waveforms',
      'Implemented real-time Battery Telemetry with power profiles and live Cloudflare DNS ping latency diagnostics',
      'Achieved 100% vector SVG standardization and complete mobile touch responsiveness',
    ],
    content: `### Part 1: Syau Studio — In-Browser Live Code Sandbox
To make **स्याउ OS** the ultimate operating system for creators and developers, we engineered **Syau Studio** (\`StudioApp\`) — a full-featured code playground with instant live execution.

#### Highlights:
1. **Multi-Tab File Architecture**: Edit \`index.html\`, \`style.css\`, and \`script.js\` with tab key indentation and line numbering.
2. **Instant Sandboxed Execution**: Auto-reloads code changes inside an isolated sandbox iframe with zero latency.
3. **Built-in DevTools Console**: Captures \`console.log\`, \`console.warn\`, and \`console.error\` in real-time.
4. **Interactive Starter Templates**: *Neon Galaxy Particles*, *Cyber Pong Arcade*, and *3D Holographic Card*.

---

### Part 2: Meo (स्याउ साथी) — AI Copilot & Interactive Desktop Cat
We evolved the desktop companion into **Meo (स्याउ साथी)**:
- **Zero-Config OS Copilot**: Controls windows, adjusts screen brightness, toggles dark/light themes, and speaks Nepali BS dates.
- **Groq & Gemini Dual Engine**: Fast, free cloud LLM reasoning with user API keys.
- **Interactive Desktop Pixel Cat**: 16x16 pixel sprite with walking, idle, sleep states, and a 1-minute uninterrupted petting mode with rate-limited \`meow.mp3\` audio and music auto-ducking.

---

### Part 3: स्याउ Capture Studio & Telemetry
1. **Screen & Window Recorder**: High-framerate video capture with microphone mixing via \`navigator.mediaDevices.getDisplayMedia\`.
2. **Snip & Canvas Markup Tool**: Full canvas drawing tools (Pen, Highlighter, Arrow, Rectangle, Text) with instant clipboard/wallpaper export.
3. **Photo Booth**: Live webcam streams with 6 aesthetic color filters and countdown flash animation.
4. **Voice Memo Studio**: Real-time Web Audio API frequency waveform visualizer saving directly into IndexedDB.
5. **Hardware Subsystems**: Battery Status API with power profiles and live Cloudflare DNS HTTP ping diagnostics.

**स्याउ OS v1.3.0 is a complete powerhouse of creativity, coding, and companionship!**`,
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
