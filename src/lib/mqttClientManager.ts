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
import { EventEmitter } from "events";
import { isEqual } from "lodash";
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
  private cachedMessages: MqttMessage[] = [];
  private currentProtocolVersion: 4 | 5 = 4;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private eventEmitter = new EventEmitter();

  private constructor() {}

  public static getInstance(): MqttClientManager {
    if (!MqttClientManager.instance) {
      MqttClientManager.instance = new MqttClientManager();
    }
    return MqttClientManager.instance;
  }

  public on(event: string, listener: (...args: any[]) => void) {
    this.eventEmitter.on(event, listener);
  }

  public off(event: string, listener: (...args: any[]) => void) {
    this.eventEmitter.off(event, listener);
  }

  private emitStateChange() {
    this.eventEmitter.emit("stateChange");
  }

  public connect(
    options: MqttConnectionOptions,
    initialSubscriptions: SubscribeOptions[] = []
  ): void {
    if (!options || !options.host || !options.port) return;

    if (this.client && this.client.connected) {
      toast.warn(
        "Already connected. Disconnecting before connecting to a new broker."
      );
      this.disconnect();
    }

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
      properties: {
        sessionExpiryInterval: options.properties?.sessionExpiryInterval ?? 0,
        receiveMaximum: options.properties?.receiveMaximum ?? 0,
        maximumPacketSize: options.properties?.maximumPacketSize ?? 0,
        topicAliasMaximum: options.properties?.topicAliasMaximum ?? 0,
        requestResponseInformation:
          options.properties?.requestResponseInformation ?? false,
        requestProblemInformation:
          options.properties?.requestProblemInformation ?? false,
        userProperties: options.properties?.userProperties || undefined,
      },
    };

    try {
      this.client = mqtt.connect(connectUrl, mqttOptions);

      this.client.on("connect", () => {
        this.connectionStatus = "Connected";
        this.currentProtocolVersion = options.protocolVersion as 4 | 5;
        this.reconnectAttempts = 0;
        toast.success(
          `Connected to ${options.host}:${options.port} (MQTT ${options.protocolVersion}.0)`
        );
        this.emitStateChange();
      });

      this.client.on("error", (err) => {
        this.connectionStatus = "Error";
        console.error("MQTT connection error:", err.stack);
        toast.error(`Connection error: ${err}`);
        this.emitStateChange();
      });

      this.client.on("reconnect", () => {
        this.connectionStatus = "Reconnecting";
        toast.info(`Reconnecting...`);
        this.emitStateChange();
      });

      this.client.on("close", () => {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.client?.end(true, () => {
            this.connectionStatus = "Disconnected";
            this.client = null;
            this.clearSubscriptionsAndMessages();
            toast.error(
              `Max reconnect attempts (${this.maxReconnectAttempts}) reached. Connection stopped.`
            );
            this.emitStateChange();
          });
        } else {
          this.connectionStatus = "Disconnected";
          this.clearSubscriptionsAndMessages();
          toast.info("Disconnected from broker.");
          this.emitStateChange();
        }
      });

      this.client.on("offline", () => {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
        this.connectionStatus = "Disconnected";
        this.clearSubscriptionsAndMessages();
        toast.warn("MQTT Client is offline.");
        this.emitStateChange();
      });

      this.client.on("end", () => {
        this.connectionStatus = "Disconnected";
        this.clearSubscriptionsAndMessages();
        toast.info("MQTT Client connection ended.");
        this.emitStateChange();
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

        const topicColor =
          this.activeSubscriptions.find((sub) => sub.topic === topic)?.color ||
          "#22c55e";

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
            color: topicColor,
          },
        ];
        this.emitStateChange();
      });
    } catch (error: any) {
      this.connectionStatus = "Error";
      console.error("Failed to connect:", error);
      toast.error(`Failed to connect: ${error.message}`);
      this.emitStateChange();
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
        this.emitStateChange();
      });
    } else {
      this.connectionStatus = "Disconnected";
      this.clearSubscriptionsAndMessages();
      toast.warn("No connection to disconnect.");
      this.emitStateChange();
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
      nl: options.nl || false,
      rap: options.rap || false,
      rh: options.rh || 0,
      properties: options.properties || {},
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
          this.emitStateChange();
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
          this.emitStateChange();
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

    if (
      publishProperties.topicAlias !== undefined &&
      (publishProperties.topicAlias < 0 ||
        publishProperties.topicAlias > 65535)
    ) {
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

          const topicColor =
            this.activeSubscriptions.find((sub) => sub.topic === options.topic)
              ?.color || "#22c55e";

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
              color: topicColor,
            },
          ];
          this.emitStateChange();
        }
      }
    );
  }

  public toggleSelectedTopic(topic: SubscribeOptions): void {
    this.selectedTopics = this.selectedTopics.some((sub) => sub.id === topic.id)
      ? this.selectedTopics.filter((sub) => sub.id !== topic.id)
      : [...this.selectedTopics, topic];
    this.emitStateChange();
  }

  private clearSubscriptionsAndMessages(): void {
    this.activeSubscriptions = [];
    this.selectedTopics = [];
    this.receivedMessages = [];
    this.cachedMessages = [];
    this.emitStateChange();
  }

  public getClient(): MqttClient | null {
    return this.client;
  }

  public getConnectionStatus(): string {
    return this.connectionStatus;
  }

  public getReceivedMessages(): MqttMessage[] {
    const filteredMessages = this.receivedMessages.filter((msg) =>
      this.selectedTopics.some((sub) => sub.topic === msg.topic)
    );
    if (isEqual(filteredMessages, this.cachedMessages)) {
      return this.cachedMessages;
    }
    this.cachedMessages = filteredMessages;
    return this.cachedMessages;
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