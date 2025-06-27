"use client"

import { useState, useEffect } from "react"
import { NanoMQApiService } from "@/lib/mock-data"
import { PrometheusMetrics } from "@/types/metrics"

interface DashboardData {
  clientLatest: number
  prometheusLatest: PrometheusMetrics
  clientHistory: { timestamp: string; count: number }[]
  prometheusHistory: PrometheusMetrics[]
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const mockService = new NanoMQApiService()

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Chỉ gọi 1 API duy nhất
      const response = await mockService.getDashboardData()

      const clientHistory = response.client_count || []
      const prometheusHistory = response.prometheus || []
      setData({
        clientLatest: clientHistory[0]?.count ?? 0,
        prometheusLatest: prometheusHistory[0] ?? {},
        clientHistory,
        prometheusHistory,
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
