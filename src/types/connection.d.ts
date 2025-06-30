import {
  MqttConnectionOptions,
  SubscribeOptions,
  PublishOptions,
} from "./mqtt";
export interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  serverUrl: string;
  username: string;
  password: string;
  error: string | null;
  // api: NanoMQAPI | null
  connect: (url: string, username: string, password: string) => Promise<void>;
  disconnect: () => void;
}

export interface SavedConnection {
  name: string; // Tên hiển thị của kết nối
  options: MqttConnectionOptions;
  subscriptions: SubscribeOptions[]; // Các topic đã subscribe cho kết nối này
}
