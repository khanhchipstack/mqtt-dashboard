"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricCardProps } from "@/types/metrics"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"



export function MetricCard({
  title,
  value,
  subtitle,
  previousValue,
  trend = "stable",
  color = "blue",
  isLarge = false,
}: MetricCardProps) {
  const colorClasses = {
    blue: "text-blue-400",
    green: "text-green-400",
    purple: "text-purple-400",
    orange: "text-orange-400",
  }

  const trendIcons = {
    up: <TrendingUp className="h-4 w-4 text-green-400" />,
    down: <TrendingDown className="h-4 w-4 text-red-400" />,
    stable: <Minus className="h-4 w-4 text-gray-400" />,
  }
  const barColors = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    purple: "bg-purple-600",
    orange: "bg-orange-600",
  }
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-bold ${colorClasses[color]}`}>
              {typeof value === "number" ? value.toLocaleString() : value}
            </span>
            {subtitle && <span className={`text-sm ${colorClasses[color]}`}>{subtitle}</span>}
          </div>

          {previousValue && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                {typeof previousValue === "number" ? previousValue.toLocaleString() : previousValue}
              </span>
              <div className="flex items-center space-x-1">
                {trendIcons[trend]}
                <span className="text-gray-400">2 phút trước</span>
              </div>
            </div>
          )} 

          {/* Simple trend line visualization */}
          <div className="h-12 flex items-end space-x-1">
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className={`w-1 ${barColors[color]} opacity-60`}
                style={{
                  height: `${Math.random() * 100}%`,
                  minHeight: "2px",
                }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
