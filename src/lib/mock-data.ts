// import type {
//   NodeData,
//   BrokerData,
//   MetricsData,
//   ClientData,
//   SubscriptionData,
//   TopicData,
//   BridgeData,
//   PrometheusMetrics,
// } from "./nanomq-api"

// // Mock data based on real API responses
// export const mockNodeData: NodeData[] = [
//   {
//     connections: 2,
//     node_status: "Đang chạy",
//     uptime: "15 giờ, 22 phút, 4 giây",
//     version: "0.8.1",
//   },
// ]

// export const mockBrokerData: BrokerData[] = [
//   {
//     datetime: "2022-06-07 10:02:24",
//     node_status: "Đang chạy",
//     sysdescr: "NanoMQ Broker",
//     uptime: "15 giờ, 1 phút, 38 giây",
//     version: "0.7.9-3",
//   },
// ]

// export const mockMetricsData: MetricsData = {
//   metrics: [],
//   cpuinfo: "2.5%",
//   memory: "20049920",
// }

// export const mockClientData: ClientData[] = [
//   {
//     client_id: "nanomq-f6d6fbfb",
//     username: "alvin",
//     keepalive: 60,
//     conn_state: "connected",
//     clean_start: true,
//     proto_name: "MQTT",
//     proto_ver: 5,
//     recv_msg: 3,
//   },
//   {
//     client_id: "nanomq-bdf61d9b",
//     username: "nanomq",
//     keepalive: 60,
//     conn_state: "connected",
//     clean_start: true,
//     proto_name: "MQTT",
//     proto_ver: 5,
//     recv_msg: 0,
//   },
//   {
//     client_id: "nanomq-abc123",
//     username: "sensor_01",
//     keepalive: 30,
//     conn_state: "disconnected",
//     clean_start: false,
//     proto_name: "MQTT",
//     proto_ver: 4,
//     recv_msg: 15,
//   },
// ]

// export const mockSubscriptionData: SubscriptionData[] = [
//   {
//     clientid: "nanomq-29978ec1",
//     topic: "sensor/temperature",
//     qos: 2,
//   },
//   {
//     clientid: "nanomq-3020ffac",
//     topic: "sensor/humidity",
//     qos: 1,
//   },
//   {
//     clientid: "nanomq-abc123",
//     topic: "device/status",
//     qos: 0,
//   },
// ]

// export const mockTopicData: TopicData[][] = [
//   [{ topic: "", cld_cnt: 1 }],
//   [{ topic: "sensor/temperature", cld_cnt: 2, clientid: ["nanomq-3a4a0956", "nanomq-29978ec1"] }],
//   [{ topic: "sensor/humidity", cld_cnt: 1, clientid: ["nanomq-0cfd69bb"] }],
//   [{ topic: "device/status", cld_cnt: 1, clientid: ["nanomq-26971dc8"] }],
//   [{ topic: "alerts/critical", cld_cnt: 0, clientid: [] }],
// ]

// export const mockBridgeData: BridgeData = {
//   bridge: {
//     nodes: [
//       {
//         name: "emqx",
//         enable: true,
//         parallel: 2,
//         connector: {
//           server: "mqtt-tcp://broker.emqx.io:1883",
//           proto_ver: 5,
//           clientid: null,
//           clean_start: true,
//           username: "",
//           password: "",
//           keepalive: 60,
//         },
//         forwards: [
//           {
//             remote_topic: "fwd/topic1",
//             local_topic: "topic1",
//           },
//           {
//             remote_topic: "fwd/topic2",
//             local_topic: "topic2",
//           },
//         ],
//         subscription: [
//           {
//             remote_topic: "cmd/topic1",
//             local_topic: "topic1",
//             qos: 1,
//           },
//           {
//             remote_topic: "cmd/topic2",
//             local_topic: "topic2",
//             qos: 2,
//           },
//         ],
//       },
//       {
//         name: "aws-iot",
//         enable: false,
//         parallel: 1,
//         connector: {
//           server: "mqtt-tcp://iot.amazonaws.com:8883",
//           proto_ver: 4,
//           clientid: "nanomq-bridge-aws",
//           clean_start: true,
//           username: "aws-user",
//           password: "aws-pass",
//           keepalive: 30,
//         },
//         forwards: [
//           {
//             remote_topic: "aws/data",
//             local_topic: "sensors/data",
//           },
//         ],
//         subscription: [
//           {
//             remote_topic: "aws/commands",
//             local_topic: "device/commands",
//             qos: 1,
//           },
//         ],
//       },
//     ],
//   },
// }

