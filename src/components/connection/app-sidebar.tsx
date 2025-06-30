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
          Settings
        </Button>
        {connection && (
          <Button
            onClick={isConnected ? onDisconnect : () => onConnect(connection.options)}
            className={`flex items-center gap-2 font-semibold px-4 py-2 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg ${
              isConnected
                ? "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white hover:shadow-red-500/50"
                : "bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white hover:shadow-green-500/50"
            }`}
            aria-label={isConnected ? "Disconnect from broker" : "Connect to broker"}
          >
            <Wifi size={18} className="animate-pulse" />
            {isConnected ? "Disconnect" : "Connect"}
          </Button>
        )}
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