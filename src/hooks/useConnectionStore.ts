// src/hooks/mqtt/useConnectionStore.ts
"use client";

import { create } from "zustand";
import { SavedConnection } from "@/types/connection";
import { generateUniqueId } from "@/utils/idGenerator";
import { toast } from "react-toastify";
import { useConfirmDialog } from "./useConfirmDialog";

const LOCAL_STORAGE_KEY = "mqtt_connections";

interface ConnectionStore {
  connections: SavedConnection[];
  selectedConnectionId: string | null;

  addConnection: (conn: Omit<SavedConnection, "id">) => void;
  updateConnection: (
    id: string,
    updatedFields: Partial<SavedConnection>
  ) => void;
  deleteConnection: (id: string) => void;
  selectConnection: (id: string | null) => void;
  getSelectedConnection: () => SavedConnection | undefined;
}

export const useConnectionStore = create<ConnectionStore>((set, get) => ({
  connections: [],
  selectedConnectionId: null,

  addConnection: (conn) => {
    if (get().connections.length > 0) {
      toast.error("Chỉ được lưu tối đa 1 connection!");
      return;
    }
    
    const newConn: SavedConnection = { ...conn, id: generateUniqueId() };
    const updated = [newConn];  // Chỉ có 1 phần tử
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    set({ connections: updated, selectedConnectionId: newConn.id });
    toast.success(`Connection "${newConn.name}" saved!`);
  },
  
  updateConnection: (id, updatedFields) => {
    const updated = get().connections.map((c) =>
      c.id === id ? { ...c, ...updatedFields } : c
    );
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    set({ connections: updated });
    toast.success("Connection updated!");
  },
  

  deleteConnection: (id) => {
    const toDelete = get().connections.find((c) => c.id === id);
    if (!toDelete) return;
  
    const { openConfirm } = useConfirmDialog.getState();
  
    openConfirm({
      title: "Xóa kết nối",
      description: `Bạn có chắc muốn xóa kết nối "${toDelete.name || "Unnamed"}"?`,
      onConfirm: () => {
        const updated = get().connections.filter((c) => c.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        set({
          connections: updated,
          selectedConnectionId:
            get().selectedConnectionId === id ? null : get().selectedConnectionId,
        });
        toast.info(`Kết nối "${toDelete.name || "Unnamed"}" đã được xóa.`);
      },
    });
  },

  selectConnection: (id) => {
    set({ selectedConnectionId: id });
  },

  getSelectedConnection: () => {
    return get().connections.find((c) => c.id === get().selectedConnectionId);
  },
}));

// Tự load từ localStorage khi lần đầu load app
if (typeof window !== "undefined") {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      useConnectionStore.setState({ connections: JSON.parse(stored) });
    }
  } catch (error) {
    console.error("Failed to load connections:", error);
    toast.error("Failed to load saved connections.");
  }
}
