import { create } from 'zustand'
import { useNotificationStore } from './desktopStore'

export interface WifiNetwork {
  ssid: string
  signal: number // 1-4
  secured: boolean
  speed?: string
  isDevice?: boolean
  securityType?: string
}

export interface NetworkConfig {
  ip: string
  gateway: string
  dns: string
  mac: string
  frequency: string
}

interface NetworkStore {
  wifiEnabled: boolean
  connectedSsid: string | null
  availableNetworks: WifiNetwork[]
  isDeviceOnline: boolean
  deviceDownlink: number | null // in Mbps
  deviceRtt: number | null // in ms
  deviceEffectiveType: string | null
  livePing: number | null
  isPinging: boolean
  isScanning: boolean
  networkConfig: NetworkConfig
  setWifiEnabled: (enabled: boolean) => void
  toggleWifi: () => void
  connectToNetwork: (ssid: string) => void
  disconnect: () => void
  scanNetworks: () => Promise<void>
  addCustomNetwork: (ssid: string, secured?: boolean) => void
  forgetNetwork: (ssid: string) => void
  runPingTest: () => Promise<number | null>
  updateDeviceNetwork: () => void
}

const getInitialWifi = (): boolean => {
  const saved = localStorage.getItem('syau-os-wifi')
  return saved !== 'off'
}

const getInitialSsid = (): string | null => {
  const saved = localStorage.getItem('syau-os-wifi-ssid')
  if (saved !== null) return saved || null
  return 'Device Wi-Fi (Host Physical)'
}

export const useNetworkStore = create<NetworkStore>((set, get) => {
  const conn = typeof navigator !== 'undefined' ? (navigator as any).connection : null

  const getDeviceNetworks = (): WifiNetwork[] => {
    const downlink = conn?.downlink ? `${conn.downlink} Mbps` : '300 Mbps'
    return [
      { ssid: 'Device Wi-Fi (Host Physical)', signal: 4, secured: true, speed: downlink, isDevice: true, securityType: 'WPA3 Personal' },
      { ssid: 'स्याउ-Fiber-5G', signal: 4, secured: true, speed: '500 Mbps', securityType: 'WPA2/WPA3' },
      { ssid: 'HackClub_Global_Net', signal: 3, secured: true, speed: '250 Mbps', securityType: 'WPA2 Enterprise' },
      { ssid: 'Susant_Lab_Mesh', signal: 4, secured: true, speed: '1 Gbps', securityType: 'WPA3 Personal' },
      { ssid: 'Kathmandu_Guest_WiFi', signal: 2, secured: false, speed: '50 Mbps', securityType: 'Open (Unsecured)' },
    ]
  }

  // Setup live listeners for physical device online/offline status
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      set({ isDeviceOnline: true })
      useNotificationStore.getState().add('Physical device is now ONLINE', 'globe', 3000)
    })
    window.addEventListener('offline', () => {
      set({ isDeviceOnline: false })
      useNotificationStore.getState().add('Physical device lost internet connection', 'alert', 4000)
    })
    if (conn?.addEventListener) {
      conn.addEventListener('change', () => {
        get().updateDeviceNetwork()
      })
    }
  }

  return {
    wifiEnabled: getInitialWifi(),
    connectedSsid: getInitialWifi() ? getInitialSsid() : null,
    availableNetworks: getDeviceNetworks(),
    isDeviceOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    deviceDownlink: conn?.downlink || null,
    deviceRtt: conn?.rtt || null,
    deviceEffectiveType: conn?.effectiveType || '4g',
    livePing: null,
    isPinging: false,
    isScanning: false,
    networkConfig: {
      ip: '192.168.1.42',
      gateway: '192.168.1.1',
      dns: '1.1.1.1, 8.8.8.8',
      mac: '4A:8F:66:B2:10:9A',
      frequency: '5 GHz (Wi-Fi 6 / 802.11ax)',
    },

    updateDeviceNetwork: () => {
      const c = (navigator as any)?.connection
      set({
        deviceDownlink: c?.downlink || null,
        deviceRtt: c?.rtt || null,
        deviceEffectiveType: c?.effectiveType || '4g',
        availableNetworks: getDeviceNetworks(),
      })
    },

    setWifiEnabled: (enabled: boolean) => {
      localStorage.setItem('syau-os-wifi', enabled ? 'on' : 'off')
      const currentSsid = enabled ? (getInitialSsid() || 'Device Wi-Fi (Host Physical)') : null
      set({ wifiEnabled: enabled, connectedSsid: currentSsid })

      if (enabled) {
        useNotificationStore.getState().add(`Wi-Fi turned ON — Connected to ${currentSsid}`, 'wifi', 3000)
        get().scanNetworks()
      } else {
        useNotificationStore.getState().add('Wi-Fi turned OFF (OS Disconnected)', 'wifi-off', 3000)
      }
    },

    toggleWifi: () => {
      const next = !get().wifiEnabled
      get().setWifiEnabled(next)
    },

    connectToNetwork: (ssid: string) => {
      localStorage.setItem('syau-os-wifi-ssid', ssid)
      localStorage.setItem('syau-os-wifi', 'on')
      set({ wifiEnabled: true, connectedSsid: ssid })
      useNotificationStore.getState().add(`Connected to ${ssid} (Secured)`, 'wifi', 3000)
    },

    disconnect: () => {
      set({ connectedSsid: null })
      useNotificationStore.getState().add('Disconnected from network', 'alert', 2500)
    },

    scanNetworks: async () => {
      set({ isScanning: true })
      await new Promise(r => setTimeout(r, 1200))
      set({ isScanning: false, availableNetworks: getDeviceNetworks() })
      useNotificationStore.getState().add('Wi-Fi scan complete (5 networks found)', 'radar', 2000)
    },

    addCustomNetwork: (ssid: string, secured = true) => {
      const trimmed = ssid.trim()
      if (!trimmed) return
      const newNet: WifiNetwork = {
        ssid: trimmed,
        signal: 4,
        secured,
        speed: '300 Mbps',
        securityType: secured ? 'WPA2/WPA3 Personal' : 'Open',
      }
      set(s => ({
        availableNetworks: [newNet, ...s.availableNetworks.filter(n => n.ssid !== trimmed)],
        connectedSsid: trimmed,
        wifiEnabled: true,
      }))
      localStorage.setItem('syau-os-wifi-ssid', trimmed)
      useNotificationStore.getState().add(`Joined network "${trimmed}"`, 'wifi', 3000)
    },

    forgetNetwork: (ssid: string) => {
      set(s => ({
        availableNetworks: s.availableNetworks.filter(n => n.ssid !== ssid),
        connectedSsid: s.connectedSsid === ssid ? null : s.connectedSsid,
      }))
      useNotificationStore.getState().add(`Forgot network "${ssid}"`, 'trash', 2500)
    },

    runPingTest: async () => {
      set({ isPinging: true })
      const start = performance.now()
      try {
        await fetch('https://www.cloudflare.com/cdn-cgi/trace', { mode: 'no-cors', cache: 'no-store' })
        const elapsed = Math.round(performance.now() - start)
        set({ livePing: elapsed, isPinging: false })
        useNotificationStore.getState().add(`Ping test complete: ${elapsed}ms latency`, 'battery-charging', 3000)
        return elapsed
      } catch {
        const elapsed = Math.round(performance.now() - start)
        set({ livePing: elapsed || 28, isPinging: false })
        return elapsed || 28
      }
    }
  }
})


