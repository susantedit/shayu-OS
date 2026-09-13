import { create } from 'zustand'

export type CursorTheme = 'sukuna' | 'demonslayer' | 'system'
export type CursorSize = 'small' | 'medium' | 'large' | 'xlarge'

export interface CursorState {
  defaultCursor: CursorTheme
  pointerCursor: CursorTheme
  scale: number
  size: CursorSize
  setDefaultCursor: (theme: CursorTheme) => void
  setPointerCursor: (theme: CursorTheme) => void
  setScale: (scale: number) => void
  setSize: (size: CursorSize) => void
  setPreset: (defaultTheme: CursorTheme, pointerTheme: CursorTheme) => void
  resetToDefault: () => void
}

const SUKUNA_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAC/VBMVEUAAAAjFBUgFRYEAQIFAwMSDAwCAAAEAgIcDA0CAAALBAUCAQERCgsjFBUHBgYKBgYPCwsEAgIMCAgKBAQTCgsFAgICAQIIBAQFAQEJBQYXERERDg4TBwgGBQUKBQY3JykWCAkwFBcsJSUfFhcgCw1gRUgTDg8gEhMSBAUtEBMpERMdERI5HiFKHSIAAADuzrnvz7ruzbjuzrfuz7oCAgLsy7bsybTwzbjuy7YIAgISBAX11L7w0LsbBgkhBgny0LoNAwT/79j+2sTpw7AXBAb/3sfctaXqxrIuJST/4cr62sPlwa4vBwwkIB8oCg7//eX/6NH51b/y073guKjNo5cgGxocFxf/9t7/69P/5MzCj4iPHjY5ChEMCwv/89v418DwzrlADRYHCAj/5c/xzrnWsKI4KioWExNFCRE1CA0oBQndrqDjvaureHP/+eHWq53WpJqUIDlwFSfzzbjyy7XElY28hYGyfnphSUf91cHgsqaWa2iEGzE5MjDLuKjRqZyYhnydbmp0aWKEYF1xVFJXQD5AOjZ/GS5hER9SDBj//+rwxrbVvq3Gm5GkiH6LfnWkd3OZd3OGeHCRdW6JZ2RaRkSwJEGIHTMxLSxVDx0SDxD20LrpvK3evKq+q53LnpOum46lk4eqgHuBcWp6cGhlW1ZOPTtnEiI8GSEzFRtOCxbbxbXFr6C7koijcm2Lb2uJWFlkVVBaU01nTUpOSESgJD2kID2cIDlINTXXt6e8mo+dkIXfeoOTgXdsT09HQz9FLC9LERzp0b760rzixbPuvq/ntai2kYiwkYesiICggXiTZmJvWlZ7WFVSNDd4FypcESAnFxlaDhn54s76yLrLsaHUm5S3ioOxioPLd3zBdnrCZGymZGh+ZmJ6X11yYFvBKEfgz77kyriyoZTDn5PBiIW3WWKPX11hOz5IHiXt3Mf5wbO4pZjPlI7QiIjQgYS1b3KuU13RK0z///yWSlJ5S0+/ppjflZXPbnR0REZsLjT5ravylZipR1KEKDiYjBVFAAAALnRSTlMACA/mkizuuCb1b8A0F6aeRMqBYjzW3NOvV0wfwoV4QeF9Ym64N7GP9KLOrVCTpJWPOwAAAUBJREFUeJxjYMAPOPTwSOrpmeDTa4lPbwwjTimrmVaMDFZYpUwYfIqyNHkUsUpm2UbX6EXbYTdYVOZ84crtNX447JTZFnvnUwYOSdvtv55tsMQh6aLY8S6Kk6e3kn0WVvm0gpN6kXp6enonwzAlBZ7muOrl6U+1Xt3HginLrrfw4RMjf0ev/VVYgrJJPz4i3nuTtbP3HExJPcMjFp678p2CAzxRxLmkhRgYJFMDnI+b51QZx/ejRCCz3+3fPAx65gGOBimr9Y30+lDNzD1WqRdrqN+1ySih7tCmAlRJpQo956mm+sZ6W74VlziGoPtTz0JfX9/ANCKvyajBTADdtbnOxgbGBgYG9voGphvRJZn0yp5bRxoaGBjoP9YTxeLVstwoU0OzWr352NMbd2663sI8XGlRL/eKHjcOOQYGlAQOAPxrVIobgI+2AAAAAElFTkSuQmCC'

