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
    title: 'Starting SyauOS and fighting window dragging bugs',
    date: 'August 24, 2026',
    readTime: '2 min read',
    summary: 'Why I called it स्याउ, building on React and Vite, and fixing mouse cursor slipping.',
    content: `I wanted to build a web desktop with its own Nepali identity. In Nepal, "स्याउ" (Syau) means Apple, so calling it स्याउ OS felt like a fun nod to macOS.

Window dragging was the first thing that broke. I thought adding an onMouseMove handler to the window header would take five minutes. But if you dragged too quickly, your mouse pointer slipped off the header div, the event stopped firing, and the window just froze in place.

I learned that mousemove has to be attached to the global window object when mousedown starts, then cleaned up on mouseup.

Then there was the z-index problem. Clicking an old window didn't bring it in front of the active one. I solved that with a small Zustand store to track the active window id and increase its z-index on click. I also clamped the spawn coordinates so windows stop opening half off-screen on small laptop screens.`,
  },
  {
    id: 'devlog-2',
    title: 'Fixing the layout for mobile phones',
    date: 'August 28, 2026',
    readTime: '2 min read',
    summary: 'Handling mobile browser address bars with 100dvh and making buttons easier to tap.',
    content: `The desktop looked fine on my monitor, but it was unusable on phones.

Mobile Safari and Chrome have dynamic URL bars that slide around when you scroll. Regular CSS 100vh doesn't track that movement, so the bottom dock got cut in half and bounced around. Switching the main container to 100dvh stopped the jitter.

The window controls also needed work. A 12px close button is easy to click with a mouse, but thumb taps kept missing it. I gave the buttons invisible padding so the clickable hit target is roughly 30px while keeping the icon small.

On screens under 768px wide, standard desktop windows also went way past the screen edge. I added a rule that auto-maximizes windows on mobile so people can actually read notes or type commands without zooming.`,
  },
  {
    id: 'devlog-3',
    title: 'Building the Nepali calendar and unit converter',
    date: 'September 1, 2026',
    readTime: '3 min read',
    summary: 'Why standard date math fails for Bikram Sambat, and writing land measurement conversions.',
    content: `I wanted an app in SyauOS that felt distinctly Nepali. We use the Bikram Sambat (BS) calendar in Nepal, which is about 56.7 years ahead of the Gregorian calendar.

Converting BS dates in JavaScript is tricky because Nepali month lengths change from year to year. Baisakh might have 31 days one year and 32 days the next. There is no simple leap year math like in the solar calendar, so I compiled a month-length lookup table from 2000 BS to 2090 BS to calculate accurate day differences.

I also added conversions for traditional land units. In Kathmandu and hilly regions, land is bought in Ropani, Aana, Paisa, and Daam. Down in the Terai plains, people use Bigha, Kattha, and Dhur. Writing the formulas to convert between these units and square feet gives the OS a practical tool that people in Nepal use all the time.`,
  },
  {
    id: 'devlog-4',
    title: 'Hack Club feedback and removing boilerplate',
    date: 'September 5, 2026',
    readTime: '2 min read',
    summary: 'Shreerang called out the vibe coding, so I deleted hundreds of lines of unused templates.',
    content: `Shreerang reviewed my project on Hack Club and told me the front-end looked vibe coded and that even my devlogs felt AI-generated.

That was tough to hear at first because I spent a lot of time debugging CSS and window states. But he was right. Early on, I asked an LLM for starter code across different apps, and it dumped in massive files. I had a studio app with over a thousand lines of canvas particle code that I didn't write and couldn't explain.

I went through the repo and deleted the bloat. I dropped the canvas files, the dummy browser, and other filler apps. SyauOS is smaller now, but every file left in the project is something I understand and wrote myself.`,
  },
  {
    id: 'devlog-5',
    title: 'Cutting the AI chatbot and running offline',
    date: 'September 6, 2026',
    readTime: '2 min read',
    summary: 'Getting rid of the Gemini API prompt box so SyauOS is a clean, local web desktop.',
    content: `Having an AI assistant in the OS turned out to be a mistake. Putting an API key field in Settings made the whole project look like a thin wrapper around Gemini.

I deleted all the external API calls and removed the assistant. Now SyauOS runs purely client-side in the browser. The terminal parses local commands like neofetch and clear, notes save to localStorage, and the calendar runs its math directly in TypeScript.

It loads fast, needs zero API keys, and works without an internet connection.`,
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
       <div style={{
        width: 290, borderRight: '1px solid var(--color-glass-border)',
        display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.02)',
        flexShrink: 0,
      }}>
     
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
