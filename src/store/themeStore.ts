import { create } from 'zustand'

export type ThemeMode = 'dark' | 'light'

interface ThemeStore {
  mode: ThemeMode
  brightness: number
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
  setBrightness: (brightness: number) => void
}

const getInitialTheme = (): ThemeMode => {
  const saved = localStorage.getItem('syau-os-theme') as ThemeMode
  if (saved === 'dark' || saved === 'light') return saved
  return 'dark'
}

const getInitialBrightness = (): number => {
  const saved = localStorage.getItem('syau-os-brightness')
  if (saved) {
    const num = parseInt(saved, 10)
    if (!isNaN(num) && num >= 30 && num <= 150) return num
  }
  return 100
}

const initialBrightness = getInitialBrightness()
if (typeof document !== 'undefined') {
  document.documentElement.style.setProperty('--os-brightness', `${initialBrightness}%`)
}

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: getInitialTheme(),
  brightness: initialBrightness,
  setMode: (mode) => {
    localStorage.setItem('syau-os-theme', mode)
    document.documentElement.setAttribute('data-theme', mode)
    set({ mode })
  },
  toggleMode: () => {
    set(state => {
      const next = state.mode === 'dark' ? 'light' : 'dark'
      localStorage.setItem('syau-os-theme', next)
      document.documentElement.setAttribute('data-theme', next)
      return { mode: next }
    })
  },
  setBrightness: (brightness) => {
    const clamped = Math.max(30, Math.min(150, brightness))
    localStorage.setItem('syau-os-brightness', String(clamped))
    document.documentElement.style.setProperty('--os-brightness', `${clamped}%`)
    set({ brightness: clamped })
  }
}))

