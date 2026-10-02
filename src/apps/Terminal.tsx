import { useState, useRef, useEffect } from 'react'
import { useDesktopStore } from '../store/desktopStore'
import { getNepaliDateBS } from '../utils/nepaliCalendar'

interface Line {
  text: string
  type: 'input' | 'output' | 'error'
}

const COMMANDS: Record<string, (text?: string) => string> = {
  help: () => `Available commands:
  help        - Show this list of commands
  neofetch    - System specs and ASCII स्याउ logo
  baghchal    - Play बाघचाल (Bagh-Chal board game)
  type        - Open Syau Type (Nepali phonetic typing)
  audio       - Open Focus Audio synthesizer
  nepali      - View Nepali date and open Patro
  notes       - Open Notes scratchpad
  calc        - Open Calculator
  matrix      - Trigger matrix code stream
  cowsay <t>  - Syau cow speaker
  ps          - List active windows and processes
  kill <name> - Close a window by title or app ID
  settings    - Open Settings
  whoami      - Builder info
  about       - About स्याउ OS
  skills      - Technical skills
  projects    - Highlighted projects
  contact     - Contact information
  clear       - Clear the terminal screen
  date        - Current system timestamp
  echo <text> - Print text to console`,

  whoami: () => 'Kantaraj Luitel (Susant) -- developer, student, and builder of SyauOS from Nepal',

  about: () => `स्याउ OS v1.4.0
A handcrafted client-side web desktop environment built for Hack Club.
Engineered with React 19, TypeScript, Vite, custom Bikram Sambat calendar math,
phonetic Nepali transliteration, and Web Audio API focus soundscapes.
Zero external AI chatbots. 100% offline client-side code.
Created by Kantaraj Luitel (Susant).`,

  skills: () => `Languages:    TypeScript, JavaScript, Python, C, SQL, HTML, CSS
Styling:      Vanilla CSS, CSS Custom Properties
Focus Areas:  Web Desktop Architecture, Board Game Algorithms, Web Audio API`,

  projects: () => `स्याउ OS (SyauOS)  - Web Desktop Environment with Nepali Culture & Tools
Bagh-Chal Engine   - Nepal's National Traditional Board Game (Tigers & Goats)
Campfire Kathmandu - 2nd Place Winner (Hack Club 2026)
Syau Type Engine   - Phonetic Romanized to Devanagari live transliterator`,

  contact: () => `Email:    susantedit@gmail.com
GitHub:   github.com/susantedit
LinkedIn: linkedin.com/in/kantaraj-luitel`,

  baghchal: () => `बाघचाल (Bagh-Chal) is Nepal's ancient two-player strategy game.
4 Tigers vs 20 Goats on a 5x5 grid with diagonal paths.
Launching game board...`,

  neofetch: () => `
         .---.        susant@syau-os
       /   / \\        --------------
      |   |   |       OS: स्याउ OS 1.4.0
       \\   \\ /        Host: Client-Side Browser (Offline)
     .---------.      Kernel: React 19 + TypeScript 6
    /           \\     Uptime: Active Web Session
   |  (.)   (.)  |    Shell: syau-sh 1.4
   |     ___     |    WM: Custom Zustand Window Manager
    \\   '---'   /     Styling: Vanilla CSS (Custom Properties)
     '---------'      Calendar: Bikram Sambat (BS) Engine
                      Features: Bagh-Chal, Syau Type, Focus Audio
                      Builder: Kantaraj Luitel (Susant) [Nepal]`,

  date: () => new Date().toString(),
}

