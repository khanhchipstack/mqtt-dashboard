"use client"

import { useState, useEffect } from "react"
import { NanoMQApiService } from "@/lib/mock-data"
// import { useConnection } from "@/components/connection-provider"
import type { NodeData, BrokerData, MetricsData, ClientData, PrometheusMetrics } from "@/lib/nanomq-api"

interface DashboardData {
  nodes: NodeData[]
  brokers: BrokerData[]
  metrics: MetricsData
  clients: ClientData[]
  prometheus: PrometheusMetrics
}

export function useDashboardData() {
  // const { api } = useConnection()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const mockService = new NanoMQApiService()

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Real API calls (commented out)
      // const [nodes, brokers, metrics, clients, prometheus] = await Promise.all([
      //   api.getNodes(),
      //   api.getBrokers(),
      //   api.getMetrics(),
      //   api.getClients(),
      //   api.getPrometheusMetrics(),
      // ])

      // Mock API calls
      const [nodes, brokers, metrics, clients, prometheus] = await Promise.all([
        mockService.getNodes(),
        mockService.getBrokers(),
        mockService.getMetrics(),
        mockService.getClients(),
        mockService.getPrometheusMetrics(),
      ])

      setData({
        nodes,
        brokers,
        metrics,
        clients,
        prometheus,
      })
    } catch (err) {
      setError("Failed to fetch dashboard data")
      console.error("Dashboard fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}
