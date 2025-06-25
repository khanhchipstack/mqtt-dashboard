export  interface ConnectionState {
  isConnected: boolean
  isConnecting: boolean
  serverUrl: string
  username: string
  password: string
  error: string | null
  // api: NanoMQAPI | null
  connect: (url: string, username: string, password: string) => Promise<void>
  disconnect: () => void
}
export interface ConnectionProviderProps {
  children: ReactNode
}