import { useState, useEffect, useRef, useMemo } from 'react'
import {
  Check, Plus, Trash2, Download, Upload, Play,
  Columns, Edit3, Eye, Code2, Terminal, Copy,
  Folder
} from 'lucide-react'

interface NoteDoc {
  id: string
  title: string
  content: string
  updatedAt: number
}

const DEFAULT_SAMPLE_NOTE = `# Notes

Scratchpad for notes, to-dos, and quick JavaScript snippets.

### To-do
- [x] Fix window drag slipping bug
- [x] Add 100dvh layout for phones
- [x] Add Bikram Sambat calendar and land converter
- [ ] Add more wallpaper choices

### JS Sandbox
\`\`\`javascript
const greeting = "Hello from SyauOS";
console.log(greeting);
return { status: "ok" };
\`\`\`
`

export default function Notes() {

  const [notes, setNotes] = useState<NoteDoc[]>(() => {
    try {
      const saved = localStorage.getItem('syau-os-notes-v2')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
      const legacyNote = localStorage.getItem('syau-os-notes')
      return [
        {
          id: 'note-1',
          title: 'Welcome to Notes Pro',
          content: legacyNote && legacyNote.trim() ? legacyNote : DEFAULT_SAMPLE_NOTE,
          updatedAt: Date.now(),
        }
      ]
    } catch {
      return [{ id: 'note-1', title: 'Quick Notes', content: DEFAULT_SAMPLE_NOTE, updatedAt: Date.now() }]
    }
  })

  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || 'note-1')
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split')
  const [showSidebar, setShowSidebar] = useState(false)
  const [saved, setSaved] = useState(false)

  
  const [codeOutputs, setCodeOutputs] = useState<Record<string, { logs: string[]; result?: string; error?: string }>>({})

  const activeNote = useMemo(() => {
    return notes.find(n => n.id === activeNoteId) || notes[0]
  }, [notes, activeNoteId])

  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const fileInputRef = useRef<HTMLInputElement>(null)


  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      
      if (activeNote) {
        localStorage.setItem('syau-os-notes', activeNote.content)
      }
      setSaved(true)
      const t = setTimeout(() => setSaved(false), 1500)
      return () => clearTimeout(t)
    }, 400)
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [notes, activeNote])

  const updateActiveContent = (text: string) => {
    setNotes(prev => prev.map(n => {
      if (n.id === activeNoteId) {
 
        const firstLine = text.trim().split('\n')[0]?.replace(/^#+\s*/, '') || 'Untitled Note'
        const title = firstLine.slice(0, 30) || 'Untitled Note'
        return { ...n, content: text, title, updatedAt: Date.now() }
      }
      return n
    }))
  }

  const createNewNote = () => {
    const newNote: NoteDoc = {
      id: `note-${Date.now()}`,
      title: 'New Note',
      content: `# New Note\n\nStart typing your ideas here...`,
      updatedAt: Date.now(),
    }
    setNotes(prev => [newNote, ...prev])
    setActiveNoteId(newNote.id)
  }

  const deleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (notes.length <= 1) return
    const nextNotes = notes.filter(n => n.id !== id)
    setNotes(nextNotes)
    if (activeNoteId === id) {
      setActiveNoteId(nextNotes[0].id)
    }
  }


  const handleExport = (type: 'md' | 'txt') => {
    if (!activeNote) return
    const blob = new Blob([activeNote.content], { type: type === 'md' ? 'text/markdown' : 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeNote.title.toLowerCase().replace(/[^a-z0-9]/gi, '_') || 'note'}.${type}`
    a.click()
    URL.revokeObjectURL(url)
  }

 
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result || '')
      const title = file.name.replace(/\.[^/.]+$/, '')
      const newDoc: NoteDoc = {
        id: `note-${Date.now()}`,
        title,
        content: text,
        updatedAt: Date.now(),
      }
      setNotes(prev => [newDoc, ...prev])
      setActiveNoteId(newDoc.id)
    }
    reader.readAsText(file)
  }

  const runCodeSnippet = (blockId: string, code: string) => {
    const logs: string[] = []
    const customConsole = {
      log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
      info: (...args: any[]) => logs.push(`[info] ${args.join(' ')}`),
      error: (...args: any[]) => logs.push(`[error] ${args.join(' ')}`),
    }

    try {
     
      const runner = new Function('console', `"use strict";\n${code}`)
      const result = runner(customConsole)
      setCodeOutputs(prev => ({
        ...prev,
        [blockId]: {
          logs,
          result: result !== undefined ? (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)) : undefined,
        }
      }))
    } catch (err: any) {
      setCodeOutputs(prev => ({
        ...prev,
        [blockId]: {
          logs,
          error: String(err?.message || err),
        }
      }))
    }
  }

  
  const words = activeNote?.content.trim() ? activeNote.content.trim().split(/\s+/).length : 0
  const chars = activeNote?.content.length || 0
  const linesCount = activeNote?.content.split('\n').length || 0


  const renderMarkdown = (md: string) => {
    const lines = md.split('\n')
    const elements: React.ReactNode[] = []
    let inCodeBlock = false
    let codeBlockLang = ''
    let codeBlockContent: string[] = []
    let codeBlockIndex = 0

    let inTable = false
    let tableRows: string[][] = []

    const flushTable = (key: string) => {
      if (tableRows.length > 0) {
        const header = tableRows[0]
        const body = tableRows.slice(1)
        elements.push(
          <div key={key} style={{ overflowX: 'auto', margin: '14px 0' }}>
            <table style={{
              width: '100%', borderCollapse: 'collapse', fontSize: 12,
              border: '1px solid var(--color-glass-border)',
            }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.06)' }}>
                  {header.map((col, idx) => (
                    <th key={idx} style={{
                      padding: '8px 12px', textAlign: 'left',
                      borderBottom: '1px solid var(--color-border)', fontWeight: 700,
                    }}>
                      {formatInline(col)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, rIdx) => (
                  <tr key={rIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} style={{ padding: '6px 12px' }}>
                        {formatInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
        tableRows = []
      }
      inTable = false
    }

    lines.forEach((line, idx) => {

      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          const blockId = `code-block-${codeBlockIndex}`
          const codeString = codeBlockContent.join('\n')
          const output = codeOutputs[blockId]
          const isJS = codeBlockLang === 'javascript' || codeBlockLang === 'js'

          elements.push(
            <div key={blockId} style={{
              margin: '14px 0', borderRadius: 8, overflow: 'hidden',
              border: '1px solid var(--color-glass-border)', background: '#111318',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 12px', background: 'rgba(255,255,255,0.05)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-sakura)', fontFamily: 'var(--font-mono)' }}>
                  {codeBlockLang || 'code'}
                </span>

                <div style={{ display: 'flex', gap: 8 }}>
                  {isJS && (
                    <button
                      onClick={() => runCodeSnippet(blockId, codeString)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px',
                        borderRadius: 4, border: '1px solid var(--color-mint)',
                        background: 'rgba(74,222,128,0.12)', color: '#4ADE80',
                        fontSize: 10, fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      <Play size={10} /> Run JS
                    </button>
                  )}
                  <button
                    onClick={() => navigator.clipboard.writeText(codeString)}
                    style={{
                      background: 'transparent', border: 'none', color: 'var(--color-text-muted)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: 10,
                    }}
                    title="Copy code"
                  >
                    <Copy size={11} /> Copy
                  </button>
                </div>
              </div>

              <pre style={{
                margin: 0, padding: 12, overflowX: 'auto', fontSize: 12,
                fontFamily: 'var(--font-mono)', lineHeight: 1.5, color: '#E2E8F0',
              }}>
                {codeString}
              </pre>

              {output && (
                <div style={{
                  padding: '8px 12px', background: '#090B0E',
                  borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                    <Terminal size={11} /> Output Console:
                  </div>
                  {output.logs.map((l, i) => (
                    <div key={i} style={{ color: '#93C5FD' }}>{`> ${l}`}</div>
                  ))}
                  {output.result && (
                    <div style={{ color: '#86EFAC', marginTop: 2 }}>{`< ${output.result}`}</div>
                  )}
                  {output.error && (
                    <div style={{ color: '#F87171', marginTop: 2 }}>{`Error: ${output.error}`}</div>
                  )}
                </div>
              )}
            </div>
          )

          inCodeBlock = false
          codeBlockContent = []
          codeBlockLang = ''
          codeBlockIndex++
        } else {
          inCodeBlock = true
          codeBlockLang = line.trim().slice(3).trim()
        }
        return
      }

      if (inCodeBlock) {
        codeBlockContent.push(line)
        return
      }

     
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const row = line.trim().slice(1, -1).split('|').map(c => c.trim())
        if (!row.every(c => /^:?-+:?$/.test(c))) {
          tableRows.push(row)
          inTable = true
        }
        return
      } else if (inTable) {
        flushTable(`table-${idx}`)
      }

      if (line.startsWith('# ')) {
        elements.push(<h1 key={idx} style={{ fontSize: 22, fontWeight: 800, margin: '16px 0 8px', color: 'var(--color-text-primary)' }}>{formatInline(line.slice(2))}</h1>)
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={idx} style={{ fontSize: 18, fontWeight: 700, margin: '14px 0 6px', color: 'var(--color-text-primary)' }}>{formatInline(line.slice(3))}</h2>)
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={idx} style={{ fontSize: 15, fontWeight: 700, margin: '12px 0 4px', color: 'var(--color-text-primary)' }}>{formatInline(line.slice(4))}</h3>)
      } else if (line.startsWith('---')) {
        elements.push(<hr key={idx} style={{ border: 'none', height: 1, background: 'var(--color-glass-border)', margin: '16px 0' }} />)
      } else if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={idx} style={{
            margin: '10px 0', padding: '6px 12px', borderLeft: '3px solid var(--color-sakura)',
            background: 'rgba(232,130,155,0.06)', borderRadius: '0 6px 6px 0', fontStyle: 'italic',
          }}>
            {formatInline(line.slice(2))}
          </blockquote>
        )
      } else if (line.trim().startsWith('- [ ] ') || line.trim().startsWith('- [x] ')) {
        const checked = line.trim().startsWith('- [x] ')
        const text = line.trim().slice(6)
        elements.push(
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
            <input
              type="checkbox"
              checked={checked}
              readOnly
              style={{ accentColor: 'var(--color-sakura)', cursor: 'default' }}
            />
            <span style={{ textDecoration: checked ? 'line-through' : 'none', color: checked ? 'var(--color-text-muted)' : 'var(--color-text-primary)' }}>
              {formatInline(text)}
            </span>
          </div>
        )
      } else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        elements.push(
          <li key={idx} style={{ marginLeft: 20, margin: '3px 0' }}>
            {formatInline(line.trim().slice(2))}
          </li>
        )
      } else if (line.trim() === '') {
        elements.push(<div key={idx} style={{ height: 8 }} />)
      } else {
        elements.push(<p key={idx} style={{ margin: '4px 0', lineHeight: 1.6 }}>{formatInline(line)}</p>)
      }
    })

    if (inTable) flushTable('table-end')

    return elements
  }

  const formatInline = (text: string) => {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} style={{
            background: 'rgba(255,255,255,0.08)', padding: '2px 6px',
            borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--color-peach)',
          }}>
            {part.slice(1, -1)}
          </code>
        )
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i}>{part.slice(1, -1)}</em>
      }
      return part
    })
  }

  return (
    <div className="app-notes-pro" style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)',
      fontSize: 13, background: 'var(--color-bg-primary)',
    }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".md,.txt,.json"
        style={{ display: 'none' }}
      />

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 14px', borderBottom: '1px solid var(--color-glass-border)',
        background: 'var(--color-glass-card)', backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
              borderRadius: 6, border: '1px solid var(--color-border)',
              background: showSidebar ? 'var(--color-sakura)' : 'var(--color-bg-secondary)',
              color: showSidebar ? '#FFF' : 'var(--color-text-secondary)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}
            title="Toggle Notes Sidebar"
          >
            <Folder size={12} />
            <span>Docs</span>
          </button>

          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)' }}>
            {activeNote?.title || 'Notes Pro'}
          </span>

          {saved && (
            <span style={{
              fontSize: 10, color: '#4ADE80', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 3,
            }}>
              <Check size={11} /> Saved
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            display: 'flex', background: 'rgba(0,0,0,0.2)', padding: 2,
            borderRadius: 6, border: '1px solid var(--color-border)',
          }}>
            <button
              onClick={() => setViewMode('edit')}
              style={{
                padding: '4px 8px', borderRadius: 4, border: 'none',
                background: viewMode === 'edit' ? 'var(--color-sakura)' : 'transparent',
                color: viewMode === 'edit' ? '#FFF' : 'var(--color-text-secondary)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11,
              }}
              title="Editor Only"
            >
              <Edit3 size={12} /> Edit
            </button>
            <button
              onClick={() => setViewMode('split')}
              style={{
                padding: '4px 8px', borderRadius: 4, border: 'none',
                background: viewMode === 'split' ? 'var(--color-sakura)' : 'transparent',
                color: viewMode === 'split' ? '#FFF' : 'var(--color-text-secondary)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11,
              }}
              title="Split View"
            >
              <Columns size={12} /> Split
            </button>
            <button
              onClick={() => setViewMode('preview')}
              style={{
                padding: '4px 8px', borderRadius: 4, border: 'none',
                background: viewMode === 'preview' ? 'var(--color-sakura)' : 'transparent',
                color: viewMode === 'preview' ? '#FFF' : 'var(--color-text-secondary)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11,
              }}
              title="Preview Only"
            >
              <Eye size={12} /> View
            </button>
          </div>

          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => handleExport('md')}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
                borderRadius: 6, border: '1px solid var(--color-border)',
                background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}
              title="Download as .md file"
            >
              <Download size={11} /> .md
            </button>
            <button
              onClick={() => handleExport('txt')}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
                borderRadius: 6, border: '1px solid var(--color-border)',
                background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}
              title="Download as .txt file"
            >
              <Download size={11} /> .txt
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
                borderRadius: 6, border: '1px solid var(--color-border)',
                background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}
              title="Import file"
            >
              <Upload size={11} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {showSidebar && (
          <div style={{
            width: 180, borderRight: '1px solid var(--color-glass-border)',
            background: 'var(--color-glass-card)', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{
              padding: '10px 12px', borderBottom: '1px solid var(--color-border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                DOCUMENTS ({notes.length})
              </span>
              <button
                onClick={createNewNote}
                style={{
                  background: 'var(--color-sakura)', border: 'none', color: '#FFF',
                  width: 22, height: 22, borderRadius: 4, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}
                title="Create New Note"
              >
                <Plus size={13} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
              {notes.map(note => {
                const isActive = note.id === activeNoteId
                return (
                  <div
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    style={{
                      padding: '8px 10px', borderRadius: 6, marginBottom: 4, cursor: 'pointer',
                      background: isActive ? 'rgba(232,130,155,0.14)' : 'transparent',
                      border: isActive ? '1px solid rgba(232,130,155,0.3)' : '1px solid transparent',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}
                  >
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: isActive ? 700 : 500, fontSize: 12, color: isActive ? 'var(--color-sakura)' : 'var(--color-text-primary)' }}>
                        {note.title}
                      </div>
                    </div>

                    {notes.length > 1 && (
                      <button
                        onClick={e => deleteNote(note.id, e)}
                        style={{
                          background: 'transparent', border: 'none',
                          color: 'var(--color-text-muted)', cursor: 'pointer', opacity: 0.6,
                        }}
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {(viewMode === 'edit' || viewMode === 'split') && (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              borderRight: viewMode === 'split' ? '1px solid var(--color-glass-border)' : 'none',
              background: 'rgba(0,0,0,0.15)',
            }}>
              <textarea
                value={activeNote?.content || ''}
                onChange={e => updateActiveContent(e.target.value)}
                placeholder="Type markdown, code blocks, task lists..."
                spellCheck={false}
                style={{
                  flex: 1, width: '100%', height: '100%', padding: '16px 20px',
                  background: 'transparent', border: 'none', outline: 'none',
                  color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)',
                  fontSize: 13, lineHeight: 1.6, resize: 'none',
                }}
              />
            </div>
          )}

          {(viewMode === 'preview' || viewMode === 'split') && (
            <div style={{
              flex: 1, overflowY: 'auto', padding: '16px 24px',
              background: 'var(--color-bg-primary)',
            }}>
              {renderMarkdown(activeNote?.content || '')}
            </div>
          )}
        </div>
      </div>

      <div style={{
        padding: '6px 14px', borderTop: '1px solid var(--color-glass-border)',
        background: 'var(--color-glass-card)', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', fontSize: 11,
        color: 'var(--color-text-muted)',
      }}>
        <div style={{ display: 'flex', gap: 14 }}>
          <span>{words} words</span>
          <span>{chars} characters</span>
          <span>{linesCount} lines</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Code2 size={12} style={{ color: 'var(--color-sakura)' }} />
          <span>Markdown Pro & Sandbox</span>
        </div>
      </div>
    </div>
  )
}
