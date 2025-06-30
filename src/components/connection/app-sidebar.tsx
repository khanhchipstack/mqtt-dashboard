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
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Handle responsive sidebar state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobileOpen(false);
      } else {
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Tự động mở form nếu chưa có connection
  useEffect(() => {
    if (connections.length === 0) {
      setIsModalOpen(true);
    }else{
      setIsModalOpen(false)
    }
  }, [connections.length]);

  const handleOpenNew = useCallback(() => {
    setEditingConnection(null);
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((conn: SavedConnection) => {
    setEditingConnection(conn);
    setIsModalOpen(true);
  }, []);

  // Determine layout based on modal state and screen size
  const [isHorizontal, setIsHorizontal] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const check = () => {
        setIsHorizontal(!isModalOpen && window.innerWidth >= 768);
      };
  
      check(); // Gọi lần đầu
      window.addEventListener("resize", check);
  
      return () => window.removeEventListener("resize", check);
    }
  }, [isModalOpen]);

  return (
    <div
      className={`bg-gray-900 text-white border-b md:border-b-0 md:border-r border-gray-800 flex transition-all duration-300 ${
        isHorizontal
          ? `flex-row items-center justify-between p-2 md:p-3 h-auto md:h-full flex-col ${
              isExpanded ? "w-72" : "w-16"
            }`
          : `flex-col h-full ${
              isMobileOpen ? "fixed inset-y-0 left-0 z-50 w-72" : ""
            }`
      }`}
    >
      {/* Header or Toggle */}
      <div className="flex items-center justify-between w-full md:w-auto p-2">
        {isHorizontal ? (
          <div className="flex items-center space-x-2">
            <Wifi className="text-blue-400" size={20} />
            {isExpanded && (
              <h2 className="text-md font-semibold text-blue-400">
                Connections
              </h2>
            )}
          </div>
        ) : isExpanded ? (
          <div className="flex items-center space-x-2">
            <Wifi className="text-blue-400" size={22} />
            <h2 className="text-lg font-semibold text-blue-400">Connections</h2>
          </div>
        ) : (
          <Wifi className="text-blue-400" size={22} />
        )}

        <button
          onClick={() => {
            if (isHorizontal) {
              setIsExpanded(!isExpanded);
            } else {
              setIsExpanded(!isExpanded);
              setIsMobileOpen(isExpanded ? false : true);
            }
          }}
          className="text-gray-400 hover:text-white p-1 sm:p-2 rounded transition"
          title={isExpanded ? "Collapse" : "Expand"}
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={isExpanded}
        >
          {isExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Connection List or Buttons */}
      <div
        className={`flex-1 ${
          isHorizontal
            ? "flex-row flex-wrap gap-2 p-2 overflow-x-auto"
            : "overflow-y-auto p-2 space-y-2"
        } relative z-0 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800`}
      >
        {connections.map((conn) => {
          const isSelected = conn.id === selectedConnectionId;
          const isConnected = isSelected && connectionStatus === "Connected";

          return (
            <div
              key={conn.id}
              onClick={() => onSelectConnection(conn.id)}
              title={conn.name}
              className={`group relative flex items-center p-1 sm:p-2 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? "bg-blue-700 border-blue-500 shadow-inner"
                  : "bg-gray-800 border-gray-700 hover:ring-1 hover:ring-blue-500"
              } ${isHorizontal ? "h-12" : ""}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onSelectConnection(conn.id);
                }
              }}
              aria-label={`Select connection ${conn.name}`}
            >
              {isHorizontal ? (
                <div className="flex items-center space-x-1 truncate w-full">
                  <span
                    className={`text-xs font-medium truncate flex-1 ${
                      isExpanded ? "" : "hidden"
                    }`}
                  >
                    {conn.name}
                  </span>
                  {isConnected ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDisconnect();
                      }}
                      className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-full"
                      aria-label={`Disconnect from ${conn.name}`}
                    >
                      <LogOut size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onConnect(conn.options);
                      }}
                      className="p-1 bg-green-600 hover:bg-green-700 text-white rounded-full"
                      aria-label={`Connect to ${conn.name}`}
                    >
                      <Link2 size={14} />
                    </button>
                  )}
                  <Menu as="div">
                    <Menu.Button
                      className={`p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full ${
                        isExpanded ? "" : "hidden"
                      }`}
                      aria-label={`More options for ${conn.name}`}
                    >
                      <MoreVertical size={16} />
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-[100]">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => handleEdit(conn)}
                            className={`flex items-center w-full px-3 py-2 text-xs ${
                              active
                                ? "bg-gray-700 text-white"
                                : "text-gray-300"
                            }`}
                            aria-label={`Edit ${conn.name}`}
                          >
                            <Pencil size={14} className="mr-2" /> Edit
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => onDeleteConnection(conn.id)}
                            className={`flex items-center w-full px-3 py-2 text-xs text-red-400 hover:text-red-300 ${
                              active ? "bg-gray-700" : ""
                            }`}
                            aria-label={`Delete ${conn.name}`}
                          >
                            <Trash2 size={14} className="mr-2" /> Delete
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Menu>
                </div>
              ) : isExpanded ? (
                <div className="flex-1 min-w-0">
                  <h4 className="truncate font-medium text-xs sm:text-sm hover:text-blue-300">
                    {conn.name}
                  </h4>
                  <div className="flex items-center space-x-2 mt-2">
                    {isConnected ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDisconnect();
                        }}
                        className="flex-1 text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white rounded px-2 sm:px-3 py-1 transition flex items-center justify-center"
                        aria-label={`Disconnect from ${conn.name}`}
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
                        className="flex-1 text-xs sm:text-sm bg-green-600 hover:bg-green-700 text-white rounded px-2 sm:px-3 py-1 transition flex items-center justify-center"
                        aria-label={`Connect to ${conn.name}`}
                      >
                        <Link2 size={12} className="mr-1" /> Connect
                      </button>
                    )}

                    <Menu as="div" className="relative">
                      <Menu.Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="p-2 sm:p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition"
                        aria-label={`More options for ${conn.name}`}
                      >
                        <MoreVertical size={18} />
                      </Menu.Button>
                      <Menu.Items className="absolute right-0 mt-2 w-40 sm:w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-70">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => handleEdit(conn)}
                              className={`flex items-center w-full px-3 py-2 text-xs sm:text-sm ${
                                active
                                  ? "bg-gray-700 text-white"
                                  : "text-gray-300"
                              }`}
                              aria-label={`Edit ${conn.name}`}
                            >
                              <Pencil size={16} className="mr-2" /> Edit
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => onDeleteConnection(conn.id)}
                              className={`flex items-center w-full px-3 py-2 text-xs sm:text-sm text-red-400 hover:text-red-300 ${
                                active ? "bg-gray-700" : ""
                              }`}
                              aria-label={`Delete ${conn.name}`}
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
                  <h4 className="truncate font-medium text-xs sm:text-sm hover:text-blue-300">
                    {conn.name}
                  </h4>
                  {isConnected ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDisconnect();
                      }}
                      title="Disconnect"
                      className="p-2 sm:p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition"
                      aria-label={`Disconnect from ${conn.name}`}
                    >
                      <LogOut size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onConnect(conn.options);
                      }}
                      title="Connect"
                      className="p-2 sm:p-3 bg-green-600 hover:bg-green-700 text-white rounded-full transition"
                      aria-label={`Connect to ${conn.name}`}
                    >
                      <Link2 size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {connections.length === 0 && !isHorizontal && isExpanded && (
          <div className="text-gray-400 text-xs sm:text-sm px-2 text-center mt-4">
            No connections. Please create one.
          </div>
        )}
      </div>

      {/* Add New Connection Button */}
      {!isHorizontal && connections.length === 0 && (
        <div className="p-3 border-t border-gray-800">
          <Button
            onClick={handleOpenNew}
            className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition"
            aria-label="Add new connection"
          >
            <Plus size={16} />
            {isExpanded ? "Add New Connection" : ""}
          </Button>
        </div>
      )}
      {isHorizontal && connections.length === 0 && (
        <Button
          onClick={handleOpenNew}
          className={`flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-2 py-1 transition h-10 ${
            isExpanded ? "" : "w-10"
          }`}
          aria-label="Add new connection"
        >
          <Plus size={16} />
          {isExpanded && (
            <span className="ml-2 hidden md:inline">Add New Connection</span>
          )}
        </Button>
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
        <div className="fixed inset-y-0 left-0 flex items-center justify-center p-4 sm:p-6 w-full">
          <Dialog.Panel className="w-full max-w-lg sm:w-full md:w-full bg-gray-900 rounded-xl border border-gray-700 shadow-2xl max-h-[90vh]">
            <ConnectionForm
              connection={editingConnection}
              isExpanded
              onClose={() => {
                setIsModalOpen(false);
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
