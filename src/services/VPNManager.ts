import { exec } from 'child_process'

interface CommandOutput {
  stdout: string
}

class VPNManager {
  private static instance: VPNManager | null = null
  public isConnected: boolean
  private currentSessionPath: string | null

  private constructor() {
    this.isConnected = false
    this.currentSessionPath = null
  }

  public static getInstance(): VPNManager {
    if (!VPNManager.instance) {
      VPNManager.instance = new VPNManager()
    }
    return VPNManager.instance
  }

  public async connectVPN(configPath: string): Promise<CommandOutput> {
    const output = await this.runCommand(`openvpn3 session-start --config "${configPath}"`)
    this.isConnected = true
    const match = output.stdout.match(/Session path: (.+)/)
    if (match) {
      this.currentSessionPath = match[1].trim()
    }
    return output
  }

  public async disconnectVPN(): Promise<CommandOutput> {
    if (!this.currentSessionPath) {
      return Promise.reject(new Error('No active session to disconnect.'))
    }
    const output = await this.runCommand(
      `openvpn3 session-manage --disconnect --session-path "${this.currentSessionPath}"`
    )
    this.isConnected = false
    this.currentSessionPath = null
    return output
  }

  public async disconnectAllSessions(): Promise<void> {
    try {
      const { stdout } = await this.runCommand('openvpn3 sessions-list')
      const sessionPaths = stdout.match(/\/net\/openvpn\/v3\/sessions\/[a-f0-9s]+/g)

      if (sessionPaths && sessionPaths.length > 0) {
        await Promise.all(
          sessionPaths.map((sessionPath) =>
            this.runCommand(`openvpn3 session-manage --disconnect --path ${sessionPath}`)
          )
        )
      }

      this.isConnected = false
      this.currentSessionPath = null
      console.log('All sessions disconnected successfully.')
    } catch (error) {
      console.error('Failed to disconnect all sessions:', error)
    }
  }

  public async toggleVPN(configPath?: string): Promise<void> {
    configPath = configPath ?? this.currentSessionPath ?? ''
    if (this.isConnected) {
      await this.disconnectVPN()
    } else {
      await this.connectVPN(configPath)
    }
  }

  private runCommand(command: string): Promise<CommandOutput> {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Command failed: ${error.message}`))
          return
        }
        if (stderr) {
          reject(new Error(`Command failed: ${stderr}`))
          return
        }
        resolve({ stdout })
      })
    })
  }
}

export default VPNManager.getInstance()
