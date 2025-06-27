"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface DashboardHeaderProps {
  onRefresh: () => void
}

export function DashboardHeader({ onRefresh }: DashboardHeaderProps) {

  useEffect(() => {
    const interval = setInterval(() => {
      onRefresh()
    }, 60000) // 60000ms = 1 phút

    return () => clearInterval(interval) // Cleanup khi component unmount
  }, [onRefresh])

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-yellow-500 mb-2">Dashboard</h1>
        </div>
      </div>
    </div>
  )
}
