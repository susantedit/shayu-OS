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
    title: 'Devlog #1: Why I Started स्याउ OS and Fighting the Window Manager',
    date: 'August 24, 2026',
    version: 'v1.0.0',
    category: 'Window Engine',
    author: 'Kantaraj Luitel (Susant)',
    summary: 'Why I named it स्याउ (Apple in Nepali), choosing the tech stack, and spending hours figuring out window dragging and z-index stacking.',
    highlights: [
      'Picked the name स्याउ (Apple in Nepali) as a tribute to macOS with native Devanagari typography',
      'Set up React, TypeScript, and Vite with Zustand for window state',
      'Fought window z-index layering bugs so clicking a window actually brings it to the front',
      'Added dual Dark and Light mode support using CSS variables',
      'Built the TopBar with live Bikram Sambat (BS) Nepali calendar dates',
    ],
    content: `When I decided to build a web desktop for Hack Club, I wanted it to have an identity that reflects where I am from. I named it स्याउ OS (Syau OS). In Nepali, "स्याउ" means Apple, which was my fun little nod to macOS, but with authentic Nepali Devanagari typography (Noto Sans Devanagari) blended with clean monospace fonts.

### The First Big Hurdle: The Window Manager
I thought dragging a window in a browser would be simple, but it quickly turned into a mess:
1. When you dragged one window, it would get stuck behind other windows. I had to create a focused window stack in Zustand that bumps the clicked window's z-index to the highest level.
2. If you dragged too fast, the mouse pointer left the window header and dragging broke. I had to attach the mousemove listener to the global window rather than just the titlebar element.
3. Windows were spawning off-screen on smaller laptops. I had to add offset clamping so new windows spawn with a slight cascade inside visible bounds.

### Bilingual Typography & Themes
I set up CSS variables so switching between Dark Mode and Light Mode actually changes backgrounds, borders, and text contrast without needing to reload the page. I also wanted a piece of home in the top bar, so I wrote a simple helper to calculate Bikram Sambat (BS) dates alongside the standard calendar.`,
  },
  {
    id: 'devlog-2',
    title: 'Devlog #2: The Mobile Nightmare and Fixing Viewport Overflow',
    date: 'August 28, 2026',
    version: 'v1.1.0',
    category: 'Mobile Fixes',
    author: 'Kantaraj Luitel (Susant)',
    summary: 'Making a desktop interface usable on phones when reviewers and judges test it on mobile screens.',
    highlights: [
      'Fixed windows spawning wider than mobile screens with dynamic viewport clamping',
      'Switched from 100vh to 100dvh to prevent mobile browser address bars from cutting off the dock',
      'Enlarged touch targets for window close and minimize buttons',
      'Added auto-maximize for phone screens so apps open fullscreen by default',
      'Made the dock scroll horizontally when icons overflow narrow widths',
    ],
    content: `Desktop web OS projects are usually built on a 1080p or 1440p monitor with a mouse. But when I shared my project, the first thing people did was open the link on their phones.

Everything broke:
- The windows were 640px wide, so half the window and the close buttons were cut off off-screen.
- Swiping to move a window pulled down the entire browser page or triggered mobile pull-to-refresh.
- The mobile Safari and Chrome bottom address bar covered half the dock.

### How I Fixed It:
1. **Dynamic Clamping**: On screens under 768px wide, windows now clamp their width to calc(100vw - 16px) and auto-maximize by default so the user can actually use the app.
2. **Viewport Units**: Replaced standard 100vh with 100dvh across index.css so the desktop canvas fits within dynamic mobile screen heights without weird jumpy scrolling.
3. **Touch Targets**: Window action buttons (close, minimize, expand) were only 12px wide, which was impossible to tap with a thumb. I expanded their hitboxes with padding while keeping the visual indicator neat.
4. **Dock Horizontal Scroll**: The dock now wraps into a smooth horizontal scroll container on mobile so icons do not shrink down to microscopic dots.`,
  },
  {
    id: 'devlog-3',
    title: 'Devlog #3: Ditching Local MP3s for Spotify Hub & Fixing Audio Bugs',
    date: 'August 31, 2026',
    version: 'v1.2.0',
    category: 'Audio & Apps',
    author: 'Kantaraj Luitel (Susant)',
    summary: 'Replacing bulky local audio files with a native Spotify web player embed and organizing Nepali classics and lofi tracks.',
    highlights: [
      'Removed bundled audio files to keep repo lightweight and avoid bandwidth waste',
      'Embedded responsive Spotify player iframe with playlist presets',
      'Curated playlists: Nepali Old Classics, Lofi Beats, Anime OSTs, and Brazilian Funk',
      'Solved iframe reloading glitches when dragging or resizing the music player window',
      'Added custom Spotify URL loader so users can paste their own favorite playlists',
    ],
    content: `In the first version, I had local mp3 files in the project. That was a mistake:
- The git repo size was getting bloated.
- Playing audio had sync bugs and limited track variety.
- It felt like a toy instead of a player I would actually use while working.

### Building the Spotify Hub:
I replaced the local player with a native Spotify embed player. This let me organize playlists I actually listen to while coding, including Nepali Old Classics, Lofi study beats, and Anime soundtracks.

### The Iframe Reload Bug:
The hardest part was that dragging or resizing the music player window in Framer Motion caused React to re-render the iframe, restarting the song from the beginning every time. I fixed this by decoupling the iframe container dimensions and using pointer-events: none on the iframe during active drag gestures so the mouse events don't get swallowed by the Spotify embed.`,
  },
  {
    id: 'devlog-4',
    title: 'Devlog #4: De-Vibing the Codebase, Cleaning CSS, and Being Honest',
    date: 'September 5, 2026',
    version: 'v1.3.1',
    category: 'Refactor & Polish',
    author: 'Kantaraj Luitel (Susant)',
    summary: 'Addressing Hack Club reviewer feedback: stripping AI boilerplate, toning down neon glow, and rewriting code by hand.',
    highlights: [
      'Reviewed feedback from Hack Club reviewer Shreerang about vibe coding and AI tells',
      'Stripped robotic boilerplate comments across Calculator, Widgets, Notes, and Terminal',
      'Toned down hyper-saturated neon glow and heavy blur filters to create clean, intentional CSS',
      'Rewrote devlogs from scratch in my real personal voice without corporate marketing jargon',
      'Committed changes incrementally every 25-30 minutes to document real iterative progress',
    ],
    content: `When Shreerang reviewed my Stardance submission, he gave me blunt, necessary feedback: the frontend looked vibe coded, the devlogs sounded like AI generated marketing copy, and the initial massive commit did not reflect genuine, incremental coding.

He was right. When starting out, I leaned heavily on AI prompts to scaffold components and generate documentation. While the features worked, it had all the classic tells of AI slop: hyper-saturated glow effects, bloated comments stating the obvious, and devlogs written like an enterprise press release.

### What I Changed in this Refactor:
1. **Human Voice**: Rewrote all devlogs to be completely honest about my building journey, what I struggled with, and what I learned.
2. **De-Vibed CSS**: Removed excessive backdrop blur (was set to 40px with heavy saturation) and replaced harsh neon shadows with clean, balanced borders and theme tokens.
3. **Cleaned Boilerplate**: Went through components like Widgets, Notes, Calculator, and Terminal to delete AI-generated comments and simplify the state logic so I understand and own every line.
4. **Honest Git Habits**: Moving away from dumping giant updates all at once. Making focused commits every 25-30 minutes as I make real improvements.

Hack Club is about learning to build things yourself, and this refactor made Syau OS much cleaner, lighter, and more personal.`,
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
            {['all', 'Window Engine', 'Mobile Fixes', 'Audio & Apps', 'Refactor & Polish'].map(cat => (
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
