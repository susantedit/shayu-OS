import test from 'node:test'
import assert from 'node:assert/strict'
import { useClipboardStore } from './clipboardStore.ts'

function resetStore() {
  useClipboardStore.setState({
    items: [],
    isOpen: false,
    searchQuery: '',
    copiedId: null,
  })
}

test('useClipboardStore starts with clean state after reset', () => {
  resetStore()
  const state = useClipboardStore.getState()
  assert.equal(state.items.length, 0)
  assert.equal(state.isOpen, false)
  assert.equal(state.searchQuery, '')
})

test('addEntry adds items and limits history to 10 items', () => {
  resetStore()
  const store = useClipboardStore.getState()

  for (let i = 1; i <= 15; i++) {
    store.addEntry(`Item ${i}`)
  }

  const state = useClipboardStore.getState()
  assert.equal(state.items.length, 10)
  assert.equal(state.items[0].text, 'Item 15')
  assert.equal(state.items[9].text, 'Item 6')
})

test('addEntry deduplicates existing text and moves it to the top', () => {
  resetStore()
  const store = useClipboardStore.getState()

  store.addEntry('Apple')
  store.addEntry('Banana')
  store.addEntry('Cherry')

  assert.equal(useClipboardStore.getState().items.length, 3)
  assert.equal(useClipboardStore.getState().items[0].text, 'Cherry')

  store.addEntry('Apple')

  const state = useClipboardStore.getState()
  assert.equal(state.items.length, 3)
  assert.equal(state.items[0].text, 'Apple')
  assert.equal(state.items[1].text, 'Cherry')
  assert.equal(state.items[2].text, 'Banana')
})

test('addEntry ignores empty or whitespace-only strings', () => {
  resetStore()
  const store = useClipboardStore.getState()

  store.addEntry('')
  store.addEntry('   ')
  store.addEntry('\n\t\n')

  const state = useClipboardStore.getState()
  assert.equal(state.items.length, 0)
})

test('removeEntry removes specific item by id', () => {
  resetStore()
  const store = useClipboardStore.getState()

  store.addEntry('First')
  store.addEntry('Second')

  const items = useClipboardStore.getState().items
  assert.equal(items.length, 2)
  const targetId = items[0].id

  store.removeEntry(targetId)
  const updated = useClipboardStore.getState().items
  assert.equal(updated.length, 1)
  assert.equal(updated[0].text, 'First')
})

test('clearHistory empties the items list', () => {
  resetStore()
  const store = useClipboardStore.getState()

  store.addEntry('Item A')
  store.addEntry('Item B')
  assert.equal(useClipboardStore.getState().items.length, 2)

  store.clearHistory()
  assert.equal(useClipboardStore.getState().items.length, 0)
})

test('toggleOpen and setIsOpen update tray visibility', () => {
  resetStore()
  const store = useClipboardStore.getState()

  assert.equal(useClipboardStore.getState().isOpen, false)
  store.toggleOpen()
  assert.equal(useClipboardStore.getState().isOpen, true)
  store.toggleOpen()
  assert.equal(useClipboardStore.getState().isOpen, false)

  store.setIsOpen(true)
  assert.equal(useClipboardStore.getState().isOpen, true)
  store.setIsOpen(false)
  assert.equal(useClipboardStore.getState().isOpen, false)
})
