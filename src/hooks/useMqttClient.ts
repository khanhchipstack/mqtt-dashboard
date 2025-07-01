  "use client";

  import { useState, useEffect, useCallback } from "react";
  import mqtt, { MqttClient, IClientOptions, IClientPublishOptions } from "mqtt";
  import {
    MqttConnectionOptions,
    MqttMessage,
    SubscribeOptions,
    PublishOptions,
    Mqtt5WillProperties,
    Mqtt5ConnectProperties,
    Mqtt5PublishProperties,
  } from "@/types/mqtt";
  import { generateMessageId } from "@/utils/idGenerator";
  import { toast } from "react-toastify";

  type ConnectionStatus = "Connected" | "Connecting" | "Disconnected" | "Error";

  interface MqttClientHookResult {
    client: MqttClient | null;
    connectionStatus: ConnectionStatus;
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
    const [client, setClient] = useState<MqttClient | null>(null);
    const [connectionStatus, setConnectionStatus] =
      useState<ConnectionStatus>("Disconnected");
    const [receivedMessages, setReceivedMessages] = useState<MqttMessage[]>([]);
    const [activeSubscriptions, setActiveSubscriptions] = useState<
      SubscribeOptions[]
    >([]);
    const [selectedTopics, setSelectedTopics] = useState<SubscribeOptions[]>([]);
    const [currentProtocolVersion, setCurrentProtocolVersion] = useState<4 | 5>(4);

    const connect = useCallback(
      (
        options: MqttConnectionOptions,
        initialSubscriptions: SubscribeOptions[] = []
      ) => {
        if (client && client.connected) {
          toast.warn("Already connected. Disconnect before connecting to a new broker.");
          return;
        }

        setConnectionStatus("Connecting");
        setReceivedMessages([]);
        setActiveSubscriptions([]);
        setSelectedTopics([]);
        const connectUrl = `${options.protocol}://${options.host}:${options.port}`;

        let mqtt5ConnectProperties: Mqtt5ConnectProperties | undefined = undefined;
        if (options.protocolVersion === 5 && options.properties) {
          try {
            mqtt5ConnectProperties = {
              sessionExpiryInterval: options.properties.sessionExpiryInterval,
              receiveMaximum: options.properties.receiveMaximum,
              maximumPacketSize: options.properties.maximumPacketSize,
              topicAliasMaximum: options.properties.topicAliasMaximum,
              requestResponseInformation:
                options.properties.requestResponseInformation,
              requestProblemInformation:
                options.properties.requestProblemInformation,
              userProperties: options.properties.userProperties,
            };
          } catch (e) {
            console.error("Error parsing MQTT 5.0 Connect User Properties:", e);
            toast.error("Invalid MQTT 5.0 connect properties format.");
            setConnectionStatus("Error");
            return;
          }
        }

        let mqtt5WillProperties: Mqtt5WillProperties | undefined = undefined;
        if (
          options.will &&
          options.protocolVersion === 5 &&
          options.will.properties
        ) {
          try {
            mqtt5WillProperties = {
              willDelayInterval: options.will.properties.willDelayInterval,
              messageExpiryInterval:
                options.will.properties.messageExpiryInterval,
              contentType: options.will.properties.contentType,
              responseTopic: options.will.properties.responseTopic,
              correlationData: options.will.properties.correlationData
                ? Buffer.from(options.will.properties.correlationData, "base64")
                : undefined,
              payloadFormatIndicator:
                options.will.properties.payloadFormatIndicator,
              userProperties: options.will.properties.userProperties,
            };
          } catch (e) {
            console.error(
              "Error parsing MQTT 5.0 Will User Properties or Correlation Data:",
              e
            );
            toast.error("Invalid MQTT 5.0 will properties format.");
            setConnectionStatus("Error");
            return;
          }
        }

        const mqttOptions: IClientOptions = {
          clientId: options.clientId,
          username: options.username || undefined,
          password: options.password || undefined,
          clean: options.clean ?? true,
          keepalive: options.keepalive ?? 60,
          connectTimeout: options.connectTimeout ?? 10_000,
          reconnectPeriod: options.reconnectPeriod ?? 0,
          protocolVersion: options.protocolVersion,
          will: options.will
            ? {
                topic: options.will.topic,
                payload: options.will.payload,
                qos: options.will.qos,
                retain: options.will.retain,
                properties: mqtt5WillProperties,
              }
            : undefined,
          rejectUnauthorized: options.rejectUnauthorized ?? true,
          ca: options.ca?.trim() ? Buffer.from(options.ca, "utf-8") : undefined,
          cert: options.cert?.trim() ? Buffer.from(options.cert, "utf-8") : undefined,
          key: options.key?.trim() ? Buffer.from(options.key, "utf-8") : undefined,
          properties: options.protocolVersion === 5 ? mqtt5ConnectProperties : undefined,
        };

        try {
          console.log({
            connectUrl,
            mqttOptions,
            
          })
          const mqttClient = mqtt.connect(connectUrl, mqttOptions);
          
          mqttClient.on("connect", () => {
            setConnectionStatus("Connected");
            setCurrentProtocolVersion(options.protocolVersion);
            toast.success(
              `Connected to ${options.host}:${options.port} (MQTT ${options.protocolVersion}.0)`
            );

            initialSubscriptions.forEach((sub) => {
              mqttClient.subscribe(sub.topic, { qos: sub.qos }, (err) => {
                if (err) {
                  console.error(`Failed to auto-subscribe to ${sub.topic}:`, err);
                  toast.error(`Failed to auto-subscribe to ${sub.topic}: ${err.message}`);
                } else {
                  console.log(`Auto-subscribed to topic: ${sub.topic}`);
                  setActiveSubscriptions((prev) => {
                    if (!prev.some((s) => s.id === sub.id)) {
                      return [...prev, sub];
                    }
                    return prev;
                  });
                  setSelectedTopics((prev) => {
                    if (!prev.some((s) => s.id === sub.id)) {
                      return [...prev, sub];
                    }
                    return prev;
                  });
                }
              });
            });
          });

          mqttClient.on("error", (err) => {
            setConnectionStatus("Error");
            console.error("MQTT connection error:", err);
            toast.error(`Connection error: ${err.message}`);
          });

          mqttClient.on("reconnect", () => {
            setConnectionStatus("Connecting");
            toast.info("Reconnecting...");
          });

          mqttClient.on("close", () => {
            setConnectionStatus("Disconnected");
            setClient(null);
            setActiveSubscriptions([]);
            setSelectedTopics([]);
            setCurrentProtocolVersion(4);
            toast.info("Disconnected from broker.");
          });

          mqttClient.on("offline", () => {
            setConnectionStatus("Disconnected");
            toast.warn("MQTT Client is offline.");
          });

          mqttClient.on("end", () => {
            setConnectionStatus("Disconnected");
            setClient(null);
            setActiveSubscriptions([]);
            setSelectedTopics([]);
            setCurrentProtocolVersion(4);
            toast.info("MQTT Client connection ended.");
          });

          mqttClient.on("message", (topic, message, packet) => {
            let parsedPayload: any = null;
            const msgString = message.toString();
            try {
              if (msgString.startsWith("{") && msgString.endsWith("}")) {
                parsedPayload = JSON.parse(msgString);
              }
            } catch (e) {
              // Not JSON
            }

            setReceivedMessages((prevMessages) => [
              ...prevMessages,
              {
                id: generateMessageId(),
                topic,
                message: msgString,
                parsedPayload,
                qos: packet.qos,
                timestamp: new Date().toLocaleString(),
                size: message.byteLength,
              },
            ]);
          });

          setClient(mqttClient);
        } catch (error: any) {
          setConnectionStatus("Error");
          console.error("Failed to connect:", error);
          toast.error(`Failed to connect: ${error.message}`);
        }
      },
      [client]
    );

    const disconnect = useCallback(() => {
      if (client) {
        client.end(true, () => {
          setConnectionStatus("Disconnected");
          setClient(null);
          setActiveSubscriptions([]);
          setSelectedTopics([]);
          setCurrentProtocolVersion(4);
          toast.info("MQTT Client disconnected.");
        });
      } else {
        setConnectionStatus("Disconnected");
        toast.warn("No connection to disconnect.");
      }
    }, [client]);

    const subscribe = useCallback(
      (options: SubscribeOptions) => {
        if (client && client.connected) {
          if (activeSubscriptions.some((sub) => sub.topic === options.topic)) {
            toast.warn(`Already subscribed to "${options.alias || options.topic}"`);
            return;
          }

          client.subscribe(options.topic, { qos: options.qos }, (err) => {
            if (err) {
              console.error(`Failed to subscribe to ${options.topic}:`, err);
              toast.error(`Failed to subscribe to ${options.topic}: ${err.message}`);
            } else {
              console.log(`Subscribed to topic: ${options.topic}`);
              setActiveSubscriptions((prev) => [...prev, options]);
              setSelectedTopics((prev) => [...prev, options]); // Auto-select new subscription
              toast.success(`Subscribed to "${options.alias || options.topic}"`);
            }
          });
        } else {
          toast.error("Not connected to MQTT broker. Please connect first.");
        }
      },
      [client, activeSubscriptions]
    );

    const unsubscribe = useCallback(
      (id: string, topic: string) => {
        if (client && client.connected) {
          client.unsubscribe(topic, (err) => {
            if (err) {
              console.error(`Failed to unsubscribe from ${topic}:`, err);
              toast.error(`Failed to unsubscribe from ${topic}: ${err.message}`);
            } else {
              console.log(`Unsubscribed from topic: ${topic}`);
              setActiveSubscriptions((prev) => {
                const unsubscribedItem = prev.find((sub) => sub.id === id);
                if (unsubscribedItem) {
                  toast.info(
                    `Unsubscribed from "${unsubscribedItem.alias || unsubscribedItem.topic}"`
                  );
                }
                return prev.filter((sub) => sub.id !== id);
              });
              setSelectedTopics((prev) => prev.filter((sub) => sub.id !== id));
              setReceivedMessages((prevMessages) =>
                prevMessages.filter((msg) => msg.topic !== topic)
              );
            }
          });
        } else {
          toast.error("Not connected to MQTT broker.");
        }
      },
      [client]
    );

    const toggleSelectedTopic = useCallback((topic: SubscribeOptions) => {
      setSelectedTopics((prev) => {
        if (prev.some((sub) => sub.id === topic.id)) {
          return prev.filter((sub) => sub.id !== topic.id);
        } else {
          return [...prev, topic];
        }
      });
    }, []);

    const publish = useCallback(
      (options: PublishOptions) => {
        if (client && client.connected) {
          let payloadBuffer: string | Buffer;
          let payloadSize: number = 0;
          try {
            switch (options.format) {
              case "json":
                JSON.parse(options.payload);
                payloadBuffer = options.payload;
                break;
              case "hex":
                payloadBuffer = Buffer.from(
                  options.payload.replace(/\s/g, ""),
                  "hex"
                );
                break;
              case "base64":
                payloadBuffer = Buffer.from(options.payload, "base64");
                break;
              case "plaintext":
              default:
                payloadBuffer = options.payload;
                break;
            }
            payloadSize =
              typeof payloadBuffer === "string"
                ? Buffer.byteLength(payloadBuffer, "utf8")
                : payloadBuffer.byteLength;
          } catch (e: any) {
            toast.error(`Invalid payload format: ${e.message}`);
            console.error("Error parsing payload:", e);
            return;
          }

          let mqtt5PublishProperties: Mqtt5PublishProperties | undefined =
            undefined;
          if (currentProtocolVersion === 5 && options.properties) {
            try {
              mqtt5PublishProperties = {
                payloadFormatIndicator: options.properties.payloadFormatIndicator,
                messageExpiryInterval: options.properties.messageExpiryInterval,
                contentType: options.properties.contentType,
                responseTopic: options.properties.responseTopic,
                correlationData: options.properties.correlationData
                  ? Buffer.from(options.properties.correlationData, "base64")
                  : undefined,
                userProperties: options.properties.userProperties,
              };
            } catch (e) {
              console.error(
                "Error parsing MQTT 5.0 Publish User Properties or Correlation Data:",
                e
              );
              toast.error("Invalid MQTT 5.0 publish properties format.");
              return;
            }
          }

          const publishOptions: IClientPublishOptions = {
            qos: options.qos,
            retain: options.retain,
            properties: mqtt5PublishProperties,
          };

          client.publish(options.topic, payloadBuffer, publishOptions, (err) => {
            if (err) {
              console.error(`Failed to publish to ${options.topic}:`, err);
              toast.error(`Failed to publish to ${options.topic}: ${err.message}`);
            } else {
              console.log(
                `Published message to ${options.topic}: ${options.payload}`
              );
              toast.success(`Published to "${options.topic}"`);
              setReceivedMessages((prevMessages) => [
                ...prevMessages,
                {
                  id: generateMessageId(),
                  topic: options.topic,
                  message: options.payload,
                  parsedPayload:
                    options.format === "json"
                      ? JSON.parse(options.payload)
                      : options.payload,
                  qos: options.qos,
                  timestamp: new Date().toLocaleString(),
                  isPublished: true,
                  size: payloadSize,
                },
              ]);
            }
          });
        } else {
          toast.error("Not connected to MQTT broker. Please connect first.");
        }
      },
      [client, currentProtocolVersion]
    );

    // Filter messages based on selected topics
    const filteredMessages = receivedMessages.filter((msg) =>
      selectedTopics.some((sub) => sub.topic === msg.topic)
    );

    useEffect(() => {
      return () => {
        if (client) {
          client.end();
        }
      };
    }, [client]);

    return {
      client,
      connectionStatus,
      receivedMessages: filteredMessages,
      activeSubscriptions,
      selectedTopics,
      connect,
      disconnect,
      subscribe,
      unsubscribe,
      publish,
      toggleSelectedTopic,
      currentProtocolVersion,
    };
  };