// export const mockPrometheusData: PrometheusMetrics = {
//   connections_count: 2,
//   connections_max: 5,
//   sessions_count: 2,
//   sessions_max: 5,
//   topics_count: 4,
//   topics_max: 10,
//   subscribers_count: 3,
//   subscribers_max: 15,
//   messages_received: 21503337974,
//   messages_sent: 17360185675,
//   messages_dropped: 1250,
//   memory_usage: 19922944,
//   memory_usage_max: 19922944,
//   cpu_usage: 2.5,
//   cpu_usage_max: 15.5,
// }

// // Mock service to simulate API calls
// export class MockDataService {
//   private delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

//   async getNodes(): Promise<NodeData[]> {
//     await this.delay(500)
//     return mockNodeData
//   }

//   async getBrokers(): Promise<BrokerData[]> {
//     await this.delay(500)
//     return mockBrokerData
//   }

//   async getMetrics(): Promise<MetricsData> {
//     await this.delay(500)
//     return mockMetricsData
//   }

//   async getClients(): Promise<ClientData[]> {
//     await this.delay(500)
//     return mockClientData
//   }

//   async getSubscriptions(): Promise<SubscriptionData[]> {
//     await this.delay(500)
//     return mockSubscriptionData
//   }

//   async getTopics(): Promise<TopicData[][]> {
//     await this.delay(500)
//     return mockTopicData
//   }

//   async getBridges(): Promise<BridgeData> {
//     await this.delay(500)
//     return mockBridgeData
//   }

//   async getPrometheusMetrics(): Promise<PrometheusMetrics> {
//     await this.delay(500)
//     return mockPrometheusData
//   }
// }
import axios, { type AxiosInstance } from "axios"
import type {
  NodeData,
  BrokerData,
  MetricsData,
  ClientData,
  SubscriptionData,
  TopicData,
  BridgeData,
  PrometheusMetrics,
} from "./nanomq-api"

// API Response wrapper interface
interface ApiResponse<T> {
  code: number
  data: T
}

// NanoMQ API Service
export class NanoMQApiService {
  private api: AxiosInstance

