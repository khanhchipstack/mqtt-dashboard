"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Wifi, WifiOff } from "lucide-react"
import type { ClientData } from "@/lib/nanomq-api"
import { ClientStatsProps } from "@/types/clients"



export function ClientStats({ clients }: ClientStatsProps) {
  const connectedClients = clients.filter((c) => c.conn_state === "connected").length
  const disconnectedClients = clients.filter((c) => c.conn_state === "disconnected").length

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2 text-green-400">
            <Wifi className="h-5 w-5" />
            <span>Clients đã kết nối</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-400">{connectedClients}</div>
          <p className="text-sm text-gray-400">Đang hoạt động</p>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2 text-red-400">
            <WifiOff className="h-5 w-5" />
            <span>Clients đã ngắt kết nối</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-400">{disconnectedClients}</div>
          <p className="text-sm text-gray-400">Gần đây ngắt kết nối</p>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2 text-blue-400">
            <Users className="h-5 w-5" />
            <span>Tổng số Clients</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-400">{clients.length}</div>
          <p className="text-sm text-gray-400">Tất cả thời gian</p>
        </CardContent>
      </Card>
    </div>
  )
}
