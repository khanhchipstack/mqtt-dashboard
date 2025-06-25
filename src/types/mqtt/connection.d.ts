// src/types/mqtt/connection.d.ts
import { MqttConnectionOptions, SubscribeOptions, PublishOptions } from './mqtt';

export interface SavedConnection {
  id: string;
  name: string; // Tên hiển thị của kết nối
  options: MqttConnectionOptions;
  subscriptions: SubscribeOptions[]; // Các topic đã subscribe cho kết nối này
}