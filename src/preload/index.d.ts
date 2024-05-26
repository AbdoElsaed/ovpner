import { ElectronAPI } from '@electron-toolkit/preload'
import { ApiMethods } from './index'

declare global {
  interface Window {
    electron: ElectronAPI
    api: ApiMethods
  }
}
