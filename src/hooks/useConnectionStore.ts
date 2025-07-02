"use client";

import { create } from "zustand";
import { SavedConnection } from "@/types/connection";
import { MqttClient } from "mqtt";
import { toast } from "react-toastify";
import { useConfirmDialog } from "./useConfirmDialog";
import { mqttClientManager } from "@/lib/mqttClientManager";

const LOCAL_STORAGE_KEY = "mqtt_connection";

export type ConnectionStatus = "Connected" | "Connecting" | "Disconnected" | "Error";

interface ConnectionStore {
  connection: SavedConnection | null;
  mqttClient: MqttClient | null;
  connectionStatus: ConnectionStatus;
  setConnection: (conn: SavedConnection) => void;
  updateConnection: (updatedFields: Partial<SavedConnection>) => void;
  deleteConnection: () => void;
  getConnection: () => SavedConnection | null;
  setMqttClient: (client: MqttClient | null) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
}

export const useConnectionStore = create<ConnectionStore>((set, get) => ({
  connection: null,
  mqttClient: null,
  connectionStatus: "Disconnected",

  setConnection: (conn) => {
    if (get().connection) {
      toast.error("Chỉ được lưu một kết nối duy nhất!");
      return;
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(conn));
    set({ connection: conn, connectionStatus: "Connecting" });
    mqttClientManager.connect(conn); // Connect using the manager
    toast.success(`Kết nối "${conn.name}" đã được lưu!`);
  },

  updateConnection: (updatedFields) => {
    const current = get().connection;
    if (!current) {
      toast.error("Không có kết nối để cập nhật!");
      return;
    }

    const updated = { ...current, ...updatedFields };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    set({ connection: updated });
    toast.success("Kết nối đã được cập nhật!");
  },

  deleteConnection: () => {
    const current = get().connection;
    if (!current) {
      toast.error("Không có kết nối để xóa!");
      return;
    }

    const { openConfirm } = useConfirmDialog.getState();

    openConfirm({
      title: "Xóa kết nối",
      description: `Bạn có chắc muốn xóa kết nối "${current.name || "Unnamed"}"?`,
      onConfirm: () => {
        mqttClientManager.disconnect();
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        set({ connection: null, mqttClient: null, connectionStatus: "Disconnected" });
        toast.info(`Kết nối "${current.name || "Unnamed"}" đã được xóa.`);
      },
    });
  },

  getConnection: () => {
    return get().connection;
  },

  setMqttClient: (client) => {
    set({ mqttClient: client });
  },

  setConnectionStatus: (status) => {
    set({ connectionStatus: status });
  },
}));

// Load from localStorage on initialization
if (typeof window !== "undefined") {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const connection = JSON.parse(stored);
      useConnectionStore.setState({ connection });
      mqttClientManager.connect(connection); // Reconnect on load
    }
  } catch (error) {
    console.error("Failed to load connection:", error);
    toast.error("Không thể tải kết nối đã lưu.");
  }
}