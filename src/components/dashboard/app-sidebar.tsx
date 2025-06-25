"use client";

import React, { useState, useCallback } from "react";
import { SavedConnection } from "@/types/mqtt/connection";
import { Plus, Wifi, MoreVertical, Trash2, Pencil, Link2 } from "lucide-react";
import { Dialog, Menu } from "@headlessui/react";
import ConnectionForm from "@/components/clients/mqtt/ConnectionForm";
import { MqttConnectionOptions } from "@/types/mqtt/mqtt";

interface AppSidebarProps {
  connections: SavedConnection[];
  selectedConnectionId: string | null;
  onSelectConnection: (id: string | null) => void;
  onDeleteConnection: (id: string) => void;
  onConnect: (options: MqttConnectionOptions) => void;
  onDisconnect: () => void;
  connectionStatus: string;
  onSave: (newConnection: Omit<SavedConnection, "id">) => void;
  onUpdate: (id: string, updatedFields: Partial<SavedConnection>) => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({
  connections,
  selectedConnectionId,
  onSelectConnection,
  onDeleteConnection,
  onConnect,
  onDisconnect,
  connectionStatus,
  onSave,
  onUpdate,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<SavedConnection | null>(null);

  const handleOpenNew = useCallback(() => {
    setEditingConnection(null);
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((conn: SavedConnection) => {
    setEditingConnection(conn);
    setIsModalOpen(true);
  }, []);

  return (
    <div className="w-full bg-gray-900 text-white shadow-lg border-b border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <Wifi className="text-blue-400" size={22} />
          <h2 className="text-xl font-semibold text-blue-400">Connections</h2>
        </div>
        <button
          onClick={handleOpenNew}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-9 h-9 flex items-center justify-center shadow-md transition"
          title="Add New Connection"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Horizontal List */}
      <div className="flex overflow-x-auto space-x-3 p-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
        {connections.length === 0 ? (
          <div className="text-gray-400 text-sm py-2 px-4">No connections. Click + to add.</div>
        ) : (
          connections.map((conn) => (
            <div
              key={conn.id}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border min-w-[220px] transition-all cursor-pointer group ${
                conn.id === selectedConnectionId
                  ? "bg-blue-700 border-blue-600 shadow-inner"
                  : "bg-gray-800 border-gray-700 hover:ring-1 hover:ring-blue-500"
              }`}
            >
              <div
                className="flex-1 truncate font-medium text-sm hover:text-blue-300"
                onClick={() => onSelectConnection(conn.id)}
                title={conn.name}
              >
                {conn.name}
              </div>

              <Menu as="div" className="relative">
                <Menu.Button className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition">
                  <MoreVertical size={18} />
                </Menu.Button>
                <Menu.Items className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => handleEdit(conn)}
                        className={`flex items-center w-full px-3 py-2 text-sm ${
                          active ? "bg-gray-700 text-white" : "text-gray-300"
                        }`}
                      >
                        <Pencil size={16} className="mr-2" /> Edit
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => onSelectConnection(conn.id)}
                        className={`flex items-center w-full px-3 py-2 text-sm ${
                          active ? "bg-gray-700 text-white" : "text-gray-300"
                        }`}
                      >
                        <Link2 size={16} className="mr-2" /> Connect
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => onDeleteConnection(conn.id)}
                        className={`flex items-center w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 ${
                          active ? "bg-gray-700" : ""
                        }`}
                      >
                        <Trash2 size={16} className="mr-2" /> Delete
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Menu>
            </div>
          ))
        )}
      </div>

      {/* Connection Form Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-4xl bg-gray-900 rounded-xl border border-gray-700 shadow-2xl overflow-y-auto max-h-[90vh]">
            <ConnectionForm
              connection={editingConnection}
              isExpanded
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