const DEMONSLAYER_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAC/VBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8AAAD7+/sCAgPw8PC2trbU1NX//firq6sJCQjY2Ne7u7pycnJmZWVPT0/R0dC+vr4QEA/NzczCwsL09PSzsrKdnZ08PD339/fj4+LFxcWLiolZWlp+f37t7e3p6upLSkpGRkbJycl2dnZVVVUbGxxZ0eve39+vr6+ko6MrKiugoKBk6f5f2fGRkZGCgoHb29unp6eNjY43Nzfl5eWVlZWFhYZhXVwhISBwbm1ra2pgYmNDQUEwMDAfgL8mJSVs+/8/i5yZmZh7e3tk8/9f4fn/9/D86OEFPm0BBSJFz+zo5+fn3tkYb4I91PUineARhc0vpb5BpbkYeLI+m64JX5QtYnMGMmEBEEc3ss2gs7oUFxd0l6k7fItBaXxAXmZQ6/8fi84vlMgFeMMmlbHDtK8ejKa8rKQrhZhFcpKsj4YWSlsFJFQAARA0xeZSy+RNvNPOwbsebZ5Wj5mun5gpZIsGU4ofOUsABTJN3/z+8Okwu9jk0c3Z0My1xsanvMbjyb9QrL7GvLecpqwBYaaTn6OzqKJbf46Re3UfW2tibWrw/fxU2vbr+fOfx9ggk9fH0dWzzNVOssjRxcIFbrZWn6xuj5oRfpZ8i5QAQX8SUXgCHjoFHCxZ/P9jt8lvrb8Iaquchn8FL0aSs8HZu7Jzo7CFcWlzX1oH+xn26ujy491FxN1Ap9chsNOEoK2FmZ5tg4tWeYEpT1g0PlBfT0pMwemOy+Z5xtYfocJZkbU9jaybkI9yfIRpc3pQZnBAVFseOzfT8/yDtr7NsaaimphecHweLT8aISkH4RQhrO/B3+702dGRvcp/tIZno3BFMCwPqSCn+vpus90EiQik1/bY+t3P5NKp2KwebiwARgCB8Pmt3d2M9ce9k4ossU4KxCEAYQBk/5AwmkoXyj4d+ziMh/BoAAAAGnRSTlMA+jqXLRfsc6N9vmj0xkQO47YhrdHYXotQB3HwnZkAAAGKSURBVHicdZLdK4NRHMd/s8jkrdWU79nsSWuMUWg2Iual7WmEkhipJRJJeZlQoqYlL5tCUUYuFuVCUZQL5YYW5YoLFy5c+APcuNRT03OyPd+bU+fb59P5nXOIuLRYSTHFw2ppYQkF1ETMAHcXUXdCaUA2sRJUg1KL5V0WX7sgxYx8xmlToKEsohIANVL9iAxVn4yCEaPcSjOYxzKyAqRVl3JigJnzKyTMDr3AOpszucPkwQ60Ad4tvLtrYniGPLkbWJcwfzS6fGvRG48EpwyqYRI6EETTDs5nAq0H10UGTpsD9EK4EgbNKA/C0S7W8TeQDuDDBuPAvXN6rr/nh7sGItKiEA5fDN+nN6NefPFaUTsLYOFuHntrEVdo15r7z1pZgM+3wLQf+1iSJ4lHVVW6hKthYxieMpH+R4dNXygcuTybTACl6MYsr4sTGLdRsjDxMDgy9ZKUJEKRa3VoVKEkPLlOLpJrpcfzNh4nHvYPtW13Kmk1MAGCEukMPWzUK5ViVa2SlUjbwH/4X3u+VKrdn829AAAAAElFTkSuQmCC'

