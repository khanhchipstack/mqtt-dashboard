"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, RefreshCw } from "lucide-react"
import type { NodeData } from "@/lib/nanomq-api"

interface DashboardHeaderProps {
  nodeData?: NodeData
  onRefresh: () => void
}

export function DashboardHeader({ nodeData, onRefresh }: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-yellow-500 mb-2">Bảng điều khiển NanoMQ Broker</h1>
          <h2 className="text-2xl font-semibold text-yellow-400">Giám sát MQTT thời gian thực</h2>
        </div>
        <div className="flex space-x-2">
          <Button onClick={onRefresh} variant="outline" className="border-gray-600 text-gray-300">
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
            <Plus className="mr-2 h-4 w-4" />
            Tải NanoMQ
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-white font-medium">NanoMQ Cluster</span>
              <Badge variant="default" className="bg-green-600">
                Đã kết nối
              </Badge>
              {nodeData && <span className="text-gray-400">v{nodeData.version}</span>}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>Thời gian hoạt động: {nodeData?.uptime}</span>
              <span>Trạng thái: {nodeData?.node_status}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
