import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getSetting: (key): Promise<string> => ipcRenderer.invoke('settings-get', key),
  setSetting: (key, value): Promise<void> => ipcRenderer.invoke('settings-set', key, value),
  hasSetting: (key): Promise<boolean> => ipcRenderer.invoke('settings-has', key),
  deleteSetting: (key): Promise<void> => ipcRenderer.invoke('settings-delete', key),
  connectToVpn: (vpnFilePath: string): Promise<{ ok: boolean; err?: string }> =>
    ipcRenderer.invoke('vpn-connect', vpnFilePath),
  disConnectVpn: (): Promise<void> => ipcRenderer.invoke('vpn-disconnect'),
  getIsVpnConnected: (): Promise<{ isConnected: boolean }> =>
    ipcRenderer.invoke('get-is-vpn-connected')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api as ApiMethods
}

export type ApiMethods = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof typeof api]: (typeof api)[K] extends (...args: any[]) => Promise<infer R>
    ? (...args: Parameters<(typeof api)[K]>) => Promise<R>
    : never
}