const sizeToScale = (size: CursorSize): number => {
  switch (size) {
    case 'small': return 50
    case 'medium': return 100
    case 'large': return 150
    case 'xlarge': return 200
    default: return 100
  }
}

const scaleToSize = (scale: number): CursorSize => {
  if (scale <= 65) return 'small'
  if (scale <= 115) return 'medium'
  if (scale <= 165) return 'large'
  return 'xlarge'
}

interface SvgCursorResult {
  url: string
  hx: number
  hy: number
}

const getCursorSvgDataUrl = (
  theme: CursorTheme,
  type: 'cursor' | 'pointer',
  scale: number
): SvgCursorResult => {
  const clampedScale = Math.max(20, Math.min(200, scale))
  const size = Math.max(10, Math.min(128, Math.round(32 * (clampedScale / 100))))

  if (theme === 'system') {
    if (type === 'pointer') {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24"><path d="M9 2v10H7.5A2.5 2.5 0 0 0 5 14.5v2.5a7 7 0 0 0 7 7h3a7 7 0 0 0 7-7v-4.5a2 2 0 0 0-2-2h-1.5v-1.5a2 2 0 0 0-2-2H15v-1.5a2 2 0 0 0-2-2h-1.5V2a1.5 1.5 0 0 0-3 0z" fill="#18181c" stroke="#FFFFFF" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/><path d="M12.5 7v6M15 8.5v4.5M17.5 10v3" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round"/></svg>`
      const hx = Math.max(1, Math.round(size * (9 / 24)))
      const hy = Math.max(1, Math.round(size * (2 / 24)))
      return { url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, hx, hy }
    } else {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24"><path d="M3 2L18.5 14L11.5 14.8L15.8 22L12.5 23.5L8.2 16.2L3 21V2Z" fill="#18181c" stroke="#FFFFFF" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></svg>`
      const hx = Math.max(1, Math.round(size * (3 / 24)))
      const hy = Math.max(1, Math.round(size * (2 / 24)))
      return { url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, hx, hy }
    }
  }

  const b64 = theme === 'demonslayer' ? DEMONSLAYER_BASE64 : SUKUNA_BASE64
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 28 28"><image href="data:image/png;base64,${b64}" width="28" height="28" style="image-rendering:pixelated;"/></svg>`
  const hx = Math.max(1, Math.round(size * (2 / 28)))
  const hy = Math.max(1, Math.round(size * (2 / 28)))
  return { url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, hx, hy }
}

export const applyCursorStyles = (defaultCursor: CursorTheme, pointerCursor: CursorTheme, scale: number) => {
  if (typeof document === 'undefined') return

  let styleEl = document.getElementById('syau-cursor-styles') as HTMLStyleElement | null
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = 'syau-cursor-styles'
    document.head.appendChild(styleEl)
  }

  const defObj = getCursorSvgDataUrl(defaultCursor, 'cursor', scale)
  const ptrObj = getCursorSvgDataUrl(pointerCursor, 'pointer', scale)

  styleEl.innerHTML = `
    html, body, #root {
      cursor: url("${defObj.url}") ${defObj.hx} ${defObj.hy}, auto !important;
    }
    *, *::before, *::after {
      cursor: inherit;
    }
    button, button *,
    a, a *,
    .dock-item, .dock-item *,
    .dock-container,
    .dock-icon-wrapper, .dock-icon-wrapper *,
    .desktop-icon, .desktop-icon *,
    .window-header-btn, .window-header-btn *,
    .topbar-item, .topbar-item *,
    .traffic-light, .traffic-light *,
    .cursor-pointer, .cursor-pointer *,
    [data-clickable], [data-clickable] *,
    [role="button"], [role="button"] *,
    [role="tab"], [role="tab"] *,
    [role="menuitem"], [role="menuitem"] *,
    select, summary, label,
    [style*="cursor: pointer"], [style*="cursor: pointer"] *,
    [style*="cursor:pointer"], [style*="cursor:pointer"] *,
    [onclick], [onclick] * {
      cursor: url("${ptrObj.url}") ${ptrObj.hx} ${ptrObj.hy}, pointer !important;
    }
    input[type="text"], input[type="password"], input[type="email"],
    input[type="search"], input[type="number"], textarea, [contenteditable="true"] {
      cursor: text !important;
    }
  `
}

