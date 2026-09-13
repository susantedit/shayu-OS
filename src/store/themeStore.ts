import { create } from 'zustand'

export type ThemeMode = 'dark' | 'light'
export type AccentMode = 'preset' | 'custom'
export type DockPosition = 'bottom' | 'left' | 'right'
export type DockSize = 'compact' | 'default' | 'large'

export interface CustomThemeConfig {
  accentMode: AccentMode
  customAccentPrimary: string
  customAccentDark: string
  windowBlur: number
  windowOpacity: number
  dockPosition: DockPosition
  dockSize: DockSize
  customWallpaper: string | null
  wallpaperBlur: number
  wallpaperDim: number
}

interface ThemeStore extends CustomThemeConfig {
  mode: ThemeMode
  brightness: number
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
  setBrightness: (brightness: number) => void
  setCustomAccent: (primary: string, dark?: string) => void
  setWindowOptics: (blur: number, opacity: number) => void
  setDockConfig: (position: DockPosition, size: DockSize) => void
  setCustomWallpaper: (urlOrDataUri: string | null) => void
  setWallpaperEffects: (blur: number, dim: number) => void
  exportThemeJSON: () => string
  importThemeJSON: (jsonString: string) => boolean
  resetThemeDefaults: () => void
}

const DEFAULT_THEME_CONFIG: CustomThemeConfig = {
  accentMode: 'preset',
  customAccentPrimary: '#E8829B',
  customAccentDark: '#C45A7C',
  windowBlur: 18,
  windowOpacity: 88,
  dockPosition: 'bottom',
  dockSize: 'default',
  customWallpaper: null,
  wallpaperBlur: 0,
  wallpaperDim: 30,
}

