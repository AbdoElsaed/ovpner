import { useEffect, useState } from 'react'
import { VPN_CONFIG_SETTING_NAME } from './shared/constants'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Loader from './components/Loader'

function App(): JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  const [configFilePath, setConfigFilePath] = useState<string | null>(null)
  const [showLoader, setShowLoader] = useState<boolean>(false)
  const [isVpnConnected, setIsVpnConnected] = useState<boolean>(false)
  const [loadingVpnStatus, setLoadingVpnStatus] = useState<boolean>(false)

  useEffect(() => {
    setLoadingVpnStatus(true)
    ;(async (): Promise<void> => {
      const vpnFilePath = await window?.api?.getSetting(VPN_CONFIG_SETTING_NAME)
      if (vpnFilePath) {
        setConfigFilePath(vpnFilePath)
      }
      const isConnectedRes = await window?.api?.getIsVpnConnected()
      setIsVpnConnected(isConnectedRes.isConnected)
    })()
    setLoadingVpnStatus(false)

    window.electron.ipcRenderer.on('vpn-status-changed', (_, isConnected: boolean) => {
      setIsVpnConnected(isConnected)
    })
    return () => {
      window.electron.ipcRenderer.removeAllListeners('vpn-status-changed')
    }
  }, [])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    setConfigFilePath(file?.path as string)
  }

  const onConnectHandler = async (): Promise<void> => {
    if (!configFilePath) {
      alert('Please select a VPN config file first.')
      return
    }
    setShowLoader(true)
    const res = await window?.api?.connectToVpn(configFilePath)
    if (res?.ok) {
      toast.success('connected successfully!')
      setIsVpnConnected(true)
      await window?.api?.setSetting(VPN_CONFIG_SETTING_NAME, configFilePath)
      window.electron.ipcRenderer.send('vpn-status-changed', true)
    } else {
      toast.error(`Error connecting to the vpn :( \n ${res?.err}`)
    }
    setShowLoader(false)
  }

  const onDisconnectHandler = async (): Promise<void> => {
    setShowLoader(true)
    if (!configFilePath) return
    await window?.api?.disConnectVpn()
    setIsVpnConnected(false)
    window.electron.ipcRenderer.send('vpn-status-changed', false)
    toast.success('Disconnected successfully!')
    setShowLoader(false)
  }

  const onRemoveHandler = async (): Promise<void> => {
    await window?.api?.deleteSetting(VPN_CONFIG_SETTING_NAME)
    setConfigFilePath(null)
  }

  return loadingVpnStatus ? (
    <Loader />
  ) : (
    <div className="vpn-app">
      {configFilePath ? (
        <>
          <p>selected file: {configFilePath}</p>
          <button className="removeBtn" onClick={onRemoveHandler}>
            remove
          </button>
        </>
      ) : (
        <>
          <input onChange={onFileChange} type="file" id="fileInput" accept=".ovpn" hidden />
          <label htmlFor="fileInput" id="fileLabel" className="file-label">
            Select OpenVPN File
          </label>
        </>
      )}
      {isVpnConnected ? (
        <button className="mainButton disconnectBtn" onClick={onDisconnectHandler}>
          Disconnect
        </button>
      ) : (
        <button className="mainButton" onClick={onConnectHandler}>
          Connect
        </button>
      )}

      {showLoader && <Loader />}

      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  )
}

export default App
