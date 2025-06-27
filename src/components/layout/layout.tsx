"use client";

import type React from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmDialog from "../common/confirm-dialog";
interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-900 w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">{children}</SidebarInset>
        <ToastContainer position="top-right" autoClose={3000} />
        <ConfirmDialog />
      </div>
    </SidebarProvider>
  );
}
