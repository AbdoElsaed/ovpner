import { ipcMain, IpcMainInvokeEvent } from 'electron'
import settings from 'electron-settings'
import vpnManager from '../services/VPNManager'

export function registerIpcHandlers(): void {
  ipcMain.handle(
    'settings-get',
    async (event: IpcMainInvokeEvent, key: string): Promise<unknown> => {
      return await settings.get(key)
    }
  )

  ipcMain.handle(
    'settings-set',
    async (event: IpcMainInvokeEvent, key: string, value: string): Promise<void> => {
      await settings.set(key, value)
    }
  )

  ipcMain.handle(
    'settings-has',
    async (event: IpcMainInvokeEvent, key: string): Promise<boolean> => {
      return await settings.has(key)
    }
  )

  ipcMain.handle(
    'settings-delete',
    async (event: IpcMainInvokeEvent, key: string): Promise<void> => {
      await settings.unset(key)
    }
  )

  ipcMain.handle(
    'vpn-connect',
    async (
      event: IpcMainInvokeEvent,
      vpnFilePath: string
    ): Promise<{ ok: boolean; err?: unknown | string }> => {
      try {
        const res = await vpnManager.connectVPN(vpnFilePath)
        if (res?.stdout.includes('Connected')) {
          return { ok: true }
        } else {
          return { ok: false }
        }
      } catch (err) {
        return { ok: false, err }
      }
    }
  )

  ipcMain.handle('vpn-disconnect', async (): Promise<void> => {
    await vpnManager.disconnectVPN()
  })

  ipcMain.handle('get-is-vpn-connected', async (): Promise<{ isConnected: boolean }> => {
    const isConnected = vpnManager.isConnected
    return { isConnected }
  })

  // Add more IPC handlers here as needed
}
