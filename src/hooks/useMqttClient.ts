"use client";

import { useState, useEffect } from "react";
import { MqttConnectionOptions, MqttMessage, SubscribeOptions, PublishOptions } from "@/types/mqtt";
import { mqttClientManager } from "@/lib/mqttClientManager";
import { ConnectionStatus, useConnectionStore } from "./useConnectionStore";
import { MqttClient } from "mqtt";

interface MqttClientHookResult {
  client: MqttClient | null;
  connectionStatus: string;
  receivedMessages: MqttMessage[];
  activeSubscriptions: SubscribeOptions[];
  selectedTopics: SubscribeOptions[];
  connect: (
    connectionOptions: MqttConnectionOptions,
    initialSubscriptions?: SubscribeOptions[]
  ) => void;
  disconnect: () => void;
  subscribe: (options: SubscribeOptions) => void;
  unsubscribe: (id: string, topic: string) => void;
  publish: (options: PublishOptions) => void;
  toggleSelectedTopic: (topic: SubscribeOptions) => void;
  currentProtocolVersion: 4 | 5;
}

export const useMqttClient = (): MqttClientHookResult => {
  const { setMqttClient, setConnectionStatus } = useConnectionStore();
  const [receivedMessages, setReceivedMessages] = useState<MqttMessage[]>([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState<SubscribeOptions[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<SubscribeOptions[]>([]);
  const [connectionStatus, setLocalConnectionStatus] = useState<string>(
    mqttClientManager.getConnectionStatus()
  );
  const [currentProtocolVersion, setCurrentProtocolVersion] = useState<4 | 5>(
    mqttClientManager.getCurrentProtocolVersion()
  );

  useEffect(() => {
    const updateState = () => {
      setReceivedMessages(mqttClientManager.getReceivedMessages());
      setActiveSubscriptions(mqttClientManager.getActiveSubscriptions());
      setSelectedTopics(mqttClientManager.getSelectedTopics());
      setLocalConnectionStatus(mqttClientManager.getConnectionStatus());
      setCurrentProtocolVersion(mqttClientManager.getCurrentProtocolVersion());
      setMqttClient(mqttClientManager.getClient());
      setConnectionStatus(mqttClientManager.getConnectionStatus() as ConnectionStatus);
    };

    // Đăng ký lắng nghe sự kiện stateChange
    mqttClientManager.on("stateChange", updateState);
    updateState(); // Đồng bộ trạng thái ban đầu

    return () => mqttClientManager.off("stateChange", updateState); // Dọn dẹp
  }, [setMqttClient, setConnectionStatus]);

  return {
    client: mqttClientManager.getClient(),
    connectionStatus,
    receivedMessages,
    activeSubscriptions,
    selectedTopics,
    connect: mqttClientManager.connect.bind(mqttClientManager),
    disconnect: mqttClientManager.disconnect.bind(mqttClientManager),
    subscribe: mqttClientManager.subscribe.bind(mqttClientManager),
    unsubscribe: mqttClientManager.unsubscribe.bind(mqttClientManager),
    publish: mqttClientManager.publish.bind(mqttClientManager),
    toggleSelectedTopic: mqttClientManager.toggleSelectedTopic.bind(mqttClientManager),
    currentProtocolVersion,
  };
};