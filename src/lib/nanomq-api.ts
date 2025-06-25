interface ApiResponse<T> {
  code: number
  data: T
}

interface NodeData {
  connections: number
  node_status: string
  uptime: string
  version: string
}

interface BrokerData {
  datetime: string
  node_status: string
  sysdescr: string
  uptime: string
  version: string
}

interface MetricsData {
  metrics: any[]
  cpuinfo: string
  memory: string
}

interface ClientData {
  client_id: string
  username: string
  keepalive: number
  conn_state: string
  clean_start: boolean
  proto_name: string
  proto_ver: number
  recv_msg: number
}

interface SubscriptionData {
  clientid: string
  topic: string
  qos: number
}

interface TopicData {
  topic: string
  cld_cnt: number
  clientid?: string[]
}

interface BridgeNode {
  name: string
  enable: boolean
  parallel: number
  connector: {
    server: string
    proto_ver: number
    clientid: string | null
    clean_start: boolean
    username: string
    password: string
    keepalive: number
    conn_properties?: any
    will_properties?: any
  }
  forwards: Array<{
    remote_topic: string
    local_topic: string
  }>
  subscription: Array<{
    remote_topic: string
    local_topic: string
    qos: number
  }>
  sub_properties?: any
  tls?: any
}

interface BridgeData {
  bridge: {
    nodes: BridgeNode[]
  }
}

interface PrometheusMetrics {
  connections_count: number
  connections_max: number
  sessions_count: number
  sessions_max: number
  topics_count: number
  topics_max: number
  subscribers_count: number
  subscribers_max: number
  messages_received: number
  messages_sent: number
  messages_dropped: number
  memory_usage: number
  memory_usage_max: number
  cpu_usage: number
  cpu_usage_max: number
}

class NanoMQAPI {
  private baseUrl: string
  private username: string
  private password: string

  constructor(baseUrl: string, username: string, password: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "") // Remove trailing slash
    this.username = username
    this.password = password
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}/api/v4${endpoint}`
    const credentials = btoa(`${this.username}:${this.password}`)

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error)
      throw error
    }
  }

  private parsePrometheusMetrics(prometheusText: string): PrometheusMetrics {
    const lines = prometheusText.split("\n")
    const metrics: any = {}

    for (const line of lines) {
      if (line.startsWith("#") || !line.trim()) continue

      const parts = line.split(" ")
      if (parts.length >= 2) {
        const metricName = parts[0]
        const value = Number.parseFloat(parts[1])

        // Map metric names to our interface
        switch (metricName) {
          case "nanomq_connections_count":
            metrics.connections_count = value
            break
          case "nanomq_connections_max":
            metrics.connections_max = value
            break
          case "nanomq_sessions_count":
            metrics.sessions_count = value
            break
          case "nanomq_sessions_max":
            metrics.sessions_max = value
            break
          case "nanomq_topics_count":
            metrics.topics_count = value
            break
          case "nanomq_topics_max":
            metrics.topics_max = value
            break
          case "nanomq_subscribers_count":
            metrics.subscribers_count = value
            break
          case "nanomq_subscribers_max":
            metrics.subscribers_max = value
            break
          case "nanomq_messages_received":
            metrics.messages_received = value
            break
          case "nanomq_messages_sent":
            metrics.messages_sent = value
            break
          case "nanomq_messages_dropped":
            metrics.messages_dropped = value
            break
          case "nanomq_memory_usage":
            metrics.memory_usage = value
            break
          case "nanomq_memory_usage_max":
            metrics.memory_usage_max = value
            break
          case "nanomq_cpu_usage":
            metrics.cpu_usage = value
            break
          case "nanomq_cpu_usage_max":
            metrics.cpu_usage_max = value
            break
        }
      }
    }

    return metrics as PrometheusMetrics
  }

  async getNodes(): Promise<NodeData[]> {
    const response = await this.makeRequest<ApiResponse<NodeData[]>>("/nodes")
    return response.data
  }

  async getBrokers(): Promise<BrokerData[]> {
    const response = await this.makeRequest<ApiResponse<BrokerData[]>>("/brokers")
    return response.data
  }

  async getMetrics(): Promise<MetricsData> {
    return await this.makeRequest<MetricsData>("/metrics")
  }

  async getClients(): Promise<ClientData[]> {
    const response = await this.makeRequest<ApiResponse<ClientData[]>>("/clients")
    return response.data
  }

  async getSubscriptions(): Promise<SubscriptionData[]> {
    const response = await this.makeRequest<ApiResponse<SubscriptionData[]>>("/subscriptions")
    return response.data
  }

  async getTopics(): Promise<TopicData[][]> {
    const response = await this.makeRequest<ApiResponse<TopicData[][]>>("/topic-tree")
    return response.data
  }

  async getBridges(): Promise<BridgeData> {
    const response = await this.makeRequest<ApiResponse<BridgeData>>("/bridges")
    return response.data
  }

  async getPrometheusMetrics(): Promise<PrometheusMetrics> {
    const prometheusText = await fetch(`${this.baseUrl}/api/v4/prometheus`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${btoa(`${this.username}:${this.password}`)}`,
      },
    }).then((res) => res.text())

    return this.parsePrometheusMetrics(prometheusText)
  }
}

export { NanoMQAPI }
export type {
  NodeData,
  BrokerData,
  MetricsData,
  ClientData,
  SubscriptionData,
  TopicData,
  BridgeNode,
  BridgeData,
  PrometheusMetrics,
}
