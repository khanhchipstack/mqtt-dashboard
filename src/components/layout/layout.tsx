"use client";

import type React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmDialog from "../common/confirm-dialog";
import { AppNavbar } from "./app-navbar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-900 w-full">
        {/* Sidebar ẩn trên mobile */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        <div className="flex-1 flex flex-col">
          {/* Navbar hiện trên mobile */}
          <div className="md:hidden">
            <AppNavbar />
          </div>

          <SidebarInset className="flex-1">{children}</SidebarInset>
        </div>

        <ToastContainer position="top-right" autoClose={3000} />
        <ConfirmDialog />
      </div>
    </SidebarProvider>
  );
}
