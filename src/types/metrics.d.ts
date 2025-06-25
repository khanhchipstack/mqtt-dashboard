export interface SystemMetrics {
  cpuinfo: string
  memory: string
  timestamp?: string
}

export interface PrometheusMetrics {
  connections_count: number
  connections_max: number
  sessions_count: number
  sessions_max: number
  topics_count: number
  topics_max: number
  subscribers_count: number
  subscribers_max: number
  messages_received: number
  messages_sent: number
  messages_dropped: number
  memory_usage: number
  memory_usage_max: number
  cpu_usage: number
  cpu_usage_max: number
}

export  interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  previousValue?: string | number
  trend?: "up" | "down" | "stable"
  color?: "blue" | "green" | "purple" | "orange"
  isLarge?: boolean
}
