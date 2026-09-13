import { useState, useEffect, lazy, Suspense } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useDesktopStore } from './store/desktopStore'
import BootScreen from './components/BootScreen'
import TopBar from './components/TopBar'
import Desktop from './components/Desktop'
import Dock from './components/Dock'
import Window from './components/Window'
import SystemUI from './components/SystemUI'
import LockScreen from './components/LockScreen'
import SearchBar from './components/SearchBar'
import Widgets from './components/Widgets'
import WindowSwitcher from './components/WindowSwitcher'
import ClipboardPopover from './components/ClipboardPopover'
import ErrorBoundary from './components/ErrorBoundary'
import { useFileSystem } from './store/fileSystem'
import { useThemeStore } from './store/themeStore'
import { initClipboardListener } from './store/clipboardStore'
import './store/cursorStore'

const AboutMe = lazy(() => import('./apps/AboutMe'))
const Terminal = lazy(() => import('./apps/Terminal'))
const Notes = lazy(() => import('./apps/Notes'))
const Calculator = lazy(() => import('./apps/Calculator'))
const Settings = lazy(() => import('./apps/Settings'))
const Devlogs = lazy(() => import('./apps/Devlogs'))
const NepaliConverter = lazy(() => import('./apps/NepaliConverter'))

const APP_COMPONENTS: Record<string, React.LazyExoticComponent<React.FC>> = {
  about: AboutMe,
  terminal: Terminal,
  notes: Notes,
  calculator: Calculator,
  calc: Calculator,
  settings: Settings,
  devlogs: Devlogs,
  nepali: NepaliConverter,
  'nepali-converter': NepaliConverter,
  calendar: NepaliConverter,
  patro: NepaliConverter,
}

type BootPhase = 'waiting' | 'topbar' | 'desktop' | 'dock' | 'done'

export default function App() {
  const bootDone = useDesktopStore(s => s.bootDone)
  const windows = useDesktopStore(s => s.windows)
  const currentWorkspace = useDesktopStore(s => s.currentWorkspace)
  const switchWorkspace = useDesktopStore(s => s.switchWorkspace)
  const themeMode = useThemeStore(s => s.mode)
  const [bootPhase, setBootPhase] = useState<BootPhase>('waiting')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode)
  }, [themeMode])

  const ensureFS = useFileSystem(s => s.ensureDefaultStructure)
  useEffect(() => { ensureFS().catch(() => {}) }, [ensureFS])

  useEffect(() => {
    const cleanup = initClipboardListener()
    return cleanup
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '4') {
        e.preventDefault()
        switchWorkspace(parseInt(e.key))
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowLeft') {
        e.preventDefault()
        switchWorkspace(Math.max(1, currentWorkspace - 1))
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight') {
        e.preventDefault()
        const max = useDesktopStore.getState().maxWorkspaces
        switchWorkspace(Math.min(max, currentWorkspace + 1))
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentWorkspace, switchWorkspace])

  useEffect(() => {
    if (!bootDone) return
    const timers: ReturnType<typeof setTimeout>[] = []
    timers.push(setTimeout(() => setBootPhase('topbar'), 100))
    timers.push(setTimeout(() => setBootPhase('desktop'), 300))
    timers.push(setTimeout(() => setBootPhase('dock'), 500))
    timers.push(setTimeout(() => setBootPhase('done'), 700))
    return () => timers.forEach(clearTimeout)
  }, [bootDone])

  return (
    <>
      {!bootDone && <BootScreen />}
      {bootDone && (
        <>
          {bootPhase !== 'waiting' && (
            <motion.div
              initial={{ y: -34, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <TopBar />
            </motion.div>
          )}
          {['desktop', 'dock', 'done'].includes(bootPhase) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <Desktop />
            </motion.div>
          )}
          <AnimatePresence>
            {windows.filter(w => w.workspace === currentWorkspace).map(win => {
              const AppComponent = APP_COMPONENTS[win.appId]
              if (!AppComponent) return null
              return (
                <Window key={win.id} window={win}>
                  <ErrorBoundary>
                    <Suspense fallback={null}>
                      <AppComponent />
                    </Suspense>
                  </ErrorBoundary>
                </Window>
              )
            })}
          </AnimatePresence>
          {['dock', 'done'].includes(bootPhase) && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 250, damping: 22, delay: 0.1 }}
            >
              <Dock />
            </motion.div>
          )}
          <SearchBar />
          <SystemUI />
          <LockScreen />
          <Widgets />
          <WindowSwitcher />
          <ClipboardPopover />
        </>
      )}
    </>
  )
}
