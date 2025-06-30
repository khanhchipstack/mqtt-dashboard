"use client";

import { create } from "zustand";
import { SavedConnection } from "@/types/connection";
import { toast } from "react-toastify";
import { useConfirmDialog } from "./useConfirmDialog";

const LOCAL_STORAGE_KEY = "mqtt_connection";

interface ConnectionStore {
  connection: SavedConnection | null;
  setConnection: (conn: SavedConnection) => void;
  updateConnection: (updatedFields: Partial<SavedConnection>) => void;
  deleteConnection: () => void;
  getConnection: () => SavedConnection | null;
}

export const useConnectionStore = create<ConnectionStore>((set, get) => ({
  connection: null,

  setConnection: (conn) => {
    if (get().connection) {
      toast.error("Chỉ được lưu một kết nối duy nhất!");
      return;
    }
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(conn));
    set({ connection: conn });
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
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        set({ connection: null });
        toast.info(`Kết nối "${current.name || "Unnamed"}" đã được xóa.`);
      },
    });
  },

  getConnection: () => {
    return get().connection;
  },
}));

// Tự load từ localStorage khi lần đầu load app
if (typeof window !== "undefined") {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      useConnectionStore.setState({ connection: JSON.parse(stored) });
    }
  } catch (error) {
    console.error("Failed to load connection:", error);
    toast.error("Không thể tải kết nối đã lưu.");
  }
}