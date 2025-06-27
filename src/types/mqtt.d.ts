// src/types/mqtt/mqtt.d.ts
import { IClientOptions, IClientPublishOptions } from "mqtt";

export type MqttProtocolVersion = 4 | 5; // 4 for MQTT 3.1.1, 5 for MQTT 5.0

// Custom type for connection options to simplify our form
export interface MqttConnectionOptions {
  protocol: "mqtt" | "mqtts" | "ws" | "wss";
  host: string;
  port: number;
  clientId: string;
  username?: string;
  password?: string;
  clean?: boolean;
  keepalive?: number;
  connectTimeout?: number; // in milliseconds
  reconnectPeriod?: number; // in milliseconds, 0 to disable
  protocolVersion: MqttProtocolVersion;

  // Will Message (Last Will and Testament)
  will?: {
    topic: string;
    payload: string;
    qos: 0 | 1 | 2;
    retain: boolean;
    properties?: Mqtt5WillProperties;
  };

  // SSL/TLS options
  rejectUnauthorized?: boolean; // For self-signed certificates
  ca?: string; // CA certificate as string (Base64 or plain text PEM)
  cert?: string; // Client certificate as string (Base64 or plain text PEM)
  key?: string; // Client key as string (Base64 or plain text PEM)

  // MQTT 5.0 properties for CONNECT packet
  properties?: Mqtt5ConnectProperties;
}

export interface Mqtt5WillProperties {
  willDelayInterval?: number;
  messageExpiryInterval?: number;
  contentType?: string;
  responseTopic?: string;
  correlationData?: string; // Base64 encoded
  payloadFormatIndicator?: boolean; // 0 for binary, 1 for UTF-8
  userProperties?: { [key: string]: string };
}

export interface Mqtt5ConnectProperties {
  sessionExpiryInterval?: number; // seconds
  receiveMaximum?: number;
  maximumPacketSize?: number;
  topicAliasMaximum?: number;
  requestResponseInformation?: boolean;
  requestProblemInformation?: boolean;
  userProperties?: { [key: string]: string };
}

export interface Mqtt5PublishProperties {
  payloadFormatIndicator?: 0 | 1;
  messageExpiryInterval?: number;
  contentType?: string;
  responseTopic?: string;
  correlationData?: string; // Base64 encoded
  userProperties?: { [key: string]: string };
}

// Custom type for a received message
export interface MqttMessage {
  id: string; // NEW: Unique ID for the message
  topic: string;
  message: string; // Original string payload
  parsedPayload?: any; // Parsed object if JSON, otherwise undefined
  qos: 0 | 1 | 2;
  timestamp: string;
  isPublished?: boolean; // True if this message was published by this client (for display)
  size: number; // Size in bytes
}

// Custom type for subscription
export interface SubscribeOptions {
  id: string; // NEW: Unique ID for the subscription
  topic: string;
  qos: 0 | 1 | 2;
  alias?: string; // User-defined name for the subscription in UI
  color?: string; // Color for UI
}

// Custom type for publish
export type PayloadFormat = "plaintext" | "json" | "hex" | "base64";

export interface PublishOptions {
  topic: string;
  payload: string;
  format: PayloadFormat;
  qos: 0 | 1 | 2;
  retain: boolean;
  properties?: Mqtt5PublishProperties;
}
