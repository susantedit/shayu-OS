import { useState } from 'react'
import { BookOpen, Calendar, Clock, Sun, Moon } from 'lucide-react'
import { useThemeStore } from '../store/themeStore'

export interface DevlogEntry {
  id: string
  title: string
  date: string
  readTime: string
  summary: string
  content: string
}

const DEVLOGS: DevlogEntry[] = [
  {
    id: 'devlog-1',
    title: 'Building a Web OS in Nepal and Fighting the Window Manager',
    date: 'August 24, 2026',
    readTime: '3 min read',
    summary: 'Why I named it स्याउ (Apple in Nepali), starting with React and Vite, and spending hours fixing window z-index and mouse dragging.',
    content: `I started स्याउ OS because I wanted to build a web desktop with my own cultural identity. In Nepali, "स्याउ" (pronounced Syau) means Apple. It was my playful tribute to macOS, but incorporating native Devanagari typography (Noto Sans Devanagari) alongside clean monospace fonts.

### The Window Manager Headache
Building the window system was the hardest part of the first week. I thought dragging a div around would take ten minutes, but it turned into a cascade of weird edge cases:

1. Window Layering (z-index):
If you opened three windows, clicking an inactive window did not bring it to the front. I had to build a focused window stack in Zustand that tracks activeWindowId and dynamically bumps the clicked window's z-index above all others.

2. Pointer Slipping:
If you dragged the window titlebar too quickly, the mouse cursor slipped outside the header element. The onMouseMove event stopped firing, leaving the window stranded halfway across the screen. I learned that you cannot bind mousemove to the header itself; you have to attach the event listener to the global window object on mousedown and clean it up on mouseup.

3. Spawn Boundaries:
Windows were spawning half off-screen on smaller laptop viewports. I added a cascade offset calculator with viewport boundary clamping so new apps open inside visible coordinates.`,
  },
  {
    id: 'devlog-2',
    title: 'The Mobile Nightmare: 100vh vs 100dvh and Touch Targets',
    date: 'August 28, 2026',
    readTime: '3 min read',
    summary: 'Making a desktop interface usable on phones when reviewers open the link on mobile screens.',
    content: `Everything looked great on my laptop monitor. Then I sent the link to a friend who opened it on a phone, and it was completely broken.

Here is what failed on mobile:
- Mobile Chrome and Safari have dynamic bottom URL bars that slide up and down. Standard CSS 100vh does not account for this, so the bottom dock was half cut off and the page kept bouncing when scrolled. Switching the root container to 100dvh fixed the layout height.
- The window action buttons (close, minimize, maximize) were only 12px wide. Tapping them with a thumb was impossible. I expanded their hitboxes to 30px with transparent padding while keeping the visual indicator small and neat.
- A 600px wide window on a 390px mobile screen meant the titlebar controls were completely cut off. I added an auto-maximize rule for screens below 768px so windows open full-width on phones automatically.
- The dock icons squeezed together into tiny dots. I added a horizontal scroll wrapper with smooth touch inertia so the dock stays comfortable on phones.`,
  },
  {
    id: 'devlog-3',
    title: 'Scrapping Bundled MP3s for a Spotify Hub and Fixing Iframe Glitches',
    date: 'August 31, 2026',
    readTime: '3 min read',
    summary: 'Why local audio files were a bad idea, embedding Spotify, and fixing iframe re-renders during window drag.',
    content: `In my initial build, I bundled three local MP3 audio files inside the repository for the music player.

That was a bad decision:
- It bloated the repository size unnecessarily.
- Browser audio element handling had sync glitches when windows were minimized.
- Nobody actually wants to listen to three static audio files on loop.

I replaced it with an embedded Spotify web player hub featuring playlists I actually listen to while coding: Nepali Old Classics, Lofi study beats, Anime OSTs, and Brazilian funk.

### The Iframe Reload Glitch
The most frustrating bug: whenever you dragged or resized the music player window, Framer Motion re-rendered the container layout. This caused the Spotify iframe to reload and restart the song from second zero every single time you touched the window.

The solution was two-fold:
1. Setting pointer-events: none on the iframe container during active window drag events so mouse events don't get captured by Spotify.
2. Isolating the iframe container width and height from transient drag velocity updates so React doesn't re-mount the iframe DOM node.`,
  },
  {
    id: 'devlog-4',
    title: 'The Hack Club Review: Stripping AI Boilerplate and Taking Real Ownership',
    date: 'September 5, 2026',
    readTime: '4 min read',
    summary: 'Candid reflections on feedback from Hack Club reviewer Shreerang, deleting 800+ lines of fake canvas demos, and rewriting devlogs honestly.',
    content: `When Shreerang reviewed my Stardance project on Hack Club, he gave me blunt, necessary feedback:
"The front-end looks a lot vibe coded. Rewrite the parts you used AI for. Even your devlogs look AI gen."

At first, hearing that stung because I spent long nights debugging the window manager, mobile touch bounds, and Spotify iframe reloading. But when I stepped back and looked at the codebase through a reviewer's eyes, he was right.

When I started scaffolding the project, I leaned on AI prompts to flesh out apps and generate markdown summaries. That left distinct fingerprints:
1. Studio.tsx had grown to nearly 1,000 lines because it was packed with huge hardcoded canvas particle systems (neon stars, synthwave grids) that I did not write by hand and would never actually use.
2. The devlogs had a robotic structure with "Key Accomplishments", corporate categories, and marketing summaries that sounded like a PR announcement instead of a student developer talking about their code.
3. Excessive CSS gradients, neon borders, and aesthetic fluff that masked simple underlying logic.

### What I Did to Fix It
I went through the codebase to prune the fluff and take true ownership:
- Gutted the 800+ lines of pre-baked canvas particle scripts from Studio.tsx and turned it into a clean, straightforward HTML/CSS/JS scratchpad under 200 lines that I understand completely.
- Deleted the artificial devlog cards and rewrote every single entry here in my own authentic voice as a high school student developer in Nepal.
- Toned down the CSS: removed oversaturated glow filters and replaced them with clean, functional borders and readable type.

Hack Club is about genuine learning and building things yourself. Stripping out the AI fluff made स्याउ OS significantly lighter, cleaner, and something I can stand behind 100%.`,
  },
  {
    id: 'devlog-5',
    title: 'Going 100% Local: Removing the AI Chatbot and Passing Hack Club Standards',
    date: 'September 6, 2026',
    readTime: '3 min read',
    summary: 'Eliminating the Gemini API integration, hardcoded keys, and turning Meo into an authentic, offline OS command companion.',
    content: `Following review feedback from @Shreerang on Hack Club (#ask-the-shipwrights), I took a hard look at the remaining AI elements in SyauOS.

The biggest red flag was MeoAssistant:
Early on, I had wired up Google's Gemini 1.5 Flash REST API to make Meo a conversational AI chatbot, even leaving an API key configuration input in Settings. Having an LLM chatbot inside a desktop OS immediately gave the impression that the entire project was an AI wrapper.

### The Refactoring:
1. Removed all external AI REST calls, Gemini API endpoints, and cloud keys from the repository.
2. Rewrote Meo into a 100% client-side desktop companion and keyboard command runner. It now handles system actions locally: launching apps (Terminal, Notes, Calculator, Devlogs), switching themes, jumping between virtual workspaces, and listing keyboard shortcuts.
3. Added native Web Speech API synthesis for offline spoken feedback without sending any user data over the network.
4. Cleaned up Settings.tsx to remove all API key fields.

SyauOS is now completely self-contained and runs 100% on the client device. The features I am proud of — the Bikram Sambat calendar engine, the window manager physics, and the local developer tools — stand front and center on their own merits.`,
  },
]

