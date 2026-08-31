import { useState } from 'react'

const sections = [
  {
    title: '🚀 Getting Started',
    items: [
      { label: 'Open Apps', desc: 'Click any icon in the dock at the bottom of the screen, or right-click the desktop for quick access to About Me, Terminal, Notes, and Settings.' },
      { label: 'Move Windows', desc: 'Drag windows by their title bar. Windows snap to screen edges — drag left/right for half-screen, drag to the top to maximize.' },
      { label: 'Resize Windows', desc: 'Grab any edge or corner of a window to resize it.' },
      { label: 'Window Controls', desc: 'Red = close, Yellow = minimize, Green = maximize. Double-click the title bar to toggle maximize.' },
      { label: 'Spotlight Search', desc: 'Press Cmd+K (or Ctrl+K) to open Spotlight. Type to search apps, use arrow keys to navigate, Enter to launch.' },
    ],
  },
  {
    title: '🖥️ Built-in Apps',
    items: [
      { label: 'About Me', desc: 'Profile card with links to GitHub, Discord, email, and portfolio.' },
      { label: 'Terminal', desc: 'A custom shell (syau-sh) with 20+ commands. Try `help` to see them all.' },
      { label: 'Notes', desc: 'Quick notepad with auto-save to localStorage and a "✓ Saved" indicator.' },
      { label: 'Calculator', desc: 'Basic calculator with keyboard support. Type numbers and operators directly.' },
      { label: 'Music Player', desc: '27 tracks across anime, jazz, classical, and more. Has a visualizer that reacts to the music.' },
      { label: 'Gallery', desc: '11 images in a grid. Click to select, double-click for fullscreen lightbox with ‹/› navigation.' },
      { label: 'Browser', desc: 'Embedded web browser with proxy support. If a site blocks embedding, try Google Translate or Wayback Machine.' },
      { label: 'Doomscroll', desc: 'TikTok-style vertical video scroller. Scroll/swipe/arrow keys to navigate. Double-click to like with a heart animation.' },
      { label: 'Settings', desc: 'Change accent colors (6 options), background mode (solid/static/live wallpaper), and more.' },
    ],
  },
  {
    title: '💻 Terminal Commands',
    items: [
      { label: 'help', desc: 'Show all available commands.' },
      { label: 'whoami', desc: 'Who is Kantaraj Luitel (Susant)?' },
      { label: 'about', desc: 'About स्याउ OS.' },
      { label: 'skills', desc: 'Technical skills list.' },
      { label: 'projects', desc: 'Projects: स्याउ OS, Creator Profile.' },
      { label: 'contact', desc: 'Email, GitHub, LinkedIn links.' },
      { label: 'neofetch', desc: 'System info with ASCII art.' },
      { label: 'date', desc: 'Current date and time.' },
      { label: 'echo [text]', desc: 'Echo text back.' },
      { label: 'clear', desc: 'Clear the terminal.' },
      { label: 'matrix', desc: 'Matrix rain effect.' },
      { label: 'weather', desc: 'Weather report for स्याउ OS.' },
      { label: 'cowsay [text]', desc: 'A cow says your text.' },
      { label: 'sudo', desc: 'Try it and find out ;)' },
    ],
  },
  {
    title: '🥚 Easter Eggs & Modes',
    items: [
      { label: 'Theme Mode', desc: 'Toggle Dark Mode and White Light Mode in TopBar or Settings.' },
      { label: 'Rainbow Mode', desc: 'Click the "स्याउ OS" logo in the top bar 10 times. The top bar turns rainbow for 5 seconds.' },
      { label: 'Desktop Pet', desc: 'A tiny pet follows your cursor. It falls asleep after 15 seconds of no mouse movement.' },
    ],
  },
  {
    title: '🎨 Visual & Audio',
    items: [
      { label: 'Glass Morphism', desc: 'All panels, dock, and windows use glassmorphism with blur, saturation, and subtle borders.' },
      { label: 'Boot Sequence', desc: 'Cinematic boot: logo reveal with blur → terminal with BIOS/kernel/services → desktop assembles piece by piece.' },
      { label: 'Click Sounds', desc: 'Subtle audio feedback on every button click, dock click, and menu interaction.' },
      { label: 'Cursor Trail', desc: 'Sakura-colored dots follow your mouse with a comet tail effect.' },
      { label: 'Dock Magnification', desc: 'macOS-style dock magnification — icons scale up based on mouse proximity.' },
    ],
  },
  {
    title: '⚙️ System Features',
    items: [
      { label: 'Lock Screen', desc: 'After 5 minutes of inactivity, a lock screen appears with the time. Click or press any key to unlock.' },
      { label: 'Window Snapping', desc: 'Drag a window to the left/right edge for half-screen. Drag to the top to maximize.' },
      { label: 'Devlogs App', desc: 'Dedicated native Devlogs Viewer App with search, filter, and progress logs.' },
      { label: 'Creator App', desc: 'Interactive profile app for Kantaraj Luitel (Susant).' },
      { label: 'Persistent State', desc: 'Notes, settings, accent color, and wallpaper choices are saved to localStorage.' },
    ],
  },
]

export default function Guide() {
  const [openSection, setOpenSection] = useState<number | null>(0)

  return (
    <div style={{ padding: 20, height: '100%', overflow: 'auto' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 4 }}>
          📖 स्याउ OS Guide
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
          Everything you need to know about स्याउ OS — features, commands, easter eggs, and creator info.
        </div>
      </div>

      {sections.map((section, si) => (
        <div key={si} style={{ marginBottom: 8 }}>
          <button
            onClick={() => setOpenSection(openSection === si ? null : si)}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 10,
              background: openSection === si ? 'rgba(232,130,155,0.08)' : 'rgba(255,255,255,0.02)',
              border: '1px solid ' + (openSection === si ? 'rgba(232,130,155,0.15)' : 'rgba(255,255,255,0.04)'),
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              color: openSection === si ? 'var(--color-sakura)' : 'var(--color-text-primary)',
              fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-sans)',
              transition: 'all 0.15s',
            }}
          >
            <span>{section.title}</span>
            <span style={{ fontSize: 12, opacity: 0.5 }}>{openSection === si ? '−' : '+'}</span>
          </button>

          {openSection === si && (
            <div style={{
              marginTop: 4, padding: '8px 6px',
              background: 'rgba(0,0,0,0.15)', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.03)',
            }}>
              {section.items.map((item, ii) => (
                <div key={ii} style={{
                  padding: '8px 10px', borderRadius: 8,
                  marginBottom: ii < section.items.length - 1 ? 2 : 0,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-sakura)', marginBottom: 2 }}>
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
        background: 'rgba(232,130,155,0.03)', border: '1px solid rgba(255,255,255,0.04)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
          Made by Subhansh and caffeine for the Hack Club Stardance Jam
        </div>
      </div>
    </div>
  )
}