export default function Terminal() {
  const [lines, setLines] = useState<Line[]>([
    { text: 'SyauTerm v1.4.0 (स्याउ OS)', type: 'output' },
    { text: 'Type "help" for a list of commands, or "baghchal" to play the board game.', type: 'output' },
    { text: '', type: 'output' },
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [lines])

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim()
    if (!trimmed) return

    const newLines: Line[] = [{ text: `$ ${trimmed}`, type: 'input' }]
    setHistory(h => [trimmed, ...h])
    setHistIdx(-1)

    const [command, ...args] = trimmed.split(' ')

    if (command === 'clear') {
      setLines([])
      return
    }

    if (command === 'ps') {
      const wins = useDesktopStore.getState().windows
      let out = 'PID   APPLICATION       WORKSPACE   STATUS\n'
      out +=    '------------------------------------------\n'
      wins.forEach((w, idx) => {
        const pid = String(1000 + idx).padEnd(6)
        const app = (w.appId || 'app').slice(0, 16).padEnd(18)
        const ws = `WS ${w.workspace}`.padEnd(12)
        const st = (w.minimized ? 'MINIMIZED' : 'ACTIVE')
        out += `${pid}${app}${ws}${st}\n`
      })
      out += `\nTotal windows open: ${wins.length}`
      newLines.push({ text: out, type: 'output' })
    } else if (command === 'kill') {
      const target = args[0]
      if (!target) {
        newLines.push({ text: 'Usage: kill <app-id | title>', type: 'error' })
      } else {
        const state = useDesktopStore.getState()
        const foundWin = state.windows.find(w =>
          w.appId.toLowerCase() === target.toLowerCase() ||
          w.title.toLowerCase().includes(target.toLowerCase())
        )
        if (foundWin) {
          state.closeWindow(foundWin.id)
          newLines.push({ text: `Closed window: ${foundWin.title}`, type: 'output' })
        } else {
          newLines.push({ text: `kill: no window found matching '${target}'`, type: 'error' })
        }
      }
    } else if (command === 'nepali' || command === 'patro') {
      const today = getNepaliDateBS(new Date())
      let out = 'स्याउ OS नेपाली पात्रो (Bikram Sambat Calendar)\n'
      out +=    '-----------------------------------------------\n'
      out +=    `आजको मिति: ${today.formattedBS} गते, ${today.dayName}\n`
      out +=    `Gregorian:   ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`
      useDesktopStore.getState().openWindow('nepali-converter', 'नेपाली पात्रो र एकाइ रूपान्तरण', 780, 560)
      newLines.push({ text: out, type: 'output' })
    } else if (command === 'baghchal' || command === 'bagh') {
      useDesktopStore.getState().openWindow('bagh-chal', 'बाघचाल (Bagh-Chal) - Traditional Nepalese Strategy Board Game', 820, 560)
      newLines.push({ text: 'Launched बाघचाल (Bagh-Chal) board game.', type: 'output' })
    } else if (command === 'type') {
      useDesktopStore.getState().openWindow('syau-type', 'स्याउ टाइप - Nepali Transliteration', 760, 520)
      newLines.push({ text: 'Launched Syau Type transliterator.', type: 'output' })
    } else if (command === 'audio' || command === 'sound') {
      useDesktopStore.getState().openWindow('focus-audio', 'स्याउ साउन्ड - Focus Audio', 720, 540)
      newLines.push({ text: 'Launched Focus Audio synthesizer.', type: 'output' })
    } else if (command === 'notes') {
      useDesktopStore.getState().openWindow('notes', 'Notes', 640, 480)
      newLines.push({ text: 'Launched Notes app.', type: 'output' })
    } else if (command === 'calc' || command === 'calculator') {
      useDesktopStore.getState().openWindow('calculator', 'Calculator', 320, 460)
      newLines.push({ text: 'Launched Calculator.', type: 'output' })
    } else if (command === 'settings') {
      useDesktopStore.getState().openWindow('settings', 'Settings', 540, 460)
      newLines.push({ text: 'Launched Settings.', type: 'output' })
    } else if (command === 'matrix') {
      const matrixChars = '01SYAU10NEPAL01KATHMANDU100101'
      let stream = ''
      for (let r = 0; r < 8; r++) {
        let line = ''
        for (let c = 0; c < 40; c++) {
          line += matrixChars[Math.floor(Math.random() * matrixChars.length)] + ' '
        }
        stream += line + '\n'
      }
      newLines.push({ text: stream, type: 'output' })
    } else if (command === 'cowsay') {
      const msg = args.join(' ') || 'SyauOS: Handcrafted with pride!'
      const bubbleBorder = '-'.repeat(msg.length + 2)
      const cow = `
  ${bubbleBorder}
< ${msg} >
  ${bubbleBorder}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`
      newLines.push({ text: cow, type: 'output' })
    } else if (command === 'history') {
      newLines.push({ text: history.slice().reverse().map((h, i) => `${i + 1}  ${h}`).join('\n'), type: 'output' })
    } else if (command === 'echo') {
      newLines.push({ text: args.join(' '), type: 'output' })
    } else if (COMMANDS[command]) {
      const result = COMMANDS[command](args.join(' '))
      newLines.push({ text: result, type: 'output' })
    } else {
      newLines.push({ text: `syau-sh: command not found: ${command}. Type "help" for commands.`, type: 'error' })
    }

    newLines.push({ text: '', type: 'output' })
    setLines(l => [...l, ...newLines])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input)
      setInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length > 0) {
        const newIdx = Math.min(histIdx + 1, history.length - 1)
        setHistIdx(newIdx)
        setInput(history[newIdx])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (histIdx > 0) {
        const newIdx = histIdx - 1
        setHistIdx(newIdx)
        setInput(history[newIdx])
      } else if (histIdx === 0) {
        setHistIdx(-1)
        setInput('')
      }
    }
  }

  return (
    <div
      className="app-terminal"
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
        {lines.map((l, i) => (
          <div
            key={i}
            className={`app-terminal-line ${l.type}`}
            style={{
              color: l.type === 'input' ? 'var(--color-sakura)' : l.type === 'error' ? '#ef4444' : 'var(--color-miku)',
              minHeight: l.text ? undefined : '0.6em'
            }}
          >
            {l.text}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        <span className="app-terminal-prompt">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
          className="app-terminal-input"
        />
      </div>
    </div>
  )
}
