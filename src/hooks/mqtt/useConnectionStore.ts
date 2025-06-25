// src/hooks/mqtt/useConnectionStore.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { SavedConnection } from '@/types/mqtt/connection'; // Updated import path
import { generateUniqueId } from '@/utils/mqtt/idGenerator'; // Updated import path
import { toast } from 'react-toastify';

const LOCAL_STORAGE_KEY = 'mqtt_connections';

export const useConnectionStore = () => {
  const [connections, setConnections] = useState<SavedConnection[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedConnections = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedConnections) {
        setConnections(JSON.parse(storedConnections));
      }
    } catch (error) {
      console.error("Failed to load connections from localStorage:", error);
      toast.error("Failed to load saved connections.");
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(connections));
    } catch (error) {
      console.error("Failed to save connections to localStorage:", error);
      toast.error("Failed to save connections.");
    }
  }, [connections]);

  const addConnection = useCallback((newConnection: Omit<SavedConnection, 'id'>) => {
    const connectionWithId: SavedConnection = {
      ...newConnection,
      id: generateUniqueId(),
    };
    setConnections((prev) => [...prev, connectionWithId]);
    setSelectedConnectionId(connectionWithId.id);
    toast.success(`Connection "${newConnection.name}" saved!`);
  }, []);

  const updateConnection = useCallback((id: string, updatedFields: Partial<SavedConnection>) => {
    setConnections((prev) =>
      prev.map((conn) => (conn.id === id ? { ...conn, ...updatedFields } : conn))
    );
    toast.success(`Connection updated!`);
  }, []);

  const deleteConnection = useCallback((id: string) => {
    const connToDelete = connections.find(conn => conn.id === id);
    if (window.confirm(`Are you sure you want to delete connection "${connToDelete?.name || 'Unnamed Connection'}"?`)) {
      setConnections((prev) => prev.filter((conn) => conn.id !== id));
      if (selectedConnectionId === id) {
        setSelectedConnectionId(null);
      }
      toast.info(`Connection "${connToDelete?.name || 'Unnamed Connection'}" deleted.`);
    }
  }, [connections, selectedConnectionId]);

  const selectConnection = useCallback((id: string | null) => {
    setSelectedConnectionId(id);
    console.log('id',id)
  }, []);

  const getSelectedConnection = useCallback(() => {
    return connections.find((conn) => conn.id === selectedConnectionId);
  }, [connections, selectedConnectionId]);

  return {
    connections,
    selectedConnectionId,
    addConnection,
    updateConnection,
    deleteConnection,
    selectConnection,
    getSelectedConnection,
  };
};