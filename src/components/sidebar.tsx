"use client"

import { Activity, BarChart3, Database, Network, Settings, Users, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const navigationItems = [
  { name: "Dashboard", icon: BarChart3, active: true },
  { name: "Clients", icon: Users },
  { name: "Topics", icon: Network },
  { name: "Subscriptions", icon: Database },
  { name: "Bridges", icon: Zap },
  { name: "Metrics", icon: Activity },
  { name: "Test", icon: Settings },
  { name: "Settings", icon: Settings },
]

export function Sidebar() {
  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-sm">N</span>
          </div>
          <span className="text-white font-semibold text-lg">NANOMQ</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => (
          <Button
            key={item.name}
            variant={item.active ? "secondary" : "ghost"}
            className={`w-full justify-start text-left ${
              item.active
                ? "bg-yellow-600 text-white hover:bg-yellow-700"
                : "text-gray-300 hover:text-white hover:bg-gray-700"
            }`}
          >
            <item.icon className="mr-3 h-4 w-4" />
            {item.name}
          </Button>
        ))}
      </nav>

      {/* Promotional Card */}
      <div className="p-4 mt-8">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-xs">N</span>
              </div>
              <span className="font-semibold text-gray-900">NANOMQ</span>
              <span className="text-sm text-gray-600">CLOUD</span>
            </div>
            <p className="text-sm text-gray-700 mb-3">NanoMQ Cloud is now free for up to 100 MQTT clients.</p>
            <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-black">
              Learn more
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex justify-between items-center text-sm text-gray-400">
          <span>© NanoMQ</span>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            Light Mode
          </Button>
        </div>
      </div>
    </div>
  )
}
