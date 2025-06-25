"use client"

import { BrokerInfo } from "@/components/broker-info"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { LoadingSkeleton } from "@/components/common/loading-skeleton"
import { ErrorDisplay } from "@/components/common/error-display"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import DashboardWarning from "./dashboard/dashboard-warning"

export function Dashboard() {
  const { data, loading, error, refetch } = useDashboardData()

  if (loading) {
    return (
      <div className="flex-1 bg-gray-900 p-8">
        <LoadingSkeleton rows={2} columns={3} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 bg-gray-900 p-8">
        <ErrorDisplay message={error} onRetry={refetch} />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="flex-1 bg-gray-900 p-8">
      {/* <DashboardHeader nodeData={data.nodes[0]} onRefresh={refetch} /> */}

      {/* <BrokerInfo data={data} /> */}
      <DashboardWarning/>
      <DashboardStats prometheus={data.prometheus} />
    </div>
  )
}
