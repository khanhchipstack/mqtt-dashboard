"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Server, Clock, Cpu, MemoryStick } from "lucide-react"
import type { NodeData, BrokerData, MetricsData, PrometheusMetrics } from "@/lib/nanomq-api"
import { BrokerInfoProps } from "@/types/broker"



export function BrokerInfo({ data }: BrokerInfoProps) {
  if (!data) return null

  const broker = data.brokers[0]
  const node = data.nodes[0]
  const metrics = data.metrics
  const prometheus = data.prometheus

  const formatBytes = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Broker Connection Info */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Server className="h-5 w-5" />
            <span>Thông tin Broker</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Mô tả:</span>
              <p className="text-white">{broker?.sysdescr || "NanoMQ Broker"}</p>
            </div>
            <div>
              <span className="text-gray-400">Phiên bản:</span>
              <p className="text-white">{broker?.version || node?.version}</p>
            </div>
            <div>
              <span className="text-gray-400">Khởi động:</span>
              <p className="text-white">{broker?.datetime}</p>
            </div>
            <div>
              <span className="text-gray-400">Trạng thái:</span>
              <Badge className="bg-green-600 text-white">{broker?.node_status || node?.node_status}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Cpu className="h-5 w-5" />
            <span>Tài nguyên hệ thống</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <div>
                <span className="text-gray-400">Thời gian hoạt động:</span>
                <p className="text-white">{node?.uptime}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Cpu className="h-4 w-4 text-gray-400" />
              <div>
                <span className="text-gray-400">CPU:</span>
                <p className="text-white">{metrics?.cpuinfo || `${prometheus?.cpu_usage}%`}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MemoryStick className="h-4 w-4 text-gray-400" />
              <div>
                <span className="text-gray-400">Bộ nhớ:</span>
                <p className="text-white">
                  {metrics?.memory
                    ? formatBytes(Number.parseInt(metrics.memory))
                    : formatBytes(prometheus?.memory_usage || 0)}
                </p>
              </div>
            </div>
            <div>
              <span className="text-gray-400">Kết nối:</span>
              <p className="text-white">{node?.connections || prometheus?.connections_count || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
