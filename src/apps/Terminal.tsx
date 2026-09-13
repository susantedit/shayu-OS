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
  ps          - List active windows and processes
  kill <name> - Close a window by title or app ID
  nepali      - View Nepali date and open Patro
  notes       - Open Notes scratchpad
  calc        - Open Calculator
  settings    - Open Settings
  whoami      - Builder info
  about       - About स्याउ OS
  skills      - Technical skills
  projects    - Highlighted projects
  contact     - Contact information
  neofetch    - System details and ASCII logo
  clear       - Clear the terminal screen
  date        - Current system timestamp
  echo <text> - Print text to console`,

  whoami: () => 'Kantaraj Luitel (Susant) -- developer, student, and builder of SyauOS',

  about: () => `स्याउ OS v1.3.0
A client-side web desktop environment built for Hack Club.
Engineered with React 19, TypeScript, Vite, and custom Bikram Sambat calendar logic.
Created by Kantaraj Luitel (Susant).`,

  skills: () => `Languages:    TypeScript, JavaScript, Python, C, SQL
Frameworks:   React 19, Tailwind CSS, Vite, Node.js
Focus Areas:  Web Development, Operating System Concepts, Nepali Localization`,

  projects: () => `स्याउ OS (SyauOS)  - Web Desktop Environment with Nepali Bikram Sambat Integration
Devlogs           - Engineering notes on window management, viewports, and calendar math`,

  contact: () => `Email:    susantedit@gmail.com
GitHub:   github.com/susantedit
LinkedIn: linkedin.com/in/kantaraj-luitel`,

  neofetch: () => `
  /\\_/\\      susant@syau-os
 ( o.o )     ----------------
  > ^ <      OS: स्याउ OS 1.3.0
 /|   |\\     Kernel: React 19 + TypeScript
(_|   |_)    Shell: syau-sh 1.3
             WM: Custom Zustand Window Manager
             Calendar: Bikram Sambat (BS) Engine
             Theme: Dual Dark & Light Mode
             Creator: Kantaraj Luitel (Susant)`,

  date: () => new Date().toString(),
}

export default function Terminal() {
  const [lines, setLines] = useState<Line[]>([
    { text: 'SyauTerm v1.3.0 (स्याउ OS)', type: 'output' },
    { text: 'Type "help" for a list of commands.', type: 'output' },
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
    } else if (command === 'notes') {
      useDesktopStore.getState().openWindow('notes', 'Notes', 640, 480)
      newLines.push({ text: 'Launched Notes app.', type: 'output' })
    } else if (command === 'calc' || command === 'calculator') {
      useDesktopStore.getState().openWindow('calculator', 'Calculator', 320, 460)
      newLines.push({ text: 'Launched Calculator.', type: 'output' })
    } else if (command === 'settings') {
      useDesktopStore.getState().openWindow('settings', 'Settings', 540, 460)
      newLines.push({ text: 'Launched Settings.', type: 'output' })
    } else if (command === 'echo') {
      newLines.push({ text: args.join(' '), type: 'output' })
    } else if (COMMANDS[command]) {
      const result = COMMANDS[command](args.join(' '))
      newLines.push({ text: result, type: 'output' })
    } else {
      newLines.push({ text: `syau-sh: command not found: ${command}`, type: 'error' })
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
      style={{
        display: 'flex', flexDirection: 'column', height: '100%',
        background: '#0e1117', color: '#7EDDD6', fontFamily: 'monospace',
        fontSize: 13, padding: 14, overflow: 'hidden'
      }}
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              color: l.type === 'input' ? '#E8829B' : l.type === 'error' ? '#EF4444' : '#C4B5FD',
              minHeight: l.text ? undefined : '0.6em'
            }}
          >
            {l.text}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        <span style={{ color: '#E8829B', fontWeight: 600 }}>$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: '#F3F4F6', fontFamily: 'inherit', fontSize: 'inherit'
          }}
        />
      </div>
    </div>
  )
}