const getInitialConfig = () => {
  const savedDefault = (localStorage.getItem('syau-cursor-default') as CursorTheme) || 'sukuna'
  const savedPointer = (localStorage.getItem('syau-cursor-pointer') as CursorTheme) || 'demonslayer'
  const savedScaleStr = localStorage.getItem('syau-cursor-scale')
  let scale = 100
  if (savedScaleStr) {
    scale = Math.max(20, Math.min(200, parseInt(savedScaleStr, 10) || 100))
  } else {
    const savedSize = localStorage.getItem('syau-cursor-size') as CursorSize
    if (savedSize) {
      scale = sizeToScale(savedSize)
    }
  }

  return { defaultCursor: savedDefault, pointerCursor: savedPointer, scale, size: scaleToSize(scale) }
}

const initial = getInitialConfig()
if (typeof document !== 'undefined') {
  applyCursorStyles(initial.defaultCursor, initial.pointerCursor, initial.scale)
}

export const useCursorStore = create<CursorState>((set, get) => ({
  defaultCursor: initial.defaultCursor,
  pointerCursor: initial.pointerCursor,
  scale: initial.scale,
  size: initial.size,

  setDefaultCursor: (theme) => {
    localStorage.setItem('syau-cursor-default', theme)
    set({ defaultCursor: theme })
    const { pointerCursor, scale } = get()
    applyCursorStyles(theme, pointerCursor, scale)
  },

  setPointerCursor: (theme) => {
    localStorage.setItem('syau-cursor-pointer', theme)
    set({ pointerCursor: theme })
    const { defaultCursor, scale } = get()
    applyCursorStyles(defaultCursor, theme, scale)
  },

  setScale: (scale) => {
    const clamped = Math.max(20, Math.min(200, Math.round(scale)))
    localStorage.setItem('syau-cursor-scale', clamped.toString())
    localStorage.setItem('syau-cursor-size', scaleToSize(clamped))
    set({ scale: clamped, size: scaleToSize(clamped) })
    const { defaultCursor, pointerCursor } = get()
    applyCursorStyles(defaultCursor, pointerCursor, clamped)
  },

  setSize: (size) => {
    const scale = sizeToScale(size)
    localStorage.setItem('syau-cursor-scale', scale.toString())
    localStorage.setItem('syau-cursor-size', size)
    set({ scale, size })
    const { defaultCursor, pointerCursor } = get()
    applyCursorStyles(defaultCursor, pointerCursor, scale)
  },

  setPreset: (defaultTheme, pointerTheme) => {
    localStorage.setItem('syau-cursor-default', defaultTheme)
    localStorage.setItem('syau-cursor-pointer', pointerTheme)
    set({ defaultCursor: defaultTheme, pointerCursor: pointerTheme })
    const { scale } = get()
    applyCursorStyles(defaultTheme, pointerTheme, scale)
  },

  resetToDefault: () => {
    localStorage.setItem('syau-cursor-default', 'system')
    localStorage.setItem('syau-cursor-pointer', 'system')
    localStorage.setItem('syau-cursor-scale', '100')
    localStorage.setItem('syau-cursor-size', 'medium')
    set({ defaultCursor: 'system', pointerCursor: 'system', scale: 100, size: 'medium' })
    applyCursorStyles('system', 'system', 100)
  }
}))
