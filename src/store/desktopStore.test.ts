import test from 'node:test'
import assert from 'node:assert/strict'
import { useDesktopStore } from './desktopStore.ts'

function resetStore() {
  useDesktopStore.setState({
    windows: [],
    activeWindowId: null,
    nextZIndex: 10,
    bootDone: false,
    openApps: [],
    dockHovered: null,
    currentWorkspace: 1,
    installedStoreApps: [],
  })
}

test('DesktopStore boots and opens a window', () => {
  resetStore()
  const store = useDesktopStore.getState()

  assert.equal(store.bootDone, false)
  store.setBootDone(true)
  assert.equal(useDesktopStore.getState().bootDone, true)

  store.openWindow('calculator', 'Calculator', 320, 460)
  const state = useDesktopStore.getState()

  assert.equal(state.windows.length, 1)
  assert.equal(state.windows[0].appId, 'calculator')
  assert.equal(state.windows[0].title, 'Calculator')
  assert.equal(state.windows[0].width, 320)
  assert.equal(state.windows[0].height, 460)
  assert.equal(state.windows[0].minimized, false)
  assert.equal(state.activeWindowId, state.windows[0].id)
  assert.ok(state.openApps.includes('calculator'))
})

test('DesktopStore focusWindow increases zIndex and sets activeWindowId', () => {
  resetStore()
  const store = useDesktopStore.getState()

  store.openWindow('app1', 'Window 1')
  const win1Id = useDesktopStore.getState().windows[0].id
  const zIndex1 = useDesktopStore.getState().windows[0].zIndex

  store.openWindow('app2', 'Window 2')
  const win2Id = useDesktopStore.getState().windows[1].id

  assert.equal(useDesktopStore.getState().activeWindowId, win2Id)

  store.focusWindow(win1Id)
  const afterFocus = useDesktopStore.getState()

  assert.equal(afterFocus.activeWindowId, win1Id)
  const win1After = afterFocus.windows.find(w => w.id === win1Id)
  assert.ok(win1After!.zIndex > zIndex1)
})

test('DesktopStore minimize and maximize behavior', () => {
  resetStore()
  const store = useDesktopStore.getState()

  store.openWindow('notes', 'Notes')
  const winId = useDesktopStore.getState().windows[0].id

  store.minimizeWindow(winId)
  assert.equal(useDesktopStore.getState().windows[0].minimized, true)
  assert.equal(useDesktopStore.getState().activeWindowId, null)

  store.toggleMaximize(winId)
  assert.equal(useDesktopStore.getState().windows[0].maximized, true)
  assert.equal(useDesktopStore.getState().windows[0].minimized, false)

  store.toggleMaximize(winId)
  assert.equal(useDesktopStore.getState().windows[0].maximized, false)
})

test('DesktopStore workspace management and filtering', () => {
  resetStore()
  const store = useDesktopStore.getState()

  store.openWindow('app_ws1', 'App on WS 1')
  const win1Id = useDesktopStore.getState().windows[0].id

  store.switchWorkspace(2)
  assert.equal(useDesktopStore.getState().currentWorkspace, 2)

  store.openWindow('app_ws2', 'App on WS 2')
  assert.equal(useDesktopStore.getState().windows.length, 2)

  const ws1Windows = useDesktopStore.getState().getWorkspaceWindows(1)
  const ws2Windows = useDesktopStore.getState().getWorkspaceWindows(2)

  assert.equal(ws1Windows.length, 1)
  assert.equal(ws1Windows[0].id, win1Id)
  assert.equal(ws2Windows.length, 1)
  assert.equal(ws2Windows[0].appId, 'app_ws2')
})

test('DesktopStore closeWindow cleans up window and active state', () => {
  resetStore()
  const store = useDesktopStore.getState()

  store.openWindow('to_close', 'To Close')
  const winId = useDesktopStore.getState().windows[0].id
  assert.equal(useDesktopStore.getState().windows.length, 1)

  store.closeWindow(winId)
  const afterClose = useDesktopStore.getState()

  assert.equal(afterClose.windows.length, 0)
  assert.equal(afterClose.activeWindowId, null)
  assert.equal(afterClose.openApps.includes('to_close'), false)
})
