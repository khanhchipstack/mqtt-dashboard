"use client"

import { usePathname, useRouter } from "next/navigation"
import { Activity, BarChart3, Database, Network, Settings, Users, Zap, LogOut, Wifi } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useConnection } from "@/components/connection-provider"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navigationItems = [
  { name: "Tổng quan", icon: BarChart3, path: "/" },
  // { name: "Clients", icon: Users, path: "/clients" },
  // { name: "Topics", icon: Network, path: "/topics" },
  // { name: "Subscriptions", icon: Database, path: "/subscriptions" },
  // { name: "Bridges", icon: Zap, path: "/bridges" },
  // { name: "Metrics", icon: Activity, path: "/metrics" },
  { name: "MQTT", icon: Settings, path: "/mqtt" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { disconnect, serverUrl, username, isConnected } = useConnection()

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const handleDisconnect = () => {
    disconnect()
    router.push("/")
  }

  return (
    <Sidebar className="bg-gray-800 border-r border-gray-700">
      <SidebarHeader className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-sm">N</span>
          </div>
          <div className="flex-1">
            <span className="text-white font-semibold text-lg">NANOMQ</span>
            <div className="flex items-center space-x-2 mt-1">
              <Wifi className="h-3 w-3 text-green-400" />
              <span className="text-xs text-gray-400 truncate">{serverUrl}</span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className="text-xs border-green-600 text-green-400">
                Đã kết nối: {username}
              </Badge>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarMenu className="space-y-2">
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                onClick={() => handleNavigation(item.path)}
                isActive={pathname === item.path}
                className={`w-full justify-start ${
                  pathname === item.path
                    ? "bg-yellow-600 text-white hover:bg-yellow-700"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-700">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">© NanoMQ 2024</span>
            <Badge variant="outline" className="border-green-600 text-green-400">
              Trực tuyến
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            className="w-full border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Ngắt kết nối
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
