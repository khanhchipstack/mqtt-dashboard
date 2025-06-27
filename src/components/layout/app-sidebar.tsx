"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Settings,
  Wifi,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navigationItems = [
  { name: "Tổng quan", icon: BarChart3, path: "/" },
  { name: "Kết nối", icon: Wifi, path: "/connection" },
  { name: "Công cụ", icon: Settings, path: "/mqtt" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
  };
  return (
    <Sidebar className="bg-gray-800 border-r border-gray-700">
      <SidebarHeader className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10  rounded-full flex items-center justify-center">
            {/* <span className="text-black font-bold text-sm">N</span> */}
            <img className="w-[50px]" src={"/images/logo.png"} />
          </div>
          <div className="flex-1">
            <span
              style={{ color: "#05b2ff" }}
              className="text-white font-semibold text-sm"
            >
              FreeMQTT by Chipstack
            </span>
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
    </Sidebar>
  );
}