  constructor(baseURL = "http://localhost:8888") {
    this.api = axios.create({
      baseURL,
      auth: {
        username: "admin",
        password: "public",
      },
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }

  async getNodes(): Promise<NodeData[]> {
    try {
      const response = await this.api.get<ApiResponse<NodeData[]>>("/api/v4/nodes")
      return response.data.data
    } catch (error) {
      console.error("Error fetching nodes:", error)
      throw new Error("Failed to fetch nodes data")
    }
  }

  async getBrokers(): Promise<BrokerData[]> {
    try {
      const response = await this.api.get<ApiResponse<BrokerData[]>>("/api/v4/brokers")
      return response.data.data
    } catch (error) {
      console.error("Error fetching brokers:", error)
      throw new Error("Failed to fetch brokers data")
    }
  }

  async getMetrics(): Promise<MetricsData> {
    try {
      const response = await this.api.get<MetricsData>("/api/v4/metrics")
      return response.data
    } catch (error) {
      console.error("Error fetching metrics:", error)
      throw new Error("Failed to fetch metrics data")
    }
  }

  async getClients(): Promise<ClientData[]> {
    try {
      const response = await this.api.get<ApiResponse<ClientData[]>>("/api/v4/clients")
      return response.data.data
    } catch (error) {
      console.error("Error fetching clients:", error)
      throw new Error("Failed to fetch clients data")
    }
  }

  async getSubscriptions(): Promise<SubscriptionData[]> {
    try {
      const response = await this.api.get<ApiResponse<SubscriptionData[]>>("/api/v4/subscriptions")
      return response.data.data
    } catch (error) {
      console.error("Error fetching subscriptions:", error)
      throw new Error("Failed to fetch subscriptions data")
    }
  }

  async getTopics(): Promise<TopicData[][]> {
    try {
      const response = await this.api.get<ApiResponse<TopicData[][]>>("/api/v4/topic-tree")
      return response.data.data
    } catch (error) {
      console.error("Error fetching topics:", error)
      throw new Error("Failed to fetch topics data")
    }
  }

  async getBridges(): Promise<BridgeData> {
    try {
      const response = await this.api.get<ApiResponse<BridgeData>>("/api/v4/bridges")
      return response.data.data
    } catch (error) {
      console.error("Error fetching bridges:", error)
      throw new Error("Failed to fetch bridges data")
    }
  }

  async getPrometheusMetrics(): Promise<PrometheusMetrics> {
    try {
      const response = await this.api.get<string>("/api/v4/prometheus", {
        headers: {
          Accept: "text/plain",
        },
      })

      // Parse Prometheus metrics text format
      return this.parsePrometheusMetrics(response.data)
    } catch (error) {
      console.error("Error fetching prometheus metrics:", error)
      throw new Error("Failed to fetch prometheus metrics")
    }
  }

  private parsePrometheusMetrics(metricsText: string): PrometheusMetrics {
    const lines = metricsText.split("\n")
    const metrics: PrometheusMetrics = {
      connections_count: 0,
      connections_max: 0,
      sessions_count: 0,
      sessions_max: 0,
      topics_count: 0,
      topics_max: 0,
      subscribers_count: 0,
      subscribers_max: 0,
      messages_received: 0,
      messages_sent: 0,
      messages_dropped: 0,
      memory_usage: 0,
      memory_usage_max: 0,
      cpu_usage: 0,
      cpu_usage_max: 0,
    }

    for (const line of lines) {
      if (line.startsWith("#") || line.trim() === "") continue

      const [metricName, value] = line.split(" ")
      const numValue = Number.parseFloat(value)

      switch (metricName) {
        case "nanomq_connections_count":
          metrics.connections_count = numValue
          break
        case "nanomq_connections_max":
          metrics.connections_max = numValue
          break
        case "nanomq_sessions_count":
          metrics.sessions_count = numValue
          break
        case "nanomq_sessions_max":
          metrics.sessions_max = numValue
          break
        case "nanomq_topics_count":
          metrics.topics_count = numValue
          break
        case "nanomq_topics_max":
          metrics.topics_max = numValue
          break
        case "nanomq_subscribers_count":
          metrics.subscribers_count = numValue
          break
        case "nanomq_subscribers_max":
          metrics.subscribers_max = numValue
          break
        case "nanomq_messages_received":
          metrics.messages_received = numValue
          break
        case "nanomq_messages_sent":
          metrics.messages_sent = numValue
          break
        case "nanomq_messages_dropped":
          metrics.messages_dropped = numValue
          break
        case "nanomq_memory_usage":
          metrics.memory_usage = numValue
          break
        case "nanomq_memory_usage_max":
          metrics.memory_usage_max = numValue
          break
        case "nanomq_cpu_usage":
          metrics.cpu_usage = numValue
          break
        case "nanomq_cpu_usage_max":
          metrics.cpu_usage_max = numValue
          break
      }
    }

    return metrics
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.api.get("/api/v4/nodes")
      return true
    } catch (error) {
      console.error("Health check failed:", error)
      return false
    }
  }

  // Method to update base URL if needed
  updateBaseURL(newBaseURL: string): void {
    this.api.defaults.baseURL = newBaseURL
  }

  // Method to update credentials if needed
  updateCredentials(username: string, password: string): void {
    this.api.defaults.auth = { username, password }
  }
}

// Create a singleton instance
export const nanoMQApiService = new NanoMQApiService()

// Export individual methods for easier usage
export const {
  getNodes,
  getBrokers,
  getMetrics,
  getClients,
  getSubscriptions,
  getTopics,
  getBridges,
  getPrometheusMetrics,
  healthCheck,
} = nanoMQApiService