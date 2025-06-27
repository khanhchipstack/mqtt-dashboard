
import { PrometheusMetrics } from "@/types/metrics";
import axios, { type AxiosInstance } from "axios"
interface ApiResponseData {
  prometheus: { timestamp: string; raw: string }[]
  client_count: { timestamp: string; count: number }[]
}
export class NanoMQApiService {
  private api: AxiosInstance

  // constructor(baseURL = process.env.NEXT_PUBLIC_API_URL) {
  //   this.api = axios.create({
  //     baseURL,
  //     timeout: 10000,
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   })
  // }

  constructor() {
    const isBrowser = typeof window !== 'undefined'
  
    this.api = axios.create({
      baseURL: isBrowser 
        ? '/' // Trình duyệt gọi vào chính FE
        : 'http://nanomq-proxy:3000',    // FE backend gọi nội bộ
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
  async getDashboardData(): Promise<{
    prometheus: PrometheusMetrics[]
    client_count: { timestamp: string; count: number }[]
  }> {
    try {
      const response = await this.api.get<ApiResponseData>("/api/metrics")

      const prometheus = (response.data.prometheus || []).map(item => ({
        ...this.parsePrometheusMetrics(item.raw),
      }))

      const client_count = response.data.client_count || []

      return { prometheus, client_count }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      throw new Error("Failed to fetch dashboard data")
    }
  }

  private parsePrometheusMetrics(metricsText: string): PrometheusMetrics {
    const lines = metricsText.split("\n")
    const metrics: PrometheusMetrics = {
      connections_count: 0,
      connections_max: 0,
      sessions_count: 0,
      sessions_max: 0,
      topics_count: 0,
      topics_max: 0,
      subscribers_count: 0,
      subscribers_max: 0,
      messages_received: 0,
      messages_sent: 0,
      messages_dropped: 0,
      memory_usage: 0,
      memory_usage_max: 0,
      cpu_usage: 0,
      cpu_usage_max: 0,
    }

    for (const line of lines) {
      if (line.startsWith("#") || line.trim() === "") continue

      const [metricName, value] = line.split(" ")
      const numValue = Number.parseFloat(value)

      switch (metricName) {
        case "nanomq_connections_count":
          metrics.connections_count = numValue
          break
        case "nanomq_connections_max":
          metrics.connections_max = numValue
          break
        case "nanomq_sessions_count":
          metrics.sessions_count = numValue
          break
        case "nanomq_sessions_max":
          metrics.sessions_max = numValue
          break
        case "nanomq_topics_count":
          metrics.topics_count = numValue
          break
        case "nanomq_topics_max":
          metrics.topics_max = numValue
          break
        case "nanomq_subscribers_count":
          metrics.subscribers_count = numValue
          break
        case "nanomq_subscribers_max":
          metrics.subscribers_max = numValue
          break
        case "nanomq_messages_received":
          metrics.messages_received = numValue
          break
        case "nanomq_messages_sent":
          metrics.messages_sent = numValue
          break
        case "nanomq_messages_dropped":
          metrics.messages_dropped = numValue
          break
        case "nanomq_memory_usage":
          metrics.memory_usage = numValue
          break
        case "nanomq_memory_usage_max":
          metrics.memory_usage_max = numValue
          break
        case "nanomq_cpu_usage":
          metrics.cpu_usage = numValue
          break
        case "nanomq_cpu_usage_max":
          metrics.cpu_usage_max = numValue
          break
      }
    }

    return metrics
  }
}
export const nanoMQApiService = new NanoMQApiService()

export const {
  getDashboardData,
} = nanoMQApiService
