"use client";

import React, { useState } from "react";
import { SavedConnection } from "@/types/connection";
import { Wifi, Settings } from "lucide-react";
import { Dialog } from "@headlessui/react";
import ConnectionForm from "@/components/mqtt/ConnectionForm";
import { MqttConnectionOptions } from "@/types/mqtt";
import { Button } from "../ui/button";

interface AppSidebarProps {
  connection: SavedConnection | null;
  onConnect: (options: MqttConnectionOptions) => void;
  onDisconnect: () => void;
  connectionStatus: string;
  onSave: (newConnection: SavedConnection) => void;
  onUpdate: (updatedFields: Partial<SavedConnection>) => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({
  connection,
  onConnect,
  onDisconnect,
  connectionStatus,
  onSave,
  onUpdate,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isConnected = connectionStatus === "Connected";

  return (
    <div className="bg-gray-900 text-white border-b border-gray-800 p-4 flex items-center justify-between gap-4">
      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/50"
          aria-label="Open connection settings"
        >
          <Settings size={18} className="animate-pulse" />
          Thiết lập kết nối
        </Button>
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm ${
            isConnected
              ? "border-green-500 bg-green-950 text-green-300"
              : "border-red-500 bg-red-950 text-red-300"
          }`}
        >
          <Wifi
            size={14}
            className={
              isConnected ? "animate-pulse text-green-400" : "text-red-400"
            }
          />
          {isConnected ? "Đã kết nối" : "Chưa kết nối"}
        </div>
      </div>

      {/* Modal Form */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
        <div className="fixed inset-y-0 left-0 flex items-center justify-center p-4 sm:p-6 w-full">
          <Dialog.Panel className="w-full max-w-lg bg-gray-900 rounded-xl border border-gray-700 shadow-2xl max-h-[90vh]">
            <ConnectionForm
              connection={connection}
              isExpanded={true}
              onClose={() => setIsModalOpen(false)}
              connectionStatus={connectionStatus}
              onToggleExpand={() => {}}
              onConnect={onConnect}
              onDisconnect={onDisconnect}
              onSave={onSave}
              onUpdate={onUpdate}
            />
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default AppSidebar;
