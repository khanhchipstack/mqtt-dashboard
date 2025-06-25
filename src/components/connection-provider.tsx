"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Wifi, WifiOff } from "lucide-react"
import { ConnectionProviderProps, ConnectionState } from "@/types/connection"

const ConnectionContext = createContext<ConnectionState | null>(null)

export function useConnection() {
  const context = useContext(ConnectionContext)
  if (!context) {
    throw new Error("useConnection must be used within ConnectionProvider")
  }
  return context
}

export function ConnectionProvider({ children }: ConnectionProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showConnectionModal, setShowConnectionModal] = useState(false)
  const [serverUrl, setServerUrl] = useState("http://localhost:8888")
  const [username, setUsername] = useState("admin")
  const [password, setPassword] = useState("public")
  const [error, setError] = useState<string | null>(null)
  // const [api, setApi] = useState<NanoMQAPI | null>(null)

  // Check for existing connection on mount
  useEffect(() => {
    const savedConnection = localStorage.getItem("nanomq-connection")
    if (savedConnection) {
      try {
        const connectionData = JSON.parse(savedConnection)
        setIsConnected(true)
        setServerUrl(connectionData.serverUrl)
        setUsername(connectionData.username)
        setPassword(connectionData.password || "public")
        setShowConnectionModal(false)

        // Create API instance (commented out for mock)
        // const apiInstance = new NanoMQAPI(
        //   connectionData.serverUrl,
        //   connectionData.username,
        //   connectionData.password || "public",
        // )
        // setApi(apiInstance)
      } catch (err) {
        // If parsing fails, show connection modal
        setShowConnectionModal(true)
      }
    } else {
      setShowConnectionModal(true)
    }
  }, [])

  const connect = async (url: string, user: string, pass: string) => {
    setIsConnecting(true)
    setError(null)

    try {
      // Test connection by calling nodes API (commented out for mock)
      // const apiInstance = new NanoMQAPI(url, user, pass)
      // await apiInstance.getNodes()

      // Mock connection delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // If successful, set connected state
      setIsConnected(true)
      setShowConnectionModal(false)
      setServerUrl(url)
      setUsername(user)
      setPassword(pass)
      // setApi(apiInstance)

      // Save connection to localStorage
      localStorage.setItem(
        "nanomq-connection",
        JSON.stringify({
          serverUrl: url,
          username: user,
          password: pass,
          timestamp: Date.now(),
        }),
      )
    } catch (err) {
      setError("Failed to connect to NanoMQ server. Please check your credentials and server URL.")
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setIsConnected(false)
    setShowConnectionModal(true)
    setError(null)
    // setApi(null)
    // Remove connection from localStorage
    localStorage.removeItem("nanomq-connection")
  }

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    await connect(serverUrl, username, password)
  }

  return (
    <ConnectionContext.Provider
      value={{
        isConnected,
        isConnecting,
        serverUrl,
        username,
        password,
        error,
        // api,
        connect,
        disconnect,
      }}
    >
      <Dialog open={showConnectionModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-white">
              <Wifi className="h-5 w-5 text-yellow-500" />
              <span>Kết nối đến NanoMQ Server</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleConnect} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serverUrl" className="text-gray-300">
                URL Server
              </Label>
              <Input
                id="serverUrl"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="http://localhost:8081"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">
                Tên đăng nhập
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Mật khẩu
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="public"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            {error && (
              <Alert className="bg-red-900/20 border-red-600">
                <WifiOff className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-200">
                  Không thể kết nối đến NanoMQ server. Vui lòng kiểm tra thông tin đăng nhập và URL server.
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isConnecting}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang kết nối...
                </>
              ) : (
                <>
                  <Wifi className="mr-2 h-4 w-4" />
                  Kết nối
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {isConnected && children}
    </ConnectionContext.Provider>
  )
}
