"use client";

import React, { useState, useCallback, useEffect } from "react";
import { SavedConnection } from "@/types/connection";
import {
  Plus,
  Wifi,
  MoreVertical,
  Trash2,
  Pencil,
  Link2,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Dialog, Menu } from "@headlessui/react";
import ConnectionForm from "@/components/mqtt/ConnectionForm";
import { MqttConnectionOptions } from "@/types/mqtt";
import { Button } from "../ui/button";

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
  const [editingConnection, setEditingConnection] =
    useState<SavedConnection | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleOpenNew = useCallback(() => {
    setEditingConnection(null);
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((conn: SavedConnection) => {
    setEditingConnection(conn);
    setIsModalOpen(true);
  }, []);

  // Tự động mở form nếu chưa có connection
  useEffect(() => {
    if (connections.length === 0) {
      setIsModalOpen(true);
    }
  }, [connections.length]);
  return (
    <div
      className={`h-full bg-gray-900 text-white border-r border-gray-800 flex flex-col transition-all duration-300 ${
        isExpanded ? "w-72" : "w-16"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-gray-800">
        {isExpanded ? (
          <div className="flex items-center space-x-2">
            <Wifi className="text-blue-400" size={22} />
            <h2 className="text-lg font-semibold text-blue-400">Connections</h2>
          </div>
        ) : (
          <Wifi className="text-blue-400" size={22} />
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white p-1 rounded transition"
          title={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Danh sách Connection */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
        {connections.map((conn) => {
          const isSelected = conn.id === selectedConnectionId;
          const isConnected = isSelected && connectionStatus === "Connected";

          return (
            <div
              key={conn.id}
              onClick={() => onSelectConnection(conn.id)}
              title={conn.name}
              className={`group relative flex items-center p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-blue-700 border-blue-500 shadow-inner"
                  : "bg-gray-800 border-gray-700 hover:ring-1 hover:ring-blue-500"
              }`}
            >
              {isExpanded ? (
                <div className="flex-1 min-w-0">
                  <h4 className="truncate font-medium text-sm hover:text-blue-300">
                    {conn.name}
                  </h4>
                  <div className="flex items-center space-x-2 mt-2">
                    {isConnected ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDisconnect();
                        }}
                        className="flex-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded px-2 py-1 transition flex items-center justify-center"
                      >
                        <LogOut size={12} className="mr-1" /> Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectConnection(conn.id);
                          onConnect(conn.options);
                        }}
                        className="flex-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded px-2 py-1 transition flex items-center justify-center"
                      >
                        <Link2 size={12} className="mr-1" /> Connect
                      </button>
                    )}

                    {/* Dropdown Menu */}
                    <Menu as="div" className="relative">
                      <Menu.Button
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition"
                      >
                        <MoreVertical size={16} />
                      </Menu.Button>
                      <Menu.Items className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => handleEdit(conn)}
                              className={`flex items-center w-full px-3 py-2 text-sm ${
                                active
                                  ? "bg-gray-700 text-white"
                                  : "text-gray-300"
                              }`}
                            >
                              <Pencil size={16} className="mr-2" /> Edit
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
                </div>
              ) : (
                <div className="flex items-center space-x-2 ml-auto">
                  {isConnected ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDisconnect();
                      }}
                      title="Disconnect"
                      className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition"
                    >
                      <LogOut size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onConnect(conn.options);
                      }}
                      title="Connect"
                      className="p-1 bg-green-600 hover:bg-green-700 text-white rounded-full transition"
                    >
                      <Link2 size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {connections.length === 0 && isExpanded && (
          <div className="text-gray-400 text-sm px-2 text-center mt-4">
            No connections. Please create one.
          </div>
        )}
      </div>
      {/* Add New Connection Button */}
      {connections.length === 0 && (
        <div className="p-3 border-t border-gray-800">
          <Button
            onClick={handleOpenNew}
            className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition"
          >
            <Plus size={16} />
            {isExpanded ? "Add New Connection" : ""}
          </Button>
        </div>
      )}
      {/* Modal Form */}
      <Dialog
        open={isModalOpen}
        onClose={() => {
          if (connections.length !== 0) {
            setIsModalOpen(false);
          }
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-4xl bg-gray-900 rounded-xl border border-gray-700 shadow-2xl overflow-y-hidden max-h-[90vh]">
            <ConnectionForm
              connection={editingConnection}
              isExpanded
              onClose={() => {
                // if (connections.length !== 0) {
                setIsModalOpen(false);
                // }
              }}
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
