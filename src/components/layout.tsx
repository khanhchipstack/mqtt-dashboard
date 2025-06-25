"use client"

import type React from "react"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { ConnectionProvider } from "@/components/connection-provider"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <ConnectionProvider>
      <SidebarProvider>
        <div className="flex min-h-screen bg-gray-900 w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">{children}</SidebarInset>
        </div>
      </SidebarProvider>
    </ConnectionProvider>
  )
}
