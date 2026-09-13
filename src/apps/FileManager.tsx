import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Folder, File, FolderPlus, FilePlus, Edit3, FolderOpen, FileText
} from 'lucide-react'
import { useFileSystem } from '../store/fileSystem'
import type { FSNode } from '../store/fileSystem'

type ViewMode = 'grid' | 'list'

function formatSize(bytes: number): string {
  if (bytes === 0) return '--'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function FileManager() {
  const { loaded, load, getChildren, getNode, createFile, createFolder, rename, updateContent, getPath } = useFileSystem()
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [showCreate, setShowCreate] = useState(false)
  const [creatingType, setCreatingType] = useState<'file' | 'folder' | null>(null)
  const [newName, setNewName] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null)
  const [editingNode, setEditingNode] = useState<FSNode | null>(null)
  const [editorText, setEditorText] = useState('')
  const [editorDirty, setEditorDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const renameRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { if (!loaded) load() }, [loaded, load])
  useEffect(() => { if (creatingType && inputRef.current) inputRef.current.focus() }, [creatingType])
  useEffect(() => { if (renamingId && renameRef.current) { renameRef.current.focus(); renameRef.current.select() } }, [renamingId])

  const children = getChildren(currentFolder)
  const breadcrumbs: FSNode[] = []
  { let id: string | null = currentFolder; while (id) { const n = getNode(id); if (n) { breadcrumbs.unshift(n); id = n.parentId } else break } }

  const handleDoubleClick = (node: FSNode) => {
    if (node.type === 'folder') { setCurrentFolder(node.id); setSelected(null) }
    else { setEditingNode(node); setEditorText(node.content || ''); setEditorDirty(false) }
  }

  const handleSaveEditor = async () => {
    if (!editingNode) return
    setSaving(true)
    await updateContent(editingNode.id, editorText)
    setEditorDirty(false)
    setSaving(false)
    setEditingNode(prev => prev ? { ...prev, content: editorText } : null)
  }

  const handleCloseEditor = () => {
    if (editorDirty) {
      handleSaveEditor().then(() => setEditingNode(null))
    } else {
      setEditingNode(null)
    }
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    if (creatingType === 'folder') await createFolder(newName.trim(), currentFolder)
    else await createFile(newName.trim(), currentFolder)
    setCreatingType(null); setNewName('')
  }

  const handleRename = async (id: string) => {
    if (!renameValue.trim()) { setRenamingId(null); return }
    await rename(id, renameValue.trim())
    setRenamingId(null)
  }

  if (!loaded) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)', fontSize: 13, fontFamily: 'var(--font-sans)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, opacity: 0.5 }}>
          <FolderOpen size={28} />
        </div>
        Loading file system...
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', fontFamily: 'var(--font-sans)' }}
      onClick={() => { setContextMenu(null); setShowCreate(false) }}>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-window-header)',
      }}>
        <ToolbarBtn onClick={() => setCurrentFolder(null)} title="Home">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => { if (breadcrumbs.length > 0) setCurrentFolder(breadcrumbs[breadcrumbs.length - 1].parentId) }} title="Back" disabled={breadcrumbs.length === 0}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </ToolbarBtn>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 3, overflow: 'hidden', fontSize: 12, color: 'var(--color-text-secondary)' }}>
          <span style={{ cursor: 'pointer', opacity: currentFolder ? 0.6 : 1, fontWeight: 600 }} onClick={() => setCurrentFolder(null)}>Home</span>
          {breadcrumbs.map((b, i) => (
            <span key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ opacity: 0.3, fontSize: 10 }}>&#9656;</span>
              <span style={{ cursor: 'pointer', opacity: i === breadcrumbs.length - 1 ? 1 : 0.6, fontWeight: i === breadcrumbs.length - 1 ? 600 : 400 }}
                onClick={() => setCurrentFolder(b.id)}>{b.name}</span>
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 2 }}>
          <ToolbarBtn onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} title="Toggle view">
            {viewMode === 'grid' ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            )}
          </ToolbarBtn>
          <div style={{ position: 'relative' }}>
            <ToolbarBtn onClick={(e) => { e.stopPropagation(); setShowCreate(!showCreate) }} accent>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </ToolbarBtn>
            <AnimatePresence>
              {showCreate && (
                <motion.div initial={{ opacity: 0, y: -4, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: 6, zIndex: 50,
                    background: 'var(--color-window-bg)', border: '1px solid var(--color-border-active)',
                    borderRadius: 10, padding: 4, minWidth: 160,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 1px rgba(232,130,155,0.1)',
                  }} onClick={e => e.stopPropagation()}>
                  <DropdownItem icon={<FolderPlus size={14} style={{ color: '#FBBF24' }} />} label="New Folder" onClick={() => { setCreatingType('folder'); setShowCreate(false); setNewName('') }} />
                  <DropdownItem icon={<FilePlus size={14} style={{ color: '#60A5FA' }} />} label="New File" onClick={() => { setCreatingType('file'); setShowCreate(false); setNewName('') }} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {creatingType && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ padding: '8px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', opacity: 0.7 }}>
                {creatingType === 'folder' ? <Folder size={14} style={{ color: '#FBBF24' }} /> : <File size={14} style={{ color: '#60A5FA' }} />}
              </span>
              <input ref={inputRef} value={newName} onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setCreatingType(null); setNewName('') } }}
                placeholder={creatingType === 'folder' ? 'Folder name...' : 'File name...'}
                style={inputStyle} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ flex: 1, overflowY: 'auto', padding: viewMode === 'grid' ? 14 : '0 14px' }}>
        {children.length === 0 && !creatingType ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-muted)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, opacity: 0.4 }}>
              <FolderOpen size={36} />
            </div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Empty folder</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>Create a file or folder to get started</div>
          </div>
        ) : viewMode === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 6 }}>
            {children.map(node => (
              <motion.div key={node.id} layout
                onClick={e => { e.stopPropagation(); setSelected(node.id) }}
                onDoubleClick={() => handleDoubleClick(node)}
                onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id }) }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '14px 6px', borderRadius: 10, cursor: 'pointer',
                  background: selected === node.id ? 'rgba(147,197,253,0.1)' : 'transparent',
                  border: selected === node.id ? '1px solid rgba(147,197,253,0.25)' : '1px solid transparent',
                  transition: 'background 0.15s, border-color 0.15s',
                }}>
                {renamingId === node.id ? (
                  <input ref={renameRef} value={renameValue} onChange={e => setRenameValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleRename(node.id); if (e.key === 'Escape') setRenamingId(null) }}
                    onBlur={() => handleRename(node.id)}
                    style={{ ...inputStyle, width: 80, textAlign: 'center', fontSize: 11 }}
                    onClick={e => e.stopPropagation()} />
                ) : (
                  <>
                    <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {node.type === 'folder' ? (
                        <Folder size={32} style={{ color: '#FBBF24' }} />
                      ) : (
                        <FileText size={30} style={{ color: '#60A5FA' }} />
                      )}
                    </div>
                    <span style={{
                      fontSize: 11, color: 'var(--color-text-primary)', textAlign: 'center',
                      wordBreak: 'break-all', lineHeight: 1.3, maxHeight: 2.6, overflow: 'hidden',
                      fontWeight: selected === node.id ? 600 : 400,
                    }}>{node.name}</span>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {children.map(node => (
              <div key={node.id}
                onClick={e => { e.stopPropagation(); setSelected(node.id) }}
                onDoubleClick={() => handleDoubleClick(node)}
                onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id }) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '7px 8px',
                  borderRadius: 6, cursor: 'pointer',
                  background: selected === node.id ? 'rgba(147,197,253,0.1)' : 'transparent',
                  transition: 'background 0.1s',
                }}>
                {node.type === 'folder' ? (
                  <Folder size={16} style={{ color: '#FBBF24' }} />
                ) : (
                  <FileText size={16} style={{ color: '#60A5FA' }} />
                )}
                <span style={{ flex: 1, fontSize: 12, color: selected === node.id ? 'var(--color-sky)' : 'var(--color-text-primary)' }}>
                  {node.name}
                </span>
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {formatSize(node.size || 0)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{
        padding: '5px 14px', borderTop: '1px solid var(--color-border)',
        background: 'var(--color-window-header)',
        fontSize: 11, color: 'var(--color-text-muted)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span>{children.length} item{children.length !== 1 ? 's' : ''}</span>
        {selected && <span style={{ opacity: 0.7 }}>{getPath(selected)}</span>}
      </div>

      <AnimatePresence>
        {contextMenu && (() => {
          const node = getNode(contextMenu.nodeId)
          if (!node) return null
          return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              style={{
                position: 'fixed', left: contextMenu.x, top: contextMenu.y, zIndex: 1000,
                background: 'var(--color-window-bg)', border: '1px solid var(--color-border-active)',
                borderRadius: 10, padding: 4, minWidth: 170,
                boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 1px rgba(232,130,155,0.1)',
              }}>
              {node.type === 'folder' && (
                <DropdownItem icon={<FolderOpen size={14} style={{ color: '#FBBF24' }} />} label="Open" onClick={() => { setCurrentFolder(node.id); setContextMenu(null) }} />
              )}
              {node.type === 'file' && (
                <DropdownItem icon={<FileText size={14} style={{ color: '#60A5FA' }} />} label="Open" onClick={() => { setEditingNode(node); setEditorText(node.content || ''); setEditorDirty(false); setContextMenu(null) }} />
              )}
              <DropdownItem icon={<Edit3 size={14} style={{ color: 'var(--color-sakura)' }} />} label="Rename" onClick={() => { setRenamingId(node.id); setRenameValue(node.name); setContextMenu(null) }} />
            </motion.div>
          )
        })()}
      </AnimatePresence>

      <AnimatePresence>
        {editingNode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0, background: 'var(--color-window-bg)',
              display: 'flex', flexDirection: 'column', zIndex: 20,
            }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 14px', borderBottom: '1px solid var(--color-border)',
              background: 'var(--color-window-header)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{editingNode.name}</span>
                {editorDirty && <span style={{ fontSize: 10, color: 'var(--color-peach)', fontWeight: 600 }}>unsaved</span>}
                {saving && <span style={{ fontSize: 10, color: 'var(--color-miku)', fontWeight: 600 }}>saving...</span>}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {editorDirty && (
                  <button onClick={handleSaveEditor} style={{ ...pillBtn, background: 'rgba(147,197,253,0.15)', border: '1px solid rgba(147,197,253,0.3)', color: 'var(--color-sky)' }}>
                    Save
                  </button>
                )}
                <button onClick={handleCloseEditor} style={pillBtn}>Close</button>
              </div>
            </div>
            <textarea
              ref={textareaRef}
              value={editorText}
              onChange={e => { setEditorText(e.target.value); setEditorDirty(true) }}
              onKeyDown={e => {
                if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                  e.preventDefault()
                  handleSaveEditor()
                }
                if (e.key === 'Escape') handleCloseEditor()
                if (e.key === 'Tab') {
                  e.preventDefault()
                  const ta = e.currentTarget
                  const start = ta.selectionStart
                  const end = ta.selectionEnd
                  const val = ta.value
                  setEditorText(val.substring(0, start) + '  ' + val.substring(end))
                  setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 2 }, 0)
                }
              }}
              placeholder="Type content here..."
              spellCheck={false}
              style={{
                flex: 1, resize: 'none', padding: '16px 20px',
                background: 'transparent', border: 'none', outline: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: 13, lineHeight: 1.8,
                color: 'var(--color-text-primary)',
                caretColor: 'var(--color-sky)',
                tabSize: 2,
              }}
            />
            <div style={{
              padding: '5px 14px', borderTop: '1px solid var(--color-border)',
              background: 'var(--color-window-header)',
              fontSize: 10, color: 'var(--color-text-muted)',
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span>Ctrl+S to save</span>
              <span>{editorText.length} chars · {editorText.split('\n').length} lines</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const ToolbarBtn = ({ onClick, title, disabled, accent, children }: {
  onClick: (e: React.MouseEvent) => void; title?: string; disabled?: boolean; accent?: boolean; children: React.ReactNode
}) => (
  <button onClick={onClick} title={title} disabled={disabled} style={{
    background: 'transparent', border: 'none', borderRadius: 7,
    width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: accent ? 'var(--color-sky)' : disabled ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
    cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.3 : 1,
    transition: 'all 0.15s',
  }}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
  >{children}</button>
)

const DropdownItem = ({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
    padding: '7px 10px', border: 'none', borderRadius: 6,
    background: 'transparent', cursor: 'pointer', fontSize: 12,
    color: danger ? '#EF4444' : 'var(--color-text-primary)',
    textAlign: 'left', transition: 'background 0.1s', fontFamily: 'var(--font-sans)',
  }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
  >
    <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
    <span>{label}</span>
  </button>
)

const inputStyle: React.CSSProperties = {
  flex: 1, padding: '7px 10px', borderRadius: 8,
  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border-active)',
  color: 'var(--color-text-primary)', fontSize: 12, outline: 'none',
  fontFamily: 'var(--font-sans)',
}

const pillBtn: React.CSSProperties = {
  padding: '4px 12px', borderRadius: 8,
  background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)',
  color: 'var(--color-text-secondary)', fontSize: 11, cursor: 'pointer',
  fontFamily: 'var(--font-sans)', fontWeight: 500,
}
