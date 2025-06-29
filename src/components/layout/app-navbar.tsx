"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const navigationItems = [
  { name: "Tổng quan", path: "/" },
  { name: "Kết nối", path: "/connection" },
  { name: "Công cụ", path: "/mqtt" },
];

export function AppNavbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigate = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <>
      <div className="bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 h-14">
        <div className="flex items-center space-x-2 justify-between w-full">
          <button
            onClick={() => setOpen(true)}
            className="text-white hover:text-yellow-500 focus:outline-none"
          >
            <Menu size={24} />
          </button>
          <span className="text-white font-sm">FreeMQTT by Chipstack</span>
          <div className="w-6 h-6  rounded-full flex items-center justify-center">
            {/* <span className="text-black font-bold text-sm">N</span> */}
            <img className="w-[30px]" src={"/images/logo.png"} />
          </div>
        </div>
      </div>

      {/* Sidebar dạng Overlay khi mở */}
      <div
        className={`fixed inset-0 z-50 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="w-64 bg-gray-800 h-full p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between mb-6">
          <div className="w-6 h-6  rounded-full flex items-center justify-center">
            {/* <span className="text-black font-bold text-sm">N</span> */}
            <img className="w-[30px]" src={"/images/logo.png"} />
          </div>
            <span className="text-white font-bold">Menu</span>
            <button onClick={() => setOpen(false)} className="text-white">
              <X size={20} />
            </button>
          </div>

          {navigationItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigate(item.path)}
              className={`text-left px-3 py-2 rounded ${
                pathname === item.path
                  ? "bg-yellow-600 text-white"
                  : "text-gray-300 hover:text-white hover:bg-gray-700"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

       
      </div>
    </>
  );
}
