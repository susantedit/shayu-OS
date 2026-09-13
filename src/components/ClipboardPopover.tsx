import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clipboard,
  Copy,
  Check,
  Trash2,
  X,
  Search,
  Clock,
  FileText,
  CornerDownLeft
} from 'lucide-react'
import { useClipboardStore } from '../store/clipboardStore'

function formatRelativeTime(timestamp: number): string {
  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))
  if (diffSeconds < 10) return 'Just now'
  if (diffSeconds < 60) return `${diffSeconds}s ago`
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

export default function ClipboardPopover() {
  const isOpen = useClipboardStore(s => s.isOpen)
  const setIsOpen = useClipboardStore(s => s.setIsOpen)
  const items = useClipboardStore(s => s.items)
  const searchQuery = useClipboardStore(s => s.searchQuery)
  const setSearchQuery = useClipboardStore(s => s.setSearchQuery)
  const copiedId = useClipboardStore(s => s.copiedId)
  const copyItem = useClipboardStore(s => s.copyItem)
  const removeEntry = useClipboardStore(s => s.removeEntry)
  const clearHistory = useClipboardStore(s => s.clearHistory)

  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement)?.closest?.('[data-clipboard-toggle]')
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    const timer = setTimeout(() => {
      searchInputRef.current?.focus()
    }, 120)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      clearTimeout(timer)
    }
  }, [isOpen, setIsOpen])

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items
    const query = searchQuery.toLowerCase()
    return items.filter(item => item.text.toLowerCase().includes(query))
  }, [items, searchQuery])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: -10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            top: 38,
            right: 14,
            width: 360,
            maxWidth: 'calc(100vw - 28px)',
            maxHeight: 'min(580px, calc(100vh - 54px))',
            zIndex: 9998,
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(160deg, rgba(24, 18, 28, 0.96) 0%, rgba(14, 10, 18, 0.98) 100%)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            borderRadius: 14,
            border: '1px solid rgba(232, 130, 155, 0.28)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), 0 0 1px rgba(255, 255, 255, 0.15) inset',
            color: 'var(--color-text-primary)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(255, 255, 255, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: 'rgba(232, 130, 155, 0.15)',
                  color: 'var(--color-sakura)',
                }}
              >
                <Clipboard size={14} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.01em' }}>
                Clipboard History
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-sakura)',
                  background: 'rgba(232, 130, 155, 0.12)',
                  padding: '1px 6px',
                  borderRadius: 999,
                  border: '1px solid rgba(232, 130, 155, 0.2)',
                }}
              >
                {items.length}/10
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearHistory}
                  title="Clear all history"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '3px 8px',
                    borderRadius: 6,
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#F87171',
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                  }}
                >
                  <Trash2 size={12} />
                  <span>Clear</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close (Esc)"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                  e.currentTarget.style.color = 'var(--color-text-primary)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--color-text-secondary)'
                }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Search Box */}
          {items.length > 0 && (
            <div
              style={{
                padding: '8px 12px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Search
                  size={13}
                  style={{
                    position: 'absolute',
                    left: 10,
                    color: 'var(--color-text-secondary)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter snippets..."
                  style={{
                    width: '100%',
                    height: 28,
                    paddingLeft: 30,
                    paddingRight: searchQuery ? 28 : 10,
                    borderRadius: 6,
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    background: 'rgba(0, 0, 0, 0.25)',
                    color: 'var(--color-text-primary)',
                    fontSize: 12,
                    outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'var(--color-sakura)'
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: 6,
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      padding: 2,
                    }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* List Area */}
          <div
            style={{
              padding: '8px 10px',
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {items.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '36px 16px',
                  textAlign: 'center',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'rgba(232, 130, 155, 0.1)',
                    border: '1px solid rgba(232, 130, 155, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-sakura)',
                  }}
                >
                  <Clipboard size={22} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Clipboard is empty
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--color-text-secondary)',
                    maxWidth: 240,
                    lineHeight: 1.4,
                  }}
                >
                  Copy any text in स्याउ OS with Ctrl+C to store up to 10 history items.
                </div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '28px 16px',
                  textAlign: 'center',
                  gap: 8,
                }}
              >
                <Search size={20} style={{ color: 'var(--color-text-muted)' }} />
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  No snippets match &quot;{searchQuery}&quot;
                </span>
              </div>
            ) : (
              filteredItems.map(item => {
                const isCopied = copiedId === item.id
                const isHovered = hoveredId === item.id

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => copyItem(item)}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      padding: '8px 10px',
                      borderRadius: 8,
                      background: isHovered
                        ? 'rgba(232, 130, 155, 0.12)'
                        : 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid ' + (isHovered ? 'rgba(232, 130, 155, 0.35)' : 'rgba(255, 255, 255, 0.08)'),
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isHovered ? '0 4px 12px rgba(0, 0, 0, 0.3)' : 'none',
                    }}
                  >
                    {/* Text Preview */}
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        lineHeight: 1.45,
                        color: isHovered ? '#FFFFFF' : 'var(--color-text-primary)',
                        maxHeight: 52,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {item.text}
                    </div>

                    {/* Metadata & Actions */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 2,
                        fontSize: 10,
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Clock size={10} style={{ opacity: 0.7 }} />
                          {formatRelativeTime(item.timestamp)}
                        </span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <FileText size={10} style={{ opacity: 0.7 }} />
                          {item.charCount} chars
                          {item.lineCount > 1 ? ` (${item.lineCount} lines)` : ''}
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => copyItem(item)}
                          title="Copy to clipboard"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            padding: '2px 6px',
                            borderRadius: 4,
                            border: '1px solid ' + (isCopied ? 'rgba(74, 222, 128, 0.4)' : 'rgba(255, 255, 255, 0.15)'),
                            background: isCopied ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            color: isCopied ? '#4ADE80' : 'var(--color-text-secondary)',
                            fontSize: 10,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {isCopied ? (
                            <>
                              <Check size={11} />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => removeEntry(item.id)}
                          title="Remove item"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 20,
                            height: 20,
                            borderRadius: 4,
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--color-text-muted)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.color = '#F87171'
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.color = 'var(--color-text-muted)'
                            e.currentTarget.style.background = 'transparent'
                          }}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>

          {/* Footer Guide */}
          <div
            style={{
              padding: '6px 12px',
              background: 'rgba(0, 0, 0, 0.35)',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 10,
              color: 'var(--color-text-secondary)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <CornerDownLeft size={10} style={{ color: 'var(--color-sakura)' }} />
              Click snippet to re-copy
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: 'var(--color-text-muted)',
              }}
            >
              Ctrl+Shift+V
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}