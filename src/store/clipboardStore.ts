import { create } from 'zustand'
import { useNotificationStore } from './desktopStore.ts'

export interface ClipboardItem {
  id: string
  text: string
  timestamp: number
  charCount: number
  lineCount: number
}

const STORAGE_KEY = 'syau_clipboard_history'
const MAX_ITEMS = 10

function loadStoredItems(): ClipboardItem[] {
  try {
    if (typeof localStorage === 'undefined') return []
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.slice(0, MAX_ITEMS)
    }
  } catch {}
  return []
}

function persistItems(items: ClipboardItem[]) {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)))
  } catch {}
}

interface ClipboardStore {
  items: ClipboardItem[]
  isOpen: boolean
  searchQuery: string
  copiedId: string | null

  addEntry: (text: string) => void
  removeEntry: (id: string) => void
  clearHistory: () => void
  setIsOpen: (open: boolean) => void
  toggleOpen: () => void
  setSearchQuery: (query: string) => void
  copyItem: (item: ClipboardItem) => Promise<boolean>
}

let isInternalCopy = false

export const useClipboardStore = create<ClipboardStore>((set, get) => ({
  items: loadStoredItems(),
  isOpen: false,
  searchQuery: '',
  copiedId: null,

  addEntry: (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    const lines = text.split('\n').length
    const chars = text.length

    set(state => {
      const existingFiltered = state.items.filter(item => item.text !== text)
      const newItem: ClipboardItem = {
        id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        text,
        timestamp: Date.now(),
        charCount: chars,
        lineCount: lines,
      }
      const updated = [newItem, ...existingFiltered].slice(0, MAX_ITEMS)
      persistItems(updated)
      return { items: updated }
    })
  },

  removeEntry: (id: string) => {
    set(state => {
      const updated = state.items.filter(item => item.id !== id)
      persistItems(updated)
      return { items: updated }
    })
  },

  clearHistory: () => {
    persistItems([])
    set({ items: [], searchQuery: '' })
    useNotificationStore.getState().add('Clipboard history cleared', 'trash', 2000)
  },

  setIsOpen: (open: boolean) => {
    set({ isOpen: open, searchQuery: open ? get().searchQuery : '' })
  },

  toggleOpen: () => {
    set(state => ({ isOpen: !state.isOpen, searchQuery: '' }))
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query })
  },

  copyItem: async (item: ClipboardItem) => {
    try {
      isInternalCopy = true
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(item.text)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = item.text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }

      set({ copiedId: item.id })
      useNotificationStore.getState().add('Copied to clipboard', 'check', 2000)

      setTimeout(() => {
        set(state => (state.copiedId === item.id ? { copiedId: null } : {}))
      }, 1500)

      setTimeout(() => {
        isInternalCopy = false
      }, 300)

      return true
    } catch {
      isInternalCopy = false
      useNotificationStore.getState().add('Failed to copy to clipboard', 'alert', 2500)
      return false
    }
  },
}))

export function initClipboardListener(): () => void {
  const handleCopyOrCut = () => {
    if (isInternalCopy) return

    setTimeout(() => {
      let copiedText = ''

      const activeEl = document.activeElement
      if (
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement
      ) {
        const start = activeEl.selectionStart ?? 0
        const end = activeEl.selectionEnd ?? 0
        if (end > start) {
          copiedText = activeEl.value.substring(start, end)
        }
      }

      if (!copiedText) {
        const selection = window.getSelection()
        if (selection && selection.toString()) {
          copiedText = selection.toString()
        }
      }

      if (copiedText && copiedText.trim()) {
        useClipboardStore.getState().addEntry(copiedText)
      }
    }, 20)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'V' || e.key === 'v')) {
      e.preventDefault()
      useClipboardStore.getState().toggleOpen()
    }
  }

  document.addEventListener('copy', handleCopyOrCut)
  document.addEventListener('cut', handleCopyOrCut)
  window.addEventListener('keydown', handleKeyDown)

  return () => {
    document.removeEventListener('copy', handleCopyOrCut)
    document.removeEventListener('cut', handleCopyOrCut)
    window.removeEventListener('keydown', handleKeyDown)
  }
}