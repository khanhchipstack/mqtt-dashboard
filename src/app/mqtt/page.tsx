"use client";

import React, { useEffect, useState, useCallback } from "react";
import SubscribeSection from "@/components/mqtt/SubscribeSection";
import AppSidebar from "@/components/connection/app-sidebar";
import { useMqttClient } from "@/hooks/useMqttClient";
import { useConnectionStore } from "@/hooks/useConnectionStore";
import { SavedConnection } from "@/types/connection";
import { MqttConnectionOptions, SubscribeOptions } from "@/types/mqtt";
import "react-toastify/dist/ReactToastify.css";
import { Layout } from "@/components/layout/layout";
import { MessageCircleMore } from "lucide-react";
import MqttChatBox from "@/components/mqtt/MqttChat";

export default function MqttClientPage() {
  const {
    connections,
    selectedConnectionId,
    addConnection,
    updateConnection,
    deleteConnection,
    selectConnection,
    getSelectedConnection,
  } = useConnectionStore();

  const {
    connectionStatus,
    receivedMessages,
    activeSubscriptions,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    publish,
    currentProtocolVersion,
  } = useMqttClient();

  const currentConnection = getSelectedConnection();
  const [isConnectionFormExpanded, setIsConnectionFormExpanded] =
    useState(true);
  const [selectedTopic, setSelectedTopic] = useState<SubscribeOptions | null>(
    null
  );
  const [newConnectionData, setNewConnectionData] = useState<Omit<
    SavedConnection,
    "id"
  > | null>(null);

  const connectionForForm =
    selectedConnectionId === null ? newConnectionData : currentConnection;

  useEffect(() => {
    if (!currentConnection && selectedConnectionId !== null) {
      setNewConnectionData(null);
      setIsConnectionFormExpanded(true);
    } else if (
      connectionStatus === "Connected" &&
      isConnectionFormExpanded &&
      selectedConnectionId !== null
    ) {
      setIsConnectionFormExpanded(false);
    } else if (selectedConnectionId === null) {
      setIsConnectionFormExpanded(true);
    }
  }, [
    connectionStatus,
    isConnectionFormExpanded,
    currentConnection,
    selectedConnectionId,
  ]);

  const handleSaveNewConnection = useCallback(
    (newConn: Omit<SavedConnection, "id">) => {
      addConnection(newConn);
      setNewConnectionData(null);
      selectConnection(newConn.id);
      setIsConnectionFormExpanded(false);
    },
    [addConnection, selectConnection]
  );

  const handleUpdateConnection = useCallback(
    (id: string, updatedFields: Partial<SavedConnection>) => {
      updateConnection(id, updatedFields);
      if (selectedConnectionId === id && connectionStatus !== "Disconnected") {
        disconnect();
        setTimeout(() => {
          const latestConnection = getSelectedConnection();
          if (latestConnection?.options) {
            connect(latestConnection.options, latestConnection.subscriptions);
          }
        }, 500);
      }
      setIsConnectionFormExpanded(false);
    },
    [
      updateConnection,
      selectedConnectionId,
      connectionStatus,
      disconnect,
      connect,
      getSelectedConnection,
    ]
  );

  const handleConnectSelected = useCallback(
    (options: MqttConnectionOptions) => {
      if (selectedConnectionId === null && newConnectionData) {
        alert("Please select or create a connection first.");
      } else if (currentConnection) {
        connect(options, currentConnection.subscriptions);
      } else {
        alert("Please select or create a connection first.");
      }
    },
    [
      currentConnection,
      connect,
      selectedConnectionId,
      newConnectionData,
      addConnection,
      connections,
      selectConnection,
    ]
  );

  const handleSubscribeTopic = useCallback(
    (options: SubscribeOptions) => {
      subscribe(options);
      if (currentConnection) {
        updateConnection(currentConnection.id, {
          subscriptions: [...currentConnection.subscriptions, options],
        });
      } else if (selectedConnectionId === null && newConnectionData) {
        setNewConnectionData((prev) =>
          prev
            ? { ...prev, subscriptions: [...prev.subscriptions, options] }
            : null
        );
      }
    },
    [
      subscribe,
      currentConnection,
      updateConnection,
      selectedConnectionId,
      newConnectionData,
    ]
  );

  const handleUnsubscribeTopic = useCallback(
    (id: string, topic: string) => {
      unsubscribe(id, topic);
      if (currentConnection) {
        updateConnection(currentConnection.id, {
          subscriptions: currentConnection.subscriptions.filter(
            (sub) => sub.id !== id
          ),
        });
      } else if (selectedConnectionId === null && newConnectionData) {
        setNewConnectionData((prev) =>
          prev
            ? {
                ...prev,
                subscriptions: prev.subscriptions.filter(
                  (sub) => sub.id !== id
                ),
              }
            : null
        );
      }
      if (selectedTopic?.id === id) setSelectedTopic(null);
    },
    [
      unsubscribe,
      currentConnection,
      updateConnection,
      selectedTopic,
      selectedConnectionId,
      newConnectionData,
    ]
  );

  useEffect(() => {
    if (selectedConnectionId === null) {
      setNewConnectionData({
        name: `New Connection ${new Date().toLocaleTimeString()}`,
        options: {
          protocol: "ws",
          host: "localhost",
          port: 9003,
          clientId: `mqttjs_${Math.random().toString(16).substr(2, 8)}`,
          clean: true,
          keepalive: 60,
          connectTimeout: 10000,
          reconnectPeriod: 0,
          protocolVersion: 4,
        },
        subscriptions: [],
      });
      setIsConnectionFormExpanded(true);
      setSelectedTopic(null);
    } else if (currentConnection) {
      setIsConnectionFormExpanded(connectionStatus !== "Connected");
      setSelectedTopic(null);
    }
  }, [selectedConnectionId, currentConnection, connectionStatus]);

  useEffect(() => {
    if (
      !currentConnection &&
      connectionStatus !== "Disconnected" &&
      selectedConnectionId !== null
    ) {
      disconnect();
    }
  }, [currentConnection, connectionStatus, disconnect, selectedConnectionId]);

  const toggleConnectionForm = () =>
    setIsConnectionFormExpanded((prev) => !prev);

  const subscriptionsToDisplay =
    selectedConnectionId === null
      ? newConnectionData?.subscriptions || []
      : activeSubscriptions;

  return (
    <Layout>
      <div className="flex flex-col h-screen bg-gray-950 text-white md:flex-row">
        {/* Sidebar chiếm chiều ngang cố định */}
        <div>
          <AppSidebar
            connections={connections}
            selectedConnectionId={selectedConnectionId}
            onSelectConnection={(id) => {
              selectConnection(id);
              setNewConnectionData(null);
            }}
            onDeleteConnection={(id) => {
              deleteConnection(id);
              if (id === selectedConnectionId) {
                selectConnection(null);
                setNewConnectionData(null);
              }
            }}
            onConnect={handleConnectSelected}
            onDisconnect={disconnect}
            connectionStatus={connectionStatus}
            onSave={handleSaveNewConnection}
            onUpdate={handleUpdateConnection}
          />
        </div>

        {/* Khu vực chính */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {connectionForForm && (
            <div className="flex flex-col flex-1 overflow-hidden md:flex-row">
              {/* Subscriptions */}
              <div className="w-full md:w-72 bg-gray-900 border-b md:border-b-0 md:border-r border-gray-800 overflow-y-auto">
                <SubscribeSection
                  onSubscribe={handleSubscribeTopic}
                  isConnected={connectionStatus === "Connected"}
                  activeSubscriptions={subscriptionsToDisplay}
                  onUnsubscribe={handleUnsubscribeTopic}
                  onSelectTopic={setSelectedTopic}
                  selectedTopic={selectedTopic}
                />
              </div>

              {/* Messages & Publish */}
              <div className="flex-1 flex flex-col bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg overflow-hidden">
                <h3 className="text-xl font-semibold mb-3 flex items-center border-b border-gray-700 pb-2">
                  <MessageCircleMore className="text-cyan-300 mr-2" />
                  Chat
                  {selectedTopic ? (
                    <span className="ml-2 truncate text-yellow-400">
                      {selectedTopic.alias || selectedTopic.topic}
                    </span>
                  ) : (
                    <span className="ml-2 text-gray-500">
                      (No Topic Selected)
                    </span>
                  )}
                </h3>

                <div className="flex-1 overflow-hidden">
                  <MqttChatBox
                    messages={receivedMessages}
                    onPublish={publish}
                    isConnected={connectionStatus === "Connected"}
                    protocolVersion={currentProtocolVersion}
                    selectedTopic={selectedTopic}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
