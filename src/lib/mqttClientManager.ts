import mqtt, {
  MqttClient,
  IClientOptions,
  IClientPublishOptions,
  IClientSubscribeOptions,
  ISubscriptionGrant,
} from "mqtt";
import {
  Mqtt5PublishProperties,
  MqttConnectionOptions,
  MqttMessage,
  PublishOptions,
  SubscribeOptions,
} from "@/types/mqtt";
import { toast } from "react-toastify";
import { generateMessageId } from "@/utils/idGenerator";
import { Buffer } from "buffer";

class MqttClientManager {
  private static instance: MqttClientManager | null = null;
  private client: MqttClient | null = null;
  private connectionStatus:
    | "Connected"
    | "Connecting"
    | "Disconnected"
    | "Reconnecting"
    | "Error" = "Disconnected";
  private receivedMessages: MqttMessage[] = [];
  private activeSubscriptions: SubscribeOptions[] = [];
  private selectedTopics: SubscribeOptions[] = [];
  private currentProtocolVersion: 4 | 5 = 4;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  private constructor() {}

  public static getInstance(): MqttClientManager {
    if (!MqttClientManager.instance) {
      MqttClientManager.instance = new MqttClientManager();
    }
    return MqttClientManager.instance;
  }

  public connect(
    options: MqttConnectionOptions,
    initialSubscriptions: SubscribeOptions[] = []
  ): void {
    // If already connected, disconnect first
    if (this.client && this.client.connected) {
      toast.warn(
        "Already connected. Disconnecting before connecting to a new broker."
      );
      this.disconnect();
    }

    // Reset all state for a new connection
    this.connectionStatus = "Connecting";
    this.reconnectAttempts = 0;
    this.clearSubscriptionsAndMessages();

    const connectUrl = `${options.protocol}://${options.host}:${options.port}`;
    console.log(`Connecting to MQTT broker at ${connectUrl}...`);
    const mqttOptions: IClientOptions = {
      clientId: options.clientId,
      username: options.username || undefined,
      password: options.password ? Buffer.from(options.password) : undefined,
      clean: options.clean ?? true,
      keepalive: options.keepalive ?? 60,
      connectTimeout: options.connectTimeout ?? 10_000,
      reconnectPeriod: options.reconnectPeriod ?? 1000,
      protocolVersion: options.protocolVersion,
      will: options.will
        ? {
            topic: options.will.topic,
            payload: options.will.payload,
            qos: options.will.qos,
            retain: options.will.retain,
            properties: options.will.properties,
          }
        : undefined,
      rejectUnauthorized: options.rejectUnauthorized ?? true,
      ca: options.ca?.trim() ? Buffer.from(options.ca, "utf-8") : undefined,
      cert: options.cert?.trim()
        ? Buffer.from(options.cert, "utf-8")
        : undefined,
      key: options.key?.trim() ? Buffer.from(options.key, "utf-8") : undefined,
      properties:
        options.protocolVersion === 5 ? options.properties : undefined,
    };

    try {
      this.client = mqtt.connect(connectUrl, mqttOptions);

      this.client.on("connect", () => {
        this.connectionStatus = "Connected";
        this.currentProtocolVersion = options.protocolVersion;
        this.reconnectAttempts = 0; // Reset khi đã kết nối thành công
        toast.success(
          `Connected to ${options.host}:${options.port} (MQTT ${options.protocolVersion}.0)`
        );
      });

      this.client.on("error", (err) => {
        this.connectionStatus = "Error";
        console.error("MQTT connection error:", err);
        toast.error(`Connection error: ${err.message}`);
      });

      this.client.on("reconnect", () => {
        this.connectionStatus = "Reconnecting";
        toast.info(`Reconnecting...`);
      });

      // Đếm số lần thất bại thực tế tại close hoặc offline
      this.client.on("close", () => {
        if (this.connectionStatus !== "Connected") {
          this.reconnectAttempts += 1;
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.client?.end(true, () => {
              this.connectionStatus = "Disconnected";
              this.client = null;
              this.clearSubscriptionsAndMessages();
              toast.error(
                `Max reconnect attempts (${this.maxReconnectAttempts}) reached. Connection stopped.`
              );
            });
          } else {
            toast.warn(
              `Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
            );
          }
        }
      });

      this.client.on("close", () => {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          return;
        }
        this.connectionStatus = "Disconnected";
        this.clearSubscriptionsAndMessages();
        toast.info("Disconnected from broker.");
      });

      this.client.on("offline", () => {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          return;
        }
        this.connectionStatus = "Disconnected";
        this.clearSubscriptionsAndMessages();
        toast.warn("MQTT Client is offline.");
      });

      this.client.on("end", () => {
        this.connectionStatus = "Disconnected";
        this.clearSubscriptionsAndMessages();
        toast.info("MQTT Client connection ended.");
      });

      this.client.on("message", (topic, message, packet) => {
        let parsedPayload: any = null;
        const msgString = message.toString();

        try {
          if (msgString.startsWith("{") && msgString.endsWith("}")) {
            parsedPayload = JSON.parse(msgString);
          }
        } catch (e) {
          // Not JSON, bỏ qua
        }

        // 🔥 Lấy màu của topic
        const topicColor =
          this.activeSubscriptions.find((sub) => sub.topic === topic)?.color ||
          "#22c55e"; // default xanh lá nếu không có

        this.receivedMessages = [
          ...this.receivedMessages.slice(-100),
          {
            id: generateMessageId(),
            topic,
            message: msgString,
            parsedPayload,
            qos: packet.qos,
            timestamp: new Date().toLocaleString(),
            size: message.byteLength,
            color: topicColor, // Thêm màu vào message
          },
        ];
      });
    } catch (error: any) {
      this.connectionStatus = "Error";
      console.error("Failed to connect:", error);
      toast.error(`Failed to connect: ${error.message}`);
    }
  }

  public disconnect(): void {
    if (this.client) {
      this.client.end(true, () => {
        this.connectionStatus = "Disconnected";
        this.client = null;
        this.reconnectAttempts = 0;
        this.clearSubscriptionsAndMessages();
        toast.info("MQTT Client disconnected.");
      });
    } else {
      this.connectionStatus = "Disconnected";
      this.clearSubscriptionsAndMessages();
      toast.warn("No connection to disconnect.");
    }
  }

  public subscribe(options: SubscribeOptions): void {
    if (!this.client || !this.client.connected) {
      toast.error("Not connected to MQTT broker. Please connect first.");
      return;
    }

    if (this.activeSubscriptions.some((sub) => sub.topic === options.topic)) {
      toast.warn(`Already subscribed to "${options.alias || options.topic}"`);
      return;
    }

    const subscribeOptions: IClientSubscribeOptions = {
      qos: options.qos,
      nl: options.nl || false, // No Local (default false if undefined)
      rap: options.rap || false, // Retain As Published (default false if undefined)
      rh: options.rh || 0, // Retain Handling (default 0 if undefined)
      properties: options.properties || {}, // MQTT 5.0 properties, including subscriptionIdentifier if provided
    };

    this.client.subscribe(
      options.topic,
      subscribeOptions,
      (err, granted?: ISubscriptionGrant[]) => {
        if (err) {
          console.error(`Failed to subscribe to ${options.topic}:`, err);
          toast.error(
            `Failed to subscribe to ${options.topic}: ${err.message}`
          );
        } else {
          console.log(`Subscribed to topic: ${options.topic}`, granted);
          this.activeSubscriptions = [...this.activeSubscriptions, options];
          this.selectedTopics = [...this.selectedTopics, options];
          toast.success(`Subscribed to "${options.alias || options.topic}"`);
        }
      }
    );
  }

  public unsubscribe(id: string, topic: string): void {
    if (this.client && this.client.connected) {
      this.client.unsubscribe(topic, (err) => {
        if (err) {
          console.error(`Failed to unsubscribe from ${topic}:`, err);
          toast.error(`Failed to unsubscribe from ${topic}: ${err.message}`);
        } else {
          console.log(`Unsubscribed from topic: ${topic}`);
          const unsubscribedItem = this.activeSubscriptions.find(
            (sub) => sub.id === id
          );
          if (unsubscribedItem) {
            toast.info(
              `Unsubscribed from "${
                unsubscribedItem.alias || unsubscribedItem.topic
              }"`
            );
          }
          this.activeSubscriptions = this.activeSubscriptions.filter(
            (sub) => sub.id !== id
          );
          this.selectedTopics = this.selectedTopics.filter(
            (sub) => sub.id !== id
          );
          this.receivedMessages = this.receivedMessages.filter(
            (msg) => msg.topic !== topic
          );
        }
      });
    } else {
      toast.error("Not connected to MQTT broker.");
    }
  }

  public publish(options: PublishOptions): void {
    if (!this.client || !this.client.connected) {
      toast.error("Not connected to MQTT broker. Please connect first.");
      return;
    }
  
    let payloadBuffer: string | Buffer;
    let payloadSize: number = 0;
  
    try {
      switch (options.format) {
        case "json":
          JSON.parse(options.payload);
          payloadBuffer = options.payload;
          break;
        case "hex":
          payloadBuffer = Buffer.from(options.payload.replace(/\s/g, ""), "hex");
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
  
    // Prepare MQTT 5.0 properties with defaults and validation
    const publishProperties: Mqtt5PublishProperties = {
      payloadFormatIndicator:
        options.properties?.payloadFormatIndicator ??
        (options.format === "json" || options.format === "plaintext"),
      messageExpiryInterval: options.properties?.messageExpiryInterval,
      topicAlias: options.properties?.topicAlias,
      contentType: options.properties?.contentType,
      responseTopic: options.properties?.responseTopic,
      correlationData: options.properties?.correlationData,
      userProperties: options.properties?.userProperties,
      subscriptionIdentifier: options.properties?.subscriptionIdentifier,
    };
  
    // Validate topicAlias if provided
    if (publishProperties.topicAlias !== undefined && (publishProperties.topicAlias < 0 || publishProperties.topicAlias > 65535)) {
      toast.error("Topic Alias must be between 0 and 65535");
      return;
    }
  
    const publishOptions: IClientPublishOptions = {
      qos: options.qos,
      retain: options.retain,
      properties: publishProperties,
    };
  
    this.client.publish(
      options.topic,
      payloadBuffer,
      publishOptions,
      (err) => {
        if (err) {
          console.error(`Failed to publish to ${options.topic}:`, err);
          toast.error(`Failed to publish to ${options.topic}: ${err.message}`);
        } else {
          console.log(`Published message to ${options.topic}: ${options.payload}`);
          toast.success(`Published to "${options.topic}"`);
  
          // 🔥 Tìm màu theo topic:
          const topicColor =
            this.activeSubscriptions.find((sub) => sub.topic === options.topic)
              ?.color || "#22c55e"; // default xanh lá nếu không có
  
          this.receivedMessages = [
            ...this.receivedMessages.slice(-100),
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
              color: topicColor, // Thêm color vào message
            },
          ];
        }
      }
    );
  }

  public toggleSelectedTopic(topic: SubscribeOptions): void {
    this.selectedTopics = this.selectedTopics.some((sub) => sub.id === topic.id)
      ? this.selectedTopics.filter((sub) => sub.id !== topic.id)
      : [...this.selectedTopics, topic];
  }

  private clearSubscriptionsAndMessages(): void {
    this.activeSubscriptions = [];
    this.selectedTopics = [];
    this.receivedMessages = [];
  }

  public getClient(): MqttClient | null {
    return this.client;
  }

  public getConnectionStatus(): string {
    return this.connectionStatus;
  }

  public getReceivedMessages(): MqttMessage[] {
    return this.receivedMessages.filter((msg) =>
      this.selectedTopics.some((sub) => sub.topic === msg.topic)
    );
  }

  public getActiveSubscriptions(): SubscribeOptions[] {
    return this.activeSubscriptions;
  }

  public getSelectedTopics(): SubscribeOptions[] {
    return this.selectedTopics;
  }

  public getCurrentProtocolVersion(): 4 | 5 {
    return this.currentProtocolVersion;
  }
}

export const mqttClientManager = MqttClientManager.getInstance();
