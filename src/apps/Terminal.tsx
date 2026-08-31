import { useState, useRef, useEffect } from 'react'

interface Line {
  text: string
  type: 'input' | 'output' | 'error'
}

const COMMANDS: Record<string, (text?: string) => string> = {
  help: () => `Available commands:
  help       - Show this message
  whoami     - Who am I?
  about      - About स्याउ OS
  skills     - My skills
  projects   - My projects
  contact    - Contact info
  neofetch   - System info
  clear      - Clear terminal
  date       - Current date/time
  echo       - Echo text back
  matrix     - Matrix rain
  weather    - Weather check
  cowsay     - Cow says your text
  sudo       - Try it ;)`,

  whoami: () => 'Kantaraj Luitel (Susant) -- builder, researcher, cybersecurity enthusiast',

  about: () => `स्याउ OS v1.0.0
A modern web-based operating system built for Hack Club.
Made with React, TypeScript, Tailwind CSS, Noto Sans Devanagari & Space Grotesk.
Designed by Kantaraj Luitel (Susant).`,

  skills: () => `Languages:    TypeScript, JavaScript, Python, C, SQL
Frameworks:  React, Next.js, Tailwind, Node.js
Cybersecurity: APIsec Certified, Ethical Hacking, TryHackMe
Cloud/AI:    Oracle Cloud Certified GenAI, Google Cloud, AI Agents`,

  projects: () => `स्याउ OS      Bilingual Web Operating System
Creator OS    Custom Creator Profile System`,

  contact: () => `Email:    susantedit@gmail.com
GitHub:   github.com/susantedit
LinkedIn: linkedin.com/in/kantaraj-luitel`,

  neofetch: () => `
  /\\_/\\      susant@syau-os
 ( o.o )     ----------------
  > ^ <      OS: स्याउ OS 1.0.0
 /|   |\\     Kernel: React 19 + TypeScript
(_|   |_)    Shell: syau-sh 1.0
             Resolution: responsive
             WM: Framer Motion
             Theme: Dual Dark & White Light
             Terminal: SyauTerm
             Creator: Kantaraj Luitel (Susant)`,

  date: () => new Date().toString(),

  matrix: () => 'MATRIX MODE ACTIVATED\n' + Array.from({ length: 8 }, () =>
    Array.from({ length: 40 }, () => String.fromCharCode(0x30A0 + Math.random() * 96)).join('')
  ).join('\n'),

  weather: () => {
    const conditions = ['☀️ Sunny', '🌤 Partly cloudy', '🌧 Rainy', '⛅ Cloudy', '🌈 Rainbow', '❄️ Snowy']
    const cond = conditions[Math.floor(Math.random() * conditions.length)]
    const temp = Math.floor(Math.random() * 30 + 5)
    return `स्याउ OS Weather Service\n${cond} | ${temp}°C\nHumidity: ${Math.floor(Math.random() * 60 + 30)}%\nWind: ${Math.floor(Math.random() * 20 + 1)} km/h`
  },

  cowsay: (text?: string) => {
    const msg = text || 'स्याउ OS is sleek!'
    const top = ' ' + '_'.repeat(msg.length + 2)
    const mid = `< ${msg} >`
    const bot = ' ' + '-'.repeat(msg.length + 2)
    return `${top}\n${mid}\n${bot}\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||`
  },

  sudo: () => {
    return 'Permission denied: Access granted to Kantaraj Luitel (Susant).'
  },
}

export default function Terminal() {
  const [lines, setLines] = useState<Line[]>([
    { text: 'Welcome to SyauTerm v1.0.0 (स्याउ OS)', type: 'output' },
    { text: 'Type "help" for available commands.', type: 'output' },
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

    if (command === 'echo') {
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
      } else {
        setHistIdx(-1)
        setInput('')
      }
    }
  }

  return (
    <div className="app-terminal" ref={scrollRef} onClick={() => inputRef.current?.focus()}>
      {lines.map((line, i) => (
        <div key={i} className="app-terminal-line">
          {line.type === 'input' ? (
            <span>
              <span className="app-terminal-prompt">{line.text.slice(0, 2)}</span>
              <span>{line.text.slice(2)}</span>
            </span>
          ) : (
            <span style={{ color: line.type === 'error' ? '#F38BA8' : '#CDD6F4' }}>
              {line.text}
            </span>
          )}
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span className="app-terminal-prompt">$ </span>
        <input
          ref={inputRef}
          className="app-terminal-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
        />
      </div>
    </div>
  )
}