export default function DevlogsApp() {
  const [selectedId, setSelectedId] = useState<string>('devlog-1')
  const [search, setSearch] = useState<string>('')
  const { mode, toggleMode } = useThemeStore()

  const currentLog = DEVLOGS.find(d => d.id === selectedId) || DEVLOGS[0]

  const filteredLogs = DEVLOGS.filter(d => {
    const term = search.toLowerCase()
    return d.title.toLowerCase().includes(term) || d.summary.toLowerCase().includes(term)
  })

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: 'var(--color-window-bg)' }}>
      {/* Sidebar List */}
      <div style={{
        width: 290, borderRight: '1px solid var(--color-glass-border)',
        display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.02)',
        flexShrink: 0,
      }}>
        {/* Header */}
        <div style={{ padding: '14px 12px', borderBottom: '1px solid var(--color-glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={16} style={{ color: 'var(--color-sakura)' }} />
              <span className="font-heading" style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Devlogs & Notes
              </span>
            </div>
            <button
              onClick={toggleMode}
              title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} mode`}
              style={{
                background: 'var(--color-glass-card)', border: '1px solid var(--color-glass-border)',
                borderRadius: 6, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--color-text-primary)',
              }}
            >
              {mode === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
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
              boxSizing: 'border-box',
            }}
          />
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
                  padding: 10, borderRadius: 6, marginBottom: 6, cursor: 'pointer',
                  background: isSelected ? 'rgba(232,130,155,0.12)' : 'var(--color-glass-card)',
                  border: isSelected ? '1px solid rgba(232,130,155,0.35)' : '1px solid var(--color-glass-border)',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={10} /> {log.date.split(',')[0]}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={10} /> {log.readTime}
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

      {/* Devlog Reader Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '24px 32px' }}>
        <div style={{ borderBottom: '1px solid var(--color-glass-border)', paddingBottom: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 11, color: 'var(--color-text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={12} /> {currentLog.date}
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} /> {currentLog.readTime}
            </span>
            <span>•</span>
            <span>Kantaraj Luitel (Susant)</span>
          </div>

          <h1 className="font-heading" style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.3 }}>
            {currentLog.title}
          </h1>
        </div>

        {/* Content body */}
        <div style={{
          fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.75,
          whiteSpace: 'pre-wrap', fontFamily: 'var(--font-sans)',
        }}>
          {currentLog.content}
        </div>
      </div>
    </div>
  )
}
