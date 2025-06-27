"use client"

import { MetricCard } from "@/components/ui/metric-card"
import { PrometheusMetrics } from "@/types/metrics"

interface DashboardStatsProps {
  prometheus: PrometheusMetrics,
  listPrometheus: PrometheusMetrics[]
}

export function DashboardStats({ prometheus, listPrometheus }: DashboardStatsProps) {
  const bytesToGB=(bytes: number, precision = 2): number =>{
    return +(bytes / (1024 ** 2)).toFixed(precision)
  }
  return (
    <>
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Clients đã kết nối"
          subtitle="Tổng cộng"
          value={prometheus.connections_count}
          previousValue={prometheus.connections_max}
          trend="stable"
          color="blue"
          trendData={listPrometheus.map(p => p.connections_count)}
        />

        <MetricCard
          title="Sessions đang hoạt động"
          subtitle="Tổng cộng"
          value={prometheus.sessions_count}
          previousValue={prometheus.sessions_max}
          trend="stable"
          color="green"
          trendData={listPrometheus.map(p => p.sessions_count)}
        />

        <MetricCard
          title="Topics"
          value={prometheus.topics_count}
          subtitle="Tổng cộng"
          previousValue={prometheus.topics_max}
          trend="stable"
          color="purple"
          trendData={listPrometheus.map(p => p.topics_count)}
        />
      <MetricCard
          title="Subscribers"
          value={prometheus.subscribers_count}
          subtitle="Tổng cộng"
          previousValue={prometheus.subscribers_max}
          trend="stable"
          color="blue"
          trendData={listPrometheus.map(p => p.subscribers_count)}
        />
           {/* <MetricCard
          title="CPU"
          value={prometheus.cpu_usage}
          subtitle="Tổng cộng"
          previousValue={prometheus.cpu_usage_max}
          trend="stable"
          color="green"
          trendData={listPrometheus.map(p => p.cpu_usage)}
        />
           <MetricCard
          title="Memory"
          value={`${bytesToGB(prometheus.memory_usage)} MB`}
          subtitle="Tổng cộng"
          previousValue={`${bytesToGB(prometheus.memory_usage_max)} MB`}
          trend="stable"
          color="purple"
          trendData={listPrometheus.map(p => p.memory_usage)}
        /> */}
      </div>

      {/* Message Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Tin nhắn đã nhận"
          value={prometheus.messages_received.toLocaleString()}
          subtitle="Tổng cộng"
          previousValue={prometheus.messages_received}
          trend="up"
          color="blue"
          isLarge
          trendData={listPrometheus.map(p => p.messages_received)}
        />

        <MetricCard
          title="Tin nhắn đã gửi"
          value={prometheus.messages_sent.toLocaleString()}
          subtitle="Tổng cộng"
          previousValue={prometheus.messages_sent}
          trend="up"
          color="green"
          isLarge
          trendData={listPrometheus.map(p => p.messages_sent)}
        />

        <MetricCard
          title="Tin nhắn bị loại bỏ"
          value={prometheus.messages_dropped.toLocaleString()}
          subtitle="Tổng cộng"
          previousValue={prometheus.messages_dropped}
          trend="down"
          color="orange"
          isLarge
          trendData={listPrometheus.map(p => p.messages_dropped)}
        />
      </div>
    </>
  )
}
