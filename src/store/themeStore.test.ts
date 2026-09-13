import test from 'node:test'
import assert from 'node:assert/strict'
import { useThemeStore, darkenHex } from './themeStore.ts'

function resetStore() {
  useThemeStore.setState({
    mode: 'dark',
    brightness: 100,
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
  })
}

test('darkenHex reduces brightness of hex color', () => {
  const darkened = darkenHex('#FFFFFF', 20)
  assert.equal(darkened, '#CCCCCC')

  const darkenedPink = darkenHex('#E8829B', 25)
  assert.match(darkenedPink, /^#[0-9A-F]{6}$/)
  assert.notEqual(darkenedPink, '#E8829B')
})

test('useThemeStore initializes with valid defaults', () => {
  resetStore()
  const state = useThemeStore.getState()
  assert.equal(state.mode, 'dark')
  assert.equal(state.windowBlur, 18)
  assert.equal(state.windowOpacity, 88)
  assert.equal(state.dockPosition, 'bottom')
  assert.equal(state.dockSize, 'default')
})

test('setCustomAccent updates primary and auto-calculates dark shade', () => {
  resetStore()
  const store = useThemeStore.getState()

  store.setCustomAccent('#3B82F6')
  const state = useThemeStore.getState()

  assert.equal(state.accentMode, 'custom')
  assert.equal(state.customAccentPrimary, '#3B82F6')
  assert.ok(state.customAccentDark.length === 7)
  assert.notEqual(state.customAccentDark, '#3B82F6')
})

test('setWindowOptics clamps values to safe bounds', () => {
  resetStore()
  const store = useThemeStore.getState()

  store.setWindowOptics(100, 150)
  let state = useThemeStore.getState()
  assert.equal(state.windowBlur, 40)
  assert.equal(state.windowOpacity, 100)

  store.setWindowOptics(-10, 10)
  state = useThemeStore.getState()
  assert.equal(state.windowBlur, 0)
  assert.equal(state.windowOpacity, 40)
})

test('exportThemeJSON and importThemeJSON round-trip', () => {
  resetStore()
  const store = useThemeStore.getState()

  store.setCustomAccent('#10B981', '#047857')
  store.setWindowOptics(24, 75)
  store.setDockConfig('left', 'compact')

  const exported = store.exportThemeJSON()
  assert.ok(exported.includes('#10B981'))

  store.resetThemeDefaults()
  assert.equal(useThemeStore.getState().customAccentPrimary, '#E8829B')

  const success = store.importThemeJSON(exported)
  assert.equal(success, true)

  const restored = useThemeStore.getState()
  assert.equal(restored.customAccentPrimary, '#10B981')
  assert.equal(restored.windowBlur, 24)
  assert.equal(restored.windowOpacity, 75)
  assert.equal(restored.dockPosition, 'left')
  assert.equal(restored.dockSize, 'compact')
})

test('importThemeJSON rejects invalid JSON schema', () => {
  resetStore()
  const store = useThemeStore.getState()
  const result = store.importThemeJSON('this is not json')
  assert.equal(result, false)
})
