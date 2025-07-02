import { type IConnackPacket, type IDisconnectPacket, type IPublishPacket, type ISubscribePacket, type IUnsubscribePacket, type IConnectPacket, type QoS } from 'mqtt-packet';
import { Buffer } from 'buffer';

// Định nghĩa type cho các thuộc tính MQTT 5.0
export interface Mqtt5ConnectProperties {
  sessionExpiryInterval?: number;
  receiveMaximum?: number;
  maximumPacketSize?: number;
  topicAliasMaximum?: number;
  requestResponseInformation?: boolean;
  requestProblemInformation?: boolean;
  userProperties?: Record<string, string | string[]>;
  cleanStart?: boolean;
}

export interface Mqtt5WillProperties {
  willDelayInterval?: number;
  messageExpiryInterval?: number;
  contentType?: string;
  responseTopic?: string;
  correlationData?: Buffer; // Changed to Buffer | undefined
  payloadFormatIndicator?: boolean;
  userProperties?: Record<string, string | string[]>;
}
export type PayloadFormat = "plaintext" | "json" | "hex" | "base64";
export interface Mqtt5PublishProperties {
  payloadFormatIndicator?: boolean;
  messageExpiryInterval?: number;
  topicAlias?: number; // Bổ sung thiếu
  contentType?: string;
  responseTopic?: string;
  correlationData?: Buffer;
  userProperties?: Record<string, string | string[]>;
  subscriptionIdentifier?: number | number[]; 
}

// Định nghĩa type cho cấu hình kết nối MQTT
export interface MqttWillProperties {
  willDelayInterval?: number;
  messageExpiryInterval?: number;
  contentType?: string;
  responseTopic?: string;
  correlationData?: Buffer | string; // Buffer for MQTT.js, string for UI
  payloadFormatIndicator?: boolean;
  userProperties?: { [key: string]: string };
}

export interface MqttConnectionOptions {
  protocol: "mqtt" | "mqtts" | "ws" | "wss";
  host: string;
  port: number;
  clientId: string;
  username?: string;
  password?: string;
  clean?: boolean;
  keepalive?: number;
  connectTimeout?: number;
  reconnectPeriod?: number;
  protocolVersion?: 4 | 5;
  properties?: {
    cleanStart?: boolean;
    sessionExpiryInterval?: number;
    receiveMaximum?: number;
    maximumPacketSize?: number;
    topicAliasMaximum?: number;
    requestResponseInformation?: boolean;
    requestProblemInformation?: boolean;
    userProperties?: { [key: string]: string };
  };
  will?: {
    topic: string;
    payload: string;
    qos: 0 | 1 | 2;
    retain: boolean;
    properties?: MqttWillProperties;
  };
  ca?: string;
  cert?: string;
  key?: string;
  rejectUnauthorized?: boolean;
}

// Định nghĩa type cho tin nhắn MQTT
export interface MqttMessage {
  id: string;
  topic: string;
  message: string;
  parsedPayload: any;
  qos: QoS;
  timestamp: string;
  size: number;
  isPublished?: boolean;
  color: string; // Thêm thuộc tính color để xác định màu sắc của topic
}

// Định nghĩa type cho subscribe options
export interface SubscribeOptions {
  id: string;
  topic: string;
  qos: QoS;
  alias?: string;
  nl?: boolean;
  rap?: boolean;
  rh?: number;
  properties?: ISubscribePacket['properties'];

  color?: string; // Thêm thuộc tính color để xác định màu sắc của topic
}

// Định nghĩa type cho publish options
export interface PublishOptions {
  topic: string;
  payload: string;
  qos: QoS;
  retain: boolean;
  format: 'plaintext' | 'json' | 'hex' | 'base64';
  properties?: Mqtt5PublishProperties ;
  
}

// Export các type từ mqtt-packet
export type {
  IConnackPacket,
  IDisconnectPacket,
  IPublishPacket,
  ISubscribePacket,
  IUnsubscribePacket,
  IConnectPacket,
  QoS,
};