export function darkenHex(hex: string, percent = 22): string {
  const clean = hex.replace('#', '')
  if (clean.length !== 6 && clean.length !== 3) return hex
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean
  const num = parseInt(full, 16)
  if (isNaN(num)) return hex
  const r = Math.max(0, Math.min(255, Math.round(((num >> 16) & 255) * (1 - percent / 100))))
  const g = Math.max(0, Math.min(255, Math.round(((num >> 8) & 255) * (1 - percent / 100))))
  const b = Math.max(0, Math.min(255, Math.round((num & 255) * (1 - percent / 100))))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`
}

export function applyThemeToDOM(config: Partial<CustomThemeConfig>, mode: ThemeMode = 'dark') {
  if (typeof document === 'undefined') return
  const root = document.documentElement

  if (config.customAccentPrimary) {
    root.style.setProperty('--color-sakura', config.customAccentPrimary)
    const dark = config.customAccentDark || darkenHex(config.customAccentPrimary)
    root.style.setProperty('--color-sakura-deep', dark)
  }

  if (typeof config.windowBlur === 'number') {
    root.style.setProperty('--os-window-blur', `${config.windowBlur}px`)
  }

  if (typeof config.windowOpacity === 'number') {
    const alpha = (config.windowOpacity / 100).toFixed(2)
    root.style.setProperty('--os-window-opacity', alpha)
    if (mode === 'dark') {
      root.style.setProperty('--color-window-bg', `rgba(20, 15, 22, ${alpha})`)
      root.style.setProperty('--color-window-header', `rgba(26, 19, 32, ${Math.min(1, Number(alpha) + 0.07).toFixed(2)})`)
    } else {
      root.style.setProperty('--color-window-bg', `rgba(255, 255, 255, ${alpha})`)
      root.style.setProperty('--color-window-header', `rgba(243, 245, 250, ${Math.min(1, Number(alpha) + 0.05).toFixed(2)})`)
    }
  }

  if (typeof config.wallpaperBlur === 'number') {
    root.style.setProperty('--os-wallpaper-blur', `${config.wallpaperBlur}px`)
  }

  if (typeof config.wallpaperDim === 'number') {
    root.style.setProperty('--os-wallpaper-dim', `${(config.wallpaperDim / 100).toFixed(2)}`)
  }

  if (config.dockPosition) {
    root.setAttribute('data-dock-position', config.dockPosition)
  }

  if (config.dockSize) {
    root.setAttribute('data-dock-size', config.dockSize)
  }
}

const getSafeStorage = (key: string): string | null => {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key)
    }
  } catch {}
  return null
}

const setSafeStorage = (key: string, val: string) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, val)
    }
  } catch {}
}

const loadStoredConfig = (): CustomThemeConfig => {
  const saved = getSafeStorage('syau-os-custom-theme')
  if (!saved) return { ...DEFAULT_THEME_CONFIG }
  try {
    const parsed = JSON.parse(saved)
    return {
      accentMode: parsed.accentMode === 'custom' ? 'custom' : 'preset',
      customAccentPrimary: typeof parsed.customAccentPrimary === 'string' ? parsed.customAccentPrimary : DEFAULT_THEME_CONFIG.customAccentPrimary,
      customAccentDark: typeof parsed.customAccentDark === 'string' ? parsed.customAccentDark : DEFAULT_THEME_CONFIG.customAccentDark,
      windowBlur: typeof parsed.windowBlur === 'number' ? Math.max(0, Math.min(40, parsed.windowBlur)) : DEFAULT_THEME_CONFIG.windowBlur,
      windowOpacity: typeof parsed.windowOpacity === 'number' ? Math.max(40, Math.min(100, parsed.windowOpacity)) : DEFAULT_THEME_CONFIG.windowOpacity,
      dockPosition: ['bottom', 'left', 'right'].includes(parsed.dockPosition) ? parsed.dockPosition : 'bottom',
      dockSize: ['compact', 'default', 'large'].includes(parsed.dockSize) ? parsed.dockSize : 'default',
      customWallpaper: typeof parsed.customWallpaper === 'string' ? parsed.customWallpaper : null,
      wallpaperBlur: typeof parsed.wallpaperBlur === 'number' ? Math.max(0, Math.min(20, parsed.wallpaperBlur)) : 0,
      wallpaperDim: typeof parsed.wallpaperDim === 'number' ? Math.max(0, Math.min(80, parsed.wallpaperDim)) : 30,
    }
  } catch {
    return { ...DEFAULT_THEME_CONFIG }
  }
}

const getInitialTheme = (): ThemeMode => {
  const saved = getSafeStorage('syau-os-theme') as ThemeMode
  if (saved === 'dark' || saved === 'light') return saved
  return 'dark'
}

const getInitialBrightness = (): number => {
  const saved = getSafeStorage('syau-os-brightness')
  if (saved) {
    const num = parseInt(saved, 10)
    if (!isNaN(num) && num >= 30 && num <= 150) return num
  }
  return 100
}

const initialConfig = loadStoredConfig()
const initialBrightness = getInitialBrightness()
const initialMode = getInitialTheme()

if (typeof document !== 'undefined') {
  document.documentElement.style.setProperty('--os-brightness', `${initialBrightness}%`)
  applyThemeToDOM(initialConfig, initialMode)
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  mode: initialMode,
  brightness: initialBrightness,
  ...initialConfig,

  setMode: (mode) => {
    setSafeStorage('syau-os-theme', mode)
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', mode)
    }
    applyThemeToDOM(get(), mode)
    set({ mode })
  },

  toggleMode: () => {
    const next = get().mode === 'dark' ? 'light' : 'dark'
    get().setMode(next)
  },

  setBrightness: (brightness) => {
    const clamped = Math.max(30, Math.min(150, brightness))
    setSafeStorage('syau-os-brightness', String(clamped))
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--os-brightness', `${clamped}%`)
    }
    set({ brightness: clamped })
  },

  setCustomAccent: (primary, dark) => {
    const computedDark = dark || darkenHex(primary)
    const update = {
      accentMode: 'custom' as AccentMode,
      customAccentPrimary: primary,
      customAccentDark: computedDark,
    }
    set(update)
    const nextState = { ...get(), ...update }
    setSafeStorage('syau-os-custom-theme', JSON.stringify(nextState))
    applyThemeToDOM(nextState, get().mode)
  },

  setWindowOptics: (blur, opacity) => {
    const clampedBlur = Math.max(0, Math.min(40, blur))
    const clampedOpacity = Math.max(40, Math.min(100, opacity))
    const update = {
      windowBlur: clampedBlur,
      windowOpacity: clampedOpacity,
    }
    set(update)
    const nextState = { ...get(), ...update }
    setSafeStorage('syau-os-custom-theme', JSON.stringify(nextState))
    applyThemeToDOM(nextState, get().mode)
  },

  setDockConfig: (dockPosition, dockSize) => {
    const update = { dockPosition, dockSize }
    set(update)
    const nextState = { ...get(), ...update }
    setSafeStorage('syau-os-custom-theme', JSON.stringify(nextState))
    applyThemeToDOM(nextState, get().mode)
  },

  setCustomWallpaper: (urlOrDataUri) => {
    const update = { customWallpaper: urlOrDataUri }
    set(update)
    const nextState = { ...get(), ...update }
    setSafeStorage('syau-os-custom-theme', JSON.stringify(nextState))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('syau-os-bg-change', {
        detail: { mode: urlOrDataUri ? 'custom' : 'dark', customWallpaper: urlOrDataUri }
      }))
    }
  },

  setWallpaperEffects: (blur, dim) => {
    const clampedBlur = Math.max(0, Math.min(20, blur))
    const clampedDim = Math.max(0, Math.min(80, dim))
    const update = { wallpaperBlur: clampedBlur, wallpaperDim: clampedDim }
    set(update)
    const nextState = { ...get(), ...update }
    setSafeStorage('syau-os-custom-theme', JSON.stringify(nextState))
    applyThemeToDOM(nextState, get().mode)
  },

  exportThemeJSON: () => {
    const current = get()
    const payload = {
      version: 1,
      appName: 'SyauOS Theme',
      exportedAt: new Date().toISOString(),
      theme: {
        accentMode: current.accentMode,
        customAccentPrimary: current.customAccentPrimary,
        customAccentDark: current.customAccentDark,
        windowBlur: current.windowBlur,
        windowOpacity: current.windowOpacity,
        dockPosition: current.dockPosition,
        dockSize: current.dockSize,
        wallpaperBlur: current.wallpaperBlur,
        wallpaperDim: current.wallpaperDim,
      }
    }
    return JSON.stringify(payload, null, 2)
  },

  importThemeJSON: (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString)
      const theme = data.theme || data
      if (!theme || typeof theme !== 'object') return false

      const primary = typeof theme.customAccentPrimary === 'string' ? theme.customAccentPrimary : get().customAccentPrimary
      const dark = typeof theme.customAccentDark === 'string' ? theme.customAccentDark : darkenHex(primary)
      const blur = typeof theme.windowBlur === 'number' ? Math.max(0, Math.min(40, theme.windowBlur)) : get().windowBlur
      const opacity = typeof theme.windowOpacity === 'number' ? Math.max(40, Math.min(100, theme.windowOpacity)) : get().windowOpacity
      const dockPosition = ['bottom', 'left', 'right'].includes(theme.dockPosition) ? theme.dockPosition : get().dockPosition
      const dockSize = ['compact', 'default', 'large'].includes(theme.dockSize) ? theme.dockSize : get().dockSize
      const wallpaperBlur = typeof theme.wallpaperBlur === 'number' ? Math.max(0, Math.min(20, theme.wallpaperBlur)) : get().wallpaperBlur
      const wallpaperDim = typeof theme.wallpaperDim === 'number' ? Math.max(0, Math.min(80, theme.wallpaperDim)) : get().wallpaperDim

      const updated: CustomThemeConfig = {
        accentMode: 'custom',
        customAccentPrimary: primary,
        customAccentDark: dark,
        windowBlur: blur,
        windowOpacity: opacity,
        dockPosition,
        dockSize,
        customWallpaper: get().customWallpaper,
        wallpaperBlur,
        wallpaperDim,
      }

      set(updated)
      setSafeStorage('syau-os-custom-theme', JSON.stringify({ ...get(), ...updated }))
      applyThemeToDOM(updated, get().mode)
      return true
    } catch {
      return false
    }
  },

  resetThemeDefaults: () => {
    set(DEFAULT_THEME_CONFIG)
    setSafeStorage('syau-os-custom-theme', JSON.stringify({ ...get(), ...DEFAULT_THEME_CONFIG }))
    applyThemeToDOM(DEFAULT_THEME_CONFIG, get().mode)
  }
}))
