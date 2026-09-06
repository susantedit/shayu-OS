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
    title: 'The Hack Club Feedback: Deleting Boilerplate and Taking Real Ownership',
    date: 'September 5, 2026',
    readTime: '4 min read',
    summary: 'Reflections on feedback from Shreerang, deleting 800+ lines of canvas demos, and toning down the UI.',
    content: `When Shreerang reviewed my project on Hack Club, he gave me straightforward feedback:
"The front-end looks a lot vibe coded. Rewrite the parts you used ai for. Even your devlogs look ai gen."

At first, hearing that was tough because I spent hours debugging window dragging and touch support on mobile. But when I actually looked at what was in my repo, he had a point.

When I started, I used AI to quickly generate starter templates for different apps. Because of that:
1. Studio.tsx was over 1,000 lines full of massive canvas particle scripts that I didn't write and didn't even care about.
2. My earlier devlogs were structured like corporate marketing updates with bullet points and buzzwords instead of just writing like a high school student learning web dev.
3. The UI had too many glowing borders, glassmorphic blurs, and neon gradients that made it look like a generic template.

What I changed:
- Gutted the pre-baked canvas particle scripts from Studio.tsx and turned it into a simple HTML/CSS/JS playground under 200 lines that I actually understand.
- Rewrote the devlogs in plain English to talk about the actual bugs I ran into.
- Cleaned up the styles so it feels like a real desktop instead of an over-designed demo.

Taking ownership of the code feels a lot better than just shipping lines an LLM spit out.`,
  },
  {
    id: 'devlog-5',
    title: 'Cutting the AI Chatbot and Building a Real Command Runner',
    date: 'September 6, 2026',
    readTime: '3 min read',
    summary: 'Removing the Gemini API, getting rid of hardcoded keys, and making Meo a lightweight offline shortcut tool.',
    content: `After talking with Shreerang on Slack (#ask-the-shipwrights), I realized having an AI assistant in the OS was the biggest mistake. It gave the impression that the whole OS was just an AI wrapper, and having a Gemini API key box in Settings looked terrible.

Here is what I did to fix it today:
1. Completely deleted the Google Gemini 1.5 Flash API calls and deleted the API key setting from Settings.tsx.
2. Turned Meo into a simple, 100% offline command runner and keyboard shortcut helper. It parses simple commands locally like "open terminal", "open notes", "workspace 2", and "shortcuts" without calling any server or AI model.
3. Removed the Web Speech API voice synthesis so it stays silent, fast, and doesn't get in the way.
4. Stripped out another batch of unused code and boilerplate.

Now SyauOS has zero external AI API calls. Every app runs locally on the browser, and the code is straightforward enough that I can explain every single part of it.`,
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
