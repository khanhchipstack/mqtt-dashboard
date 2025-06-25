"use client"

import { MetricCard } from "@/components/metric-card"
import type { PrometheusMetrics } from "@/lib/nanomq-api"

interface DashboardStatsProps {
  prometheus: PrometheusMetrics
}

export function DashboardStats({ prometheus }: DashboardStatsProps) {
  return (
    <>
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Clients đã kết nối"
          subtitle="Tổng cộng"
          value={prometheus.connections_count}
          previousValue={prometheus.connections_max}
          trend="stable"
          color="blue"
        />

        <MetricCard
          title="Sessions đang hoạt động"
          subtitle="Tổng cộng"
          value={prometheus.sessions_count}
          previousValue={prometheus.sessions_max}
          trend="stable"
          color="green"
        />

        <MetricCard
          title="Topics"
          value={prometheus.topics_count}
          subtitle="Tổng cộng"
          previousValue={prometheus.topics_max}
          trend="stable"
          color="purple"
        />
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
        />

        <MetricCard
          title="Tin nhắn đã gửi"
          value={prometheus.messages_sent.toLocaleString()}
          subtitle="Tổng cộng"
          previousValue={prometheus.messages_sent}
          trend="up"
          color="green"
          isLarge
        />

        <MetricCard
          title="Tin nhắn bị loại bỏ"
          value={prometheus.messages_dropped.toLocaleString()}
          subtitle="Tổng cộng"
          previousValue={prometheus.messages_dropped}
          trend="down"
          color="orange"
          isLarge
        />
      </div>
    </>
  )
}
