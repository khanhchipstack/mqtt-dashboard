"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { RefreshCw } from "lucide-react"
import { Layout } from "@/components/layout"
import { ClientStats } from "@/components/clients/client-stats"
import { ClientTable } from "@/components/clients/client-table"
import { LoadingSkeleton } from "@/components/common/loading-skeleton"
import { ErrorDisplay } from "@/components/common/error-display"
import { useClientsData } from "@/hooks/use-clients-data"

export default function ClientsPage() {
  const { clients, loading, error, refetch } = useClientsData()

  // Mock connection history for chart
  const connectionHistory = [
    { time: "10:00", connected: 2, disconnected: 1 },
    { time: "10:05", connected: 2, disconnected: 1 },
    { time: "10:10", connected: 2, disconnected: 1 },
    { time: "10:15", connected: 2, disconnected: 1 },
    { time: "10:20", connected: 2, disconnected: 1 },
    { time: "10:25", connected: 2, disconnected: 1 },
  ]

  if (loading) {
    return (
      <Layout>
        <div className="p-8 bg-gray-900 min-h-screen">
          <LoadingSkeleton rows={2} columns={3} />
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="p-8 bg-gray-900 min-h-screen">
          <ErrorDisplay message={error} onRetry={refetch} />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-8 bg-gray-900 min-h-screen">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Quản lý Clients</h1>
              <p className="text-gray-400">Giám sát và quản lý kết nối MQTT clients</p>
            </div>
            <Button onClick={refetch} variant="outline" className="border-gray-600 text-gray-300">
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
          </div>
        </div>

        <ClientStats clients={clients} />

        {/* Connection History Chart */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Lịch sử kết nối</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={connectionHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="connected" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="disconnected" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <ClientTable clients={clients} />
      </div>
    </Layout>
  )
}
