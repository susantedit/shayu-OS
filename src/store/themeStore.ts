import { create } from 'zustand'

export type ThemeMode = 'dark' | 'light'

interface ThemeStore {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
}

const getInitialTheme = (): ThemeMode => {
  const saved = localStorage.getItem('syau-os-theme') as ThemeMode
  if (saved === 'dark' || saved === 'light') return saved
  return 'dark'
}

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: getInitialTheme(),
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
  }
}))
