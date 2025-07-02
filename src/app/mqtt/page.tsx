"use client";

import React, { useEffect, useState, useCallback } from "react";
import SubscribeSection from "@/components/mqtt/SubscribeSection";
import AppSidebar from "@/components/connection/app-sidebar";
import { SavedConnection } from "@/types/connection";
import { MqttConnectionOptions, SubscribeOptions } from "@/types/mqtt";
import "react-toastify/dist/ReactToastify.css";
import { Layout } from "@/components/layout/layout";
import { MessageCircleMore } from "lucide-react";
import MqttChatBox from "@/components/mqtt/MqttChat";
import { useConnectionStore } from "@/hooks/useConnectionStore";
import { useMqttClient } from "@/hooks/useMqttClient";

export default function MqttClientPage() {
  const {
    connection,
    setConnection,
    updateConnection,
    getConnection,
  } = useConnectionStore();

  const {
    connectionStatus,
    receivedMessages,
    activeSubscriptions,
    selectedTopics,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    publish,
    toggleSelectedTopic,
    currentProtocolVersion,
  } = useMqttClient();

  const [newConnectionData, setNewConnectionData] = useState<SavedConnection | null>(null);

  const connectionForForm = connection || newConnectionData;

  const handleSaveConnection = useCallback(
    (newConn: SavedConnection) => {
      setConnection(newConn);
      setNewConnectionData(null);
      connect(newConn.options, newConn.subscriptions);
    },
    [setConnection, connect]
  );

  const handleUpdateConnection = useCallback(
    (updatedFields: Partial<SavedConnection>) => {
      updateConnection(updatedFields);
      if (connectionStatus !== "Disconnected") {
        disconnect();
        setTimeout(() => {
          const latestConnection = getConnection();
          if (latestConnection?.options) {
            connect(latestConnection.options, latestConnection.subscriptions);
          }
        }, 500);
      }
    },
    [updateConnection, connectionStatus, disconnect, connect, getConnection]
  );

  const handleConnect = useCallback(
    (options: MqttConnectionOptions) => {
      if (connection) {
        connect(options, connection.subscriptions);
      } else if (newConnectionData) {
        handleSaveConnection(newConnectionData);
      }
    },
    [connection, connect, newConnectionData, handleSaveConnection]
  );

  const handleSubscribeTopic = useCallback(
    (options: SubscribeOptions) => {
      subscribe(options);
      if (connection) {
        updateConnection({
          subscriptions: [...connection.subscriptions, options],
        });
      } else if (newConnectionData) {
        setNewConnectionData((prev) =>
          prev
            ? { ...prev, subscriptions: [...prev.subscriptions, options] }
            : null
        );
      }
    },
    [subscribe, connection, updateConnection, newConnectionData]
  );

  const handleUnsubscribeTopic = useCallback(
    (id: string, topic: string) => {
      unsubscribe(id, topic);
      if (connection) {
        updateConnection({
          subscriptions: connection.subscriptions.filter(
            (sub) => sub.id !== id
          ),
        });
      } else if (newConnectionData) {
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
    },
    [unsubscribe, connection, updateConnection, newConnectionData]
  );

  useEffect(() => {
    if (!connection) {
      setNewConnectionData({
        name: `New Connection ${new Date().toLocaleTimeString()}`,
        options: {
          protocol: "wss",
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
    }
  }, [connection]);

  useEffect(() => {
    if (!connection && connectionStatus !== "Disconnected") {
      disconnect();
    }
  }, [connection, connectionStatus, disconnect]);

  const subscriptionsToDisplay = connection
    ? activeSubscriptions
    : newConnectionData?.subscriptions || [];

  return (
    <Layout>
      <div className="h-screen bg-gray-950 text-white flex flex-col">
        {/* Mobile Layout: AppSidebar and SubscribeSection in one row */}
        <div className="md:hidden flex flex-col sm:flex-row border-b border-gray-800">
          <div className="flex-1 sm:w-1/2">
            <AppSidebar
              connection={connection}
              onConnect={handleConnect}
              onDisconnect={disconnect}
              connectionStatus={connectionStatus}
              onSave={handleSaveConnection}
              onUpdate={handleUpdateConnection}
            />
          </div>
          <div className="flex-1 sm:w-1/2 bg-gray-900 border-t sm:border-t-0 sm:border-l border-gray-800">
            <SubscribeSection
              onSubscribe={handleSubscribeTopic}
              isConnected={connectionStatus === "Connected"}
              activeSubscriptions={subscriptionsToDisplay}
              onUnsubscribe={handleUnsubscribeTopic}
              selectedTopics={selectedTopics}
              toggleSelectedTopic={toggleSelectedTopic}
            />
          </div>
        </div>

        {/* Desktop Layout: AppSidebar in top row, SubscribeSection and MqttChatBox in bottom row */}
        <div className="hidden md:flex flex-col flex-1 overflow-hidden">
          <div className="border-b border-gray-800">
            <AppSidebar
              connection={connection}
              onConnect={handleConnect}
              onDisconnect={disconnect}
              connectionStatus={connectionStatus}
              onSave={handleSaveConnection}
              onUpdate={handleUpdateConnection}
            />
          </div>
          <div className="flex flex-1 overflow-hidden">
            <div className="w-72 bg-gray-900 border-r border-gray-800 overflow-y-auto">
              <SubscribeSection
                onSubscribe={handleSubscribeTopic}
                isConnected={connectionStatus === "Connected"}
                activeSubscriptions={subscriptionsToDisplay}
                onUnsubscribe={handleUnsubscribeTopic}
                selectedTopics={selectedTopics}
                toggleSelectedTopic={toggleSelectedTopic}
              />
            </div>
            <div className="flex-1 flex flex-col bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg overflow-hidden">
              <h3 className="text-xl font-semibold mb-3 flex items-center border-b border-gray-700 pb-2">
                <MessageCircleMore className="text-cyan-300 mr-2" />
                Tin nhắn
              </h3>
              <div className="flex-1 overflow-hidden">
                <MqttChatBox
                  messages={receivedMessages}
                  onPublish={publish}
                  isConnected={connectionStatus === "Connected"}
                  protocolVersion={currentProtocolVersion}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Chat Section */}
        <div className="md:hidden flex-1 flex flex-col bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg overflow-hidden">
          <h3 className="text-xl font-semibold mb-3 flex items-center border-b border-gray-700 pb-2">
            <MessageCircleMore className="text-cyan-300 mr-2" />
            Tin nhắn
          </h3>
          <div className="flex-1 overflow-hidden">
            <MqttChatBox
              messages={receivedMessages}
              onPublish={publish}
              isConnected={connectionStatus === "Connected"}
              protocolVersion={currentProtocolVersion}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}